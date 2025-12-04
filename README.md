# SZMC Geriatrics Pro: Auditor Edition (v14.0)

**A Clinical Decision Support tool with an "Inner AI Auditor" for safety checks.**

## New Feature: The Inner AI Auditor
In Geriatrics, complexity leads to errors (Polypharmacy, missed delirium, unsafe discharge).
v14.0 introduces a dedicated **Audit Panel** that generates strict "Critique Prompts" for ChatGPT/Claude.

### Audit Modes:
1.  **Med Safety:** Forces the AI to check your specific medication list against **Beers Criteria**, **STOPP/START**, and **Renal Dosing** rules.
2.  **Diagnostic Blindspots:** Asks the AI to identify what you might have missed (Anchoring bias check).
3.  **Discharge Safety:** Evaluates if the patient is functionally safe to return to their specific residence (Home vs. Nursing Home).

## Standard Features
* **Offline-First:** No data leaves your browser.
* **Universal Import:** Drag & Drop PDF, PPTX, DOCX, or Images (OCR).
* **Auto-Save:** Your work is saved instantly to local storage.
* **Speed Macros:** One-click insertion of common geriatric phrases.

## How to Use
1.  **Import:** Drag your patient files into the sidebar.
2.  **Refine:** Use the "Macros" to quickly clean up the HPI and Plan.
3.  **AUDIT (Crucial Step):** Before you finish, click **"Run Clinical Audit"**.
4.  **Paste:** Paste the result into ChatGPT. It will tell you: *"Wait, you prescribed Ciprofloxacin but the creatinine is 2.1. Please adjust."*
5.  **Export:** Download your PPTX for the meeting.
