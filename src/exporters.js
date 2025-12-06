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
    text: '333333'
  },
  fonts: {
    title: 32,
    subtitle: 24,
    heading: 18,
    body: 14,
    small: 12
  }
};

/**
 * Configuration for Word document export
 */
export const DOC_CONFIG = {
  mimeType: 'application/msword',
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
 * Escapes HTML special characters to prevent XSS
 * @param {string} text - The text to escape
 * @returns {string} - HTML-escaped text
 */
export function escapeHtml(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return text.replace(/[&<>"']/g, char => escapeMap[char]);
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
 * Creates slide data for PowerPoint export
 * @param {Object} data - Case data
 * @returns {Array} - Array of slide definitions
 */
export function createSlideData(data) {
  const { ageSex = '', initials = '', hpi = '', meds = '', aiResponse = '' } = data;

  const slides = [
    // Slide 1: Title
    {
      type: 'title',
      elements: [
        { text: 'Geriatric Case', x: 1, y: 2, fontSize: PPT_CONFIG.fonts.title, color: PPT_CONFIG.colors.primary, bold: true },
        { text: `${ageSex} - ${initials}`, x: 1, y: 3, fontSize: PPT_CONFIG.fonts.subtitle, color: PPT_CONFIG.colors.secondary }
      ]
    },
    // Slide 2: Clinical Context
    {
      type: 'content',
      elements: [
        { text: 'Clinical Context', x: 0.5, y: 0.5, fontSize: PPT_CONFIG.fonts.heading, color: PPT_CONFIG.colors.accent, bold: true },
        { text: `HPI: ${truncateText(hpi, PPT_CONFIG.maxHpiLength)}`, x: 0.5, y: 1, w: '90%', h: 2, fontSize: PPT_CONFIG.fonts.body },
        { text: `MEDS: ${truncateText(meds, PPT_CONFIG.maxMedsLength)}`, x: 0.5, y: 3.5, w: '90%', h: 2, fontSize: PPT_CONFIG.fonts.small }
      ]
    },
    // Slide 3: Analysis & Plan
    {
      type: 'content',
      elements: [
        { text: 'Analysis & Plan', x: 0.5, y: 0.5, fontSize: PPT_CONFIG.fonts.heading, color: PPT_CONFIG.colors.highlight, bold: true },
        { text: truncateText(aiResponse, PPT_CONFIG.maxTextPerSlide), x: 0.5, y: 1, w: '90%', h: '80%', fontSize: PPT_CONFIG.fonts.small, color: PPT_CONFIG.colors.text }
      ]
    }
  ];

  // Add overflow slide if needed
  if (aiResponse.length > PPT_CONFIG.maxTextPerSlide) {
    slides.push({
      type: 'overflow',
      elements: [
        { text: 'Plan (Cont.)', x: 0.5, y: 0.5, fontSize: PPT_CONFIG.fonts.heading, color: PPT_CONFIG.colors.highlight },
        { text: aiResponse.substring(PPT_CONFIG.maxTextPerSlide, PPT_CONFIG.maxTextPerSlide * 2), x: 0.5, y: 1, w: '90%', h: '80%', fontSize: PPT_CONFIG.fonts.small }
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
 * Exports data to a Word document
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
  sanitizeText,
  escapeHtml,
  truncateText,
  createSlideData,
  generatePPT,
  exportPPT,
  createDocHTML,
  createDocBlob,
  exportDOC,
  triggerDownload
};
