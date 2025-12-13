# SZMC Pro v16.0 Enhanced: Quick Start Guide

**Objective:** Generate a safe, validated, and professional case presentation in <3 minutes with powerful new tools.

---

## 🆕 What's New in v16.0

### Major Enhancements
* **🌙 Dark Mode:** Toggle with button in top-right (theme persists)
* **🧮 Clinical Calculators:** eGFR, CrCl, FRAX, CHA₂DS₂-VASc, MMSE
* **📋 Case Templates:** 6 pre-built scenarios (Falls, Delirium, Polypharmacy, etc.)
* **📖 Reference Library:** Beers Criteria, STOPP/START, CGA tools
* **📚 Case History:** Save, search, and restore cases
* **🎨 Modern UI:** Beautiful gradients, animations, enhanced design
* **🔔 Smart Notifications:** Toast messages for all actions

### New Keyboard Shortcuts
* `Ctrl/⌘ + H` - Open Case History
* `Ctrl/⌘ + Z` - Undo changes
* `Ctrl/⌘ + S` - Save case to history

### Existing Shortcuts
* `Ctrl/⌘ + G` - Generate AI Prompt
* `Ctrl/⌘ + E` - Export to PowerPoint
* `Ctrl/⌘ + Shift + E` - Export to Word

---

## 🚀 60-Second Quickstart

### Option 1: Use a Template (Fastest)
1. Click **📋 Templates** in sidebar
2. Select "Falls Assessment" or "Delirium"
3. Template loads instantly
4. Modify patient details as needed
5. Press `Ctrl+G` to generate AI prompt
6. Done! Press `Ctrl+E` for PowerPoint

### Option 2: Import a File
1. Drag PDF/DOCX into dropzone
2. Data auto-populates fields
3. Click **📖 Refs** to check Beers Criteria
4. Click **🧮 Calc** to calculate eGFR
5. Press `Ctrl+G` for AI prompt
6. Press `Ctrl+S` to save to history

---

## 📖 Detailed Workflow

### Phase 1: Data Entry (Choose Your Method)

#### Method A: Use a Template
**When to use:** Common scenarios, quick assessments, learning
1. Click **📋 Templates** button in sidebar
2. Choose from 6 scenarios:
   * **Falls Assessment** - 3 falls, risk medications
   * **Delirium** - Acute mental status change
   * **Polypharmacy** - 15+ medications review
   * **Dementia Evaluation** - Progressive decline
   * **Frailty** - Weight loss, decreased activity
   * **Pain Management** - Chronic pain, opioids
3. Template loads into form
4. Customize for your specific patient

#### Method B: Import a File
**When to use:** Existing documents, discharge summaries, consult notes
1. Drag file into dropzone (or click to browse)
2. Supported formats: PDF, DOCX, DOC, PPTX, HTML, TXT, JPG
3. Watch status indicator: "Reading..." → "Success!"
4. Check "Raw Data" section to verify extraction
5. Data auto-fills Age/Sex, HPI, and Medications

#### Method C: Manual Entry
**When to use:** New cases, dictation, live patient encounters
1. Fill **Age/Sex** (e.g., "85F" or "72 M")
2. Enter **Initials** (e.g., "J.D.")
3. Type **CC/HPI** in chief complaint field
4. List **Meds & Labs** in medications field

---

### Phase 2: Clinical Tools & References

#### Use Clinical Calculators (🧮 Button)
**Quick calculations without leaving your workflow**

1. Click **🧮 Calc** in quick actions
2. Select calculator from tabs:
   * **eGFR** - Enter Cr, Age, Sex → Get CKD stage
   * **CrCl** - Add Weight → Get clearance for dosing
   * **FRAX** - Fracture risk assessment
   * **CHA₂DS₂-VASc** - Stroke risk in AFib
   * **MMSE** - Cognitive status interpretation
3. Results appear instantly with clinical interpretation
4. Use for medication dosing adjustments

**Example Use Case:**
```
Patient on Digoxin with Cr 1.8
→ Calculate eGFR: 32 mL/min (Stage 3b CKD)
→ Calculate CrCl: 28 mL/min
→ Adjust Digoxin dose accordingly
→ Note in meds: "Digoxin dose reduced for renal impairment"
```

#### Check Clinical References (📖 Button)
**Evidence-based guidelines at your fingertips**

1. Click **📖 Refs** in quick actions
2. Navigate tabs:
   * **Beers Criteria** - High-risk medications
   * **STOPP/START** - Deprescribing guidance
   * **CGA Tools** - Assessment domains
3. Keep modal open while working
4. Cross-reference medications against Beers

**Example Use Case:**
```
Patient on: Diphenhydramine, Lorazepam, Diazepam
→ Check Beers: All are high-risk
→ Diphenhydramine → Delirium, falls
→ Benzodiazepines → Falls, cognitive impairment
→ Flag in AI prompt for deprescribing recommendations
```

---

### Phase 3: The Safety Audit (CRITICAL)

**Before generating your final output, always review safety**

