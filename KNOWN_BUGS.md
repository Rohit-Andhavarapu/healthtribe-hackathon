# Known Bugs (End of Sprint 4)

## Backend
1. Occasional latency when routing through TogetherAI fallback if Groq and OpenRouter are both rate-limited.
2. The Database seeding script occasionally produces conflicting overlapping time slots for a single doctor if the faker generates identical timestamps.

## Frontend
1. The AI Chat's `isScrolledUpRef` logic sometimes fails to pin to the absolute bottom on very fast streaming responses.
2. If the mock WebRTC page drops connection, it currently fails silently without a reconnect UI.

*Note: The previously known React Query array filtering crash on missing profiles has been fully resolved.*
