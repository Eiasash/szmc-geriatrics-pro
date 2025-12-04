# SZMC Auditor v14: Quick Start Guide

**Objective:** Generate a safe, validated, and professional case presentation in <3 minutes.

## Phase 1: Ingest Data
1.  **Open App:** Launch `SZMC Auditor` from your desktop/home screen.
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
2.  **Download:**
    * **PPTX:** For the morning staff meeting.
    * **Word:** For the official file or copy-pasting into the EMR.
