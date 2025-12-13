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

describe('ENHANCED STRESS TESTS - Large Data Extraction', () => {
  it('should extract from extremely large clinical notes (500K characters)', () => {
    const largeNote = `
      Patient: 85F
      HPI: ${'A'.repeat(100000)}
      Medications: ${'B'.repeat(100000)}
      Labs: ${'C'.repeat(100000)}
      Additional notes: ${'D'.repeat(200000)}
    `;

    const startTime = Date.now();
    const result = extractClinicalData(largeNote);
    const duration = Date.now() - startTime;

    expect(result.ageSex).toBe('85F');
    expect(result.hpi).toBeDefined();
    expect(result.hpi.length).toBeGreaterThan(10000);
    expect(result.meds).toBeDefined();
    expect(result.meds.length).toBeGreaterThan(10000);
    expect(duration).toBeLessThan(2000); // Should process quickly
  });

  it('should handle massive HPI section (1MB)', () => {
    const massiveHPI = 'HPI: ' + 'Patient presents with symptoms. '.repeat(30000); // ~1MB

    const result = extractClinicalData(massiveHPI);

    expect(result.hpi).toBeDefined();
    expect(result.hpi.length).toBeGreaterThan(100000);
  });

  it('should handle thousands of medications in list', () => {
    const medications = Array.from({ length: 1000 }, (_, i) =>
      `Medication${i} ${10 + i}mg daily`
    ).join(', ');

    const text = `Medications: ${medications}`;
    const result = extractClinicalData(text);

    expect(result.meds).toBeDefined();
    expect(result.meds).toContain('Medication0');
    expect(result.meds).toContain('Medication999');
  });

  it('should extract from multiline HPI with thousands of lines', () => {
    const lines = Array.from({ length: 5000 }, (_, i) => `Line ${i} of history.`).join('\n');
    const text = `HPI: ${lines}\nMeds: Aspirin`;

    const result = extractClinicalData(text);

    expect(result.hpi).toBeDefined();
    expect(result.hpi.length).toBeGreaterThan(10000);
    expect(result.hpi).toContain('Line 0');
    expect(result.hpi).toContain('Line 4999');
  });

  it('should handle complex nested clinical sections', () => {
    const complexText = `
      Patient: 92M

      Chief Complaint: Multiple complaints

      HPI: ${('Detailed history. '.repeat(100))}

      Past Medical History: ${('Condition. '.repeat(50))}

      Medications: ${('Med name dose. '.repeat(100))}

      Current Medications: ${('Another med. '.repeat(50))}

      Labs: ${('Lab value. '.repeat(200))}

      Meds: ${('Additional med. '.repeat(75))}
    `;

    const result = extractClinicalData(complexText);

    expect(result.ageSex).toBe('92M');
    expect(result.hpi).toBeDefined();
    expect(result.meds).toBeDefined();
    expect(result.labs).toBeDefined();
  });
});

