# Project Modules

This directory contains one markdown file per Finwise module. Each file describes the module's purpose, current state, responsibilities, boundaries, related code, linked PBIs, and open questions.

Use these documents alongside `timeline.md` to understand how each area of the product evolves across phases.

## Module Index

| Module | Description | Status |
|---|---|---|
| [Auth](./auth.md) | Authentication and user identity resolution | Implemented (Supabase email/password); LINE pending |
| [Dashboard](./dashboard.md) | Summary stats and charts | Implemented |
| [Expense](./expense.md) | Core expense CRUD and categories | Implemented |
| [Spending](./spending.md) | Aggregated spending analysis and reports | Partial (via Dashboard) |
| [Income](./income.md) | Income tracking for net cash flow | Aspirational |
| [Outcome](./outcome.md) | Cash outflow abstraction | Conceptual; currently covered by Expense |
| [Receipt](./receipt.md) | Receipt upload and AI extraction | Implemented |
| [Bank Slip](./bank-slip.md) | Thai bank slip upload and AI extraction | Implemented |
| [LINE](./line.md) | LINE Login, Mini App, and chatbot | Not implemented |
| [Offline Sync](./offline-sync.md) | IndexedDB storage and background sync | Not implemented |
| [AI Extraction](./ai-extraction.md) | OCR and model-driven data extraction | Implemented; pipeline aspirational |
| [DevOps](./devops.md) | Docker, CI/CD, and deployment | Not implemented |
