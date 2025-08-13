// SPDX-License-Identifier: MIT
/**
 * 🧪 TDD Tests for File Manager
 * 
 * Tests for AI-directed file saving with custom paths and names
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

// Import the class we'll implement
import { FileManager } from '../src/FileManager.js';

describe('📁 FileManager', () => {
  let fileManager;
  let tempDir;

  beforeEach(async () => {
    // Create temporary directory for testing
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'flux-test-'));
    fileManager = new FileManager({
      defaultOutputDir: tempDir
    });
  });

  afterEach(async () => {
    // Clean up temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('🏗️ Initialization', () => {
    test('should create FileManager with default output directory', () => {
      expect(fileManager).toBeDefined();
      expect(fileManager.defaultOutputDir).toBe(tempDir);
    });

    test('should create default output directory if it does not exist', async () => {
      const nonExistentDir = path.join(tempDir, 'new-dir');
      const fm = new FileManager({ defaultOutputDir: nonExistentDir });
      
      await fm.ensureDirectory(nonExistentDir);
      
      const stats = await fs.stat(nonExistentDir);
      expect(stats.isDirectory()).toBe(true);
    });

    test('should use default output directory when not specified', () => {
      const defaultFm = new FileManager();
      expect(defaultFm.defaultOutputDir).toBeDefined();
      expect(path.isAbsolute(defaultFm.defaultOutputDir)).toBe(true);
    });
  });

  describe('📝 Filename Generation', () => {
    test('should generate smart filename from prompt', () => {
      const prompt = 'A beautiful sunset over mountains';
      const model = 'flux-pro';
      
      const filename = fileManager.generateFilename(prompt, model);
      
      expect(filename).toMatch(/A_beautiful_sunset_over_mountains_flux-pro_\d{8}_\d{9}/);
      expect(filename.length).toBeLessThan(100); // Reasonable length
    });

    test('should handle long prompts by truncating', () => {
      const longPrompt = 'A'.repeat(200);
      const model = 'flux-dev';
      
      const filename = fileManager.generateFilename(longPrompt, model);
      
      expect(filename.length).toBeLessThan(100);
      expect(filename).toContain('flux-dev');
    });

    test('should sanitize special characters in prompts', () => {
      const prompt = 'A dog & cat! @#$%^&*()';
      const model = 'flux-pro';
      
      const filename = fileManager.generateFilename(prompt, model);
      
      expect(filename).toMatch(/^[a-zA-Z0-9_-]+$/);
      expect(filename).not.toContain('&');
      expect(filename).not.toContain('!');
      expect(filename).not.toContain('@');
    });

    test('should include timestamp for uniqueness', async () => {
      const prompt = 'Test image';
      const model = 'flux-pro';
      
      const filename1 = fileManager.generateFilename(prompt, model);
      // Add a small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1));
      const filename2 = fileManager.generateFilename(prompt, model);
      
      expect(filename1).not.toBe(filename2);
    });

    test('should allow custom timestamp', () => {
      const prompt = 'Test image';
      const model = 'flux-pro';
      const customTimestamp = '20240128_120000';
      
      const filename = fileManager.generateFilename(prompt, model, customTimestamp);
      
      expect(filename).toContain(customTimestamp);
    });
  });

  describe('📂 Path Resolution', () => {
    test('should resolve custom output path', () => {
      const customPath = '~/Projects/images';
      
      const resolvedPath = fileManager.resolvePath(customPath);
      
      expect(path.isAbsolute(resolvedPath)).toBe(true);
      expect(resolvedPath).toContain('Projects/images');
    });

    test('should handle absolute paths', () => {
      const absolutePath = '/tmp/flux-images';
      
      const resolvedPath = fileManager.resolvePath(absolutePath);
      
      expect(resolvedPath).toBe(absolutePath);
    });

    test('should resolve relative paths from default directory', () => {
      const relativePath = 'projects/test';
      
      const resolvedPath = fileManager.resolvePath(relativePath);
      
      expect(path.isAbsolute(resolvedPath)).toBe(true);
      expect(resolvedPath).toContain('projects/test');
    });

    test('should use default directory when no path specified', () => {
      const resolvedPath = fileManager.resolvePath();
      
      expect(resolvedPath).toBe(tempDir);
    });
  });

  describe('💾 Image Saving', () => {
    const mockImageUrl = 'https://example.com/test-image.jpg';
    const mockImageData = Buffer.from('fake-image-data');

    test('should save image from URL with custom path and filename', async () => {
      const customPath = path.join(tempDir, 'custom');
      const customFilename = 'my-custom-image.jpg';
      
      // Mock fetch (we'll need to implement this)
      fileManager.fetchImage = jest.fn().mockResolvedValue(mockImageData);
      
      const savedPath = await fileManager.saveImageFromUrl(mockImageUrl, {
        outputPath: customPath,
        filename: customFilename
      });
      
      expect(savedPath).toBe(path.join(customPath, customFilename));
      expect(fileManager.fetchImage).toHaveBeenCalledWith(mockImageUrl);
      
      // Verify file was created
      const fileExists = await fs.access(savedPath).then(() => true).catch(() => false);
      expect(fileExists).toBe(true);
    });

    test('should save image with auto-generated filename', async () => {
      const prompt = 'Beautiful landscape';
      const model = 'flux-pro';
      
      fileManager.fetchImage = jest.fn().mockResolvedValue(mockImageData);
      
      const savedPath = await fileManager.saveImageFromUrl(mockImageUrl, {
        outputPath: tempDir,
        prompt,
        model
      });
      
      expect(savedPath).toContain('Beautiful_landscape_flux-pro');
      expect(savedPath).toMatch(/\.jpg$/);
    });

    test('should create output directory if it does not exist', async () => {
      const nonExistentPath = path.join(tempDir, 'new', 'nested', 'directory');
      
      fileManager.fetchImage = jest.fn().mockResolvedValue(mockImageData);
      
      const savedPath = await fileManager.saveImageFromUrl(mockImageUrl, {
        outputPath: nonExistentPath,
        filename: 'test.jpg'
      });
      
      expect(savedPath).toBe(path.join(nonExistentPath, 'test.jpg'));
      
      const dirExists = await fs.access(nonExistentPath).then(() => true).catch(() => false);
      expect(dirExists).toBe(true);
    });

    test('should handle different image formats', async () => {
      const formats = [
        { url: 'https://example.com/image.jpg', format: 'jpeg' },
        { url: 'https://example.com/image.png', format: 'png' }
      ];
      
      fileManager.fetchImage = jest.fn().mockResolvedValue(mockImageData);
      
      for (const { url, format } of formats) {
        const savedPath = await fileManager.saveImageFromUrl(url, {
          outputPath: tempDir,
          filename: `test.${format}`,
          outputFormat: format
        });
        
        expect(savedPath).toMatch(new RegExp(`\\.${format}$`));
      }
    });

    test('should add proper extension if missing', async () => {
      fileManager.fetchImage = jest.fn().mockResolvedValue(mockImageData);
      
      const savedPath = await fileManager.saveImageFromUrl(mockImageUrl, {
        outputPath: tempDir,
        filename: 'test-without-extension',
        outputFormat: 'jpeg'
      });
      
      expect(savedPath).toMatch(/\.jpg$/);
    });

    test('should handle network errors gracefully', async () => {
      fileManager.fetchImage = jest.fn().mockRejectedValue(new Error('Network error'));
      
      await expect(
        fileManager.saveImageFromUrl(mockImageUrl, {
          outputPath: tempDir,
          filename: 'test.jpg'
        })
      ).rejects.toThrow('Failed to save image: Network error');
    });

    test('should handle file system errors', async () => {
      const readOnlyPath = '/invalid/readonly/path';
      
      fileManager.fetchImage = jest.fn().mockResolvedValue(mockImageData);
      
      await expect(
        fileManager.saveImageFromUrl(mockImageUrl, {
          outputPath: readOnlyPath,
          filename: 'test.jpg'
        })
      ).rejects.toThrow();
    });
  });

  describe('🔍 File Operations', () => {
    test('should check if file exists', async () => {
      const testFile = path.join(tempDir, 'test-file.txt');
      
      // File doesn't exist yet
      const existsBefore = await fileManager.fileExists(testFile);
      expect(existsBefore).toBe(false);
      
      // Create file
      await fs.writeFile(testFile, 'test content');
      
      // File now exists
      const existsAfter = await fileManager.fileExists(testFile);
      expect(existsAfter).toBe(true);
    });

    test('should get file info', async () => {
      const testFile = path.join(tempDir, 'info-test.txt');
      const testContent = 'test file content';
      
      await fs.writeFile(testFile, testContent);
      
      const info = await fileManager.getFileInfo(testFile);
      
      expect(info).toMatchObject({
        path: testFile,
        size: testContent.length,
        exists: true
      });
      expect(info.createdAt).toBeDefined();
      expect(typeof info.createdAt.getTime).toBe('function');
    });

    test('should handle non-existent file info', async () => {
      const nonExistentFile = path.join(tempDir, 'does-not-exist.txt');
      
      const info = await fileManager.getFileInfo(nonExistentFile);
      
      expect(info.exists).toBe(false);
      expect(info.path).toBe(nonExistentFile);
    });
  });

  describe('🎯 AI-Directed Saving Integration', () => {
    test('should save with AI-determined path and name', async () => {
      const mockImageData = Buffer.from('fake-image-data');
      const mockImageUrl = 'https://example.com/generated-image.jpg';
      
      const generationOptions = {
        prompt: 'A cyberpunk cityscape at night',
        model: 'flux-pro',
        outputPath: '~/Projects/cyberpunk/',
        filename: 'neon_city_masterpiece'
      };
      
      fileManager.fetchImage = jest.fn().mockResolvedValue(mockImageData);
      
      const result = await fileManager.saveGeneratedImage(mockImageUrl, generationOptions);
      
      expect(result).toMatchObject({
        savedPath: expect.stringContaining('neon_city_masterpiece'),
        filename: 'neon_city_masterpiece.jpg',
        directory: expect.stringContaining('cyberpunk'),
        size: mockImageData.length
      });
    });

    test('should provide intelligent suggestions for organization', () => {
      const suggestions = fileManager.suggestOrganization('logo for tech startup TechFlow');
      
      expect(suggestions).toMatchObject({
        suggestedPath: expect.stringContaining('logos'),
        suggestedFilename: expect.stringContaining('techflow'),
        category: 'logo',
        tags: expect.arrayContaining(['tech', 'startup'])
      });
    });

    test('should handle batch generation organization', async () => {
      const mockImageData = Buffer.from('fake-image-data');
      
      const batchOptions = {
        basePrompt: 'Logo variations for brand',
        outputPath: '~/Brands/MyBrand/logos/',
        variations: ['v1', 'v2', 'v3']
      };
      
      fileManager.fetchImage = jest.fn().mockResolvedValue(mockImageData);
      
      const results = await fileManager.saveBatch([
        { url: 'http://example.com/v1.jpg', variation: 'v1' },
        { url: 'http://example.com/v2.jpg', variation: 'v2' },
        { url: 'http://example.com/v3.jpg', variation: 'v3' }
      ], batchOptions);
      
      expect(results).toHaveLength(3);
      expect(results[0].filename).toContain('v1');
      expect(results[1].filename).toContain('v2');
      expect(results[2].filename).toContain('v3');
    });
  });
}); 