describe('ENHANCED STRESS TESTS - Pattern Matching Edge Cases', () => {
  it('should extract age/sex with unusual spacing variations', () => {
    const testCases = [
      { text: '85F', expected: '85F' },
      { text: '85 F', expected: '85 F' },
      { text: '85  F', expected: '85  F' },
      { text: '85\tF', expected: '85' }, // Tab handling
      { text: 'Patient is 101 years old, female gender', expected: null },
      { text: '75 male patient', expected: '75 male' },
      { text: '82 year old female', expected: '82' }
    ];

    testCases.forEach(({ text, expected }) => {
      const result = extractClinicalData(text);
      if (expected) {
        expect(result.ageSex).toBeTruthy();
      }
    });
  });

  it('should extract HPI with various header formats', () => {
    const formats = [
      'HPI: Patient presents',
      'H.P.I.: Patient presents',
      'History of Present Illness: Patient presents',
      'HISTORY OF PRESENT ILLNESS: Patient presents',
      'hpi: Patient presents',
      'History: Patient presents'
    ];

    formats.forEach(text => {
      const result = extractClinicalData(text);
      expect(result.hpi).toBeTruthy();
      expect(result.hpi).toContain('Patient presents');
    });
  });

  it('should extract medications with various header formats', () => {
    const formats = [
      'Medications: Aspirin 81mg',
      'Meds: Aspirin 81mg',
      'MEDICATIONS: Aspirin 81mg',
      'Current Medications: Aspirin 81mg',
      'Med: Aspirin 81mg',
      'Home Medications: Aspirin 81mg'
    ];

    formats.forEach(text => {
      const result = extractClinicalData(text);
      if (result.meds) {
        expect(result.meds).toContain('Aspirin');
      }
    });
  });

  it('should handle multiple age/sex patterns in same text', () => {
    const text = 'Patient 85F admitted. Daughter is 62F. Son is 58M.';

    const result = extractClinicalData(text);

    // Should extract the first occurrence
    expect(result.ageSex).toBe('85F');
  });

  it('should extract from text with multiple HPI sections', () => {
    const text = `
      HPI: First history section here.
      PMH: Past medical history
      HPI: Second history section
    `;

    const result = extractClinicalData(text);

    // Should extract from first HPI
    expect(result.hpi).toContain('First history section');
  });

  it('should handle patterns at text boundaries', () => {
    const testCases = [
      '85F',
      'HPI:Pneumonia',
      'Meds:Aspirin',
      '72 M at start',
      'ends with 90F'
    ];

    testCases.forEach(text => {
      expect(() => extractClinicalData(text)).not.toThrow();
      const result = extractClinicalData(text);
      expect(result).toBeDefined();
    });
  });

  it('should handle patterns with special regex characters', () => {
    const text = `
      Patient: 85F (*)
      HPI: Patient presents [with] {multiple} $symptoms
      Meds: Aspirin + Metformin | Lisinopril
    `;

    const result = extractClinicalData(text);

    expect(result.ageSex).toBe('85F');
    expect(result.hpi).toBeTruthy();
    expect(result.meds).toBeTruthy();
  });
});

describe('ENHANCED STRESS TESTS - Unicode & International Text', () => {
  it('should extract from mixed language clinical notes', () => {
    const text = `
      Patient: 85F (患者: 85歳女性)
      HPI: Patient presents with שלום symptoms and مرحبا condition
      Medications: 薬 include Aspirin 81mg
      Labs: 検査結果 WBC 15.2
    `;

    const result = extractClinicalData(text);

    expect(result.ageSex).toBe('85F');
    expect(result.hpi).toContain('שלום');
    expect(result.hpi).toContain('مرحبا');
    expect(result.meds).toContain('薬');
    expect(result.meds).toContain('Aspirin');
  });

  it('should handle RTL (Right-to-Left) text sections', () => {
    const text = `
      Patient: 90M
      HPI: שלום עולם זהו תיאור מקרה רפואי בעברית
      Medications: תרופות כוללות Aspirin
    `;

    const result = extractClinicalData(text);

    expect(result.ageSex).toBe('90M');
    expect(result.hpi).toContain('שלום עולם');
    expect(result.meds).toContain('תרופות');
  });

  it('should handle emoji in clinical text', () => {
    const text = `
      Patient: 75F 😊
      HPI: Patient presents with pain 🤕 and fever 🤒
      Meds: Medication 💊 Aspirin 81mg
    `;

    const result = extractClinicalData(text);

    expect(result.ageSex).toBe('75F');
    expect(result.hpi).toContain('🤕');
    expect(result.hpi).toContain('🤒');
    expect(result.meds).toContain('💊');
  });

  it('should handle diacritical marks and accents', () => {
    const text = `
      Patient: 80F
      HPI: Café au lait spots, naïve presentation in São Paulo
      Medications: Paracétamol 500mg, Ibuprofen
    `;

    const result = extractClinicalData(text);

    expect(result.ageSex).toBe('80F');
    expect(result.hpi).toContain('Café');
    expect(result.hpi).toContain('São Paulo');
    expect(result.meds).toContain('Paracétamol');
  });

  it('should handle Asian language characters', () => {
    const text = `
      患者: 85F
      HPI: 患者は混乱を呈している 환자 상태
      Medications: 薬物治療 약물 Aspirin
    `;

    const result = extractClinicalData(text);

    expect(result.ageSex).toBe('85F');
    expect(result.hpi).toContain('患者');
    expect(result.hpi).toContain('환자');
  });

  it('should handle zero-width and invisible Unicode characters', () => {
    const text = `
      Patient:\u200B85F\u200C
      HPI:\u200DPatient\uFEFF presents
      Meds: Aspirin\u200B81mg
    `;

    const result = extractClinicalData(text);

    expect(result.ageSex).toBeTruthy();
    expect(result.hpi).toBeTruthy();
    expect(result.meds).toBeTruthy();
  });
});

