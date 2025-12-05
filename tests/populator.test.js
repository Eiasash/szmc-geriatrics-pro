/**
 * Tests for Populator Module
 * Testing clinical data extraction from raw text
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  PATTERNS,
  extractValue,
  extractClinicalData,
  smartPopulate
} from '../src/populator.js';

describe('Populator Module', () => {
  describe('PATTERNS', () => {
    describe('ageSex pattern', () => {
      it('should match standard age/sex format (85F)', () => {
        const text = 'Patient is 85F admitted for...';
        const match = text.match(PATTERNS.ageSex);
        expect(match).not.toBeNull();
        expect(match[1]).toBe('85F');
      });

      it('should match age with space before sex (72 M)', () => {
        const text = 'Patient: 72 M with chest pain';
        const match = text.match(PATTERNS.ageSex);
        expect(match).not.toBeNull();
        expect(match[1]).toBe('72 M');
      });

      it('should match lowercase sex indicator (90f)', () => {
        const text = '90f presenting with falls';
        const match = text.match(PATTERNS.ageSex);
        expect(match).not.toBeNull();
        expect(match[1]).toBe('90f');
      });

      it('should match three-digit ages (101M)', () => {
        const text = '101M with altered mental status';
        const match = text.match(PATTERNS.ageSex);
        expect(match).not.toBeNull();
        expect(match[1]).toBe('101M');
      });

      it('should match "male" and "female" words', () => {
        const textMale = '75 male with COPD';
        const textFemale = '82 female with UTI';
        const textMaleCapital = '75 Male with COPD';

        expect(textMale.match(PATTERNS.ageSex)[1]).toBe('75 male');
        expect(textFemale.match(PATTERNS.ageSex)[1]).toBe('82 female');
        expect(textMaleCapital.match(PATTERNS.ageSex)[1]).toBe('75 Male');
      });

      it('should not match invalid formats', () => {
        const text = 'Patient age unknown';
        const match = text.match(PATTERNS.ageSex);
        expect(match).toBeNull();
      });
    });

    describe('hpi pattern', () => {
      it('should extract HPI section', () => {
        const text = `
          HPI: Patient presents with 3 days of confusion and decreased appetite.
          PMH: HTN, DM2
        `;
        const match = text.match(PATTERNS.hpi);
        expect(match).not.toBeNull();
        expect(match[1].trim()).toBe('Patient presents with 3 days of confusion and decreased appetite.');
      });

      it('should extract History of Present Illness section', () => {
        const text = `
          History of Present Illness: Elderly patient with falls.
          Medications: Lisinopril
        `;
        const match = text.match(PATTERNS.hpi);
        expect(match).not.toBeNull();
        expect(match[1].trim()).toBe('Elderly patient with falls.');
      });

      it('should handle multiline HPI', () => {
        const text = `
          HPI: Line one of history.
          Line two continues.
          Line three ends.
          PMH: Diabetes
        `;
        const match = text.match(PATTERNS.hpi);
        expect(match).not.toBeNull();
        expect(match[1]).toContain('Line one');
        expect(match[1]).toContain('Line two');
        expect(match[1]).toContain('Line three');
      });
    });

    describe('meds pattern', () => {
      it('should extract Medications section', () => {
        const text = `
          Medications: Lisinopril 10mg, Metformin 500mg BID
          Labs: Na 138
        `;
        const match = text.match(PATTERNS.meds);
        expect(match).not.toBeNull();
        expect(match[1].trim()).toBe('Lisinopril 10mg, Metformin 500mg BID');
      });

      it('should extract Meds shorthand', () => {
        const text = `
          Meds: Aspirin 81mg daily
          Plan: Continue current regimen
        `;
        const match = text.match(PATTERNS.meds);
        expect(match).not.toBeNull();
        expect(match[1].trim()).toBe('Aspirin 81mg daily');
      });

      it('should extract Current Medications section', () => {
        const text = `
          Current Medications: Warfarin 5mg
          Allergies: NKDA
        `;
        const match = text.match(PATTERNS.meds);
        expect(match).not.toBeNull();
        expect(match[1].trim()).toBe('Warfarin 5mg');
      });
    });
  });

  describe('extractValue', () => {
    it('should return extracted value when pattern matches', () => {
      const text = 'Age: 85F';
      const result = extractValue(text, /Age:\s*(\d+[MF])/);
      expect(result).toBe('85F');
    });

    it('should return null for non-matching patterns', () => {
      const text = 'No age here';
      const result = extractValue(text, /Age:\s*(\d+[MF])/);
      expect(result).toBeNull();
    });

    it('should return null for null input', () => {
      expect(extractValue(null, /test/)).toBeNull();
    });

    it('should return null for undefined input', () => {
      expect(extractValue(undefined, /test/)).toBeNull();
    });

    it('should return null for non-string input', () => {
      expect(extractValue(123, /test/)).toBeNull();
      expect(extractValue({}, /test/)).toBeNull();
      expect(extractValue([], /test/)).toBeNull();
    });

    it('should trim the extracted value', () => {
      const text = 'Age:   85F   ';
      const result = extractValue(text, /Age:\s*(.+)/);
      expect(result).toBe('85F');
    });
  });

  describe('extractClinicalData', () => {
    it('should extract all fields from complete clinical note', () => {
      const text = `
        Patient: 85F
        HPI: Admitted for pneumonia with 3 days of cough.
        Medications: Lisinopril 10mg, Metformin 500mg
        Labs: WBC 15.2, Cr 1.2
      `;

      const result = extractClinicalData(text);

      expect(result.ageSex).toBe('85F');
      expect(result.hpi).toContain('Admitted for pneumonia');
      expect(result.meds).toContain('Lisinopril');
    });

    it('should return null for missing fields', () => {
      const text = 'Just some random text without clinical data';
      const result = extractClinicalData(text);

      expect(result.ageSex).toBeNull();
      expect(result.hpi).toBeNull();
      expect(result.meds).toBeNull();
    });

    it('should handle null input', () => {
      const result = extractClinicalData(null);
      expect(result).toEqual({
        ageSex: null,
        hpi: null,
        meds: null,
        labs: null
      });
    });

    it('should handle empty string input', () => {
      const result = extractClinicalData('');
      expect(result).toEqual({
        ageSex: null,
        hpi: null,
        meds: null,
        labs: null
      });
    });

    it('should handle partial data', () => {
      const text = '92M admitted with falls';
      const result = extractClinicalData(text);

      expect(result.ageSex).toBe('92M');
      expect(result.hpi).toBeNull();
      expect(result.meds).toBeNull();
    });
  });

  describe('smartPopulate', () => {
    let mockElements;
    let mockGetElementById;

    beforeEach(() => {
      mockElements = {
        'age_sex': { value: '' },
        'hpi': { value: '' },
        'meds': { value: '' }
      };

      mockGetElementById = vi.fn((id) => mockElements[id] || null);
    });

    it('should populate DOM elements with extracted data', () => {
      const text = `
        Patient: 78F
        HPI: Confusion for 2 days.
        Meds: Donepezil 10mg
      `;

      smartPopulate(text, mockGetElementById);

      expect(mockElements['age_sex'].value).toBe('78F');
      expect(mockElements['hpi'].value).toContain('Confusion');
      expect(mockElements['meds'].value).toContain('Donepezil');
    });

    it('should not overwrite elements when data is not found', () => {
      mockElements['age_sex'].value = 'existing';
      const text = 'No clinical data here';

      smartPopulate(text, mockGetElementById);

      expect(mockElements['age_sex'].value).toBe('existing');
    });

    it('should return extracted data object', () => {
      const text = '85F with pneumonia';
      const result = smartPopulate(text, mockGetElementById);

      expect(result).toHaveProperty('ageSex');
      expect(result).toHaveProperty('hpi');
      expect(result).toHaveProperty('meds');
    });

    it('should handle missing DOM elements gracefully', () => {
      const mockGetElement = vi.fn(() => null);
      const text = '85F with HPI: test';

      // Should not throw
      expect(() => smartPopulate(text, mockGetElement)).not.toThrow();
    });
  });
});

describe('Edge Cases and Special Characters', () => {
  it('should handle text with special characters', () => {
    const text = '85F with café-au-lait spots & <html> tags';
    const result = extractClinicalData(text);
    expect(result.ageSex).toBe('85F');
  });

  it('should handle Hebrew/Unicode characters', () => {
    const text = '90M with HPI: שלום עולם condition';
    const result = extractClinicalData(text);
    expect(result.ageSex).toBe('90M');
  });

  it('should handle very long text', () => {
    const longHpi = 'HPI: ' + 'A'.repeat(10000) + '\nMeds: Test';
    const result = extractClinicalData(longHpi);
    expect(result.hpi.length).toBeGreaterThan(1000);
  });

  it('should handle newlines and tabs', () => {
    const text = '85F\n\tHPI:\tPatient presents.\n\tMeds:\tAspirin';
    const result = extractClinicalData(text);
    expect(result.ageSex).toBe('85F');
  });
});
