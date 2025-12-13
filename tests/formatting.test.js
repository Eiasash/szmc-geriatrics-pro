/**
 * Tests for Medical Text Formatting Functions
 * Testing formatMedicalText and formatMedicationList
 */

import { describe, it, expect } from 'vitest';
import {
  formatMedicalText,
  formatMedicationList
} from '../src/exporters.js';

describe('Medical Text Formatting', () => {
  describe('formatMedicalText', () => {
    it('should return empty string for null input', () => {
      expect(formatMedicalText(null)).toBe('');
    });

    it('should return empty string for undefined input', () => {
      expect(formatMedicalText(undefined)).toBe('');
    });

    it('should return empty string for non-string input', () => {
      expect(formatMedicalText(123)).toBe('');
      expect(formatMedicalText({})).toBe('');
    });

    it('should preserve normal text', () => {
      const text = 'Patient has hypertension and diabetes.';
      const result = formatMedicalText(text);
      expect(result).toBeTruthy();
      expect(result).toContain('hypertension');
      expect(result).toContain('diabetes');
    });

    it('should clean up excessive whitespace', () => {
      const text = 'Patient   has    hypertension.\n\n\n\nPatient   also   has   diabetes.';
      const result = formatMedicalText(text);
      expect(result).not.toMatch(/\n{3,}/); // No more than 2 newlines
      expect(result).not.toMatch(/  +/); // No multiple spaces
    });

    it('should add line breaks after sentences', () => {
      const text = 'Patient is 85 years old. Has hypertension. Takes aspirin daily.';
      const result = formatMedicalText(text);
      const lines = result.split('\n').filter(l => l.trim());
      expect(lines.length).toBeGreaterThan(1);
    });

    it('should handle medical abbreviations', () => {
      const text = 's/p CABG, h/o CHF, c/o SOB';
      const result = formatMedicalText(text);
      expect(result).toContain('s/p');
      expect(result).toContain('h/o');
      expect(result).toContain('c/o');
    });

    it('should wrap very long lines', () => {
      const longLine = 'Patient has a very long history of multiple medical conditions including hypertension, diabetes, chronic kidney disease, congestive heart failure, and chronic obstructive pulmonary disease with recent exacerbation.';
      const result = formatMedicalText(longLine, { maxLineLength: 80 });
      const lines = result.split('\n');
      const hasShortLines = lines.some(line => line.length <= 80);
      expect(hasShortLines).toBe(true);
    });

    it('should preserve medical units', () => {
      const text = 'Aspirin 81mg daily, Metformin 1000mg twice daily';
      const result = formatMedicalText(text);
      expect(result).toContain('mg');
      expect(result).toContain('daily');
    });

    it('should handle empty strings', () => {
      expect(formatMedicalText('')).toBe('');
      expect(formatMedicalText('   ')).toBe('');
    });

    it('should respect custom maxLineLength', () => {
      const text = 'This is a short line.';
      const result1 = formatMedicalText(text, { maxLineLength: 10 });
      const result2 = formatMedicalText(text, { maxLineLength: 100 });
      expect(result1).toBeTruthy();
      expect(result2).toBeTruthy();
    });

    it('should handle text with multiple paragraphs', () => {
      const text = 'Paragraph 1.\n\nParagraph 2.\n\nParagraph 3.';
      const result = formatMedicalText(text);
      expect(result).toBeTruthy();
      // The function consolidates multiple newlines to max 2, so we check for presence of paragraphs
      const lines = result.split('\n').filter(l => l.trim());
      expect(lines.length).toBeGreaterThan(0);
      expect(result).toContain('Paragraph');
    });
  });

  describe('formatMedicationList', () => {
    it('should return empty string for null input', () => {
      expect(formatMedicationList(null)).toBe('');
    });

    it('should return empty string for undefined input', () => {
      expect(formatMedicationList(undefined)).toBe('');
    });

    it('should return empty string for non-string input', () => {
      expect(formatMedicationList(123)).toBe('');
      expect(formatMedicationList({})).toBe('');
    });

    it('should split medications by newlines', () => {
      const meds = 'Aspirin 81mg daily\nMetformin 1000mg BID\nLisinopril 10mg daily';
      const result = formatMedicationList(meds);
      const lines = result.split('\n');
      expect(lines.length).toBe(3);
      expect(lines[0]).toContain('Aspirin');
      expect(lines[1]).toContain('Metformin');
      expect(lines[2]).toContain('Lisinopril');
    });

    it('should split medications by semicolons', () => {
      const meds = 'Aspirin 81mg daily; Metformin 1000mg BID; Lisinopril 10mg daily';
      const result = formatMedicationList(meds);
      const lines = result.split('\n');
      expect(lines.length).toBe(3);
    });

    it('should split medications by commas (when followed by capital letter)', () => {
      const meds = 'Aspirin 81mg daily, Metformin 1000mg BID, Lisinopril 10mg daily';
      const result = formatMedicationList(meds);
      const lines = result.split('\n');
      expect(lines.length).toBeGreaterThan(1);
    });

    it('should remove existing bullets', () => {
      const meds = '• Aspirin 81mg\n- Metformin 1000mg\n* Lisinopril 10mg';
      const result = formatMedicationList(meds);
      expect(result).not.toContain('•');
      expect(result).not.toContain('-');
      expect(result).not.toContain('*');
      expect(result).toContain('Aspirin');
    });

    it('should remove existing numbers', () => {
      const meds = '1. Aspirin 81mg\n2. Metformin 1000mg\n3. Lisinopril 10mg';
      const result = formatMedicationList(meds);
      expect(result).not.toMatch(/^\d+\./);
      expect(result).toContain('Aspirin');
    });

    it('should capitalize first letter of each medication', () => {
      const meds = 'aspirin 81mg\nmetformin 1000mg\nlisinopril 10mg';
      const result = formatMedicationList(meds);
      const lines = result.split('\n');
      expect(lines[0].charAt(0)).toBe('A');
      expect(lines[1].charAt(0)).toBe('M');
      expect(lines[2].charAt(0)).toBe('L');
    });

    it('should handle empty strings', () => {
      expect(formatMedicationList('')).toBe('');
      expect(formatMedicationList('   ')).toBe('');
    });

    it('should trim whitespace from each line', () => {
      const meds = '  Aspirin 81mg  \n  Metformin 1000mg  ';
      const result = formatMedicationList(meds);
      const lines = result.split('\n');
      expect(lines[0]).toBe('Aspirin 81mg');
      expect(lines[1]).toBe('Metformin 1000mg');
    });

    it('should handle complex medication formatting', () => {
      const meds = '1. Aspirin 81mg PO daily\n2. Metformin 1000mg PO BID with meals\n3. Lisinopril 10mg PO daily for HTN';
      const result = formatMedicationList(meds);
      const lines = result.split('\n');
      expect(lines.length).toBe(3);
      expect(lines[0]).toContain('Aspirin');
      expect(lines[1]).toContain('Metformin');
      expect(lines[2]).toContain('Lisinopril');
      // Should not have numbers
      expect(lines[0]).not.toMatch(/^1\./);
    });

    it('should preserve dosing information', () => {
      const meds = 'Aspirin 81mg PO daily\nMetformin 1000mg PO BID';
      const result = formatMedicationList(meds);
      expect(result).toContain('81mg');
      expect(result).toContain('1000mg');
      expect(result).toContain('PO');
      expect(result).toContain('BID');
    });

    it('should handle mixed delimiters', () => {
      const meds = 'Aspirin 81mg; Metformin 1000mg, Lisinopril 10mg\nAtorvastatin 20mg';
      const result = formatMedicationList(meds);
      const lines = result.split('\n').filter(Boolean);
      expect(lines.length).toBeGreaterThan(1);
    });
  });

  describe('Integration: Combined Formatting', () => {
    it('should format complete medication section', () => {
      const rawMeds = `
        1. Aspirin 81mg daily
        2. Metformin 1000mg twice daily
        3. Lisinopril 10mg daily for hypertension
        Labs: Na 140, K 4.0, Cr 1.2
      `;
      const formatted = formatMedicationList(rawMeds);
      expect(formatted).toBeTruthy();
      expect(formatted.split('\n').length).toBeGreaterThan(1);
    });

    it('should format complete HPI section', () => {
      const rawHpi = 'Patient is an 85-year-old female with history of hypertension, diabetes mellitus type 2, chronic kidney disease stage 3, and congestive heart failure who presents with acute on chronic shortness of breath. Patient reports worsening dyspnea over the past 3 days with orthopnea and paroxysmal nocturnal dyspnea.';
      const formatted = formatMedicalText(rawHpi);
      expect(formatted).toBeTruthy();
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('should handle real-world clinical text', () => {
      const clinicalText = `
        CC: SOB
        HPI: Patient is an 85F with PMH of HTN, DM2, CKD3, CHF.
        Meds: Aspirin 81mg daily, Metformin 1000mg BID, Lisinopril 10mg daily.
      `;
      const formatted = formatMedicalText(clinicalText);
      expect(formatted).toBeTruthy();
      expect(formatted).toContain('SOB');
      expect(formatted).toContain('85F');
    });
  });

  describe('ENHANCED STRESS TESTS - Large Text Formatting', () => {
    it('should format extremely long medical text (1MB)', () => {
      const longText = 'Patient presents with multiple comorbidities including hypertension and diabetes. '.repeat(12000); // ~1MB

      const startTime = Date.now();
      const formatted = formatMedicalText(longText);
      const duration = Date.now() - startTime;

      expect(formatted).toBeDefined();
      expect(formatted.length).toBeGreaterThan(10000);
      expect(duration).toBeLessThan(2000); // Should format quickly
    });

    it('should format massive medication list (1000 medications)', () => {
      const medications = Array.from({ length: 1000 }, (_, i) =>
        `${i + 1}. Medication${i} ${10 + (i % 100)}mg ${i % 3 === 0 ? 'daily' : i % 3 === 1 ? 'BID' : 'TID'}`
      ).join('\n');

      const startTime = Date.now();
      const formatted = formatMedicationList(medications);
      const duration = Date.now() - startTime;

      const lines = formatted.split('\n').filter(Boolean);

      expect(lines.length).toBeGreaterThanOrEqual(1000);
      expect(formatted).toContain('Medication0');
      expect(formatted).toContain('Medication999');
      expect(duration).toBeLessThan(1000);
    });

    it('should handle text with thousands of sentences', () => {
      const sentences = Array.from({ length: 5000 }, (_, i) =>
        `Patient finding ${i}.`
      ).join(' ');

      const formatted = formatMedicalText(sentences);

      expect(formatted).toBeDefined();
      expect(formatted.length).toBeGreaterThan(10000);
    });

    it('should format text with extremely long single sentence', () => {
      const longSentence = 'Patient presents with ' +
        Array.from({ length: 500 }, (_, i) => `condition${i}`).join(', ') +
        ' and requires comprehensive evaluation.';

      const formatted = formatMedicalText(longSentence, { maxLineLength: 100 });

      expect(formatted).toBeDefined();
      expect(formatted).toContain('condition0');
      expect(formatted).toContain('condition499');
    });

    it('should handle medication list with complex formatting', () => {
      const complexMeds = Array.from({ length: 100 }, (_, i) => {
        const formats = [
          `• Medication${i} ${10 + i}mg PO daily`,
          `- Drug${i} ${5 + i}mg IV q12h`,
          `* Med${i} ${20 + i}mg SQ weekly`,
          `${i + 1}. Rx${i} ${15 + i}mg NG BID`
        ];
        return formats[i % 4];
      }).join('\n');

      const formatted = formatMedicationList(complexMeds);
      const lines = formatted.split('\n').filter(Boolean);

      expect(lines.length).toBeGreaterThanOrEqual(100);
      // Should remove bullets and numbers
      expect(lines[0]).not.toMatch(/^[•\-*\d]/);
    });
  });

  describe('ENHANCED STRESS TESTS - Special Characters & Unicode', () => {
    it('should handle medical text with Unicode characters', () => {
      const unicodeText = `
        Patient presents with café-au-lait spots.
        Naïve presentation of résumé of symptoms.
        São Paulo protocol applied.
        Temperature: 38°C.
        Dosage: 500μg/mL.
      `;

      const formatted = formatMedicalText(unicodeText);

      expect(formatted).toContain('café-au-lait');
      expect(formatted).toContain('naïve');
      expect(formatted).toContain('São');
      expect(formatted).toContain('°C');
      expect(formatted).toContain('μg');
    });

    it('should handle medications with international characters', () => {
      const intlMeds = `
        Paracétamol 500mg
        Ibuprofen™ 400mg
        Aspirin® 81mg
        Naproxen℞ 250mg
      `;

      const formatted = formatMedicationList(intlMeds);

      expect(formatted).toContain('Paracétamol');
      expect(formatted).toContain('™');
      expect(formatted).toContain('®');
    });

    it('should handle medical text with emoji', () => {
      const emojiText = `
        Patient mood: 😊 improved
        Pain level: 🤕 moderate
        Fever: 🤒 present
        Treatment: 💊 prescribed
      `;

      const formatted = formatMedicalText(emojiText);

      expect(formatted).toContain('😊');
      expect(formatted).toContain('🤕');
      expect(formatted).toContain('🤒');
      expect(formatted).toContain('💊');
    });

    it('should handle text with RTL characters', () => {
      const rtlText = `
        Patient: שלום Smith
        Condition: مرحبا symptoms
        Notes: 患者 presentation
      `;

      const formatted = formatMedicalText(rtlText);

      expect(formatted).toContain('שלום');
      expect(formatted).toContain('مرحبا');
      expect(formatted).toContain('患者');
    });

    it('should handle medications with diacritical marks', () => {
      const diacriticalMeds = `
        Café-based medication 100mg
        Naïve formulation 200mg
        Zürich protocol drug 50mg
        São compound 75mg
      `;

      const formatted = formatMedicationList(diacriticalMeds);

      expect(formatted).toContain('Café');
      expect(formatted).toContain('Naïve');
      expect(formatted).toContain('Zürich');
      expect(formatted).toContain('São');
    });
  });

  describe('ENHANCED STRESS TESTS - Complex Medical Formatting', () => {
    it('should handle text with multiple medical abbreviations', () => {
      const abbrevText = `
        s/p CABG, h/o CVA, c/o SOB.
        PMH: HTN, DM2, CKD3, CHF, COPD, CAD.
        ROS: (+) for CP, (-) for n/v/d.
        PE: HEENT wnl, CV RRR, Lungs CTAB.
      `;

      const formatted = formatMedicalText(abbrevText);

      expect(formatted).toContain('s/p');
      expect(formatted).toContain('h/o');
      expect(formatted).toContain('c/o');
      expect(formatted).toContain('HTN');
      expect(formatted).toContain('HEENT');
    });

    it('should format medications with complex dosing', () => {
      const complexDosing = `
        Aspirin 81mg PO daily with food
        Metformin 1000mg PO BID with meals, max 2000mg/day
        Insulin glargine 20 units SQ qHS, titrate by 2 units q3days
        Warfarin 5mg PO daily, adjust based on INR goal 2-3
        Furosemide 40mg IV q12h PRN for edema
      `;

      const formatted = formatMedicationList(complexDosing);

      expect(formatted).toContain('Aspirin');
      expect(formatted).toContain('Metformin');
      expect(formatted).toContain('Insulin');
      expect(formatted).toContain('Warfarin');
    });

    it('should handle text with measurements and units', () => {
      const measurementText = `
        Weight: 75.5 kg (BMI: 25.2 kg/m²)
        BP: 145/90 mmHg
        HR: 88 bpm
        Temp: 37.2°C (99.0°F)
        Labs: Na 138 mEq/L, K 4.2 mEq/L, Cr 1.1 mg/dL
        Glucose: 156 mg/dL (8.7 mmol/L)
      `;

      const formatted = formatMedicalText(measurementText);

      expect(formatted).toContain('kg/m²');
      expect(formatted).toContain('mmHg');
      expect(formatted).toContain('°C');
      expect(formatted).toContain('mEq/L');
    });

    it('should handle medications with fractions and ranges', () => {
      const fractionMeds = `
        Levothyroxine 0.5mg daily
        Digoxin 0.125mg daily
        Warfarin 2.5-5mg daily based on INR
        Insulin 4-6 units with meals
      `;

      const formatted = formatMedicationList(fractionMeds);

      expect(formatted).toContain('0.5mg');
      expect(formatted).toContain('0.125mg');
      expect(formatted).toContain('2.5-5mg');
    });

    it('should handle text with parenthetical information', () => {
      const parentheticalText = `
        Patient (85F) presents with symptoms.
        History of hypertension (controlled on medication).
        Labs (see attached) show improvement.
        Follow-up (scheduled for 2 weeks) arranged.
      `;

      const formatted = formatMedicalText(parentheticalText);

      expect(formatted).toContain('(85F)');
      expect(formatted).toContain('(controlled on medication)');
      expect(formatted).toContain('(see attached)');
    });
  });

  describe('ENHANCED STRESS TESTS - Edge Cases & Boundary Conditions', () => {
    it('should handle empty or whitespace-only input', () => {
      const testInputs = ['', '   ', '\n\n\n', '\t\t\t', ' \n \t '];

      testInputs.forEach(input => {
        expect(formatMedicalText(input)).toBe('');
        expect(formatMedicationList(input)).toBe('');
      });
    });

    it('should handle single character input', () => {
      expect(formatMedicalText('A')).toBeTruthy();
      expect(formatMedicationList('B')).toBeTruthy();
    });

    it('should handle text with only punctuation', () => {
      const punctuation = '...!!!???;;;:::,,,';

      const formatted = formatMedicalText(punctuation);
      expect(formatted).toBeDefined();
    });

    it('should handle medication list with single medication', () => {
      const singleMed = 'Aspirin 81mg daily';

      const formatted = formatMedicationList(singleMed);

      expect(formatted).toBe('Aspirin 81mg daily');
    });

    it('should handle text with excessive newlines', () => {
      const excessiveNewlines = 'Line 1\n\n\n\n\n\nLine 2\n\n\n\n\nLine 3';

      const formatted = formatMedicalText(excessiveNewlines);

      // Should reduce excessive newlines
      expect(formatted).not.toMatch(/\n{4,}/);
      expect(formatted).toContain('Line 1');
      expect(formatted).toContain('Line 3');
    });

    it('should handle medications with only delimiters', () => {
      const delimiterOnly = ';;;,,,\n\n\n';

      const formatted = formatMedicationList(delimiterOnly);

      expect(formatted).toBe('');
    });

    it('should handle very long medication name', () => {
      const longMedName = 'A'.repeat(500) + ' 100mg daily';

      const formatted = formatMedicationList(longMedName);

      expect(formatted).toContain('A'.repeat(500));
    });

    it('should handle text with mixed newline types', () => {
      const mixedNewlines = 'Line1\nLine2\rLine3\r\nLine4';

      const formatted = formatMedicalText(mixedNewlines);

      expect(formatted).toBeDefined();
      expect(formatted).toContain('Line1');
      expect(formatted).toContain('Line4');
    });
  });

  describe('ENHANCED STRESS TESTS - Performance', () => {
    it('should format 10000 medication entries efficiently', () => {
      const hugeMedList = Array.from({ length: 10000 }, (_, i) =>
        `${i + 1}. Medication${i} ${10 + i}mg daily`
      ).join('\n');

      const startTime = Date.now();
      const formatted = formatMedicationList(hugeMedList);
      const duration = Date.now() - startTime;

      expect(formatted.split('\n').length).toBeGreaterThanOrEqual(10000);
      expect(duration).toBeLessThan(2000); // Should be fast
    });

    it('should handle rapid successive formatting calls (1000 iterations)', () => {
      const text = 'Patient presents with symptoms. Treatment plan initiated.';

      const startTime = Date.now();

      for (let i = 0; i < 1000; i++) {
        formatMedicalText(text);
      }

      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(1000);
    });

    it('should format text with complex structure efficiently', () => {
      const complexText = Array.from({ length: 1000 }, (_, i) => `
        Section ${i}:
        - Point 1 of section ${i}
        - Point 2 of section ${i}

        Details for section ${i} with multiple sentences.
        Additional information here.

      `).join('\n');

      const startTime = Date.now();
      const formatted = formatMedicalText(complexText);
      const duration = Date.now() - startTime;

      expect(formatted).toBeDefined();
      expect(formatted.length).toBeGreaterThan(10000);
      expect(duration).toBeLessThan(1000);
    });

    it('should handle concurrent formatting operations', async () => {
      const texts = Array.from({ length: 100 }, (_, i) =>
        `Patient ${i} presents with symptoms. Treatment initiated.`
      );

      const startTime = Date.now();

      await Promise.all(
        texts.map(text => Promise.resolve(formatMedicalText(text)))
      );

      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(500);
    });
  });

  describe('ENHANCED STRESS TESTS - Real-World Clinical Scenarios', () => {
    it('should format comprehensive geriatric assessment', () => {
      const assessment = `
        COMPREHENSIVE GERIATRIC ASSESSMENT

        Patient: 85F

        Chief Complaint: Falls, confusion, decreased appetite

        HPI: Patient is an 85-year-old female with PMH significant for HTN, DM2, CKD stage 3,
        CHF (EF 35%), and dementia who presents with increased falls over the past 2 weeks.
        Family reports 4 falls in past week, confusion worse at night, poor PO intake.

        Medications:
        1. Lisinopril 10mg PO daily
        2. Metformin 1000mg PO BID
        3. Furosemide 40mg PO daily
        4. Donepezil 10mg PO qHS
        5. Aspirin 81mg PO daily
        6. Atorvastatin 40mg PO qHS

        Functional Status: ADLs - needs assist with bathing, dressing. IADLs - dependent.

        Cognitive: MMSE 18/30, significant decline from baseline of 24/30 six months ago.

        Social: Lives with daughter. Home health aide 4 hours daily.
      `;

      const formatted = formatMedicalText(assessment);

      expect(formatted).toContain('85F');
      expect(formatted).toContain('Lisinopril');
      expect(formatted).toContain('MMSE');
    });

    it('should format complex polypharmacy medication list', () => {
      const polypharmacy = `
        Active Medications (18 total):

        Cardiovascular:
        • Lisinopril 10mg PO daily for HTN
        • Metoprolol succinate 50mg PO daily for CHF
        • Furosemide 40mg PO BID for volume overload
        • Spironolactone 25mg PO daily

        Endocrine:
        - Metformin 1000mg PO BID with meals
        - Glipizide 5mg PO daily before breakfast
        - Levothyroxine 75mcg PO daily on empty stomach

        Neurologic:
        * Donepezil 10mg PO qHS for dementia
        * Memantine 10mg PO BID
        * Gabapentin 300mg PO TID for neuropathy

        GI:
        1. Omeprazole 20mg PO daily
        2. Docusate 100mg PO BID PRN

        Other:
        Aspirin 81mg PO daily; Atorvastatin 40mg PO qHS; Vitamin D3 2000 IU daily;
        Calcium carbonate 500mg PO BID with meals
      `;

      const formatted = formatMedicationList(polypharmacy);
      const lines = formatted.split('\n').filter(Boolean);

      expect(lines.length).toBeGreaterThan(10);
      expect(formatted).toContain('Lisinopril');
      expect(formatted).toContain('Metformin');
      expect(formatted).toContain('Donepezil');
    });

    it('should format discharge summary with complex formatting', () => {
      const dischargeSummary = `
        DISCHARGE SUMMARY

        Admission Date: [DATE] Discharge Date: [DATE]

        Principal Diagnosis: Acute decompensated heart failure
        Secondary Diagnoses: 1) Acute on chronic kidney injury 2) Hyponatremia 3) Delirium

        Hospital Course: 85F with known CHF (EF 30%) admitted with SOB and volume overload.
        Diuresed with IV Lasix 40mg BID with good response. Cr peaked at 2.1, improved to 1.4.
        Delirium resolved with treatment of underlying medical issues.

        Discharge Medications: (see attached comprehensive list - 18 medications)

        Follow-up: Cardiology in 1 week, PCP in 2 weeks, Home health for vitals monitoring
      `;

      const formatted = formatMedicalText(dischargeSummary);

      expect(formatted).toContain('DISCHARGE SUMMARY');
      expect(formatted).toContain('Hospital Course');
      expect(formatted).toContain('Follow-up');
    });
  });
});
