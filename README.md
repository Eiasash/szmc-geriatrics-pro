# SZMC Geriatrics Pro: Auditor Edition (v14.1)

**A Clinical Decision Support tool with an "Inner AI Auditor" for safety checks.**

## New in v14.1
* **Mobile Optimized:** Full responsive design for Samsung S23 Ultra and other mobile devices
* **Security Hardened:** Added Subresource Integrity (SRI) checks for all CDN resources
* **Improved Code Quality:** Expanded, documented JavaScript for maintainability

## The Inner AI Auditor
In Geriatrics, complexity leads to errors (Polypharmacy, missed delirium, unsafe discharge).
v14.0 introduces a dedicated **Audit Panel** that generates strict "Critique Prompts" for AI assistants.

### Audit Modes:
1.  **Med Safety:** Forces the AI to check your medication list against **Beers Criteria**, **STOPP/START**, and **Renal Dosing** rules.
2.  **Diagnostic Blindspots:** Asks the AI to identify what you might have missed (Anchoring bias check).
3.  **Discharge Safety:** Evaluates if the patient is functionally safe to return to their specific residence.

## Standard Features
* **Offline-First:** No data leaves your browser during processing.
* **Universal Import:** Drag & Drop PDF, PPTX, DOCX, or Images (OCR).
* **Auto-Save:** Your work is saved instantly to local storage.
* **Speed Macros:** One-click insertion of common geriatric phrases.
* **Mobile Ready:** Optimized for phones and tablets with bottom navigation.

## How to Use
1.  **Import:** Drag your patient files into the sidebar.
2.  **Refine:** Use the "Macros" to quickly clean up the HPI and Plan.
3.  **AUDIT (Crucial Step):** Before you finish, click **"Run Clinical Audit"**.
4.  **Paste:** Paste the result into your preferred AI assistant for analysis.
5.  **Export:** Download your PPTX for the meeting.

## Privacy & Data Security

### Local Processing
* **All file parsing happens locally** in your browser using JavaScript libraries
* **No patient data is transmitted** to any external server during import or processing
* **Auto-save uses localStorage** which stays on your device only

### AI Prompt Usage - Important Notice
When you click "Generate Summary" or "Run Clinical Audit", the tool copies a text prompt to your clipboard. **You** then paste this into an external AI service (ChatGPT, Claude, etc.).

**Before using AI services with clinical data:**
1. **De-identify data:** Remove or use initials instead of full patient names
2. **Check your institution's policy** on using AI tools with clinical information
3. **Review AI service privacy policies** - data may be used for training
4. **Consider using enterprise/HIPAA-compliant AI solutions** if available
5. **Never paste sensitive identifiers** (MRN, SSN, full DOB, addresses)

**This tool does not send data to AI services automatically.** The decision to share clinical information with external AI is made by you when you paste the copied prompt.

## Technical Security
* CDN resources include Subresource Integrity (SRI) hashes
* No external tracking or analytics
* No cookies or third-party scripts beyond document parsing libraries
