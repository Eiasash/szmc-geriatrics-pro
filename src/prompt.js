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
 * @param {string} [template] - Optional custom template
 * @returns {string} - The generated prompt
 */
export function generatePrompt(data, template = PROMPT_TEMPLATE) {
  const { ageSex = '', hpi = '', meds = '' } = data || {};

  return template
    .replace('{ageSex}', ageSex)
    .replace('{hpi}', hpi)
    .replace('{meds}', meds);
}

/**
 * Validates that required fields are present
 * @param {Object} data - Patient data object
 * @returns {Object} - Validation result with isValid and missing fields
 */
export function validatePromptData(data) {
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

  return {
    isValid: missing.length === 0,
    missing,
    message: missing.length > 0
      ? `Missing required fields: ${missing.join(', ')}`
      : 'All fields present'
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
 * @returns {Promise<string>} - The generated prompt
 */
export async function generateMagicPrompt(
  getValue = (id) => document.getElementById(id)?.value || '',
  showAlert = alert
) {
  const data = {
    ageSex: getValue('age_sex'),
    hpi: getValue('hpi'),
    meds: getValue('meds')
  };

  const prompt = generatePrompt(data);
  const copied = await copyToClipboard(prompt);

  if (copied) {
    showAlert('Prompt Copied! Paste into AI.');
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
