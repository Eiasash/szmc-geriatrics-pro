# SZMC Pro v15.3: Quick Start Guide

**Objective:** Generate a safe, validated, and professional case presentation in <3 minutes.

## What's New in v15.3
* **Security Enhanced:** Updated dependencies, fixed vulnerabilities, added XSS protection
* **New Features:** Clear Form button, Export to JSON, Keyboard shortcuts
* **Better UX:** Input validation, ARIA labels for accessibility
* **Keyboard Shortcuts:**
  * `Ctrl/⌘ + G` - Generate AI Prompt
  * `Ctrl/⌘ + E` - Export to PowerPoint
  * `Ctrl/⌘ + Shift + E` - Export to Word

## Phase 1: Ingest Data
1.  **Open App:** Launch `SZMC Pro` from your desktop/home screen.
2.  **Drag & Drop:**
    * *Discharge Letter (PDF)* -> Extracts history and meds.
    * *Morning Report (PPTX)* -> Extracts slide text.
    * *Handwritten Note (JPG)* -> Uses OCR to read handwriting.
3.  **Verify:** Check the "Raw Extracted Text" sidebar to ensure data was read correctly.

## Phase 2: Refine & Speed-Type
1.  **Demographics:** Fill in Age, Sex, Initials.
2.  **Use Macros (The Chips):**
    * Click `Independent` or `Nursing Home` to instantly populate the HPI.
    * Click `Met Syn` or `Cardiac` to fill PMH.
    * Click `DNR/DNI` to set code status in the Plan.

## Phase 3: The Safety Audit (CRITICAL)
*Before generating your final output, run the Inner Auditor.*

1.  **Select Mode:**
    * Choose **"Med Safety"** for polypharmacy cases.
    * Choose **"Discharge"** for patients going home.
2.  **Run:** Click the red **"Run Clinical Audit"** button.
3.  **Process:**
    * Paste the copied prompt into ChatGPT/Claude.
    * **Review Findings:** Did it flag a drug interaction? Did it note a missing delirium workup?
    * **Adjust:** Go back to the tool and correct your "Assessment & Plan" based on the AI's critique.

## Phase 4: Export
1.  **Generate Summary:** Click "Generate Summary" for the polished narrative.
2.  **Download (or use keyboard shortcuts):**
    * **PPTX:** For the morning staff meeting (Ctrl/⌘ + E)
    * **Word:** For the official file or copy-pasting into the EMR (Ctrl/⌘ + Shift + E)
    * **JSON:** For backup or data portability
3.  **Clear Form:** Use the "Clear Form" button when starting a new case (with confirmation to prevent accidents)

## Pro Tips
* All data is auto-saved to your browser's localStorage - your work is never lost
* Use keyboard shortcuts for faster workflow
* Input validation will alert you if required fields are missing
* All exports include XSS protection for security