#### Step 1: Review Medications Against References
1. Open **📖 Refs** → Beers Criteria tab
2. Scan medication list for high-risk drugs
3. Note any:
   * Anticholinergics (Benadryl, Promethazine)
   * Benzodiazepines (Ativan, Valium)
   * NSAIDs without gastroprotection
   * Long-term PPIs (>8 weeks)

#### Step 2: Calculate Renal Function
1. Open **🧮 Calc** → eGFR tab
2. Enter creatinine, age, sex
3. Check CKD stage
4. Review medications for renal dosing:
   * Antibiotics
   * Anticoagulants
   * Diabetes medications
   * Cardiac medications

#### Step 3: Generate AI Audit Prompt
1. Press **`Ctrl+G`** (or click "✨ Copy AI Prompt")
2. Prompt auto-copies to clipboard
3. Paste into ChatGPT/Claude
4. AI will audit:
   * **Medication Safety** (Beers, interactions, dosing)
   * **Diagnostic Blindspots** (missed diagnoses)
   * **Discharge Safety** (functional status, home safety)

#### Step 4: Review & Adjust
1. Read AI recommendations carefully
2. Go back to form and update based on findings
3. Add safety considerations to assessment
4. Adjust medications if needed
5. Document rationale

---

### Phase 4: Save & Export

#### Save to Case History
**Keep track of all your cases**
1. Press **`Ctrl+S`** (or click 📚 History → Save button)
2. Case saves with timestamp
3. Access later: Press `Ctrl+H` to browse history
4. Search cases by patient info
5. Click any case to reload it

#### Export Options

##### Option 1: PowerPoint Presentation (`Ctrl+E`)
**Best for:** Morning rounds, case conferences, presentations
* **15+ professional slides** including:
  * Case overview with demographics
  * Medication safety review
  * Functional & cognitive assessment
  * Management plan
  * Safety considerations
  * Clinical references
* Click **📊 Download PPTX (With AI)**
* Or **🎓 Professional PPTX (No AI)** for cleaner version

##### Option 2: Word Document (`Ctrl+Shift+E`)
**Best for:** Documentation, EMR notes, formal reports
* **Structured clinical document** with:
  * Proper medical formatting
  * Section headings
  * Bullet points
  * Citations (Beers, STOPP/START, CGA)
* Click **📝 Download Word (Doc)**

##### Option 3: PDF (`Print`)
**Best for:** Printing, email, archival
* Click **📄 Export PDF**
* Browser print dialog opens
* Select "Save as PDF"
* Preserves formatting perfectly

##### Option 4: JSON Backup
**Best for:** Data portability, backup
* Click **💾 Export JSON**
* Raw data in JSON format
* Can reimport later
* Good for backup before major changes

---

## 💡 Pro Tips & Workflows

### Workflow 1: Polypharmacy Review (Full Audit)
```
1. Load template: 📋 → Polypharmacy
2. Or import patient med list
3. Open Beers: 📖 → Beers Criteria
4. Scan each medication
5. Calculate eGFR: 🧮 → eGFR
6. Note renal dosing issues
7. Check STOPP: 📖 → STOPP/START
8. Generate prompt: Ctrl+G
9. Paste to AI for recommendations
10. Update plan based on AI
11. Export PowerPoint: Ctrl+E
12. Save case: Ctrl+S
```

### Workflow 2: Falls Risk Assessment
```
1. Import discharge summary (PDF)
2. Load Falls template for reference: 📋
3. Identify fall risk meds in Beers: 📖
4. List medications causing:
   * Orthostatic hypotension
   * Sedation
   * Cognitive impairment
5. Generate AI prompt: Ctrl+G
6. Get deprescribing recommendations
7. Export Word doc: Ctrl+Shift+E
```

### Workflow 3: Quick Renal Dosing
```
1. While reviewing meds
2. Quick calc: 🧮 → eGFR
3. Enter Cr, Age, Sex
4. Instant result with stage
5. Adjust doses accordingly
6. Continue working
7. No workflow interruption
```

### Workflow 4: Learning Case
```
1. Load template: 📋 → Delirium
2. Review CGA domains: 📖 → CGA Tools
3. Study the template structure
4. Modify one element at a time
5. Generate AI analysis: Ctrl+G
6. Learn from AI recommendations
7. Save variations: Ctrl+S
8. Build case library
```

---

## ⌨️ Keyboard Shortcuts Cheat Sheet

### Essential Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+G` | Generate AI Prompt (most used!) |
| `Ctrl+E` | Export PowerPoint |
| `Ctrl+S` | Save case to history |
| `Ctrl+H` | Open case history browser |
| `Ctrl+Z` | Undo last change |

### Export Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+E` | PowerPoint (with AI) |
| `Ctrl+Shift+E` | Word document |

### Quick Access
* Click **📋** Templates
* Click **🧮** Calculators
* Click **📖** References
* Click **📚** History
* Click **🌙** Dark mode toggle

---

## 🎨 UI Tips

### Dark Mode
* Click **🌙** in top-right corner
* Theme saves automatically
* Perfect for night shifts
* Easy on the eyes for long sessions

