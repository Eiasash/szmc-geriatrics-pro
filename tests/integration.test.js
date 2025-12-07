/**
 * Integration Tests
 * Comprehensive tests to verify all functionality works end-to-end
 */

import { describe, it, expect } from 'vitest';
import { handleFile, SUPPORTED_EXTENSIONS, MAX_FILE_SIZE } from '../src/fileHandler.js';
import { smartPopulate, extractClinicalData } from '../src/populator.js';
import { generatePrompt, validatePromptData } from '../src/prompt.js';
import { sanitizeText, escapeHtml } from '../src/exporters.js';

describe('Integration Tests - Complete Workflow', () => {
  describe('File Import to Data Population', () => {
    it('should extract text and populate clinical data from HTML content', async () => {
      const htmlContent = `
        <html>
          <body>
            <h1>Patient Chart</h1>
            <p>Patient: 85F</p>
            <h2>HPI: Patient admitted with fever and confusion</h2>
            <h2>Medications: Aspirin 81mg, Metformin 500mg</h2>
          </body>
        </html>
      `;
      
      const mockFile = {
        name: 'patient.html',
        text: async () => htmlContent,
        size: htmlContent.length
      };

      const text = await handleFile(mockFile, {}, {});
      expect(text).toContain('85F');
      expect(text).toContain('fever and confusion');
      
      const data = extractClinicalData(text);
      expect(data.ageSex).toBe('85F');
    });

    it('should extract text from plain text file', async () => {
      const textContent = `Patient: 72 M
HPI: Admitted for chest pain
Meds: Atorvastatin 40mg, Aspirin 81mg`;
      
      const mockFile = {
        name: 'patient.txt',
        text: async () => textContent,
        size: textContent.length
      };

      const text = await handleFile(mockFile, {}, {});
      const data = extractClinicalData(text);
      
      expect(data.ageSex).toBe('72 M');
      expect(data.hpi).toBeTruthy();
      expect(data.meds).toBeTruthy();
    });
  });

  describe('Data to Prompt Generation', () => {
    it('should generate complete AI prompt from extracted data', () => {
      const data = {
        ageSex: '85F',
        hpi: 'Admitted for fever and confusion',
        meds: 'Aspirin 81mg, Metformin 500mg'
      };

      const validation = validatePromptData(data);
      expect(validation.isValid).toBe(true);

      const prompt = generatePrompt(data);
      expect(prompt).toContain('85F');
      expect(prompt).toContain('fever and confusion');
      expect(prompt).toContain('SAFETY AUDIT');
      expect(prompt).toContain('Beers Criteria');
    });

    it('should support raw text fallback when structured fields are empty', () => {
      const data = {
        ageSex: '',
        hpi: '',
        meds: '',
        rawText: 'Patient: 78M with dementia, taking donepezil and haloperidol'
      };

      const prompt = generatePrompt(data);
      expect(prompt).toContain('78M with dementia');
      expect(prompt).toContain('See clinical data below');
    });
  });

  describe('Sanitization for Export', () => {
    it('should sanitize all data before export', () => {
      const unsafeData = {
        ageSex: '85F<script>alert("xss")</script>',
        hpi: 'Patient with <b>fever</b> and confusion\x00\x01',
        meds: 'Aspirin<img src=x onerror=alert(1)> 81mg'
      };

      const sanitizedAge = sanitizeText(unsafeData.ageSex);
      const sanitizedHpi = sanitizeText(unsafeData.hpi);
      const sanitizedMeds = sanitizeText(unsafeData.meds);

      // Should remove script tags and their content
      expect(sanitizedAge).not.toContain('<script>');
      expect(sanitizedAge).toBe('85Falert("xss")'); // Tags removed, text preserved
      
      // Should remove HTML tags
      expect(sanitizedHpi).not.toContain('<b>');
      expect(sanitizedHpi).toContain('fever');
      
      // Should remove control characters
      expect(sanitizedHpi).not.toMatch(/[\x00-\x08]/);
      
      // Should remove malicious tags
      expect(sanitizedMeds).not.toContain('<img');
      expect(sanitizedMeds).toContain('Aspirin');
    });

    it('should escape HTML for safe Word export', () => {
      const data = {
        hpi: 'Patient <85 years old> with "fever" & confusion',
        meds: "Aspirin 'daily' medication"
      };

      const escapedHpi = escapeHtml(data.hpi);
      const escapedMeds = escapeHtml(data.meds);

      expect(escapedHpi).toContain('&lt;');
      expect(escapedHpi).toContain('&gt;');
      expect(escapedHpi).toContain('&quot;');
      expect(escapedHpi).toContain('&amp;');
      expect(escapedMeds).toContain('&#39;');
    });
  });

  describe('Complete End-to-End Workflow', () => {
    it('should process file -> extract data -> generate prompt -> sanitize for export', async () => {
      // Step 1: Import file
      const htmlContent = `
        <html><body>
        <p>Patient: 90F</p>
        <p>HPI: Admitted with altered mental status</p>
        <p>Medications: Diphenhydramine 25mg, Alprazolam 0.5mg</p>
        </body></html>
      `;
      
      const mockFile = {
        name: 'patient.html',
        text: async () => htmlContent,
        size: htmlContent.length
      };

      const rawText = await handleFile(mockFile, {}, {});
      
      // Step 2: Extract clinical data
      const clinicalData = extractClinicalData(rawText);
      expect(clinicalData.ageSex).toBe('90F');
      expect(clinicalData.hpi).toContain('altered mental status');
      expect(clinicalData.meds).toContain('Diphenhydramine');
      
      // Step 3: Validate and generate prompt
      const validation = validatePromptData(clinicalData);
      expect(validation.isValid).toBe(true);
      
      const prompt = generatePrompt(clinicalData);
      expect(prompt).toContain('90F');
      expect(prompt).toContain('SAFETY AUDIT');
      expect(prompt).toContain('Beers Criteria'); // Should flag Diphenhydramine
      
      // Step 4: Sanitize for export
      const sanitizedAge = sanitizeText(clinicalData.ageSex);
      const sanitizedHpi = sanitizeText(clinicalData.hpi);
      const sanitizedMeds = sanitizeText(clinicalData.meds);
      
      expect(sanitizedAge).toBe('90F');
      expect(sanitizedHpi).toContain('altered mental status');
      expect(sanitizedMeds).toContain('Diphenhydramine');
    });
  });

  describe('All File Types Support', () => {
    it('should support all documented import file types', () => {
      const allExtensions = Object.values(SUPPORTED_EXTENSIONS).flat();
      
      // Verify all documented types are supported
      expect(allExtensions).toContain('pptx');
      expect(allExtensions).toContain('pdf');
      expect(allExtensions).toContain('docx');
      expect(allExtensions).toContain('doc');
      expect(allExtensions).toContain('html');
      expect(allExtensions).toContain('htm');
      expect(allExtensions).toContain('txt');
      expect(allExtensions).toContain('jpg');
      expect(allExtensions).toContain('jpeg');
      expect(allExtensions).toContain('png');
    });

    it('should reject unsupported file types', async () => {
      const mockFile = {
        name: 'file.xyz',
        text: async () => 'content',
        size: 100
      };

      await expect(handleFile(mockFile, {}, {})).rejects.toThrow('Unsupported file type');
    });

    it('should reject files that are too large', async () => {
      const mockFile = {
        name: 'huge.pdf',
        text: async () => 'content',
        size: MAX_FILE_SIZE + 1
      };

      await expect(handleFile(mockFile, {}, {})).rejects.toThrow('File too large');
    });
  });

  describe('Medical Safety Features', () => {
    it('should include Beers Criteria in prompt', () => {
      const data = {
        ageSex: '85F',
        hpi: 'Patient with delirium',
        meds: 'Diphenhydramine, Alprazolam' // Both are Beers Criteria PIMs
      };

      const prompt = generatePrompt(data);
      expect(prompt).toContain('Beers Criteria');
      expect(prompt).toContain('SAFETY AUDIT');
      // Verify medications are included in prompt for AI to evaluate
      expect(prompt).toContain('Diphenhydramine');
      expect(prompt).toContain('Alprazolam');
    });

    it('should include drug interaction checking in prompt', () => {
      const data = {
        ageSex: '75M',
        hpi: 'Fall risk assessment',
        meds: 'Multiple fall-risk medications'
      };

      const prompt = generatePrompt(data);
      expect(prompt).toContain('Drug Interactions');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty file gracefully', async () => {
      const mockFile = {
        name: 'empty.txt',
        text: async () => '',
        size: 0
      };

      const text = await handleFile(mockFile, {}, {});
      expect(text).toBe('');
    });

    it('should handle special characters in patient data', () => {
      const data = {
        ageSex: '85F',
        hpi: 'Patient: O\'Brien with café-au-lait spots',
        meds: 'Medication™ 500mg'
      };

      const prompt = generatePrompt(data);
      expect(prompt).toContain('O\'Brien');
      expect(prompt).toContain('café-au-lait');
      expect(prompt).toContain('™');
    });

    it('should handle multiline data properly', () => {
      const data = {
        ageSex: '72M',
        hpi: 'Line 1\nLine 2\nLine 3',
        meds: 'Med 1\nMed 2'
      };

      const prompt = generatePrompt(data);
      expect(prompt).toContain('Line 1');
      expect(prompt).toContain('Line 2');
      expect(prompt).toContain('Med 1');
    });
  });

  describe('Professional Export Requirements', () => {
    it('should sanitize text while preserving medical terminology', () => {
      const medicalText = 'Patient with CHF, CKD stage III, and COPD exacerbation';
      const sanitized = sanitizeText(medicalText);
      
      expect(sanitized).toContain('CHF');
      expect(sanitized).toContain('CKD');
      expect(sanitized).toContain('COPD');
      expect(sanitized).toContain('stage III');
    });

    it('should handle complex medical abbreviations', () => {
      const data = {
        ageSex: '88F',
        hpi: 'Patient s/p CABG, h/o CVA, c/o SOB',
        meds: 'ASA, ACEI, BB'
      };

      const sanitizedHpi = sanitizeText(data.hpi);
      expect(sanitizedHpi).toContain('s/p');
      expect(sanitizedHpi).toContain('h/o');
      expect(sanitizedHpi).toContain('c/o');
    });
  });
});

describe('Feature Completeness Verification', () => {
  it('should have all import features', () => {
    // Verify import capabilities exist
    expect(SUPPORTED_EXTENSIONS).toBeDefined();
    expect(SUPPORTED_EXTENSIONS.presentation).toBeDefined();
    expect(SUPPORTED_EXTENSIONS.document).toBeDefined();
    expect(SUPPORTED_EXTENSIONS.text).toBeDefined();
    expect(SUPPORTED_EXTENSIONS.image).toBeDefined();
  });

  it('should have data population features', () => {
    expect(smartPopulate).toBeDefined();
    expect(extractClinicalData).toBeDefined();
  });

  it('should have prompt generation features', () => {
    expect(generatePrompt).toBeDefined();
    expect(validatePromptData).toBeDefined();
  });

  it('should have sanitization features', () => {
    expect(sanitizeText).toBeDefined();
    expect(escapeHtml).toBeDefined();
  });
});
