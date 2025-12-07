/**
 * Exporters Module
 * Handles exporting clinical case data to various formats
 */

/**
 * Configuration for PowerPoint export
 */
export const PPT_CONFIG = {
  maxTextPerSlide: 1000,
  maxHpiLength: 400,
  maxMedsLength: 400,
  colors: {
    primary: '2c3e50',
    secondary: '7f8c8d',
    accent: '27ae60',
    highlight: 'c0392b',
    text: '333333',
    warning: 'e74c3c',
    info: '3498db',
    success: '27ae60'
  },
  fonts: {
    title: 32,
    subtitle: 24,
    heading: 18,
    body: 14,
    small: 12,
    tiny: 10
  }
};

/**
 * Medical standards and references for geriatric care
 */
export const MEDICAL_REFERENCES = {
  beers: {
    title: 'AGS Beers Criteria®',
    description: 'Potentially inappropriate medications in older adults',
    citation: '2023 American Geriatrics Society Beers Criteria® Update Expert Panel'
  },
  stopp: {
    title: 'STOPP/START Criteria',
    description: 'Screening Tool of Older Persons\' Prescriptions',
    citation: 'O\'Mahony D, et al. Age Ageing. 2015'
  },
  cga: {
    title: 'Comprehensive Geriatric Assessment',
    description: 'Multidimensional interdisciplinary diagnostic process',
    citation: 'Ellis G, et al. BMJ. 2011'
  },
  frailty: {
    title: 'Clinical Frailty Scale',
    description: 'Rockwood Clinical Frailty Scale (CFS)',
    citation: 'Rockwood K, et al. CMAJ. 2005'
  },
  delirium: {
    title: 'CAM - Confusion Assessment Method',
    description: 'Gold standard for delirium diagnosis',
    citation: 'Inouye SK, et al. Ann Intern Med. 1990'
  }
};

/**
 * Configuration for Word document export
 */
export const DOC_CONFIG = {
  mimeType: 'application/msword',
  docxMimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  bom: '\ufeff', // UTF-8 BOM for Unicode support
  xmlNamespaces: {
    office: 'urn:schemas-microsoft-com:office:office',
    word: 'urn:schemas-microsoft-com:office:word',
    html: 'http://www.w3.org/TR/REC-html40'
  }
};

/**
 * Sanitizes text for safe export (removes potentially problematic characters)
 * @param {string} text - The text to sanitize
 * @returns {string} - Sanitized text
 */
