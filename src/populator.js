/**
 * Populator Module
 * Handles intelligent extraction of clinical data from raw text
 */

/**
 * Regex patterns for extracting clinical data
 */
export const PATTERNS = {
  // Matches age/sex patterns like "85F", "72 M", "90f", "65 male", "78 female"
  ageSex: /(\d{2,3}\s?(?:male|female|Male|Female|[MmFf]))/,

  // Matches HPI/History sections
  hpi: /(?:HPI|History of Present Illness|History)[:\s]+([\s\S]*?)(?=\n\s*(?:PMH|Past Medical History|Meds|Medications|Assessment|Physical Exam)|$)/i,

  // Matches Medications sections
  meds: /(?:Meds|Medications|Current Medications|Home Medications)[:\s]+([\s\S]*?)(?=\n\s*(?:Labs|Laboratory|Plan|Assessment|Allergies)|$)/i,

  // Matches Labs sections
  labs: /(?:Labs|Laboratory|Lab Results)[:\s]+([\s\S]*?)(?=\n\s*(?:Plan|Assessment|Imaging)|$)/i
};

/**
 * Extracts a value from text using a regex pattern
 * @param {string} text - The source text to extract from
 * @param {RegExp} regex - The regex pattern with a capture group
 * @returns {string|null} - The extracted value or null if not found
 */
export function extractValue(text, regex) {
  if (!text || typeof text !== 'string') {
    return null;
  }

  const match = text.match(regex);
  if (match && match[1]) {
    return match[1].trim();
  }
  return null;
}

/**
 * Extracts all clinical data fields from raw text
 * @param {string} text - The raw text to extract from
 * @returns {Object} - Object containing extracted fields
 */
export function extractClinicalData(text) {
  if (!text || typeof text !== 'string') {
    return {
      ageSex: null,
      hpi: null,
      meds: null,
      labs: null
    };
  }

  return {
    ageSex: extractValue(text, PATTERNS.ageSex),
    hpi: extractValue(text, PATTERNS.hpi),
    meds: extractValue(text, PATTERNS.meds),
    labs: extractValue(text, PATTERNS.labs)
  };
}

/**
 * Populates DOM elements with extracted clinical data
 * Used by the browser version of the application
 * @param {string} text - The raw text to extract from
 * @param {Function} getElementById - Function to get DOM elements (allows for testing)
 */
export function smartPopulate(text, getElementById = document.getElementById.bind(document)) {
  const data = extractClinicalData(text);

  const setField = (id, value) => {
    if (value) {
      const element = getElementById(id);
      if (element) {
        element.value = value;
      }
    }
  };

  setField('age_sex', data.ageSex);
  setField('hpi', data.hpi);
  setField('meds', data.meds);

  return data;
}

export default {
  PATTERNS,
  extractValue,
  extractClinicalData,
  smartPopulate
};
