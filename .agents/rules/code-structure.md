---
trigger: always_on
---

- Never do any heavy data processing inside a component
- Never do any data fetching inside a component
- These should be done inside respective hooks
- Always follow DRY principle
- When fetching long lists, always implement pagination. Pagination should be server side.