export function sanitizeText(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  // Remove control characters except newlines and tabs
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * HTML escape map for preventing XSS
 */
const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

/**
 * Regex pattern for HTML escaping
 */
const HTML_ESCAPE_REGEX = /[&<>"']/g;

/**
 * Escapes HTML special characters to prevent XSS
 * @param {string} text - The text to escape
 * @returns {string} - HTML-escaped text
 */
export function escapeHtml(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  return text.replace(HTML_ESCAPE_REGEX, char => HTML_ESCAPE_MAP[char]);
}

/**
 * Truncates text to a maximum length
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add when truncated
 * @returns {string} - Truncated text
 */
export function truncateText(text, maxLength, suffix = '...') {
  if (!text || text.length <= maxLength) {
    return text || '';
  }
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Creates comprehensive slide data for PowerPoint export (15+ slides)
 * @param {Object} data - Case data
 * @returns {Array} - Array of slide definitions
 */
export function createSlideData(data) {
  const { ageSex = '', initials = '', hpi = '', meds = '', aiResponse = '' } = data;

  const slides = [
    // Slide 1: Title Page
    {
      type: 'title',
      elements: [
        { text: 'Geriatric Case Presentation', x: 0.5, y: 1.5, w: '90%', fontSize: PPT_CONFIG.fonts.title, color: PPT_CONFIG.colors.primary, bold: true, align: 'center' },
        { text: `Patient: ${ageSex} - ${initials}`, x: 0.5, y: 2.8, w: '90%', fontSize: PPT_CONFIG.fonts.subtitle, color: PPT_CONFIG.colors.secondary, align: 'center' },
        { text: 'SZMC Geriatrics Pro - Clinical Decision Support', x: 0.5, y: 4, w: '90%', fontSize: PPT_CONFIG.fonts.small, color: PPT_CONFIG.colors.secondary, align: 'center' }
      ]
    },
    
    // Slide 2: Case Overview
    {
      type: 'content',
      elements: [
        { text: 'Case Overview', x: 0.5, y: 0.3, fontSize: PPT_CONFIG.fonts.heading, color: PPT_CONFIG.colors.accent, bold: true },
        { text: '• Patient Demographics', x: 0.7, y: 1, fontSize: PPT_CONFIG.fonts.body, bullet: true },
        { text: `  - Age/Sex: ${ageSex}`, x: 1, y: 1.4, fontSize: PPT_CONFIG.fonts.body },
        { text: `  - Initials: ${initials}`, x: 1, y: 1.8, fontSize: PPT_CONFIG.fonts.body },
        { text: '• Presentation Type: Comprehensive Geriatric Assessment', x: 0.7, y: 2.3, fontSize: PPT_CONFIG.fonts.body, bullet: true },
        { text: '• Setting: Inpatient/Outpatient Geriatric Consultation', x: 0.7, y: 2.8, fontSize: PPT_CONFIG.fonts.body, bullet: true }
      ]
    },

    // Slide 3: Chief Complaint & HPI (Part 1)
    {
      type: 'content',
      elements: [
        { text: 'Chief Complaint & History of Present Illness', x: 0.5, y: 0.3, fontSize: PPT_CONFIG.fonts.heading, color: PPT_CONFIG.colors.accent, bold: true },
        { text: truncateText(hpi, 600), x: 0.5, y: 1, w: '90%', h: 4, fontSize: PPT_CONFIG.fonts.body, valign: 'top' }
      ]
    },

    // Slide 4: Medication Review - Part 1
    {
      type: 'content',
      elements: [
        { text: 'Medication Review', x: 0.5, y: 0.3, fontSize: PPT_CONFIG.fonts.heading, color: PPT_CONFIG.colors.info, bold: true },
        { text: 'Current Medications', x: 0.5, y: 0.8, fontSize: PPT_CONFIG.fonts.body, bold: true },
        { text: truncateText(meds, 500), x: 0.5, y: 1.2, w: '90%', h: 3.5, fontSize: PPT_CONFIG.fonts.small, valign: 'top' }
      ]
    },

    // Slide 5: Medication Safety Considerations
    {
      type: 'content',
      elements: [
        { text: 'Medication Safety Review', x: 0.5, y: 0.3, fontSize: PPT_CONFIG.fonts.heading, color: PPT_CONFIG.colors.warning, bold: true },
        { text: '⚠️ Key Safety Considerations:', x: 0.5, y: 1, fontSize: PPT_CONFIG.fonts.body, bold: true },
        { text: '• Beers Criteria Assessment', x: 0.7, y: 1.5, fontSize: PPT_CONFIG.fonts.body, bullet: true },
        { text: '• Drug-Drug Interactions', x: 0.7, y: 2, fontSize: PPT_CONFIG.fonts.body, bullet: true },
        { text: '• Renal/Hepatic Dosing', x: 0.7, y: 2.5, fontSize: PPT_CONFIG.fonts.body, bullet: true },
        { text: '• Anticholinergic Burden', x: 0.7, y: 3, fontSize: PPT_CONFIG.fonts.body, bullet: true },
        { text: '• Fall Risk Medications', x: 0.7, y: 3.5, fontSize: PPT_CONFIG.fonts.body, bullet: true }
      ]
    },

    // Slide 6: Functional & Cognitive Assessment
    {
      type: 'content',
      elements: [
        { text: 'Functional & Cognitive Status', x: 0.5, y: 0.3, fontSize: PPT_CONFIG.fonts.heading, color: PPT_CONFIG.colors.accent, bold: true },
        { text: 'Functional Assessment', x: 0.5, y: 1, fontSize: PPT_CONFIG.fonts.body, bold: true },
        { text: '• Activities of Daily Living (ADLs)', x: 0.7, y: 1.4, fontSize: PPT_CONFIG.fonts.body, bullet: true },
        { text: '• Instrumental ADLs (IADLs)', x: 0.7, y: 1.8, fontSize: PPT_CONFIG.fonts.body, bullet: true },
        { text: 'Cognitive Assessment', x: 0.5, y: 2.5, fontSize: PPT_CONFIG.fonts.body, bold: true },
        { text: '• Mental Status Evaluation', x: 0.7, y: 2.9, fontSize: PPT_CONFIG.fonts.body, bullet: true },
        { text: '• Delirium Screening (CAM)', x: 0.7, y: 3.3, fontSize: PPT_CONFIG.fonts.body, bullet: true }
      ]
    },

    // Slide 7: Clinical Assessment Summary
    {
      type: 'content',
      elements: [
        { text: 'Clinical Assessment', x: 0.5, y: 0.3, fontSize: PPT_CONFIG.fonts.heading, color: PPT_CONFIG.colors.primary, bold: true },
        { text: truncateText(aiResponse, 700), x: 0.5, y: 1, w: '90%', h: 4, fontSize: PPT_CONFIG.fonts.small, valign: 'top' }
      ]
    },

    // Slide 8: Differential Diagnosis
    {
      type: 'content',
      elements: [
        { text: 'Differential Diagnosis', x: 0.5, y: 0.3, fontSize: PPT_CONFIG.fonts.heading, color: PPT_CONFIG.colors.info, bold: true },
        { text: 'Key Diagnostic Considerations:', x: 0.5, y: 1, fontSize: PPT_CONFIG.fonts.body, bold: true },
        { text: '• Primary Diagnosis', x: 0.7, y: 1.5, fontSize: PPT_CONFIG.fonts.body, bullet: true },
        { text: '• Alternative Diagnoses', x: 0.7, y: 2, fontSize: PPT_CONFIG.fonts.body, bullet: true },
        { text: '• Comorbidity Assessment', x: 0.7, y: 2.5, fontSize: PPT_CONFIG.fonts.body, bullet: true },
        { text: '• Geriatric Syndromes', x: 0.7, y: 3, fontSize: PPT_CONFIG.fonts.body, bullet: true },
        { text: '  - Frailty, Falls, Delirium, Polypharmacy', x: 1, y: 3.4, fontSize: PPT_CONFIG.fonts.small }
      ]
    },

    // Slide 9: Management Plan - Pharmacological
    {
      type: 'content',
      elements: [
        { text: 'Management Plan: Medications', x: 0.5, y: 0.3, fontSize: PPT_CONFIG.fonts.heading, color: PPT_CONFIG.colors.success, bold: true },
        { text: 'Pharmacological Interventions:', x: 0.5, y: 1, fontSize: PPT_CONFIG.fonts.body, bold: true },
        { text: '• Medication Optimization', x: 0.7, y: 1.5, fontSize: PPT_CONFIG.fonts.body, bullet: true },
        { text: '• Deprescribing Strategy', x: 0.7, y: 2, fontSize: PPT_CONFIG.fonts.body, bullet: true },
        { text: '• New Prescriptions (if needed)', x: 0.7, y: 2.5, fontSize: PPT_CONFIG.fonts.body, bullet: true },
        { text: '• Dose Adjustments', x: 0.7, y: 3, fontSize: PPT_CONFIG.fonts.body, bullet: true }
      ]
    },

    // Slide 10: Management Plan - Non-Pharmacological
    {
      type: 'content',
      elements: [
        { text: 'Management Plan: Non-Pharmacological', x: 0.5, y: 0.3, fontSize: PPT_CONFIG.fonts.heading, color: PPT_CONFIG.colors.success, bold: true },
        { text: 'Non-Pharmacological Interventions:', x: 0.5, y: 1, fontSize: PPT_CONFIG.fonts.body, bold: true },
        { text: '• Physical Therapy', x: 0.7, y: 1.5, fontSize: PPT_CONFIG.fonts.body, bullet: true },
        { text: '• Occupational Therapy', x: 0.7, y: 2, fontSize: PPT_CONFIG.fonts.body, bullet: true },
        { text: '• Nutrition Support', x: 0.7, y: 2.5, fontSize: PPT_CONFIG.fonts.body, bullet: true },
        { text: '• Social Work Involvement', x: 0.7, y: 3, fontSize: PPT_CONFIG.fonts.body, bullet: true },
        { text: '• Care Coordination', x: 0.7, y: 3.5, fontSize: PPT_CONFIG.fonts.body, bullet: true }
      ]
    },

    // Slide 11: Safety Planning
    {
      type: 'content',
      elements: [
        { text: 'Safety & Risk Management', x: 0.5, y: 0.3, fontSize: PPT_CONFIG.fonts.heading, color: PPT_CONFIG.colors.warning, bold: true },
        { text: '🛡️ Safety Priorities:', x: 0.5, y: 1, fontSize: PPT_CONFIG.fonts.body, bold: true },
        { text: '• Fall Prevention Strategy', x: 0.7, y: 1.5, fontSize: PPT_CONFIG.fonts.body, bullet: true },
        { text: '• Delirium Prevention/Management', x: 0.7, y: 2, fontSize: PPT_CONFIG.fonts.body, bullet: true },
        { text: '• Pressure Injury Prevention', x: 0.7, y: 2.5, fontSize: PPT_CONFIG.fonts.body, bullet: true },
        { text: '• Advance Directives Review', x: 0.7, y: 3, fontSize: PPT_CONFIG.fonts.body, bullet: true },
        { text: '• Caregiver Support Assessment', x: 0.7, y: 3.5, fontSize: PPT_CONFIG.fonts.body, bullet: true }
      ]
    },

    // Slide 12: Discharge Planning
    {
      type: 'content',
      elements: [
        { text: 'Discharge & Follow-up Planning', x: 0.5, y: 0.3, fontSize: PPT_CONFIG.fonts.heading, color: PPT_CONFIG.colors.info, bold: true },
        { text: 'Discharge Considerations:', x: 0.5, y: 1, fontSize: PPT_CONFIG.fonts.body, bold: true },
        { text: '• Disposition Planning', x: 0.7, y: 1.4, fontSize: PPT_CONFIG.fonts.body, bullet: true },
        { text: '• Home Safety Evaluation', x: 0.7, y: 1.8, fontSize: PPT_CONFIG.fonts.body, bullet: true },
        { text: '• Follow-up Appointments', x: 0.7, y: 2.2, fontSize: PPT_CONFIG.fonts.body, bullet: true },
        { text: '• Medication Reconciliation', x: 0.7, y: 2.6, fontSize: PPT_CONFIG.fonts.body, bullet: true },
        { text: '• Home Health/DME Orders', x: 0.7, y: 3, fontSize: PPT_CONFIG.fonts.body, bullet: true },
        { text: '• Patient/Family Education', x: 0.7, y: 3.4, fontSize: PPT_CONFIG.fonts.body, bullet: true }
      ]
    },

    // Slide 13: Monitoring & Follow-up
    {
      type: 'content',
      elements: [
        { text: 'Monitoring & Follow-up', x: 0.5, y: 0.3, fontSize: PPT_CONFIG.fonts.heading, color: PPT_CONFIG.colors.accent, bold: true },
        { text: 'Ongoing Monitoring:', x: 0.5, y: 1, fontSize: PPT_CONFIG.fonts.body, bold: true },
        { text: '• Clinical Parameters to Monitor', x: 0.7, y: 1.4, fontSize: PPT_CONFIG.fonts.body, bullet: true },
        { text: '• Laboratory Follow-up', x: 0.7, y: 1.8, fontSize: PPT_CONFIG.fonts.body, bullet: true },
        { text: '• Functional Status Re-evaluation', x: 0.7, y: 2.2, fontSize: PPT_CONFIG.fonts.body, bullet: true },
        { text: '• Medication Response Assessment', x: 0.7, y: 2.6, fontSize: PPT_CONFIG.fonts.body, bullet: true },
        { text: '• Quality of Life Measures', x: 0.7, y: 3, fontSize: PPT_CONFIG.fonts.body, bullet: true }
      ]
    },

    // Slide 14: Evidence-Based Guidelines
    {
      type: 'content',
      elements: [
        { text: 'Evidence-Based Practice Guidelines', x: 0.5, y: 0.3, fontSize: PPT_CONFIG.fonts.heading, color: PPT_CONFIG.colors.primary, bold: true },
        { text: 'Clinical Standards Applied:', x: 0.5, y: 1, fontSize: PPT_CONFIG.fonts.body, bold: true },
        { text: '• AGS Beers Criteria® (2023)', x: 0.7, y: 1.5, fontSize: PPT_CONFIG.fonts.body, bullet: true },
        { text: '• STOPP/START Criteria', x: 0.7, y: 1.9, fontSize: PPT_CONFIG.fonts.body, bullet: true },
        { text: '• Comprehensive Geriatric Assessment', x: 0.7, y: 2.3, fontSize: PPT_CONFIG.fonts.body, bullet: true },
        { text: '• Clinical Frailty Scale (Rockwood)', x: 0.7, y: 2.7, fontSize: PPT_CONFIG.fonts.body, bullet: true },
        { text: '• CAM - Confusion Assessment Method', x: 0.7, y: 3.1, fontSize: PPT_CONFIG.fonts.body, bullet: true },
        { text: '• Hospital Elder Life Program (HELP)', x: 0.7, y: 3.5, fontSize: PPT_CONFIG.fonts.body, bullet: true }
      ]
    },

    // Slide 15: References
    {
      type: 'references',
      elements: [
        { text: 'References & Standards', x: 0.5, y: 0.3, fontSize: PPT_CONFIG.fonts.heading, color: PPT_CONFIG.colors.primary, bold: true },
        { text: '1. ' + MEDICAL_REFERENCES.beers.citation, x: 0.5, y: 1, w: '90%', fontSize: PPT_CONFIG.fonts.tiny },
        { text: '   ' + MEDICAL_REFERENCES.beers.description, x: 0.5, y: 1.3, w: '90%', fontSize: PPT_CONFIG.fonts.tiny },
        { text: '2. ' + MEDICAL_REFERENCES.stopp.citation, x: 0.5, y: 1.7, w: '90%', fontSize: PPT_CONFIG.fonts.tiny },
        { text: '   ' + MEDICAL_REFERENCES.stopp.description, x: 0.5, y: 2, w: '90%', fontSize: PPT_CONFIG.fonts.tiny },
        { text: '3. ' + MEDICAL_REFERENCES.cga.citation, x: 0.5, y: 2.4, w: '90%', fontSize: PPT_CONFIG.fonts.tiny },
        { text: '   ' + MEDICAL_REFERENCES.cga.description, x: 0.5, y: 2.7, w: '90%', fontSize: PPT_CONFIG.fonts.tiny },
        { text: '4. ' + MEDICAL_REFERENCES.frailty.citation, x: 0.5, y: 3.1, w: '90%', fontSize: PPT_CONFIG.fonts.tiny },
        { text: '   ' + MEDICAL_REFERENCES.frailty.description, x: 0.5, y: 3.4, w: '90%', fontSize: PPT_CONFIG.fonts.tiny },
        { text: '5. ' + MEDICAL_REFERENCES.delirium.citation, x: 0.5, y: 3.8, w: '90%', fontSize: PPT_CONFIG.fonts.tiny },
        { text: '   ' + MEDICAL_REFERENCES.delirium.description, x: 0.5, y: 4.1, w: '90%', fontSize: PPT_CONFIG.fonts.tiny }
      ]
    }
  ];

  // Add overflow slide if AI response is very long
  if (aiResponse.length > 700) {
    slides.splice(8, 0, {
      type: 'overflow',
      elements: [
        { text: 'Clinical Assessment (Continued)', x: 0.5, y: 0.3, fontSize: PPT_CONFIG.fonts.heading, color: PPT_CONFIG.colors.primary, bold: true },
        { text: aiResponse.substring(700, 1400), x: 0.5, y: 1, w: '90%', h: '80%', fontSize: PPT_CONFIG.fonts.small, valign: 'top' }
      ]
    });
  }

  return slides;
}

/**
 * Generates a PowerPoint presentation
 * @param {Object} data - Case data
 * @param {Object} PptxGenJS - The PptxGenJS library
 * @returns {Object} - The presentation object
 */
export function generatePPT(data, PptxGenJS) {
  if (!PptxGenJS) {
    throw new Error('PptxGenJS library is required for PPT generation');
  }

  const pres = new PptxGenJS();
  const slides = createSlideData(data);

  for (const slideData of slides) {
    const slide = pres.addSlide();
    for (const element of slideData.elements) {
      slide.addText(element.text, {
        x: element.x,
        y: element.y,
        w: element.w,
        h: element.h,
        fontSize: element.fontSize,
        color: element.color,
        bold: element.bold
      });
    }
  }

  return pres;
}

/**
 * Exports data to a PowerPoint file
 * @param {Object} data - Case data
 * @param {Object} PptxGenJS - The PptxGenJS library
 * @param {string} filename - Output filename
 */
export async function exportPPT(data, PptxGenJS, filename) {
  const pres = generatePPT(data, PptxGenJS);
  const outputFilename = filename || `Case_${data.initials || 'export'}.pptx`;
  await pres.writeFile({ fileName: outputFilename });
  return outputFilename;
}

/**
 * Creates HTML content for Word document
 * @param {Object} data - Case data
 * @returns {string} - HTML string
 */
export function createDocHTML(data) {
  const { ageSex = '', initials = '', hpi = '', meds = '', aiResponse = '' } = data;

  const preHtml = `<html xmlns:o='${DOC_CONFIG.xmlNamespaces.office}' xmlns:w='${DOC_CONFIG.xmlNamespaces.word}' xmlns='${DOC_CONFIG.xmlNamespaces.html}'><head><meta charset='utf-8'><title>Case</title></head><body>`;
  const postHtml = '</body></html>';

  const content = `
    <h1 style="color:#2c3e50">Geriatric Case Report</h1>
    <p><strong>ID:</strong> ${escapeHtml(sanitizeText(ageSex))} (${escapeHtml(sanitizeText(initials))})</p>
    <h3>HPI</h3><p>${escapeHtml(sanitizeText(hpi))}</p>
    <h3>Meds/Labs</h3><p>${escapeHtml(sanitizeText(meds))}</p>
    <hr>
    <h3>Analysis & Plan</h3>
    <div style="font-family: Arial; white-space: pre-wrap;">${escapeHtml(sanitizeText(aiResponse))}</div>
  `;

  return preHtml + content + postHtml;
}

/**
 * Creates a Blob for Word document download
 * @param {string} htmlContent - The HTML content
 * @returns {Blob} - The Word document blob
 */
export function createDocBlob(htmlContent) {
  return new Blob([DOC_CONFIG.bom, htmlContent], {
    type: DOC_CONFIG.mimeType
  });
}

/**
 * Creates a comprehensive DOCX document using docx library
 * @param {Object} data - Case data
 * @param {Object} docx - The docx library (optional, for testing)
 * @returns {Promise<Blob>} - Promise resolving to the DOCX blob
 */
export async function createDocxDocument(data, docx = null) {
  // Try to import docx library if not provided
  if (!docx && typeof window !== 'undefined') {
    // Browser environment - docx needs to be loaded via script tag or bundler
    throw new Error('docx library must be provided in browser environment');
  }
  
  if (!docx) {
    // Node environment - try dynamic import
    try {
      docx = await import('docx');
    } catch (err) {
      throw new Error('docx library not available: ' + err.message);
    }
  }

  const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = docx;
  const { ageSex = '', initials = '', hpi = '', meds = '', aiResponse = '' } = data;

  // Create document sections
  const sections = [{
    properties: {},
    children: [
      // Title
      new Paragraph({
        text: 'Geriatric Case Report',
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      }),

      // Patient Demographics
      new Paragraph({
        text: 'Patient Demographics',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 200 }
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Patient ID: ', bold: true }),
          new TextRun(sanitizeText(ageSex) + ' (' + sanitizeText(initials) + ')')
        ],
        spacing: { after: 200 }
      }),

      // Chief Complaint & HPI
      new Paragraph({
        text: 'Chief Complaint & History of Present Illness',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Paragraph({
        text: sanitizeText(hpi),
        spacing: { after: 300 }
      }),

      // Medications & Labs
      new Paragraph({
        text: 'Current Medications & Laboratory Results',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Paragraph({
        text: sanitizeText(meds),
        spacing: { after: 300 }
      }),

      // Medication Safety Review
      new Paragraph({
        text: 'Medication Safety Review',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Paragraph({
        text: '• Beers Criteria Assessment',
        bullet: { level: 0 }
      }),
      new Paragraph({
        text: '• Drug-Drug Interactions',
        bullet: { level: 0 }
      }),
      new Paragraph({
        text: '• Renal/Hepatic Dosing Adjustments',
        bullet: { level: 0 }
      }),
      new Paragraph({
        text: '• Anticholinergic Burden Score',
        bullet: { level: 0 }
      }),
      new Paragraph({
        text: '• Fall Risk Medication Review',
        bullet: { level: 0 },
        spacing: { after: 300 }
      }),

      // Functional Assessment
      new Paragraph({
        text: 'Functional & Cognitive Assessment',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Activities of Daily Living (ADLs): ', bold: true }),
          new TextRun('Assessment pending/documented in chart')
        ]
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Instrumental ADLs (IADLs): ', bold: true }),
          new TextRun('Assessment pending/documented in chart')
        ]
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Cognitive Status: ', bold: true }),
          new TextRun('Evaluated per CAM criteria')
        ],
        spacing: { after: 300 }
      }),

      // Clinical Assessment & Analysis
      new Paragraph({
        text: 'Clinical Assessment & Analysis',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Paragraph({
        text: sanitizeText(aiResponse),
        spacing: { after: 300 }
      }),

      // Management Plan
      new Paragraph({
        text: 'Comprehensive Management Plan',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Paragraph({
        text: 'Pharmacological Interventions:',
        heading: HeadingLevel.HEADING_3,
        spacing: { after: 100 }
      }),
      new Paragraph({
        text: '• Medication optimization per clinical guidelines',
        bullet: { level: 0 }
      }),
      new Paragraph({
        text: '• Deprescribing strategy for potentially inappropriate medications',
        bullet: { level: 0 }
      }),
      new Paragraph({
        text: '• Dose adjustments based on renal/hepatic function',
        bullet: { level: 0 },
        spacing: { after: 200 }
      }),
      new Paragraph({
        text: 'Non-Pharmacological Interventions:',
        heading: HeadingLevel.HEADING_3,
        spacing: { after: 100 }
      }),
      new Paragraph({
        text: '• Physical therapy evaluation and intervention',
        bullet: { level: 0 }
      }),
      new Paragraph({
        text: '• Occupational therapy for ADL optimization',
        bullet: { level: 0 }
      }),
      new Paragraph({
        text: '• Nutrition assessment and support',
        bullet: { level: 0 }
      }),
      new Paragraph({
        text: '• Social work assessment and care coordination',
        bullet: { level: 0 },
        spacing: { after: 300 }
      }),

      // Safety & Discharge Planning
      new Paragraph({
        text: 'Safety Considerations & Discharge Planning',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Paragraph({
        text: '• Fall prevention strategy and environmental modifications',
        bullet: { level: 0 }
      }),
      new Paragraph({
        text: '• Delirium prevention per HELP protocol',
        bullet: { level: 0 }
      }),
      new Paragraph({
        text: '• Home safety evaluation prior to discharge',
        bullet: { level: 0 }
      }),
      new Paragraph({
        text: '• Caregiver support and education',
        bullet: { level: 0 }
      }),
      new Paragraph({
        text: '• Follow-up appointments scheduled',
        bullet: { level: 0 },
        spacing: { after: 300 }
      }),

      // References
      new Paragraph({
        text: 'Clinical Guidelines & References',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 }
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '1. ', bold: true }),
          new TextRun(MEDICAL_REFERENCES.beers.citation + '. '),
          new TextRun({ text: MEDICAL_REFERENCES.beers.description, italics: true })
        ],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '2. ', bold: true }),
          new TextRun(MEDICAL_REFERENCES.stopp.citation + '. '),
          new TextRun({ text: MEDICAL_REFERENCES.stopp.description, italics: true })
        ],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '3. ', bold: true }),
          new TextRun(MEDICAL_REFERENCES.cga.citation + '. '),
          new TextRun({ text: MEDICAL_REFERENCES.cga.description, italics: true })
        ],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '4. ', bold: true }),
          new TextRun(MEDICAL_REFERENCES.frailty.citation + '. '),
          new TextRun({ text: MEDICAL_REFERENCES.frailty.description, italics: true })
        ],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [
          new TextRun({ text: '5. ', bold: true }),
          new TextRun(MEDICAL_REFERENCES.delirium.citation + '. '),
          new TextRun({ text: MEDICAL_REFERENCES.delirium.description, italics: true })
        ]
      })
    ]
  }];

  const doc = new Document({ sections });
  
  // Generate blob using Packer
  const { Packer } = docx;
  const blob = await Packer.toBlob(doc);
  
  return blob;
}

