// SPDX-License-Identifier: MIT
/**
 * 📁 File Manager
 * 
 * Handles AI-directed file saving with custom paths and names
 */

import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import fetch from 'node-fetch';

export class FileManager {
  constructor(options = {}) {
    this.defaultOutputDir = options.defaultOutputDir || 
      path.join(os.homedir(), 'Downloads', 'flux-generated');
  }

  async ensureDirectory(dirPath) {
    await fs.mkdir(dirPath, { recursive: true });
  }

  resolvePath(customPath) {
    if (!customPath) {
      return this.defaultOutputDir;
    }

    if (path.isAbsolute(customPath)) {
      return customPath;
    }

    // Handle tilde expansion
    if (customPath.startsWith('~/')) {
      return path.join(os.homedir(), customPath.slice(2));
    }

    // Relative path from default directory
    return path.join(this.defaultOutputDir, customPath);
  }

  generateFilename(prompt, model, customTimestamp = null) {
    let timestamp;
    if (customTimestamp) {
      timestamp = customTimestamp;
    } else {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
      timestamp = `${year}${month}${day}_${hours}${minutes}${seconds}${milliseconds}`;
    }

    // Clean and truncate prompt
    const cleanPrompt = prompt
      .replace(/[^a-zA-Z0-9\s-_]/g, '')
      .trim()
      .replace(/\s+/g, '_')
      .substring(0, 50);

    const cleanModel = model.replace(/[^a-zA-Z0-9-]/g, '-');
    
    return `${cleanPrompt}_${cleanModel}_${timestamp}`;
  }

  async fetchImage(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    return await response.buffer();
  }

  async saveImageFromUrl(imageUrl, options = {}) {
    const {
      outputPath,
      filename,
      prompt,
      model,
      outputFormat = 'jpeg'
    } = options;

    try {
      // Resolve output directory
      const resolvedPath = this.resolvePath(outputPath);
      await this.ensureDirectory(resolvedPath);

      // Generate filename if not provided
      let finalFilename = filename;
      if (!finalFilename && prompt && model) {
        finalFilename = this.generateFilename(prompt, model);
      } else if (!finalFilename) {
        finalFilename = `generated_image_${Date.now()}`;
      }

      // Add extension if missing
      if (!finalFilename.match(/\.(jpg|jpeg|png)$/i)) {
        const extension = outputFormat === 'jpeg' ? 'jpg' : 'png';
        finalFilename = `${finalFilename}.${extension}`;
      }

      const fullPath = path.join(resolvedPath, finalFilename);

      // Fetch and save image
      const imageData = await this.fetchImage(imageUrl);
      await fs.writeFile(fullPath, imageData);

      return fullPath;
    } catch (error) {
      throw new Error(`Failed to save image: ${error.message}`);
    }
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async getFileInfo(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return {
        path: filePath,
        size: stats.size,
        createdAt: stats.birthtime,
        exists: true
      };
    } catch {
      return {
        path: filePath,
        exists: false
      };
    }
  }

  async saveGeneratedImage(imageUrl, options = {}) {
    const savedPath = await this.saveImageFromUrl(imageUrl, options);
    const fileInfo = await this.getFileInfo(savedPath);
    
    return {
      savedPath,
      filename: path.basename(savedPath),
      directory: path.dirname(savedPath),
      size: fileInfo.size
    };
  }

  suggestOrganization(prompt) {
    const lowercasePrompt = prompt.toLowerCase();
    
    // Extract category
    let category = 'image';
    let suggestedPath = 'images';
    
    if (lowercasePrompt.includes('logo')) {
      category = 'logo';
      suggestedPath = 'logos';
    } else if (lowercasePrompt.includes('icon')) {
      category = 'icon';
      suggestedPath = 'icons';
    } else if (lowercasePrompt.includes('banner') || lowercasePrompt.includes('header')) {
      category = 'banner';
      suggestedPath = 'banners';
    }

    // Extract tags
    const tags = [];
    const keywords = ['tech', 'startup', 'business', 'creative', 'modern', 'vintage', 'abstract'];
    keywords.forEach(keyword => {
      if (lowercasePrompt.includes(keyword)) {
        tags.push(keyword);
      }
    });

    // Generate filename suggestion
    const words = prompt.replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/);
    
    // Look for company/brand names (capitalized words) or meaningful terms
    const meaningfulWords = words.filter(word => {
      const lower = word.toLowerCase();
      // Skip common words
      const skipWords = ['logo', 'for', 'tech', 'startup', 'company', 'brand', 'design', 'the', 'a', 'an'];
      return !skipWords.includes(lower) && word.length > 2;
    });
    
    // If we found meaningful words, use them, otherwise fall back to first 3 words
    const finalWords = meaningfulWords.length > 0 ? meaningfulWords.slice(0, 2) : words.slice(0, 3);
    const suggestedFilename = finalWords.join('_').toLowerCase();

    return {
      suggestedPath,
      suggestedFilename,
      category,
      tags
    };
  }

  async saveBatch(imageUrls, options = {}) {
    const {
      basePrompt,
      outputPath,
      variations = []
    } = options;

    const results = [];
    
    for (let i = 0; i < imageUrls.length; i++) {
      const urlInfo = imageUrls[i];
      const variation = variations[i] || `v${i + 1}`;
      
      const filename = `${basePrompt.replace(/[^a-zA-Z0-9]/g, '_')}_${variation}`;
      
      const result = await this.saveGeneratedImage(urlInfo.url, {
        outputPath,
        filename,
        prompt: basePrompt,
        model: 'batch'
      });
      
      results.push(result);
    }
    
    return results;
  }
} 