### Toast Notifications
* Green ✅ = Success
* Red ❌ = Error
* Yellow ⚠️ = Warning
* Auto-dismiss in 3 seconds
* Non-intrusive overlay

### Modal Windows
* Click outside to close
* X button in top-right
* ESC key to close (browser default)
* Fully responsive on mobile

---

## 📱 Mobile Usage

### Optimizations
* Sidebar becomes top bar
* Quick actions stack vertically
* Modals full-width
* Large touch targets
* Swipe-friendly interface

### Mobile Tips
1. Use templates for faster data entry
2. Calculators work great on mobile
3. Reference library scrolls smoothly
4. Save often with Ctrl+S (long-press)
5. Export works on mobile browsers

---

## 🔄 Common Workflows

### Morning Rounds Prep (5 min)
```
For 3 patients:
1. Load Falls template → Modify → Ctrl+S
2. Load Delirium template → Modify → Ctrl+S
3. Load Polypharmacy template → Modify → Ctrl+S
4. For each: Ctrl+G → AI review
5. For each: Ctrl+E → PowerPoint
Total: 3 presentations ready in 5 minutes
```

### Comprehensive Medication Review (10 min)
```
1. Import med list (PDF)
2. Calculate eGFR: 🧮
3. Review each med against Beers: 📖
4. Check STOPP criteria: 📖
5. Generate AI audit: Ctrl+G
6. Review AI recommendations
7. Update medication list
8. Export Word doc: Ctrl+Shift+E
9. Save case: Ctrl+S
```

### Quick Consult Response (2 min)
```
1. Load relevant template
2. Modify chief complaint
3. Quick eGFR if needed
4. Generate prompt: Ctrl+G
5. Get AI recommendations
6. Copy key points
7. Done - no export needed
```

---

## 🎓 Learning Path

### Beginner (First Time User)
1. **Try Dark Mode:** Click 🌙 to see both themes
2. **Load a Template:** 📋 → Falls Assessment
3. **Explore Calculator:** 🧮 → Try eGFR
4. **Check References:** 📖 → Browse Beers Criteria
5. **Generate Prompt:** Ctrl+G (don't paste yet)
6. **Clear Form:** Button at bottom
7. **Repeat** with different templates

### Intermediate (Second Session)
1. **Import a File:** Drag PDF or DOCX
2. **Use Calculator:** Calculate actual eGFR
3. **Reference Check:** Compare meds to Beers
4. **Generate & Use:** Ctrl+G → Paste to AI
5. **Export:** Ctrl+E for PowerPoint
6. **Save Case:** Ctrl+S for history

### Advanced (Daily User)
1. **Keyboard-First:** Use all shortcuts
2. **Template Customization:** Modify templates for your cases
3. **Multi-Case Management:** Use history (Ctrl+H) effectively
4. **Integrated Workflow:** Calc → Refs → Prompt → Export
5. **Quality Checks:** Always audit with AI before export

---

## ⚠️ Important Reminders

### Privacy & Security
* ✅ All data stays local (localStorage)
* ✅ No server transmission during import
* ✅ YOU control AI prompt pasting
* ✅ De-identify before using AI
* ✅ Check institution policy on AI usage

### Data Management
* Auto-save every 500ms
* Save to history: Ctrl+S
* Export JSON for backup
* Clear form between patients
* History keeps last 50 cases

### Clinical Safety
* Always check Beers Criteria
* Calculate eGFR for renal dosing
* Review STOPP/START
* Use AI audit before finalizing
* Verify all recommendations
* Document clinical reasoning

---

## 🆘 Troubleshooting

### Issue: Template won't load
**Solution:** Click 📋 again, select different template, click desired template

### Issue: Calculator shows error
**Solution:** Check all fields filled, use valid numbers, check toast message

### Issue: Can't find saved case
**Solution:** Ctrl+H → Use search box → Type patient info

### Issue: Dark mode not saving
**Solution:** Check localStorage enabled in browser settings

### Issue: Export button not working
**Solution:** Ensure form has data, check browser console, try different export format

---

## 🎯 Success Metrics

### You're using it well when:
* ✅ Complete case in under 3 minutes
* ✅ Using keyboard shortcuts naturally
* ✅ Templates speed up common cases
* ✅ Calculators integrated in workflow
* ✅ Always checking Beers before finalizing
* ✅ Saving important cases to history
* ✅ Exporting professional presentations
* ✅ AI audit catches safety issues

---

## 📚 Next Steps

1. **Read Full Docs:** Check [ENHANCED_FEATURES.md](ENHANCED_FEATURES.md)
2. **Try All Templates:** Explore each scenario
3. **Practice Calculators:** Master eGFR and CrCl
4. **Build Case Library:** Save interesting cases
5. **Customize Workflow:** Find your optimal process
6. **Share Tips:** Help colleagues learn faster

---

**SZMC Pro v16.0** - Comprehensive Geriatric Clinical Decision Support
Quick Start Guide - Last Updated: December 13, 2025

For detailed documentation, see [README.md](README.md) or [ENHANCED_FEATURES.md](ENHANCED_FEATURES.md)