/**
 * Exports data to a Word document (DOCX format)
 * @param {Object} data - Case data
 * @param {string} filename - Output filename
 * @param {Object} docx - The docx library (optional, for Node.js)
 * @returns {Promise<Object>} - Promise resolving to object with blob and filename
 */
export async function exportDOCX(data, filename, docx = null) {
  try {
    const blob = await createDocxDocument(data, docx);
    const outputFilename = filename || `Case_${sanitizeText(data.initials || 'export')}.docx`;
    
    return {
      blob,
      filename: outputFilename
    };
  } catch (err) {
    console.error('DOCX export failed:', err);
    throw new Error('Failed to create DOCX document: ' + err.message);
  }
}

/**
 * Exports data to a Word document (legacy HTML-based DOC format)
 * @param {Object} data - Case data
 * @param {string} filename - Output filename
 * @returns {Object} - Object with blob and filename
 */
export function exportDOC(data, filename) {
  const html = createDocHTML(data);
  const blob = createDocBlob(html);
  const outputFilename = filename || `Case_${data.initials || 'export'}.doc`;

  return {
    blob,
    filename: outputFilename,
    html
  };
}

/**
 * Triggers a file download in the browser
 * @param {Blob} blob - The file blob
 * @param {string} filename - The filename
 */
export function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default {
  PPT_CONFIG,
  DOC_CONFIG,
  MEDICAL_REFERENCES,
  sanitizeText,
  escapeHtml,
  truncateText,
  createSlideData,
  generatePPT,
  exportPPT,
  createDocHTML,
  createDocBlob,
  createDocxDocument,
  exportDOCX,
  exportDOC,
  triggerDownload
};
