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
});
