/**
 * Tests for Prompt Generator Module
 * Testing AI prompt generation for geriatric clinical decision support
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  PROMPT_TEMPLATE,
  generatePrompt,
  validatePromptData,
  copyToClipboard,
  generateMagicPrompt
} from '../src/prompt.js';

describe('Prompt Generator Module', () => {
  describe('PROMPT_TEMPLATE', () => {
    it('should contain required sections', () => {
      expect(PROMPT_TEMPLATE).toContain('SAFETY AUDIT');
      expect(PROMPT_TEMPLATE).toContain('CLINICAL SUMMARY');
      expect(PROMPT_TEMPLATE).toContain('Drug Interactions');
      expect(PROMPT_TEMPLATE).toContain('Beers Criteria');
    });

    it('should contain placeholders for patient data', () => {
      expect(PROMPT_TEMPLATE).toContain('{ageSex}');
      expect(PROMPT_TEMPLATE).toContain('{hpi}');
      expect(PROMPT_TEMPLATE).toContain('{meds}');
    });

    it('should specify Senior Geriatrician role', () => {
      expect(PROMPT_TEMPLATE).toContain('Senior Geriatrician');
    });
  });

  describe('generatePrompt', () => {
    it('should replace placeholders with patient data', () => {
      const data = {
        ageSex: '85F',
        hpi: 'Admitted for pneumonia',
        meds: 'Lisinopril 10mg'
      };

      const result = generatePrompt(data);

      expect(result).toContain('ID: 85F');
      expect(result).toContain('HPI: Admitted for pneumonia');
      expect(result).toContain('MEDS/LABS: Lisinopril 10mg');
    });

    it('should handle empty data fields', () => {
      const data = {
        ageSex: '',
        hpi: '',
        meds: ''
      };

      const result = generatePrompt(data);

      expect(result).toContain('ID: ');
      expect(result).toContain('HPI: ');
      expect(result).toContain('MEDS/LABS: ');
    });

    it('should handle null data object', () => {
      const result = generatePrompt(null);

      expect(result).toContain('ID: ');
      expect(result).not.toContain('undefined');
      expect(result).not.toContain('null');
    });

    it('should handle undefined data object', () => {
      const result = generatePrompt(undefined);

      expect(result).toContain('ID: ');
      expect(result).not.toContain('undefined');
    });

    it('should handle partial data', () => {
      const data = {
        ageSex: '75M'
        // hpi and meds missing
      };

      const result = generatePrompt(data);

      expect(result).toContain('ID: 75M');
      expect(result).toContain('HPI: ');
      expect(result).toContain('MEDS/LABS: ');
    });

    it('should use custom template when provided', () => {
      const data = { ageSex: '80F', hpi: 'Test', meds: 'Aspirin' };
      const customTemplate = 'Patient: {ageSex}, History: {hpi}, Medications: {meds}';

      const result = generatePrompt(data, customTemplate);

      expect(result).toBe('Patient: 80F, History: Test, Medications: Aspirin');
    });

    it('should preserve special characters in data', () => {
      const data = {
        ageSex: '85F',
        hpi: 'Patient has <3 symptoms & fever',
        meds: 'Aspirin 81mg @ night'
      };

      const result = generatePrompt(data);

      expect(result).toContain('<3 symptoms & fever');
      expect(result).toContain('@ night');
    });

    it('should handle multiline data', () => {
      const data = {
        ageSex: '90M',
        hpi: 'Line 1\nLine 2\nLine 3',
        meds: 'Med 1\nMed 2'
      };

      const result = generatePrompt(data);

      expect(result).toContain('Line 1\nLine 2\nLine 3');
      expect(result).toContain('Med 1\nMed 2');
    });
  });

  describe('validatePromptData', () => {
    it('should return valid for complete data', () => {
      const data = {
        ageSex: '85F',
        hpi: 'History text',
        meds: 'Medication list'
      };

      const result = validatePromptData(data);

      expect(result.isValid).toBe(true);
      expect(result.missing).toEqual([]);
      expect(result.message).toBe('All fields present');
    });

    it('should return invalid for missing ageSex', () => {
      const data = {
        hpi: 'History',
        meds: 'Meds'
      };

      const result = validatePromptData(data);

      expect(result.isValid).toBe(false);
      expect(result.missing).toContain('ageSex');
    });

    it('should return invalid for missing hpi', () => {
      const data = {
        ageSex: '85F',
        meds: 'Meds'
      };

      const result = validatePromptData(data);

      expect(result.isValid).toBe(false);
      expect(result.missing).toContain('hpi');
    });

    it('should return invalid for missing meds', () => {
      const data = {
        ageSex: '85F',
        hpi: 'History'
      };

      const result = validatePromptData(data);

      expect(result.isValid).toBe(false);
      expect(result.missing).toContain('meds');
    });

    it('should return invalid for null data', () => {
      const result = validatePromptData(null);

      expect(result.isValid).toBe(false);
      expect(result.missing).toEqual(['ageSex', 'hpi', 'meds']);
      expect(result.message).toBe('No data provided');
    });

    it('should return invalid for empty strings', () => {
      const data = {
        ageSex: '',
        hpi: '   ',
        meds: ''
      };

      const result = validatePromptData(data);

      expect(result.isValid).toBe(false);
      expect(result.missing.length).toBe(3);
    });

    it('should provide descriptive message for missing fields', () => {
      const data = {
        ageSex: '85F'
      };

      const result = validatePromptData(data);

      expect(result.message).toContain('Missing required fields');
      expect(result.message).toContain('hpi');
      expect(result.message).toContain('meds');
    });
  });

  describe('copyToClipboard', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should call navigator.clipboard.writeText', async () => {
      const text = 'Test text';

      await copyToClipboard(text);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(text);
    });

    it('should return true on success', async () => {
      navigator.clipboard.writeText.mockResolvedValueOnce(undefined);

      const result = await copyToClipboard('text');

      expect(result).toBe(true);
    });

    it('should return false on failure', async () => {
      navigator.clipboard.writeText.mockRejectedValueOnce(new Error('Failed'));

      const result = await copyToClipboard('text');

      expect(result).toBe(false);
    });

    it('should handle empty string', async () => {
      await copyToClipboard('');

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('');
    });
  });

  describe('generateMagicPrompt', () => {
    let mockGetValue;
    let mockAlert;

    beforeEach(() => {
      vi.clearAllMocks();

      mockGetValue = vi.fn((id) => {
        const values = {
          'age_sex': '85F',
          'hpi': 'Test history',
          'meds': 'Test meds'
        };
        return values[id] || '';
      });

      mockAlert = vi.fn();
    });

    it('should generate prompt from DOM values', async () => {
      const result = await generateMagicPrompt(mockGetValue, mockAlert);

      expect(result).toContain('ID: 85F');
      expect(result).toContain('HPI: Test history');
      expect(result).toContain('MEDS/LABS: Test meds');
    });

    it('should copy prompt to clipboard', async () => {
      await generateMagicPrompt(mockGetValue, mockAlert);

      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });

    it('should show success alert when copied', async () => {
      navigator.clipboard.writeText.mockResolvedValueOnce(undefined);

      await generateMagicPrompt(mockGetValue, mockAlert);

      expect(mockAlert).toHaveBeenCalledWith('Prompt Copied! Paste into AI.');
    });

    it('should show error alert when copy fails', async () => {
      navigator.clipboard.writeText.mockRejectedValueOnce(new Error('Failed'));

      await generateMagicPrompt(mockGetValue, mockAlert);

      expect(mockAlert).toHaveBeenCalledWith('Failed to copy prompt. Please copy manually.');
    });

    it('should call getValue for all required fields', async () => {
      await generateMagicPrompt(mockGetValue, mockAlert);

      expect(mockGetValue).toHaveBeenCalledWith('age_sex');
      expect(mockGetValue).toHaveBeenCalledWith('hpi');
      expect(mockGetValue).toHaveBeenCalledWith('meds');
    });

    it('should return the generated prompt', async () => {
      const result = await generateMagicPrompt(mockGetValue, mockAlert);

      expect(typeof result).toBe('string');
      expect(result).toContain('Senior Geriatrician');
    });
  });
});

describe('Prompt Content Quality', () => {
  it('should generate prompt suitable for AI consumption', () => {
    const data = {
      ageSex: '88F',
      hpi: 'Falls with head injury',
      meds: 'Warfarin, Aspirin, Metoprolol'
    };

    const prompt = generatePrompt(data);

    // Should have clear structure
    expect(prompt).toMatch(/SECTION 1/);
    expect(prompt).toMatch(/SECTION 2/);

    // Should have data clearly labeled
    expect(prompt).toMatch(/DATA:/);
    expect(prompt).toMatch(/ID:/);
    expect(prompt).toMatch(/HPI:/);
    expect(prompt).toMatch(/MEDS\/LABS:/);
  });

  it('should include safety-relevant instructions', () => {
    const prompt = generatePrompt({ ageSex: '85F', hpi: '', meds: '' });

    expect(prompt).toContain('Drug Interactions');
    expect(prompt).toContain('Beers Criteria');
    expect(prompt).toContain('SAFETY AUDIT');
  });
});

describe('Raw Text Bypass Functionality', () => {
  describe('generatePrompt with raw text', () => {
    it('should use raw text when structured fields are empty', () => {
      const data = {
        ageSex: '',
        hpi: '',
        meds: '',
        rawText: 'Patient: 85F with pneumonia. Meds: Lisinopril'
      };

      const result = generatePrompt(data);

      expect(result).toContain('See below');
      expect(result).toContain('See clinical data below');
      expect(result).toContain('Patient: 85F with pneumonia');
    });

    it('should prefer structured fields over raw text when available', () => {
      const data = {
        ageSex: '90M',
        hpi: 'Structured HPI',
        meds: 'Structured Meds',
        rawText: 'This should not be used'
      };

      const result = generatePrompt(data);

      expect(result).toContain('ID: 90M');
      expect(result).toContain('HPI: Structured HPI');
      expect(result).toContain('MEDS/LABS: Structured Meds');
      expect(result).not.toContain('This should not be used');
    });

    it('should not use raw text if any structured field is present', () => {
      const data = {
        ageSex: '75F',
        hpi: '',
        meds: '',
        rawText: 'Raw text content'
      };

      const result = generatePrompt(data);

      expect(result).toContain('ID: 75F');
      expect(result).not.toContain('See below');
      expect(result).not.toContain('Raw text content');
    });
  });

  describe('validatePromptData with bypass', () => {
    it('should allow bypass when raw text is available', () => {
      const data = {
        ageSex: '',
        hpi: '',
        meds: '',
        rawText: 'Clinical data extracted from file'
      };

      const result = validatePromptData(data, true);

      expect(result.isValid).toBe(true);
      expect(result.usingRawText).toBe(true);
      expect(result.message).toBe('Using raw text for prompt generation');
    });

    it('should not allow bypass without raw text', () => {
      const data = {
        ageSex: '',
        hpi: '',
        meds: '',
        rawText: ''
      };

      const result = validatePromptData(data, true);

      expect(result.isValid).toBe(false);
      expect(result.usingRawText).toBe(false);
    });

    it('should require all fields when bypass is false', () => {
      const data = {
        ageSex: '',
        hpi: '',
        meds: '',
        rawText: 'Some raw text'
      };

      const result = validatePromptData(data, false);

      expect(result.isValid).toBe(false);
      expect(result.missing).toEqual(['ageSex', 'hpi', 'meds']);
    });

    it('should validate normally when structured fields are present', () => {
      const data = {
        ageSex: '85F',
        hpi: 'HPI text',
        meds: 'Meds text',
        rawText: 'Raw text'
      };

      const result = validatePromptData(data, true);

      expect(result.isValid).toBe(true);
      expect(result.usingRawText).toBe(false);
      expect(result.message).toBe('All fields present');
    });
  });

  describe('generateMagicPrompt with bypass', () => {
    let mockGetValue;
    let mockAlert;

    beforeEach(() => {
      vi.clearAllMocks();

      mockGetValue = vi.fn((id) => {
        const values = {
          'age_sex': '',
          'hpi': '',
          'meds': '',
          'raw-text': 'Raw extracted clinical data'
        };
        return values[id] || '';
      });

      mockAlert = vi.fn();
      navigator.clipboard.writeText.mockResolvedValue(undefined);
    });

    it('should generate prompt from raw text when bypass is enabled', async () => {
      const result = await generateMagicPrompt(mockGetValue, mockAlert, true);

      expect(result).toContain('See below');
      expect(result).toContain('Raw extracted clinical data');
      expect(mockAlert).toHaveBeenCalledWith('Prompt generated from raw text and copied! Paste into AI.');
    });

    it('should fail validation when bypass is disabled and fields are empty', async () => {
      const result = await generateMagicPrompt(mockGetValue, mockAlert, false);

      expect(result).toBe('');
      expect(mockAlert).toHaveBeenCalledWith(expect.stringContaining('Please fill in the following required fields'));
    });

    it('should not bypass when structured fields are available', async () => {
      mockGetValue = vi.fn((id) => {
        const values = {
          'age_sex': '85F',
          'hpi': 'Test HPI',
          'meds': 'Test Meds',
          'raw-text': 'Should not be used'
        };
        return values[id] || '';
      });

      const result = await generateMagicPrompt(mockGetValue, mockAlert, true);

      expect(result).toContain('ID: 85F');
      expect(result).toContain('HPI: Test HPI');
      expect(result).not.toContain('Should not be used');
      expect(mockAlert).toHaveBeenCalledWith('Prompt Copied! Paste into AI.');
    });
  });
});
