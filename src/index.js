/**
 * SZMC Geriatrics Pro - Main Module Entry Point
 * Clinical decision support tool for geriatricians
 */

export * from './populator.js';
export * from './prompt.js';
export * from './fileHandler.js';
export * from './exporters.js';

// Default exports for convenience
export { default as populator } from './populator.js';
export { default as prompt } from './prompt.js';
export { default as fileHandler } from './fileHandler.js';
export { default as exporters } from './exporters.js';
