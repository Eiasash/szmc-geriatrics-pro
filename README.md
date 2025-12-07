# SZMC Geriatrics Pro: Auditor Edition (v15.5.0)

**A Clinical Decision Support tool with an "Inner AI Auditor" for safety checks.**

## New in v15.5.0 - Import/Export Improvements
* **📁 Enhanced File Import:** Fixed DOC file handling - now properly supports both .doc and .docx formats
* **🔧 Improved Data Population:** Enhanced auto-population of clinical fields from imported documents
* **📊 Comprehensive PowerPoint Presentations:** Professional 15+ slide presentations including:
  * Complete case overview with demographics
  * Detailed medication safety review (Beers Criteria, drug interactions)
  * Functional and cognitive assessment sections
  * Comprehensive management plan (pharmacological and non-pharmacological)
  * Safety considerations and discharge planning
  * Evidence-based clinical guidelines and references
* **📝 Robust Word Document Export:**
  * Generates proper DOCX format
  * Comprehensive structured document with medical standards
  * Full reference citations (Beers Criteria, STOPP/START, CGA, etc.)
  * Proper formatting with headings, bullets, and sections
* **📚 Medical Standards Integration:** All exports include references to:
  * AGS Beers Criteria® (2023)
  * STOPP/START Criteria
  * Comprehensive Geriatric Assessment (CGA)
  * Clinical Frailty Scale (Rockwood)
  * CAM - Confusion Assessment Method

## Supported File Formats

### Import (Drag & Drop)
| Format | Extension | Description |
|--------|-----------|-------------|
| PowerPoint | .pptx | Extracts text from all slides |
| Word | .docx, .doc | Extracts document text |
| PDF | .pdf | Extracts text content |
| HTML | .html, .htm | Extracts plain text from HTML |
| Text | .txt | Plain text files |
| Images | .jpg, .jpeg, .png | OCR text extraction (Tesseract.js) |

### Export
| Format | Extension | Description |
|--------|-----------|-------------|
| PowerPoint | .pptx | Professional medical presentation |
| Word | .docx | Structured clinical document |
| JSON | .json | Data backup/portability |

## Previous Features (v15.3.0)
* **Security Updates:** Updated all dependencies, fixed critical vulnerabilities (happy-dom, vitest)
* **Enhanced XSS Protection:** Added comprehensive HTML escaping for all exports to prevent security issues
* **New Features:**
  * Clear Form button with confirmation dialog
  * Export to JSON functionality for data portability
  * Keyboard shortcuts (Ctrl/⌘ + G for prompt, Ctrl/⌘ + E for PPTX, Ctrl/⌘ + Shift + E for DOC)
* **Improved Validation:** Added input validation for all major functions with helpful error messages
* **Better Accessibility:** Added ARIA labels to all form inputs and buttons
* **Enhanced Testing:** Expanded test suite to 194 tests with comprehensive coverage

## Previous Features (v15.2.0)
* **Auto-Save:** Form data is automatically saved to localStorage to prevent data loss
* **Improved Error Handling:** Better error messages and graceful fallbacks throughout the application
* **Mobile Optimized:** Full responsive design for Samsung S23 Ultra and other mobile devices
* **Security Hardened:** Subresource Integrity (SRI) checks for all CDN resources
* **Modular Architecture:** Refactored codebase into separate ES modules for better maintainability

## The Inner AI Auditor
In Geriatrics, complexity leads to errors (Polypharmacy, missed delirium, unsafe discharge).
The app includes a dedicated **Audit Panel** that generates strict "Critique Prompts" for AI assistants.

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
