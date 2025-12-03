# SZMC Geriatrics Pro

🩺 **Case Presentation Tool for Geriatric Medicine**

Built for Shaare Zedek Medical Center (SZMC), Jerusalem - Geriatrics Fellowship

![Version](https://img.shields.io/badge/version-5.3-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🌐 Live Demo

**[https://eiasash.github.io/szmc-geriatrics-pro](https://eiasash.github.io/szmc-geriatrics-pro)**

## ✨ Features

### 📊 Case Presentations
- **13-slide case template** - Complete geriatric case presentation format
- **Consultation template** - Quick consult notes
- **Morning report template** - Teaching format
- Slide navigation with swipe gestures
- Auto-save to localStorage

### 📥 Import Presentations (NEW in v4.1)
Import from multiple formats:
- **JSON** - Native format, export/import between devices
- **Markdown** - Use `# Title` and `## Slide` headers
- **Plain Text** - Sections separated by blank lines
- **CSV** - Medication lists, lab values

Example Markdown import:
```markdown
# Delirium Case

## Patient
78yo male, nursing home resident

## Chief Complaint
Acute confusion x 2 days

## Medications
- Metoprolol 25mg daily
- Lisinopril 10mg daily
- Donepezil 10mg qhs

## Differential Diagnosis
- Delirium secondary to UTI
- Medication effect
- Dementia exacerbation
```

### 🧮 Clinical Calculators
- **CrCl** (Cockcroft-Gault)
- **eGFR** (CKD-EPI 2021)
- **CAM** (Confusion Assessment Method)
- **Morse Fall Scale**
- **MNA-SF** (Nutrition)
- **GDS-15** (Depression)
- **FRAIL Scale**
- **CHA₂DS₂-VASc**

### 💊 Drug Reference
- **Beers Criteria** - Drugs to avoid in elderly
- **Geriatric dosing** - Start low, go slow recommendations
- Renal adjustments

### 🧪 Lab Reference
- Normal values with geriatric-specific notes
- Assessment cutoffs (MMSE, MoCA, CAM, GDS, MNA, CFS, etc.)

### 🧠 AI Assistant (Optional)
- Automatic slide modification and speaker notes
- Generate DDx, teaching points, management plans
- Medication review (Beers criteria check)
- Evidence packs (2024-2025) with quick inject buttons and slide-ready summaries
- Presentation QA → “Ask AI to fix” workflow
- API key tester inside Settings
- Coaching tab (hooks, timelines, tough Q&A) plus safety rails and 24h checklist generators
- Slide-ready monitoring grids, handoff cards, and expanded 2025 guideline packs

## 🚀 Quick Start

### Use Online
Visit the live demo link above - works on mobile and desktop.

### Run Locally
1. Clone this repo
2. Open `index.html` in a browser
3. No build process required!

### Enable AI Features
1. Get an API key from [console.anthropic.com](https://console.anthropic.com)
2. Go to Settings (⚙️) in the app
3. Enter your API key
4. AI features will now work

## 📱 Mobile Optimized

- Touch-friendly interface
- Swipe between slides
- Bottom navigation bar
- Works offline (except AI)

## 🏥 Clinical Content

### Geriatric Syndromes
- Delirium (CAM criteria, workup, management)
- Falls (risk factors, prevention)
- Frailty (FRAIL scale, CFS)
- Polypharmacy (deprescribing)
- Malnutrition (MNA screening)

### Assessment Tools
| Tool | Cutoff | Interpretation |
|------|--------|----------------|
| MMSE | ≤23 | Cognitive impairment |
| MoCA | ≤25 | Cognitive impairment (+1 if edu <12y) |
| GDS-15 | ≥5 | Depression |
| CAM | 1+2+(3or4) | Delirium |
| MNA-SF | <8 | Malnourished |
| CFS | ≥5 | Frail |
| Morse | ≥25 | Fall risk |
| TUG | >12s | Fall risk |

## 🛠️ Development

### Tech Stack
- Vanilla JavaScript (no build required)
- Tailwind CSS (via CDN)
- LocalStorage for persistence
- Anthropic Claude API for AI

### File Structure
```
├── index.html      # Main application
├── manifest.json   # PWA manifest
├── README.md       # This file
└── LICENSE         # MIT license
```

### Contributing
Pull requests welcome! Please test on mobile devices.

## 📄 License

MIT License - Use freely for educational and clinical purposes.

## 👨‍⚕️ Author

**Eias** - Geriatrics Fellow, Shaare Zedek Medical Center

---

*Disclaimer: This tool is for educational purposes. Always verify clinical information with authoritative sources.*
