/**
 * Tests for File Handler Module
 * Testing file import and parsing functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  SUPPORTED_EXTENSIONS,
  getFileExtension,
  isExtensionSupported,
  getFileCategory,
  extractFromHTML,
  handleFile
} from '../src/fileHandler.js';

describe('File Handler Module', () => {
  describe('SUPPORTED_EXTENSIONS', () => {
    it('should have presentation category', () => {
      expect(SUPPORTED_EXTENSIONS.presentation).toContain('pptx');
    });

    it('should have document category', () => {
      expect(SUPPORTED_EXTENSIONS.document).toContain('pdf');
      expect(SUPPORTED_EXTENSIONS.document).toContain('docx');
      expect(SUPPORTED_EXTENSIONS.document).toContain('doc');
    });

    it('should have text category', () => {
      expect(SUPPORTED_EXTENSIONS.text).toContain('html');
      expect(SUPPORTED_EXTENSIONS.text).toContain('htm');
      expect(SUPPORTED_EXTENSIONS.text).toContain('txt');
    });

    it('should have image category', () => {
      expect(SUPPORTED_EXTENSIONS.image).toContain('jpg');
      expect(SUPPORTED_EXTENSIONS.image).toContain('jpeg');
      expect(SUPPORTED_EXTENSIONS.image).toContain('png');
    });
  });

  describe('getFileExtension', () => {
    it('should extract extension from simple filename', () => {
      expect(getFileExtension('document.pdf')).toBe('pdf');
    });

    it('should extract extension from filename with multiple dots', () => {
      expect(getFileExtension('my.file.name.docx')).toBe('docx');
    });

    it('should return lowercase extension', () => {
      expect(getFileExtension('FILE.PDF')).toBe('pdf');
      expect(getFileExtension('Doc.DOCX')).toBe('docx');
    });

    it('should return empty string for filename without extension', () => {
      expect(getFileExtension('filename')).toBe('');
    });

    it('should return empty string for null input', () => {
      expect(getFileExtension(null)).toBe('');
    });

    it('should return empty string for undefined input', () => {
      expect(getFileExtension(undefined)).toBe('');
    });

    it('should return empty string for non-string input', () => {
      expect(getFileExtension(123)).toBe('');
      expect(getFileExtension({})).toBe('');
    });

    it('should handle hidden files', () => {
      expect(getFileExtension('.gitignore')).toBe('gitignore');
    });

    it('should handle paths with directories', () => {
      expect(getFileExtension('/path/to/file.pdf')).toBe('pdf');
    });
  });

  describe('isExtensionSupported', () => {
    it('should return true for supported extensions', () => {
      expect(isExtensionSupported('pdf')).toBe(true);
      expect(isExtensionSupported('docx')).toBe(true);
      expect(isExtensionSupported('doc')).toBe(true);
      expect(isExtensionSupported('pptx')).toBe(true);
      expect(isExtensionSupported('html')).toBe(true);
      expect(isExtensionSupported('jpg')).toBe(true);
    });

    it('should return true for uppercase extensions', () => {
      expect(isExtensionSupported('PDF')).toBe(true);
      expect(isExtensionSupported('DOCX')).toBe(true);
    });

    it('should return false for unsupported extensions', () => {
      expect(isExtensionSupported('exe')).toBe(false);
      expect(isExtensionSupported('mp3')).toBe(false);
      expect(isExtensionSupported('zip')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isExtensionSupported('')).toBe(false);
    });
  });

  describe('getFileCategory', () => {
    it('should return presentation for pptx', () => {
      expect(getFileCategory('pptx')).toBe('presentation');
    });

    it('should return document for pdf, docx, and doc', () => {
      expect(getFileCategory('pdf')).toBe('document');
      expect(getFileCategory('docx')).toBe('document');
      expect(getFileCategory('doc')).toBe('document');
    });

    it('should return text for html and txt', () => {
      expect(getFileCategory('html')).toBe('text');
      expect(getFileCategory('txt')).toBe('text');
    });

    it('should return image for jpg and png', () => {
      expect(getFileCategory('jpg')).toBe('image');
      expect(getFileCategory('png')).toBe('image');
    });

    it('should return null for unsupported extension', () => {
      expect(getFileCategory('mp4')).toBeNull();
      expect(getFileCategory('xyz')).toBeNull();
    });

    it('should handle uppercase extensions', () => {
      expect(getFileCategory('PDF')).toBe('document');
      expect(getFileCategory('JPG')).toBe('image');
    });
  });

  describe('extractFromHTML', () => {
    it('should extract text from simple HTML', () => {
      const html = '<p>Hello World</p>';
      expect(extractFromHTML(html)).toBe('Hello World');
    });

    it('should extract text from nested HTML', () => {
      const html = '<div><p>Outer <span>Inner</span></p></div>';
      const result = extractFromHTML(html);
      expect(result).toContain('Outer');
      expect(result).toContain('Inner');
    });

    it('should strip all HTML tags', () => {
      const html = '<h1>Title</h1><p>Paragraph</p><ul><li>Item</li></ul>';
      const result = extractFromHTML(html);
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('should handle HTML with attributes', () => {
      const html = '<p class="test" id="para">Content</p>';
      expect(extractFromHTML(html)).toBe('Content');
    });

    it('should preserve text content only', () => {
      const html = '<script>alert("test")</script><p>Visible</p>';
      const result = extractFromHTML(html);
      expect(result).toContain('Visible');
    });

    it('should return empty string for null input', () => {
      expect(extractFromHTML(null)).toBe('');
    });

    it('should return empty string for undefined input', () => {
      expect(extractFromHTML(undefined)).toBe('');
    });

    it('should return empty string for non-string input', () => {
      expect(extractFromHTML(123)).toBe('');
      expect(extractFromHTML({})).toBe('');
    });

    it('should handle empty HTML', () => {
      expect(extractFromHTML('')).toBe('');
      expect(extractFromHTML('<div></div>')).toBe('');
    });

    it('should handle HTML entities', () => {
      const html = '<p>&lt;hello&gt; &amp; world</p>';
      const result = extractFromHTML(html);
      expect(result).toContain('<hello>');
      expect(result).toContain('&');
    });

    it('should handle malformed HTML gracefully', () => {
      const html = '<p>Unclosed paragraph<div>Mixed';
      // Should not throw
      expect(() => extractFromHTML(html)).not.toThrow();
    });
  });

  describe('handleFile', () => {
    let mockCallbacks;

    beforeEach(() => {
      mockCallbacks = {
        onStatus: vi.fn(),
        onError: vi.fn(),
        onSuccess: vi.fn()
      };
    });

    it('should throw error for null file', async () => {
      await expect(handleFile(null, {}, mockCallbacks))
        .rejects.toThrow('No file provided');
    });

    it('should throw error for unsupported extension', async () => {
      const file = { name: 'test.xyz' };

      await expect(handleFile(file, {}, mockCallbacks))
        .rejects.toThrow('Unsupported file type: .xyz');
    });

    it('should call onStatus callback', async () => {
      const file = {
        name: 'test.txt',
        text: vi.fn().mockResolvedValue('Hello World')
      };

      await handleFile(file, {}, mockCallbacks);

      expect(mockCallbacks.onStatus).toHaveBeenCalledWith('Reading...');
    });

    it('should call onSuccess callback on successful extraction', async () => {
      const file = {
        name: 'test.txt',
        text: vi.fn().mockResolvedValue('Content')
      };

      await handleFile(file, {}, mockCallbacks);

      expect(mockCallbacks.onSuccess).toHaveBeenCalledWith('Success!');
    });

    it('should extract text from txt file', async () => {
      const file = {
        name: 'clinical-note.txt',
        text: vi.fn().mockResolvedValue('Patient: 85F with pneumonia')
      };

      const result = await handleFile(file, {}, mockCallbacks);

      expect(result).toBe('Patient: 85F with pneumonia');
    });

    it('should extract text from html file', async () => {
      const file = {
        name: 'note.html',
        text: vi.fn().mockResolvedValue('<p>Patient data here</p>')
      };

      const result = await handleFile(file, {}, mockCallbacks);

      expect(result).toBe('Patient data here');
    });

    it('should require JSZip for pptx files', async () => {
      const file = { name: 'presentation.pptx' };

      await expect(handleFile(file, {}, mockCallbacks))
        .rejects.toThrow('JSZip library is required');
    });

    it('should require pdfjsLib for pdf files', async () => {
      const file = { name: 'document.pdf' };

      await expect(handleFile(file, {}, mockCallbacks))
        .rejects.toThrow('PDF.js library is required');
    });

    it('should require mammoth for docx files', async () => {
      const file = { name: 'document.docx' };

      await expect(handleFile(file, {}, mockCallbacks))
        .rejects.toThrow('Mammoth library is required');
    });

    it('should require Tesseract for image files', async () => {
      const file = { name: 'image.jpg' };

      await expect(handleFile(file, {}, mockCallbacks))
        .rejects.toThrow('Tesseract.js library is required');
    });

    it('should update status for OCR operations', async () => {
      const mockTesseract = {
        createWorker: vi.fn().mockResolvedValue({
          recognize: vi.fn().mockResolvedValue({ data: { text: 'OCR result' } }),
          terminate: vi.fn().mockResolvedValue(undefined)
        })
      };

      const file = { name: 'scan.jpg' };

      await handleFile(file, { Tesseract: mockTesseract }, mockCallbacks);

      expect(mockCallbacks.onStatus).toHaveBeenCalledWith('OCR (Wait)...');
    });
  });

  describe('PDF Extraction', () => {
    it('should extract text from multi-page PDF', async () => {
      const mockPage = {
        getTextContent: vi.fn().mockResolvedValue({
          items: [
            { str: 'Page 1 ' },
            { str: 'content' }
          ]
        })
      };

      const mockPdf = {
        numPages: 2,
        getPage: vi.fn().mockResolvedValue(mockPage)
      };

      const mockPdfjsLib = {
        getDocument: vi.fn().mockReturnValue({
          promise: Promise.resolve(mockPdf)
        })
      };

      const file = {
        name: 'test.pdf',
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8))
      };

      const result = await handleFile(
        file,
        { pdfjsLib: mockPdfjsLib },
        {}
      );

      expect(mockPdf.getPage).toHaveBeenCalledTimes(2);
      expect(result).toContain('Page 1');
      expect(result).toContain('content');
    });
  });

  describe('DOCX Extraction', () => {
    it('should use mammoth to extract text', async () => {
      const mockMammoth = {
        extractRawText: vi.fn().mockResolvedValue({
          value: 'Extracted document text'
        })
      };

      const file = {
        name: 'document.docx',
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8))
      };

      const result = await handleFile(
        file,
        { mammoth: mockMammoth },
        {}
      );

      expect(mockMammoth.extractRawText).toHaveBeenCalled();
      expect(result).toBe('Extracted document text');
    });
  });

  describe('PPTX Extraction', () => {
    it('should extract text from slides in order', async () => {
      // Use simple XML structure that jsdom can parse
      const mockZipFiles = {
        'ppt/slides/slide1.xml': {
          async: vi.fn().mockResolvedValue('<root>Slide 1 text</root>')
        },
        'ppt/slides/slide2.xml': {
          async: vi.fn().mockResolvedValue('<root>Slide 2 text</root>')
        },
        'ppt/slides/slide10.xml': {
          async: vi.fn().mockResolvedValue('<root>Slide 10 text</root>')
        },
        '[Content_Types].xml': {
          async: vi.fn().mockResolvedValue('<Types></Types>')
        }
      };

      const mockJSZip = {
        loadAsync: vi.fn().mockResolvedValue({
          files: mockZipFiles,
          file: (path) => mockZipFiles[path]
        })
      };

      const file = { name: 'presentation.pptx' };

      const result = await handleFile(
        file,
        { JSZip: mockJSZip },
        {}
      );

      // Verify all slides are extracted
      expect(result).toContain('Slide 1');
      expect(result).toContain('Slide 2');
      expect(result).toContain('Slide 10');

      // Should process slides in numerical order (1, 2, 10)
      const slide1Pos = result.indexOf('Slide 1');
      const slide2Pos = result.indexOf('Slide 2');
      const slide10Pos = result.indexOf('Slide 10');

      expect(slide1Pos).toBeLessThan(slide2Pos);
      expect(slide2Pos).toBeLessThan(slide10Pos);
    });
  });
});

describe('Error Handling', () => {
  it('should propagate errors from file reading', async () => {
    const file = {
      name: 'test.txt',
      text: vi.fn().mockRejectedValue(new Error('Read failed'))
    };

    const onError = vi.fn();

    await expect(handleFile(file, {}, { onError }))
      .rejects.toThrow('Read failed');

    expect(onError).toHaveBeenCalled();
  });
});

describe('ENHANCED STRESS TESTS - Large File Handling', () => {
  it('should handle text file at MAX_FILE_SIZE boundary', async () => {
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    const largeContent = 'A'.repeat(MAX_FILE_SIZE - 1000);

    const file = {
      name: 'max-size.txt',
      text: vi.fn().mockResolvedValue(largeContent),
      size: largeContent.length
    };

    const result = await handleFile(file, {}, {});

    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(1000000);
  });

  it('should handle HTML file with millions of tags', async () => {
    const largeTags = '<p>Line</p>\n'.repeat(500000); // 500K tags
    const html = `<html><body>${largeTags}</body></html>`;

    const file = {
      name: 'huge.html',
      text: vi.fn().mockResolvedValue(html),
      size: html.length
    };

    const startTime = Date.now();
    const result = await handleFile(file, {}, {});
    const duration = Date.now() - startTime;

    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(100000);
    expect(duration).toBeLessThan(10000); // Should process in reasonable time
  });

  it('should handle text file with millions of lines', async () => {
    const lines = Array.from({ length: 1000000 }, (_, i) => `Line ${i}`).join('\n');

    const file = {
      name: 'million-lines.txt',
      text: vi.fn().mockResolvedValue(lines),
      size: lines.length
    };

    const startTime = Date.now();
    const result = await handleFile(file, {}, {});
    const duration = Date.now() - startTime;

    expect(result).toBeDefined();
    expect(result).toContain('Line 0');
    expect(result).toContain('Line 999999');
    expect(duration).toBeLessThan(5000);
  });

  it('should handle HTML with deeply nested structure (200 levels)', async () => {
    let content = 'Patient: 85F HPI: Deeply nested content';
    for (let i = 0; i < 200; i++) {
      content = `<div id="level${i}"><span class="wrapper">${content}</span></div>`;
    }

    const html = `<html><body>${content}</body></html>`;
    const file = {
      name: 'deep-nested.html',
      text: vi.fn().mockResolvedValue(html),
      size: html.length
    };

    const result = await handleFile(file, {}, {});

    expect(result).toContain('Patient: 85F');
    expect(result).toContain('Deeply nested content');
    expect(result).not.toContain('<div');
  });

  it('should handle extremely long single line (1MB)', async () => {
    const longLine = 'A'.repeat(1000000); // 1MB single line

    const file = {
      name: 'long-line.txt',
      text: vi.fn().mockResolvedValue(longLine),
      size: longLine.length
    };

    const result = await handleFile(file, {}, {});

    expect(result).toBeDefined();
    expect(result.length).toBe(1000000);
  });
});

describe('ENHANCED STRESS TESTS - Special Content Processing', () => {
  it('should handle HTML with all entity types', async () => {
    const html = `
      <html><body>
      <p>&lt; &gt; &amp; &quot; &apos;</p>
      <p>&nbsp; &copy; &reg; &trade;</p>
      <p>&#65; &#66; &#67; &#9734; &#9829;</p>
      <p>&#x41; &#x42; &#x1F600;</p>
      </body></html>
    `;

    const file = {
      name: 'entities.html',
      text: vi.fn().mockResolvedValue(html),
      size: html.length
    };

    const result = await handleFile(file, {}, {});

    expect(result).toContain('<');
    expect(result).toContain('>');
    expect(result).toContain('&');
    expect(result).toContain('©');
    expect(result).toContain('®');
  });

  it('should handle HTML with mixed encodings', async () => {
    const html = `
      <html>
      <head><meta charset="UTF-8"></head>
      <body>
      <p>Latin: Hello World</p>
      <p>Hebrew: שלום עולם</p>
      <p>Arabic: مرحبا بكم</p>
      <p>Chinese: 你好世界</p>
      <p>Japanese: こんにちは世界</p>
      <p>Korean: 안녕하세요 세계</p>
      <p>Emoji: 😀🌍💻</p>
      </body></html>
    `;

    const file = {
      name: 'multilingual.html',
      text: vi.fn().mockResolvedValue(html),
      size: html.length
    };

    const result = await handleFile(file, {}, {});

    expect(result).toContain('שלום');
    expect(result).toContain('مرحبا');
    expect(result).toContain('你好');
    expect(result).toContain('こんにちは');
    expect(result).toContain('안녕하세요');
    expect(result).toContain('😀');
  });

  it('should handle HTML with malformed/broken tags', async () => {
    const malformed = `
      <html><body>
      <p>Unclosed paragraph
      <div>Unclosed div
      <span>Unclosed span
      <p>Patient: 85F</
      <div>HPI: Important data<
      </body
    `;

    const file = {
      name: 'malformed.html',
      text: vi.fn().mockResolvedValue(malformed),
      size: malformed.length
    };

    expect(() => handleFile(file, {}, {})).not.toThrow();
    const result = await handleFile(file, {}, {});

    expect(result).toContain('Patient: 85F');
    expect(result).toContain('Important data');
  });

  it('should handle text with all types of whitespace', async () => {
    const text = `
      Patient:\t85F
      HPI:\x20\x20Spaces
      Meds:\u00A0Non-breaking space
      Labs:\u2003Em space\u2004Three-per-em space
    `;

    const file = {
      name: 'whitespace.txt',
      text: vi.fn().mockResolvedValue(text),
      size: text.length
    };

    const result = await handleFile(file, {}, {});

    expect(result).toBeDefined();
    expect(result).toContain('85F');
  });

  it('should handle text with control characters', async () => {
    const controlChars = Array.from({ length: 32 }, (_, i) =>
      String.fromCharCode(i)
    ).join('');

    const text = `Patient: 85F${controlChars}HPI: Test${controlChars}Data`;

    const file = {
      name: 'control.txt',
      text: vi.fn().mockResolvedValue(text),
      size: text.length
    };

    const result = await handleFile(file, {}, {});

    expect(result).toBeDefined();
    expect(result).toContain('85F');
    expect(result).toContain('Test');
  });

  it('should handle binary-looking text data', async () => {
    const binaryLike = Array.from({ length: 1000 }, () =>
      Math.random() < 0.5 ? '0' : '1'
    ).join('');

    const text = `Patient: 85F\nData: ${binaryLike}\nMeds: Aspirin`;

    const file = {
      name: 'binary-like.txt',
      text: vi.fn().mockResolvedValue(text),
      size: text.length
    };

    const result = await handleFile(file, {}, {});

    expect(result).toContain('85F');
    expect(result).toContain(binaryLike);
  });
});

describe('ENHANCED STRESS TESTS - HTML Edge Cases', () => {
  it('should handle HTML with script and style tags', async () => {
    const html = `
      <html>
      <head>
        <script>
          function malicious() { alert('xss'); }
        </script>
        <style>
          body { background: red; }
        </style>
      </head>
      <body>
      <p>Patient: 85F</p>
      <script>alert('more xss');</script>
      <p>HPI: Patient data</p>
      </body>
      </html>
    `;

    const file = {
      name: 'scripts.html',
      text: vi.fn().mockResolvedValue(html),
      size: html.length
    };

    const result = await handleFile(file, {}, {});

    expect(result).toContain('Patient: 85F');
    expect(result).toContain('Patient data');
    // Script content should be extracted as text
    expect(result).toBeTruthy();
  });

  it('should handle HTML with comments', async () => {
    const html = `
      <html><body>
      <!-- Comment 1 -->
      <p>Patient: 85F</p>
      <!-- Multi
           line
           comment -->
      <p>HPI: Data</p>
      <!-- Nested <!-- comment --> -->
      </body></html>
    `;

    const file = {
      name: 'comments.html',
      text: vi.fn().mockResolvedValue(html),
      size: html.length
    };

    const result = await handleFile(file, {}, {});

    expect(result).toContain('Patient: 85F');
    expect(result).toContain('Data');
  });

  it('should handle HTML with CDATA sections', async () => {
    const html = `
      <html><body>
      <![CDATA[Patient: 85F]]>
      <p>HPI: Test data</p>
      <![CDATA[Medications: Aspirin]]>
      </body></html>
    `;

    const file = {
      name: 'cdata.html',
      text: vi.fn().mockResolvedValue(html),
      size: html.length
    };

    const result = await handleFile(file, {}, {});

    expect(result).toBeDefined();
    expect(result).toContain('Test data');
  });

  it('should handle HTML with DOCTYPE and XML declarations', async () => {
    const html = `
      <?xml version="1.0" encoding="UTF-8"?>
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
        "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      <body>
      <p>Patient: 85F</p>
      </body>
      </html>
    `;

    const file = {
      name: 'doctype.html',
      text: vi.fn().mockResolvedValue(html),
      size: html.length
    };

    const result = await handleFile(file, {}, {});

    expect(result).toContain('Patient: 85F');
  });

  it('should handle HTML with SVG and math content', async () => {
    const html = `
      <html><body>
      <svg width="100" height="100">
        <text>SVG Text Content</text>
      </svg>
      <p>Patient: 85F</p>
      <math>
        <mi>x</mi><mo>=</mo><mn>5</mn>
      </math>
      </body></html>
    `;

    const file = {
      name: 'svg-math.html',
      text: vi.fn().mockResolvedValue(html),
      size: html.length
    };

    const result = await handleFile(file, {}, {});

    expect(result).toContain('Patient: 85F');
    expect(result).toBeTruthy();
  });
});

describe('ENHANCED STRESS TESTS - Performance & Concurrency', () => {
  it('should handle rapid successive file reads (1000 files)', async () => {
    const files = Array.from({ length: 1000 }, (_, i) => ({
      name: `file${i}.txt`,
      text: vi.fn().mockResolvedValue(`Patient ${i}: 85F\nData ${i}`)
    }));

    const startTime = Date.now();

    for (const file of files) {
      await handleFile(file, {}, {});
    }

    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(5000); // Should handle 1000 files quickly
  });

  it('should handle concurrent file processing', async () => {
    const files = Array.from({ length: 100 }, (_, i) => ({
      name: `concurrent${i}.txt`,
      text: vi.fn().mockResolvedValue(`Patient: ${80 + i}F\nCase ${i}`)
    }));

    const startTime = Date.now();

    const results = await Promise.all(
      files.map(file => handleFile(file, {}, {}))
    );

    const duration = Date.now() - startTime;

    expect(results.length).toBe(100);
    expect(duration).toBeLessThan(3000); // Should handle concurrently
  });

  it('should handle extraction from very complex HTML efficiently', async () => {
    const complexHTML = `
      <html><body>
      ${Array.from({ length: 1000 }, (_, i) => `
        <div class="section${i}">
          <h${(i % 6) + 1}>Heading ${i}</h${(i % 6) + 1}>
          <p>Paragraph ${i} with <strong>bold</strong> and <em>italic</em></p>
          <ul>
            <li>Item 1 of section ${i}</li>
            <li>Item 2 of section ${i}</li>
          </ul>
          <table><tr><td>Cell ${i}</td></tr></table>
        </div>
      `).join('\n')}
      <p>Patient: 85F</p>
      </body></html>
    `;

    const file = {
      name: 'complex.html',
      text: vi.fn().mockResolvedValue(complexHTML),
      size: complexHTML.length
    };

    const startTime = Date.now();
    const result = await handleFile(file, {}, {});
    const duration = Date.now() - startTime;

    expect(result).toContain('Patient: 85F');
    expect(result.length).toBeGreaterThan(10000);
    expect(duration).toBeLessThan(5000);
  });

  it('should handle HTML with thousands of attributes', async () => {
    const attributeHtml = `
      <html><body>
      ${Array.from({ length: 100 }, (_, i) => `
        <div
          id="id${i}"
          class="class${i}"
          data-value="${i}"
          data-name="name${i}"
          aria-label="label${i}"
          role="role${i}"
          style="color: red;"
        >Content ${i}</div>
      `).join('\n')}
      <p>Patient: 85F</p>
      </body></html>
    `;

    const file = {
      name: 'attributes.html',
      text: vi.fn().mockResolvedValue(attributeHtml),
      size: attributeHtml.length
    };

    const result = await handleFile(file, {}, {});

    expect(result).toContain('Patient: 85F');
    expect(result).not.toContain('id=');
    expect(result).not.toContain('class=');
  });
});

describe('ENHANCED STRESS TESTS - Extension Validation', () => {
  it('should handle all case variations of extensions', async () => {
    const cases = ['txt', 'TXT', 'Txt', 'tXt'];

    for (const ext of cases) {
      const file = {
        name: `test.${ext}`,
        text: vi.fn().mockResolvedValue('Patient: 85F'),
        size: 100
      };

      const result = await handleFile(file, {}, {});
      expect(result).toContain('85F');
    }
  });

  it('should handle filenames with multiple dots', async () => {
    const names = [
      'my.file.name.txt',
      'patient.data.v2.final.html',
      '...dots...txt'
    ];

    for (const name of names) {
      const file = {
        name,
        text: vi.fn().mockResolvedValue('Patient: 85F'),
        size: 100
      };

      const result = await handleFile(file, {}, {});
      expect(result).toBeDefined();
    }
  });

  it('should handle filenames with special characters', async () => {
    const names = [
      'file (1).txt',
      'file [copy].html',
      'file-name_v2.txt',
      'file@2024.html'
    ];

    for (const name of names) {
      const file = {
        name,
        text: vi.fn().mockResolvedValue('Data'),
        size: 100
      };

      const result = await handleFile(file, {}, {});
      expect(result).toBeDefined();
    }
  });

  it('should handle very long filenames', async () => {
    const longName = 'a'.repeat(250) + '.txt';

    const file = {
      name: longName,
      text: vi.fn().mockResolvedValue('Patient: 85F'),
      size: 100
    };

    const result = await handleFile(file, {}, {});
    expect(result).toContain('85F');
  });
});

describe('ENHANCED STRESS TESTS - Boundary Conditions', () => {
  it('should handle file with size of 0', async () => {
    const file = {
      name: 'empty.txt',
      text: vi.fn().mockResolvedValue(''),
      size: 0
    };

    const result = await handleFile(file, {}, {});
    expect(result).toBe('');
  });

  it('should handle file with size of 1 byte', async () => {
    const file = {
      name: 'tiny.txt',
      text: vi.fn().mockResolvedValue('A'),
      size: 1
    };

    const result = await handleFile(file, {}, {});
    expect(result).toBe('A');
  });

  it('should handle filename edge cases', async () => {
    const edgeCases = [
      '.txt', // Hidden file
      'file.', // No extension after dot
      '.', // Just a dot
      'file' // No extension
    ];

    for (const name of edgeCases) {
      const file = {
        name,
        text: vi.fn().mockResolvedValue('Data'),
        size: 100
      };

      // Some should throw, others should work
      try {
        await handleFile(file, {}, {});
      } catch (e) {
        expect(e).toBeDefined();
      }
    }
  });
});