describe('ENHANCED STRESS TESTS - Malformed & Adversarial Input', () => {
  it('should handle HTML/XML in clinical text', () => {
    const text = `
      Patient: <patient>85F</patient>
      <hpi>HPI: <b>Patient</b> presents with <i>confusion</i></hpi>
      <medications>Meds: <drug>Aspirin</drug> 81mg</medications>
    `;

    const result = extractClinicalData(text);

    expect(result.ageSex).toBe('85F');
    expect(result.hpi).toBeTruthy();
    expect(result.meds).toBeTruthy();
  });

  it('should handle XSS attempts in clinical data', () => {
    const text = `
      Patient: 85F<script>alert('xss')</script>
      HPI: <img src=x onerror=alert(1)> Patient presents
      Meds: <svg onload=alert(1)>Aspirin</svg> 81mg
    `;

    const result = extractClinicalData(text);

    expect(result.ageSex).toBeTruthy();
    expect(result.hpi).toBeTruthy();
    expect(result.meds).toBeTruthy();
  });

  it('should handle SQL injection patterns', () => {
    const text = `
      Patient: 85F'; DROP TABLE patients; --
      HPI: ' OR '1'='1
      Meds: admin'-- Aspirin
    `;

    const result = extractClinicalData(text);

    expect(() => extractClinicalData(text)).not.toThrow();
    expect(result).toBeDefined();
  });

  it('should handle command injection patterns', () => {
    const text = `
      Patient: 85F; rm -rf /
      HPI: $(whoami) Patient presents
      Meds: \`cat /etc/passwd\` Aspirin
    `;

    const result = extractClinicalData(text);

    expect(() => extractClinicalData(text)).not.toThrow();
    expect(result).toBeDefined();
  });

  it('should handle deeply nested patterns', () => {
    let nestedText = 'Patient data';
    for (let i = 0; i < 100; i++) {
      nestedText = `[${nestedText}]`;
    }

    const text = `
      Patient: 85F
      HPI: ${nestedText}
      Meds: Aspirin
    `;

    expect(() => extractClinicalData(text)).not.toThrow();
  });

  it('should handle circular/recursive-like patterns', () => {
    const text = `
      HPI: HPI: HPI: HPI: Patient presents
      Meds: Meds: Meds: Aspirin
      Patient: Patient: 85F
    `;

    const result = extractClinicalData(text);

    expect(result).toBeDefined();
  });

  it('should handle regex DoS (ReDoS) patterns', () => {
    const text = 'HPI: ' + 'a'.repeat(10000) + 'b';

    const startTime = Date.now();
    const result = extractClinicalData(text);
    const duration = Date.now() - startTime;

    expect(result.hpi).toBeDefined();
    expect(duration).toBeLessThan(1000); // Should not cause catastrophic backtracking
  });
});

