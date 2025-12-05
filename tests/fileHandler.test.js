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

    it('should return document for pdf and docx', () => {
      expect(getFileCategory('pdf')).toBe('document');
      expect(getFileCategory('docx')).toBe('document');
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
