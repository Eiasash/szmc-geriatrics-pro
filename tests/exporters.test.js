/**
 * Tests for Exporters Module
 * Testing PowerPoint and Word document export functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  PPT_CONFIG,
  DOC_CONFIG,
  MEDICAL_REFERENCES,
  sanitizeText,
  escapeHtml,
  truncateText,
  createSlideData,
  generatePPT,
  createProfessionalSlides,
  generateProfessionalPPT,
  createDocHTML,
  createDocBlob,
  exportDOC,
  triggerDownload
} from '../src/exporters.js';

describe('Exporters Module', () => {
  describe('PPT_CONFIG', () => {
    it('should have maxTextPerSlide defined', () => {
      expect(PPT_CONFIG.maxTextPerSlide).toBe(1000);
    });

    it('should have color definitions', () => {
      expect(PPT_CONFIG.colors).toHaveProperty('primary');
      expect(PPT_CONFIG.colors).toHaveProperty('accent');
      expect(PPT_CONFIG.colors).toHaveProperty('highlight');
    });

    it('should have font size definitions', () => {
      expect(PPT_CONFIG.fonts).toHaveProperty('title');
      expect(PPT_CONFIG.fonts).toHaveProperty('body');
      expect(PPT_CONFIG.fonts.title).toBeGreaterThan(PPT_CONFIG.fonts.body);
    });
  });

  describe('DOC_CONFIG', () => {
    it('should have correct MIME type', () => {
      expect(DOC_CONFIG.mimeType).toBe('application/msword');
    });

    it('should have UTF-8 BOM character', () => {
      expect(DOC_CONFIG.bom).toBe('\ufeff');
    });

    it('should have XML namespace definitions', () => {
      expect(DOC_CONFIG.xmlNamespaces).toHaveProperty('office');
      expect(DOC_CONFIG.xmlNamespaces).toHaveProperty('word');
      expect(DOC_CONFIG.xmlNamespaces).toHaveProperty('html');
    });
  });

  describe('sanitizeText', () => {
    it('should return empty string for null input', () => {
      expect(sanitizeText(null)).toBe('');
    });

    it('should return empty string for undefined input', () => {
      expect(sanitizeText(undefined)).toBe('');
    });

    it('should return empty string for non-string input', () => {
      expect(sanitizeText(123)).toBe('');
      expect(sanitizeText({})).toBe('');
    });

    it('should preserve normal text', () => {
      expect(sanitizeText('Hello World')).toBe('Hello World');
    });

    it('should preserve newlines and tabs', () => {
      const text = 'Line 1\nLine 2\tTabbed';
      expect(sanitizeText(text)).toBe('Line 1\nLine 2\tTabbed');
    });

    it('should remove control characters', () => {
      const text = 'Hello\x00World\x1FTest';
      const result = sanitizeText(text);
      expect(result).toBe('HelloWorldTest');
      expect(result).not.toContain('\x00');
      expect(result).not.toContain('\x1F');
    });

    it('should preserve Unicode characters', () => {
      const text = 'שלום עולם 你好世界';
      expect(sanitizeText(text)).toBe('שלום עולם 你好世界');
    });

    it('should preserve HTML entities', () => {
      const text = '&lt;div&gt; &amp; test';
      expect(sanitizeText(text)).toBe('&lt;div&gt; &amp; test');
    });

    it('should remove HTML tags', () => {
      const text = '<p>Hello</p> <div>World</div>';
      expect(sanitizeText(text)).toBe('Hello World');
    });

    it('should remove XML tags', () => {
      const text = '<a:t>Patient data</a:t> <w:p>Test</w:p>';
      expect(sanitizeText(text)).toBe('Patient data Test');
    });

    it('should remove nested HTML tags', () => {
      const text = '<div><p><strong>Bold text</strong></p></div>';
      expect(sanitizeText(text)).toBe('Bold text');
    });

    it('should handle mixed content with tags and control chars', () => {
      const text = '<p>Hello\x00</p> <span>World\x1F</span>';
      expect(sanitizeText(text)).toBe('Hello World');
    });

    it('should handle malformed nested HTML tags', () => {
      const text = '<script<script>alert("xss")</script>';
      const result = sanitizeText(text);
      expect(result).toBe('alert("xss")');
      expect(result).not.toContain('<script');
      expect(result).not.toContain('</script>');
    });

    it('should handle deeply nested tags', () => {
      const text = '<div><span><b>Test</b></span></div>';
      const result = sanitizeText(text);
      expect(result).toBe('Test');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });
  });

  describe('escapeHtml', () => {
    it('should return empty string for null input', () => {
      expect(escapeHtml(null)).toBe('');
    });

    it('should return empty string for undefined input', () => {
      expect(escapeHtml(undefined)).toBe('');
    });

    it('should return empty string for non-string input', () => {
      expect(escapeHtml(123)).toBe('');
    });

    it('should escape ampersands', () => {
      expect(escapeHtml('A & B')).toBe('A &amp; B');
    });

    it('should escape less than signs', () => {
      expect(escapeHtml('5 < 10')).toBe('5 &lt; 10');
    });

    it('should escape greater than signs', () => {
      expect(escapeHtml('10 > 5')).toBe('10 &gt; 5');
    });

    it('should escape double quotes', () => {
      expect(escapeHtml('Say "Hello"')).toBe('Say &quot;Hello&quot;');
    });

    it('should escape single quotes', () => {
      expect(escapeHtml("It's")).toBe('It&#39;s');
    });

    it('should escape multiple special characters', () => {
      expect(escapeHtml('<script>alert("XSS & stuff")</script>'))
        .toBe('&lt;script&gt;alert(&quot;XSS &amp; stuff&quot;)&lt;/script&gt;');
    });

    it('should preserve normal text', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World');
    });

    it('should preserve Unicode characters', () => {
      expect(escapeHtml('שלום 你好')).toBe('שלום 你好');
    });
  });

  describe('truncateText', () => {
    it('should not truncate short text', () => {
      expect(truncateText('Hello', 100)).toBe('Hello');
    });

    it('should truncate long text with ellipsis', () => {
      const result = truncateText('This is a very long text', 10);
      expect(result).toBe('This is...');
      expect(result.length).toBe(10);
    });

    it('should use custom suffix', () => {
      const result = truncateText('Long text here', 10, ' [more]');
      expect(result).toContain('[more]');
    });

    it('should handle null input', () => {
      expect(truncateText(null, 100)).toBe('');
    });

    it('should handle undefined input', () => {
      expect(truncateText(undefined, 100)).toBe('');
    });

    it('should handle text exactly at max length', () => {
      expect(truncateText('12345', 5)).toBe('12345');
    });

    it('should handle empty string', () => {
      expect(truncateText('', 100)).toBe('');
    });

    it('should handle very short max length', () => {
      const result = truncateText('Hello World', 5);
      expect(result.length).toBe(5);
    });
  });

  describe('createSlideData', () => {
    const sampleData = {
      ageSex: '85F',
      initials: 'AB',
      hpi: 'Patient presents with confusion',
      meds: 'Lisinopril 10mg, Metformin 500mg',
      aiResponse: 'Assessment and plan text here'
    };

    it('should create at least 15 slides for comprehensive presentation', () => {
      const slides = createSlideData(sampleData);
      expect(slides.length).toBeGreaterThanOrEqual(15);
    });

    it('should create title slide first', () => {
      const slides = createSlideData(sampleData);
      expect(slides[0].type).toBe('title');
    });

    it('should include patient identifier on title slide', () => {
      const slides = createSlideData(sampleData);
      const titleSlide = slides[0];
      const hasPatientId = titleSlide.elements.some(el =>
        el.text.includes('85F') || el.text.includes('AB')
      );
      expect(hasPatientId).toBe(true);
    });

    it('should create clinical context slide with HPI', () => {
      const slides = createSlideData(sampleData);
      // HPI is on slide 3 (index 2) in the new structure
      const hpiSlide = slides.find(slide => 
        slide.elements.some(el => el.text.includes('Chief Complaint') || el.text.includes('History'))
      );
      expect(hpiSlide).toBeDefined();
      expect(hpiSlide.type).toBe('content');
    });

    it('should create assessment slide', () => {
      const slides = createSlideData(sampleData);
      // Clinical Assessment is on slide 7 in the new structure
      const analysisSlide = slides.find(slide =>
        slide.elements.some(el => el.text.includes('Assessment') || el.text.includes('Analysis'))
      );
      expect(analysisSlide).toBeDefined();
    });

    it('should create overflow slide for long AI response', () => {
      const longData = {
        ...sampleData,
        aiResponse: 'A'.repeat(1500) // Longer than 700 chars (new threshold)
      };

      const slides = createSlideData(longData);
      expect(slides.length).toBe(16); // 15 base + 1 overflow
      const overflowSlide = slides.find(s => s.type === 'overflow');
      expect(overflowSlide).toBeDefined();
    });

    it('should not create overflow slide for short AI response', () => {
      const slides = createSlideData(sampleData);
      const hasOverflow = slides.some(s => s.type === 'overflow');
      expect(hasOverflow).toBe(false);
    });

    it('should truncate HPI content appropriately', () => {
      const longHpiData = {
        ...sampleData,
        hpi: 'X'.repeat(1000)
      };

      const slides = createSlideData(longHpiData);
      // Find HPI slide (slide 3, index 2)
      const hpiSlide = slides.find(slide =>
        slide.elements.some(el => el.text.includes('Chief Complaint') || el.text.includes('History'))
      );
      expect(hpiSlide).toBeDefined();
      
      // HPI content should be truncated to 600 chars in the new structure
      const hpiContent = hpiSlide.elements.find(el => el.text.length > 50);
      expect(hpiContent).toBeDefined();
      expect(hpiContent.text.length).toBeLessThanOrEqual(603); // 600 + '...'
    });

    it('should handle empty data and create base structure', () => {
      const emptyData = {};
      const slides = createSlideData(emptyData);

      // Should create 15 slides even with empty data
      expect(slides.length).toBe(15);
      // Should not throw and should have default empty values
      expect(slides[0].type).toBe('title');
    });

    it('should include proper styling properties', () => {
      const slides = createSlideData(sampleData);

      for (const slide of slides) {
        for (const element of slide.elements) {
          expect(element).toHaveProperty('x');
          expect(element).toHaveProperty('y');
          expect(element).toHaveProperty('fontSize');
        }
      }
    });
  });

  describe('generatePPT', () => {
    let mockPptxGenJS;
    let mockSlide;

    beforeEach(() => {
      mockSlide = {
        addText: vi.fn()
      };

      mockPptxGenJS = vi.fn(function() {
        this.addSlide = vi.fn().mockReturnValue(mockSlide);
        this.writeFile = vi.fn().mockResolvedValue(undefined);
      });
    });

    it('should throw error if PptxGenJS is not provided', () => {
      expect(() => generatePPT({}, null)).toThrow('PptxGenJS library is required');
    });

    it('should create presentation instance', () => {
      generatePPT({ ageSex: '85F' }, mockPptxGenJS);
      expect(mockPptxGenJS).toHaveBeenCalled();
    });

    it('should add slides to presentation', () => {
      const pres = generatePPT({ ageSex: '85F', initials: 'AB' }, mockPptxGenJS);
      expect(pres.addSlide).toHaveBeenCalled();
    });

    it('should add text elements to slides', () => {
      generatePPT({ ageSex: '85F' }, mockPptxGenJS);
      expect(mockSlide.addText).toHaveBeenCalled();
    });
  });

  describe('createDocHTML', () => {
    const sampleData = {
      ageSex: '85F',
      initials: 'AB',
      hpi: 'Confusion for 2 days',
      meds: 'Donepezil 10mg',
      aiResponse: 'Assessment: Delirium likely'
    };

    it('should create valid HTML structure', () => {
      const html = createDocHTML(sampleData);

      expect(html).toContain('<html');
      expect(html).toContain('</html>');
      expect(html).toContain('<head>');
      expect(html).toContain('<body>');
    });

    it('should include XML namespaces for Word compatibility', () => {
      const html = createDocHTML(sampleData);

      expect(html).toContain('xmlns:o=');
      expect(html).toContain('xmlns:w=');
      expect(html).toContain('urn:schemas-microsoft-com:office');
    });

    it('should include charset meta tag', () => {
      const html = createDocHTML(sampleData);
      expect(html).toContain("charset='utf-8'");
    });

    it('should include all patient data', () => {
      const html = createDocHTML(sampleData);

      expect(html).toContain('85F');
      expect(html).toContain('AB');
      expect(html).toContain('Confusion for 2 days');
      expect(html).toContain('Donepezil 10mg');
      expect(html).toContain('Delirium likely');
    });

    it('should have proper section headers', () => {
      const html = createDocHTML(sampleData);

      expect(html).toContain('Geriatric Case Report');
      expect(html).toContain('HPI');
      expect(html).toContain('Meds/Labs');
      expect(html).toContain('Analysis & Plan');
    });

    it('should sanitize text to remove control characters', () => {
      const dataWithControlChars = {
        ...sampleData,
        hpi: 'Test\x00\x1Ftext'
      };

      const html = createDocHTML(dataWithControlChars);

      expect(html).not.toContain('\x00');
      expect(html).not.toContain('\x1F');
    });

    it('should handle empty data', () => {
      const html = createDocHTML({});

      expect(html).toContain('Geriatric Case Report');
      expect(html).not.toContain('undefined');
    });

    it('should preserve whitespace in AI response', () => {
      const html = createDocHTML(sampleData);
      expect(html).toContain('white-space: pre-wrap');
    });
  });

  describe('createDocBlob', () => {
    it('should create Blob with correct type', () => {
      const blob = createDocBlob('<html></html>');
      expect(blob.type).toBe('application/msword');
    });

    it('should include UTF-8 BOM', () => {
      const blob = createDocBlob('<html></html>');
      // The blob parts should include the BOM
      expect(blob.parts[0]).toBe('\ufeff');
    });

    it('should include HTML content', () => {
      const html = '<html><body>Test</body></html>';
      const blob = createDocBlob(html);
      expect(blob.parts[1]).toBe(html);
    });
  });

  describe('exportDOC', () => {
    const sampleData = {
      ageSex: '90M',
      initials: 'CD',
      hpi: 'Falls at home',
      meds: 'Warfarin 5mg',
      aiResponse: 'Risk assessment completed'
    };

    it('should return object with blob, filename, and html', () => {
      const result = exportDOC(sampleData);

      expect(result).toHaveProperty('blob');
      expect(result).toHaveProperty('filename');
      expect(result).toHaveProperty('html');
    });

    it('should generate filename with initials', () => {
      const result = exportDOC(sampleData);
      expect(result.filename).toBe('Case_CD.doc');
    });

    it('should use custom filename when provided', () => {
      const result = exportDOC(sampleData, 'CustomName.doc');
      expect(result.filename).toBe('CustomName.doc');
    });

    it('should use default filename for missing initials', () => {
      const result = exportDOC({ ageSex: '85F' });
      expect(result.filename).toBe('Case_export.doc');
    });

    it('should create valid HTML in result', () => {
      const result = exportDOC(sampleData);
      expect(result.html).toContain('<html');
      expect(result.html).toContain('90M');
    });
  });

  describe('triggerDownload', () => {
    let mockLink;

    beforeEach(() => {
      mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      };

      vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});
    });

    it('should create download link', () => {
      const blob = new Blob(['test']);

      triggerDownload(blob, 'test.doc');

      expect(document.createElement).toHaveBeenCalledWith('a');
    });

    it('should set correct filename', () => {
      const blob = new Blob(['test']);

      triggerDownload(blob, 'MyFile.doc');

      expect(mockLink.download).toBe('MyFile.doc');
    });

    it('should trigger click', () => {
      const blob = new Blob(['test']);

      triggerDownload(blob, 'test.doc');

      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should clean up link element', () => {
      const blob = new Blob(['test']);

      triggerDownload(blob, 'test.doc');

      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
    });

    it('should revoke object URL', () => {
      const blob = new Blob(['test']);

      triggerDownload(blob, 'test.doc');

      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });
  });
});

describe('Unicode and Internationalization', () => {
  it('should preserve Hebrew characters in DOC export', () => {
    const data = {
      ageSex: '85F',
      hpi: 'שלום עולם - Patient presents with confusion',
      meds: 'תרופות',
      aiResponse: 'Hebrew text: בדיקה'
    };

    const result = exportDOC(data);

    expect(result.html).toContain('שלום עולם');
    expect(result.html).toContain('תרופות');
    expect(result.html).toContain('בדיקה');
  });

  it('should include UTF-8 BOM for proper encoding', () => {
    const data = { ageSex: '85F' };
    const result = exportDOC(data);

    // BOM should be in blob parts
    expect(result.blob.parts[0]).toBe('\ufeff');
  });
});

describe('Edge Cases', () => {
  it('should handle very long AI responses', () => {
    const data = {
      ageSex: '85F',
      aiResponse: 'X'.repeat(10000)
    };

    const slides = createSlideData(data);

    // Should have overflow slide (15 base slides + 1 overflow)
    expect(slides.length).toBe(16);
  });

  it('should handle special characters in filenames', () => {
    const data = {
      initials: 'A/B\\C'
    };

    const result = exportDOC(data);

    // Filename should be generated (may need sanitization in production)
    expect(result.filename).toContain('Case_');
  });

  it('should handle empty strings gracefully', () => {
    const data = {
      ageSex: '',
      initials: '',
      hpi: '',
      meds: '',
      aiResponse: ''
    };

    // Should not throw
    expect(() => createSlideData(data)).not.toThrow();
    expect(() => exportDOC(data)).not.toThrow();
  });

  describe('Professional Presentation Generator (No AI Required)', () => {
    it('should create professional slides without AI response', () => {
      const data = {
        ageSex: '85F',
        initials: 'AB',
        hpi: 'Patient with multiple comorbidities',
        meds: 'Aspirin 81mg, Metoprolol 25mg'
      };

      const slides = createProfessionalSlides(data);
      
      // Should create 16 slides
      expect(slides).toHaveLength(16);
      
      // First slide should be title
      expect(slides[0].title).toBe('Title Slide');
      expect(slides[0].background).toBe(PPT_CONFIG.colors.primary);
      
      // Last slide should be references
      expect(slides[15].title).toBe('References');
    });

    it('should include medical references in slides', () => {
      const data = {
        ageSex: '78M',
        initials: 'CD',
        hpi: 'Fall risk assessment',
        meds: 'Multiple medications'
      };

      const slides = createProfessionalSlides(data);
      
      // Check that references slide exists
      const referencesSlide = slides.find(s => s.title === 'References');
      expect(referencesSlide).toBeDefined();
      
      // Should include Beers Criteria reference
      const hasBeersRef = referencesSlide.elements.some(e => 
        e.text.includes('Beers Criteria')
      );
      expect(hasBeersRef).toBe(true);
    });

    it('should create header bars for content slides', () => {
      const data = {
        ageSex: '70F',
        initials: 'EF',
        hpi: 'CGA needed',
        meds: 'Review required'
      };

      const slides = createProfessionalSlides(data);
      
      // Most slides should have headers (except title and maybe references)
      const slidesWithHeaders = slides.filter(s => s.header);
      expect(slidesWithHeaders.length).toBeGreaterThan(10);
    });

    it('should include citations on each content slide', () => {
      const data = {
        ageSex: '82M',
        initials: 'GH',
        hpi: 'Comprehensive assessment',
        meds: 'Polypharmacy'
      };

      const slides = createProfessionalSlides(data);
      
      // Count slides with citation elements
      const slidesWithCitations = slides.filter(slide => 
        slide.elements.some(e => 
          e.text && (e.text.includes('Reference:') || e.text.includes('References:'))
        )
      );
      
      // Most slides should have citations
      expect(slidesWithCitations.length).toBeGreaterThan(8);
    });

    it('should handle minimal data', () => {
      const data = {
        ageSex: '75M',
        initials: 'XY'
      };

      // Should not throw even with minimal data
      expect(() => createProfessionalSlides(data)).not.toThrow();
      
      const slides = createProfessionalSlides(data);
      expect(slides).toHaveLength(16);
    });

    it('should include all key geriatric assessment domains', () => {
      const data = {
        ageSex: '88F',
        initials: 'IJ',
        hpi: 'Multimorbidity',
        meds: 'Complex regimen'
      };

      const slides = createProfessionalSlides(data);
      const titles = slides.map(s => s.title);
      
      // Check for key assessment domains
      expect(titles).toContain('Medication Safety');
      expect(titles).toContain('Functional Assessment');
      expect(titles).toContain('Cognitive Assessment');
      expect(titles).toContain('Frailty Assessment');
      expect(titles).toContain('Fall Prevention');
      expect(titles).toContain('Delirium Prevention');
    });

    it('should generate professional PPT with PptxGenJS', () => {
      // Create mock constructor function
      const MockPptxGenJS = vi.fn(function() {
        this.addSlide = vi.fn(() => ({
          background: {},
          addShape: vi.fn(),
          addText: vi.fn()
        }));
        this.ShapeType = { rect: 'rect' };
        this.layout = '';
        this.author = '';
        this.company = '';
        this.subject = '';
        this.title = '';
      });

      const data = {
        ageSex: '80F',
        initials: 'KL',
        hpi: 'Assessment needed',
        meds: 'Medication review'
      };

      const result = generateProfessionalPPT(data, MockPptxGenJS);
      
      // Should have instantiated PptxGenJS
      expect(MockPptxGenJS).toHaveBeenCalledTimes(1);
      
      // Should return pres object
      expect(result).toBeDefined();
      expect(result.layout).toBe('LAYOUT_WIDE');
      expect(result.author).toBe('SZMC Geriatrics Pro');
      
      // Should have called addSlide 16 times (16 slides)
      expect(result.addSlide).toHaveBeenCalledTimes(16);
    });

    it('should throw error if PptxGenJS not provided', () => {
      const data = { ageSex: '70M', initials: 'MN' };
      
      expect(() => generateProfessionalPPT(data, null)).toThrow('PptxGenJS library is required');
    });
  });
});
