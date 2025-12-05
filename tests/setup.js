/**
 * Vitest Setup File
 * Configures the test environment with necessary mocks and globals
 */

import { vi } from 'vitest';

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue('')
  },
  writable: true
});

// Mock alert
global.alert = vi.fn();

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock Blob
global.Blob = class Blob {
  constructor(parts, options) {
    this.parts = parts;
    this.options = options;
    this.type = options?.type || '';
  }
};
