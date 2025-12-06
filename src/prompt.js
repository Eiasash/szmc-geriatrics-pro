/**
 * Prompt Generator Module
 * Creates AI prompts for geriatric clinical decision support
 */

/**
 * Default prompt template for geriatric safety audits
 */
export const PROMPT_TEMPLATE = `Act as a Senior Geriatrician.
I will provide clinical data. Please output a response with TWO SECTIONS:

SECTION 1: SAFETY AUDIT (Strict)
- Flag Drug Interactions.
- Flag Beers Criteria.

SECTION 2: CLINICAL SUMMARY (Professional)
- Case Presentation style.
- Assessment & Plan.

DATA:
ID: {ageSex}
HPI: {hpi}
MEDS/LABS: {meds}`;

/**
 * Generates a clinical AI prompt from patient data
 * @param {Object} data - Patient data object
 * @param {string} data.ageSex - Age and sex (e.g., "85F")
 * @param {string} data.hpi - History of present illness
 * @param {string} data.meds - Medications and labs
 * @param {string} data.rawText - Optional raw extracted text to use as fallback
 * @param {string} [template] - Optional custom template
 * @returns {string} - The generated prompt
 */
export function generatePrompt(data, template = PROMPT_TEMPLATE) {
  const { ageSex = '', hpi = '', meds = '', rawText = '' } = data || {};

  // If all structured fields are empty but raw text is available, use raw text
  const allStructuredFieldsEmpty = !ageSex && !hpi && !meds;
  if (allStructuredFieldsEmpty && rawText) {
    return template
      .replace('{ageSex}', 'See below')
      .replace('{hpi}', 'See clinical data below')
      .replace('{meds}', rawText);
  }

  return template
    .replace('{ageSex}', ageSex)
    .replace('{hpi}', hpi)
    .replace('{meds}', meds);
}

/**
 * Validates that required fields are present
 * @param {Object} data - Patient data object
 * @param {boolean} allowBypass - If true, allows validation to pass if rawText is present and ALL structured fields are empty
 * @returns {Object} - Validation result with isValid and missing fields
 */
export function validatePromptData(data, allowBypass = false) {
  const requiredFields = ['ageSex', 'hpi', 'meds'];
  const missing = [];

  if (!data) {
    return {
      isValid: false,
      missing: requiredFields,
      message: 'No data provided'
    };
  }

  for (const field of requiredFields) {
    const value = data[field];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      missing.push(field);
    }
  }

  // If bypass is allowed, ALL structured fields are empty, and raw text is available, allow bypass
  const allStructuredFieldsEmpty = missing.length === requiredFields.length;
  if (allowBypass && allStructuredFieldsEmpty && data.rawText && data.rawText.trim()) {
    return {
      isValid: true,
      missing: [],
      message: 'Using raw text for prompt generation',
      usingRawText: true
    };
  }

  return {
    isValid: missing.length === 0,
    missing,
    message: missing.length > 0
      ? `Missing required fields: ${missing.join(', ')}`
      : 'All fields present',
    usingRawText: false
  };
}

/**
 * Copies text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Whether the copy was successful
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

/**
 * Generates and copies the magic prompt to clipboard
 * Browser-specific function that reads from DOM
 * @param {Function} getValue - Function to get values from DOM (allows for testing)
 * @param {Function} showAlert - Function to show alerts (allows for testing)
 * @param {boolean} allowBypass - If true, allows prompt generation with raw text when structured fields are empty
 * @returns {Promise<string>} - The generated prompt
 */
export async function generateMagicPrompt(
  getValue = (id) => document.getElementById(id)?.value || '',
  showAlert = alert,
  allowBypass = false
) {
  const data = {
    ageSex: getValue('age_sex'),
    hpi: getValue('hpi'),
    meds: getValue('meds'),
    rawText: getValue('raw-text')
  };

  // Validate data with bypass option
  const validation = validatePromptData(data, allowBypass);
  
  if (!validation.isValid) {
    showAlert(`Please fill in the following required fields: ${validation.missing.join(', ')}`);
    return '';
  }

  const prompt = generatePrompt(data);
  const copied = await copyToClipboard(prompt);

  if (copied) {
    const message = validation.usingRawText 
      ? 'Prompt generated from raw text and copied! Paste into AI.'
      : 'Prompt Copied! Paste into AI.';
    showAlert(message);
  } else {
    showAlert('Failed to copy prompt. Please copy manually.');
  }

  return prompt;
}

export default {
  PROMPT_TEMPLATE,
  generatePrompt,
  validatePromptData,
  copyToClipboard,
  generateMagicPrompt
};
