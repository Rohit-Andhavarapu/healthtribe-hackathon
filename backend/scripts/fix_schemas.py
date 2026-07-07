import os
import glob

modules_dir = os.path.join(os.path.dirname(__file__), "..", "app", "modules")
for root, dirs, files in os.walk(modules_dir):
    for file in files:
        if file == "schemas.py":
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            
            needs_save = False
            
            # replace str with uuid.UUID for known UUID fields
            replacements = {
                "id: str": "id: uuid.UUID",
                "doctor_id: str": "doctor_id: uuid.UUID",
                "patient_id: str": "patient_id: uuid.UUID",
                "hospital_id: str": "hospital_id: uuid.UUID",
                "user_id: str": "user_id: uuid.UUID",
                "doctor_id: Optional[str]": "doctor_id: Optional[uuid.UUID]",
                "patient_id: Optional[str]": "patient_id: Optional[uuid.UUID]",
            }
            
            for old, new in replacements.items():
                if old in content:
                    content = content.replace(old, new)
                    needs_save = True
            
            if needs_save:
                if "import uuid" not in content:
                    content = "import uuid\n" + content
                with open(path, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"Fixed {path}")
