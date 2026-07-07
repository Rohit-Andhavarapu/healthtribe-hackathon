import json
import asyncio
import logging
from typing import List, Tuple, AsyncGenerator, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc, update

from app.core.settings import get_settings
from app.infrastructure.database.models import User, PatientProfile, Appointment, LabReport, Benefit, FamilyMember, Doctor
from sqlalchemy.orm import joinedload
from app.modules.timeline.query_service import TimelineQueryService
from app.modules.ai.schemas import AIChatRequest, AIChatResponse, AIStreamRequest, AIStreamChunk, ChatMessage
from app.modules.ai.prompts import SYSTEM_PROMPT, DOCTOR_SYSTEM_PROMPT
from app.modules.ai.tools import ToolRegistry, AIToolServices, get_openai_tools
from app.modules.ai.providers import GroqProvider, OpenRouterProvider, TogetherProvider

logger = logging.getLogger(__name__)
settings = get_settings()

class AIChatService:
    def __init__(self, db: AsyncSession):
        self.db = db
        
        self.providers = []
        if settings.GROQ_API_KEY:
            self.providers.append(("Groq", GroqProvider(settings.GROQ_API_KEY), settings.GROQ_MODEL))
        if settings.OPENROUTER_API_KEY:
            self.providers.append(("OpenRouter", OpenRouterProvider(settings.OPENROUTER_API_KEY), settings.OPENROUTER_MODEL))
        if settings.TOGETHER_API_KEY:
            self.providers.append(("Together", TogetherProvider(settings.TOGETHER_API_KEY), settings.TOGETHER_MODEL))
            
        if not self.providers:
            logger.warning("No AI providers configured. Inference will fail.")
            
        self.tool_registry = ToolRegistry(AIToolServices(db, None)) # Will set user later

    async def _build_context(self, user: User, client_role: str = "PATIENT", context_payload: dict = None) -> Tuple[str, List[str]]:
        sources = []
        context_parts = []
        
        if client_role == "DOCTOR":
            doctor_query = select(Doctor).options(joinedload(Doctor.hospital)).where(Doctor.user_id == user.id)
            doctor_result = await self.db.execute(doctor_query)
            doctor = doctor_result.scalar_one_or_none()
            
            if doctor:
                sources.append("Doctor Profile")
                context_parts.append("### Doctor Profile")
                context_parts.append(f"- Name: {doctor.name}")
                context_parts.append(f"- Specialization: {doctor.specialty if hasattr(doctor, 'specialty') else getattr(doctor, 'specialty', 'N/A')}")
                context_parts.append(f"- Hospital: {doctor.hospital.name if doctor.hospital else 'N/A'}")
                
                # Inject active consultation context if provided
                if context_payload and context_payload.get("appointment_id"):
                    appt_id = context_payload.get("appointment_id")
                    appt_query = select(Appointment).options(joinedload(Appointment.patient)).where(Appointment.id == appt_id)
                    appt_result = await self.db.execute(appt_query)
                    appt = appt_result.scalar_one_or_none()
                    if appt:
                        patient_id = appt.patient_id
                        sources.append("Patient File")
                        context_parts.append(f"\n### ACTIVE CONSULTATION (Patient ID: {patient_id})")
                        context_parts.append(f"- Appointment: {appt.date} {appt.time} | {appt.type} | Status: {appt.status}")
                        context_parts.append(f"- Notes: {appt.notes or 'None'}")
                        
                        profile_query = select(PatientProfile).where(PatientProfile.user_id == patient_id)
                        profile_result = await self.db.execute(profile_query)
                        profile = profile_result.scalar_one_or_none()
                        if profile:
                            context_parts.append("#### Demographics & Medical History")
                            context_parts.append(f"- Allergies: {', '.join(profile.allergies) if profile.allergies else 'None'}")
                            context_parts.append(f"- Chronic Conditions: {', '.join(profile.chronic_conditions) if profile.chronic_conditions else 'None'}")
                            if profile.demographics:
                                for k, v in profile.demographics.items():
                                    context_parts.append(f"- {k.capitalize()}: {v}")
                                    
                        timeline_service = TimelineQueryService(self.db)
                        timeline_events = await timeline_service.get_timeline(patient_id=patient_id, limit=5)
                        if timeline_events:
                            context_parts.append("#### Recent Patient Timeline")
                            for event in timeline_events:
                                title = event.structured_payload.get('title', 'Event')
                                context_parts.append(f"- {event.occurred_at.strftime('%Y-%m-%d')} | {event.type}: {title}")
                else:
                    # Generic doctor context
                    appointments_query = select(Appointment).where(Appointment.doctor_id == doctor.id)
                    appointments_result = await self.db.execute(appointments_query)
                    appointments = appointments_result.scalars().all()
                    if appointments:
                        sources.append("Appointments")
                        context_parts.append("\n### Scheduled Appointments")
                        for appt in appointments:
                            context_parts.append(f"- {appt.date} {appt.time} | {appt.type} | Status: {appt.status}")
                        
            return "\n".join(context_parts), sources

        # PATIENT CONTEXT
        profile_query = select(PatientProfile).where(PatientProfile.user_id == user.id)
        profile_result = await self.db.execute(profile_query)
        profile = profile_result.scalar_one_or_none()
        
        if profile:
            sources.append("Profile")
            demographics = profile.demographics or {}
            context_parts.append("### Patient Profile")
            context_parts.append(f"- Allergies: {', '.join(profile.allergies) if profile.allergies else 'None'}")
            context_parts.append(f"- Chronic Conditions: {', '.join(profile.chronic_conditions) if profile.chronic_conditions else 'None'}")
            if demographics:
                for k, v in demographics.items():
                    context_parts.append(f"- {k.capitalize()}: {v}")
        
        # Medical Information from new dedicated table
        from app.infrastructure.database.models import MedicalInformation, EmergencyContact
        medical_info_query = select(MedicalInformation).where(MedicalInformation.patient_id == user.id)
        medical_info_result = await self.db.execute(medical_info_query)
        medical_info = medical_info_result.scalar_one_or_none()
        
        if medical_info:
            sources.append("Medical Information")
            context_parts.append("\n### Medical Information")
            if medical_info.conditions:
                context_parts.append(f"- Known Conditions: {', '.join(medical_info.conditions)}")
            if medical_info.allergies:
                context_parts.append(f"- Allergies: {', '.join(medical_info.allergies)}")
            if medical_info.chronic_diseases:
                context_parts.append(f"- Chronic Diseases: {', '.join(medical_info.chronic_diseases)}")
            if medical_info.past_surgeries:
                context_parts.append(f"- Past Surgeries: {', '.join(medical_info.past_surgeries)}")
            if medical_info.medical_notes:
                context_parts.append(f"- Medical Notes: {medical_info.medical_notes}")
        
        # Emergency Contacts
        emergency_contacts_query = select(EmergencyContact).where(EmergencyContact.patient_id == user.id).limit(3)
        emergency_contacts_result = await self.db.execute(emergency_contacts_query)
        emergency_contacts = emergency_contacts_result.scalars().all()
        
        if emergency_contacts:
            sources.append("Emergency Contacts")
            context_parts.append("\n### Emergency Contacts")
            for contact in emergency_contacts:
                primary_badge = " [PRIMARY]" if contact.is_primary else ""
                context_parts.append(f"- {contact.name} ({contact.relation_type}): {contact.phone_number}{primary_badge}")

        # The Timeline acts as the central AI Knowledge Graph
        # We retrieve the recent longitudinal history which contains structured data
        timeline_service = TimelineQueryService(self.db)
        # Fetch more events since this is the primary context
        timeline_events = await timeline_service.get_timeline(patient_id=user.id, limit=30)
        
        if timeline_events:
            sources.append("Timeline Knowledge Graph")
            context_parts.append("\n### Longitudinal Health Record (Timeline)")
            for event in timeline_events:
                title = event.structured_payload.get('title', event.type)
                description = event.structured_payload.get('description', '')
                
                # Expand specific event types using structured payload
                if event.type == "APPOINTMENT_SCHEDULED" or event.type == "appointment_booked":
                    doc = event.structured_payload.get('doctor_name', 'Doctor')
                    date = event.structured_payload.get('date', 'Unknown Date')
                    time = event.structured_payload.get('time', '')
                    description += f" Scheduled with {doc} for {date} {time}."
                elif event.type == "imported_prescription":
                    orig = event.structured_payload.get('original_payload', {})
                    description += f" Imported Prescription: {orig}"
                elif event.type == "imported_labreport":
                    orig = event.structured_payload.get('original_payload', {})
                    description += f" Imported Lab: {orig}"
                elif event.type == "ai_summary":
                    summary = event.structured_payload.get('summary', '')
                    insights = event.structured_payload.get('insights', [])
                    description += f" AI Summary: {summary}. Insights: {', '.join(insights)}"
                elif event.type == "consent_status_changed":
                    status = event.structured_payload.get('status', 'Unknown')
                    description += f" Consent Status: {status}"
                
                notes = event.structured_payload.get('notes')
                if notes:
                    description += f" Notes: {notes}"
                
                medications = event.structured_payload.get('medications')
                if medications:
                    description += f" Medications: {', '.join(medications)}"
                    
                result = event.structured_payload.get('result')
                if result:
                    description += f" Result: {result}"
                
                source_badge = event.metadata_col.get('badge', event.source) if event.metadata_col else event.source
                context_parts.append(f"- [{source_badge}] {event.occurred_at.strftime('%Y-%m-%d')} | {event.type}: {title} - {description.strip()}")
        else:
            context_parts.append("\nNo Timeline events found for this patient.")

        if not context_parts:
            context_parts.append("No medical records available for this patient.")
            
        return "\n".join(context_parts), sources

    async def get_chat_response(self, request: AIChatRequest, user: User) -> AIChatResponse:
        if not self.providers:
            logger.error("No AI providers configured.")
            raise ValueError("AI is temporarily unavailable due to server configuration.")
            
        requested_role = request.client_role or "PATIENT"
        if requested_role == "DOCTOR" and user.role.value != "DOCTOR":
            raise ValueError("Unauthorized to access Doctor AI.")
            
        context_str, sources = await self._build_context(user, client_role=requested_role)
        from datetime import datetime
        current_date = datetime.now().strftime("%Y-%m-%d")
        
        prompt_template = DOCTOR_SYSTEM_PROMPT if requested_role == "DOCTOR" else SYSTEM_PROMPT
        sys_msg = prompt_template.format(context=context_str, current_date=current_date)
        
        messages = [
            {"role": "system", "content": sys_msg},
            {"role": "user", "content": request.message}
        ]
        
        for name, provider, model in self.providers:
            try:
                logger.info(f"Attempting inference with {name} ({model})")
                response = await provider.generate_content(model=model, messages=messages)
                return AIChatResponse(answer=response.choices[0].message.content, sources=sources)
            except Exception as e:
                logger.warning(f"{name} provider failed: {str(e)}")
                continue
                
        # If all fail
        logger.error("All AI providers failed.")
        raise ValueError("AI is temporarily unavailable. Please try again later.")

    async def get_chat_stream_response(self, request: AIStreamRequest, user: User) -> AsyncGenerator[str, None]:
        if not self.providers:
            yield json.dumps(AIStreamChunk(type="error", content="AI is temporarily unavailable.").model_dump(mode='json')) + "\n\n"
            yield json.dumps(AIStreamChunk(type="done").model_dump(mode='json')) + "\n\n"
            return

        context_payload = request.context_payload
        if not context_payload and request.conversation_id:
            from app.infrastructure.database.models import AIConversation
            conv_result = await self.db.execute(select(AIConversation).where(AIConversation.id == request.conversation_id))
            conv = conv_result.scalar_one_or_none()
            if conv and conv.context_payload:
                context_payload = conv.context_payload

        requested_role = request.client_role or "PATIENT"
        if requested_role == "DOCTOR" and user.role.value != "DOCTOR":
            yield json.dumps(AIStreamChunk(type="error", content="Unauthorized to access Doctor AI.").model_dump(mode='json')) + "\n\n"
            yield json.dumps(AIStreamChunk(type="done").model_dump(mode='json')) + "\n\n"
            return

        self.tool_registry.services.user = user
        self.tool_registry.services.client_role = requested_role
        self.tool_registry.services.context_payload = context_payload

        try:
            context_str, sources = await self._build_context(user, client_role=requested_role, context_payload=context_payload)
            yield json.dumps(AIStreamChunk(type="sources", sources=sources).model_dump(mode='json')) + "\n\n"

            from datetime import datetime
            current_date = datetime.now().strftime("%A, %B %d, %Y")
            
            prompt_template = DOCTOR_SYSTEM_PROMPT if requested_role == "DOCTOR" else SYSTEM_PROMPT
            sys_msg = prompt_template.format(context=context_str, current_date=current_date) + "\n\nYou have access to tools. Use them to fetch live information or take actions when requested."
            
            messages = [{"role": "system", "content": sys_msg}]
            
            # Take last 10 messages max
            recent_msgs = request.messages[-10:]
            for msg in recent_msgs:
                if msg.role == "user":
                    messages.append({"role": "user", "content": msg.content})
                elif msg.role == "model":
                    messages.append({"role": "assistant", "content": msg.content})
                
            tools = get_openai_tools()
            
            success = False
            for name, provider, model in self.providers:
                try:
                    logger.info(f"Attempting stream inference with {name} ({model})")
                    yield json.dumps(AIStreamChunk(type="provider", content=name).model_dump(mode='json')) + "\n\n"
                    stream = provider.generate_content_stream(model=model, messages=messages, tools=tools)
                    
                    # Accumulate tool calls if any
                    current_tool_calls = {}
                    
                    async for chunk in stream:
                        delta = chunk.choices[0].delta
                        if delta.content:
                            yield json.dumps(AIStreamChunk(type="text", content=delta.content).model_dump(mode='json')) + "\n\n"
                            
                        if delta.tool_calls:
                            for tc in delta.tool_calls:
                                idx = tc.index
                                if idx not in current_tool_calls:
                                    current_tool_calls[idx] = {"id": tc.id, "type": "function", "function": {"name": tc.function.name, "arguments": ""}}
                                if tc.function.arguments:
                                    current_tool_calls[idx]["function"]["arguments"] += tc.function.arguments
                    
                    # Process tool calls after the initial stream completes
                    if current_tool_calls:
                        messages.append({
                            "role": "assistant",
                            "tool_calls": list(current_tool_calls.values())
                        })
                        
                        for idx, call in current_tool_calls.items():
                            tool_name = call["function"]["name"]
                            try:
                                args = json.loads(call["function"]["arguments"])
                            except json.JSONDecodeError:
                                args = {}
                                
                            logger.info(f"Executing tool {tool_name} with args {args}")
                            result = await self.tool_registry.execute(tool_name, args)
                            
                            # Yield action payload to frontend
                            yield json.dumps(AIStreamChunk(
                                type="action",
                                action_type=tool_name,
                                action_payload={"result": result, "args": args}
                            ).model_dump(mode='json')) + "\n\n"
                            
                            # Send tool result to the provider
                            messages.append({
                                "role": "tool",
                                "tool_call_id": call["id"],
                                "name": tool_name,
                                "content": json.dumps({"result": result})
                            })
                            
                        # Perform the follow-up request with tool results
                        try:
                            follow_up_stream = provider.generate_content_stream(model=model, messages=messages)
                            async for final_chunk in follow_up_stream:
                                if final_chunk.choices[0].delta.content:
                                    yield json.dumps(AIStreamChunk(type="text", content=final_chunk.choices[0].delta.content).model_dump(mode='json')) + "\n\n"
                        except Exception as fe:
                            logger.error(f"Follow-up stream failed: {str(fe)}")
                            yield json.dumps(AIStreamChunk(type="error", content="Sorry, I encountered an error while processing that information.").model_dump(mode='json')) + "\n\n"
                    
                    success = True
                    break # Provider succeeded, break out of failover loop
                except Exception as e:
                    logger.warning(f"{name} stream failed: {str(e)}")
                    continue # Try next provider
                    
            if not success:
                logger.error("All AI providers failed during streaming.")
                yield json.dumps(AIStreamChunk(type="error", content="AI is temporarily unavailable. Please try again later.").model_dump(mode='json')) + "\n\n"

            # Title generation on first message
            if success and len(request.messages) == 1:
                title_messages = [
                    {"role": "system", "content": "Generate a concise, 2-4 word title for this patient request. Do not use quotes or prefixes."},
                    {"role": "user", "content": f"Request: {request.messages[0].content}"}
                ]
                for name, provider, model in self.providers:
                    try:
                        title_response = await provider.generate_content(model=model, messages=title_messages)
                        title_text = title_response.choices[0].message.content
                        if title_text:
                            title_text_clean = title_text.strip()
                            yield json.dumps(AIStreamChunk(type="title", title=title_text_clean).model_dump(mode='json')) + "\n\n"
                            
                            if request.conversation_id:
                                from app.infrastructure.database.models import AIConversation
                                await self.db.execute(
                                    update(AIConversation)
                                    .where(AIConversation.id == request.conversation_id)
                                    .values(title=title_text_clean)
                                )
                                await self.db.commit()
                        break
                    except Exception as te:
                        logger.warning(f"Failed to generate title with {name}: {te}")

            yield json.dumps(AIStreamChunk(type="done").model_dump(mode='json')) + "\n\n"
            
        except Exception as e:
            logger.error(f"Error in stream: {str(e)}", exc_info=True)
            yield json.dumps(AIStreamChunk(type="error", content="AI is temporarily unavailable. Please try again later.").model_dump(mode='json')) + "\n\n"
            yield json.dumps(AIStreamChunk(type="done").model_dump(mode='json')) + "\n\n"
