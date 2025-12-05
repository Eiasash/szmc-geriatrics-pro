/**
 * File Handler Module
 * Handles importing and parsing various file formats for clinical data extraction
 */

/**
 * Supported file extensions
 */
export const SUPPORTED_EXTENSIONS = {
  presentation: ['pptx'],
  document: ['pdf', 'docx', 'doc'],
  text: ['html', 'htm', 'txt'],
  image: ['jpg', 'jpeg', 'png']
};

/**
 * Gets the file extension from a filename
 * @param {string} filename - The filename
 * @returns {string} - Lowercase extension without the dot
 */
export function getFileExtension(filename) {
  if (!filename || typeof filename !== 'string') {
    return '';
  }
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

/**
 * Checks if a file extension is supported
 * @param {string} extension - The file extension to check
 * @returns {boolean} - Whether the extension is supported
 */
export function isExtensionSupported(extension) {
  const ext = extension.toLowerCase();
  return Object.values(SUPPORTED_EXTENSIONS).flat().includes(ext);
}

/**
 * Gets the file type category
 * @param {string} extension - The file extension
 * @returns {string|null} - The category name or null if not supported
 */
export function getFileCategory(extension) {
  const ext = extension.toLowerCase();
  for (const [category, extensions] of Object.entries(SUPPORTED_EXTENSIONS)) {
    if (extensions.includes(ext)) {
      return category;
    }
  }
  return null;
}

/**
 * Extracts text from a PPTX file
 * @param {File|ArrayBuffer} file - The PPTX file
 * @param {Object} JSZip - The JSZip library
 * @returns {Promise<string>} - Extracted text
 */
export async function extractFromPPTX(file, JSZip) {
  if (!JSZip) {
    throw new Error('JSZip library is required for PPTX extraction');
  }

  const zip = await JSZip.loadAsync(file);

  // Filter and sort slides numerically
  const slides = Object.keys(zip.files)
    .filter(name => name.match(/ppt\/slides\/slide\d+\.xml/))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)[0]);
      const numB = parseInt(b.match(/\d+/)[0]);
      return numA - numB;
    });

  let text = '';
  for (const slidePath of slides) {
    const content = await zip.file(slidePath).async('string');
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/xml');
    if (doc.documentElement) {
      text += (doc.documentElement.textContent || '') + '\n\n';
    }
  }

  return text.trim();
}

/**
 * Extracts text from a PDF file
 * @param {File|ArrayBuffer} file - The PDF file
 * @param {Object} pdfjsLib - The PDF.js library
 * @returns {Promise<string>} - Extracted text
 */
export async function extractFromPDF(file, pdfjsLib) {
  if (!pdfjsLib) {
    throw new Error('PDF.js library is required for PDF extraction');
  }

  const arrayBuffer = file instanceof ArrayBuffer ? file : await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    text += pageText + ' ';
  }

  return text.trim();
}

/**
 * Extracts text from a DOCX file
 * @param {File|ArrayBuffer} file - The DOCX file
 * @param {Object} mammoth - The Mammoth library
 * @returns {Promise<string>} - Extracted text
 */
export async function extractFromDOCX(file, mammoth) {
  if (!mammoth) {
    throw new Error('Mammoth library is required for DOCX extraction');
  }

  const arrayBuffer = file instanceof ArrayBuffer ? file : await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value || '';
}

/**
 * Extracts text from HTML content
 * @param {string} htmlContent - The HTML string
 * @returns {string} - Extracted plain text
 */
export function extractFromHTML(htmlContent) {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return '';
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  return doc.body?.innerText || doc.body?.textContent || '';
}

/**
 * Extracts text from an image using OCR
 * @param {File} file - The image file
 * @param {Object} Tesseract - The Tesseract.js library
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<string>} - Extracted text
 */
export async function extractFromImage(file, Tesseract, onProgress) {
  if (!Tesseract) {
    throw new Error('Tesseract.js library is required for image OCR');
  }

  const worker = await Tesseract.createWorker('eng');

  try {
    const result = await worker.recognize(file);
    return result.data.text || '';
  } finally {
    await worker.terminate();
  }
}

/**
 * Main file handler function
 * @param {File} file - The file to process
 * @param {Object} libraries - Object containing required libraries
 * @param {Object} callbacks - Callback functions for status updates
 * @returns {Promise<string>} - Extracted text
 */
export async function handleFile(file, libraries = {}, callbacks = {}) {
  const { JSZip, pdfjsLib, mammoth, Tesseract } = libraries;
  const { onStatus, onError, onSuccess } = callbacks;

  if (!file) {
    throw new Error('No file provided');
  }

  const extension = getFileExtension(file.name);

  if (!isExtensionSupported(extension)) {
    throw new Error(`Unsupported file type: .${extension}`);
  }

  onStatus?.('Reading...');

  try {
    let text = '';

    switch (extension) {
      case 'pptx':
        text = await extractFromPPTX(file, JSZip);
        break;

      case 'pdf':
        text = await extractFromPDF(file, pdfjsLib);
        break;

      case 'docx':
      case 'doc':
        text = await extractFromDOCX(file, mammoth);
        break;

      case 'html':
      case 'htm':
        const htmlContent = await file.text();
        text = extractFromHTML(htmlContent);
        break;

      case 'txt':
        text = await file.text();
        break;

      case 'jpg':
      case 'jpeg':
      case 'png':
        onStatus?.('OCR (Wait)...');
        text = await extractFromImage(file, Tesseract);
        break;

      default:
        throw new Error(`Unhandled file type: .${extension}`);
    }

    onSuccess?.('Success!');
    return text;

  } catch (error) {
    onError?.(error);
    throw error;
  }
}

export default {
  SUPPORTED_EXTENSIONS,
  getFileExtension,
  isExtensionSupported,
  getFileCategory,
  extractFromPPTX,
  extractFromPDF,
  extractFromDOCX,
  extractFromHTML,
  extractFromImage,
  handleFile
};