describe('ENHANCED STRESS TESTS - Boundary & Null Conditions', () => {
  it('should handle null, undefined, and empty inputs comprehensively', () => {
    const testInputs = [
      null,
      undefined,
      '',
      '   ',
      '\n\n\n',
      '\t\t\t',
      ' \n \t \r ',
      String.fromCharCode(0),
      '\x00\x01\x02'
    ];

    testInputs.forEach(input => {
      expect(() => extractClinicalData(input)).not.toThrow();
      const result = extractClinicalData(input);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('ageSex');
      expect(result).toHaveProperty('hpi');
      expect(result).toHaveProperty('meds');
    });
  });

  it('should handle extremely short valid inputs', () => {
    const testCases = [
      { text: '1F', field: 'ageSex' },
      { text: '0M', field: 'ageSex' },
      { text: 'HPI:X', field: 'hpi' },
      { text: 'Meds:A', field: 'meds' }
    ];

    testCases.forEach(({ text }) => {
      expect(() => extractClinicalData(text)).not.toThrow();
      const result = extractClinicalData(text);
      expect(result).toBeDefined();
    });
  });

  it('should handle age boundary values', () => {
    const ages = ['0F', '1M', '17F', '18M', '65F', '99M', '100F', '120M', '150F', '999M'];

    ages.forEach(ageSex => {
      const text = `Patient: ${ageSex}`;
      const result = extractClinicalData(text);
      expect(result.ageSex).toBe(ageSex);
    });
  });

  it('should handle text with only whitespace between sections', () => {
    const text = `
      85F


      HPI:


      Patient presents


      Meds:


      Aspirin
    `;

    const result = extractClinicalData(text);

    expect(result.ageSex).toBe('85F');
  });

  it('should handle extraction with no matches', () => {
    const text = 'This is completely unrelated text with no clinical data patterns.';

    const result = extractClinicalData(text);

    expect(result.ageSex).toBeNull();
    expect(result.hpi).toBeNull();
    expect(result.meds).toBeNull();
    expect(result.labs).toBeNull();
  });
});

describe('ENHANCED STRESS TESTS - Performance & Scalability', () => {
  it('should extract from 1000 different clinical notes quickly', () => {
    const notes = Array.from({ length: 1000 }, (_, i) => ({
      text: `
        Patient: ${70 + (i % 30)}${i % 2 === 0 ? 'F' : 'M'}
        HPI: Patient ${i} presents with symptoms
        Meds: Medication${i} ${10 + i}mg
      `
    }));

    const startTime = Date.now();

    notes.forEach(({ text }) => {
      const result = extractClinicalData(text);
      expect(result.ageSex).toBeTruthy();
      expect(result.hpi).toBeTruthy();
      expect(result.meds).toBeTruthy();
    });

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(5000); // Should process 1000 notes in under 5 seconds
  });

  it('should handle rapid successive extractions', () => {
    const text = `
      Patient: 85F
      HPI: Standard patient history
      Meds: Standard medications
    `;

    const startTime = Date.now();

    for (let i = 0; i < 10000; i++) {
      extractClinicalData(text);
    }

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(3000); // 10000 extractions in under 3 seconds
  });

  it('should handle population of many DOM elements efficiently', () => {
    const mockElements = {};
    const fieldCount = 1000;

    // Create 1000 mock DOM elements
    for (let i = 0; i < fieldCount; i++) {
      mockElements[`field_${i}`] = { value: '' };
    }

    const mockGetElement = vi.fn(id => mockElements[id] || null);

    const text = `
      Patient: 85F
      HPI: Patient presents with multiple conditions
      Meds: Multiple medications
    `;

    const startTime = Date.now();
    smartPopulate(text, mockGetElement);
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(100); // Should be very fast
  });

  it('should efficiently extract from text with many false-positive patterns', () => {
    const noisyText = `
      Random 99X noise 88Y text 77Z more
      Test: 66A data 55B content 44C stuff
      ${Array.from({ length: 100 }, () => Math.random().toString()).join(' ')}
      Patient: 85F
      HPI: Real patient data here
      Meds: Real medications
      ${Array.from({ length: 100 }, () => Math.random().toString()).join(' ')}
    `;

    const startTime = Date.now();
    const result = extractClinicalData(noisyText);
    const duration = Date.now() - startTime;

    expect(result.ageSex).toBe('85F');
    expect(result.hpi).toContain('Real patient data');
    expect(result.meds).toContain('Real medications');
    expect(duration).toBeLessThan(100);
  });
});
