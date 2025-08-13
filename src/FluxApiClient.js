// SPDX-License-Identifier: MIT
/**
 * 🌐 Flux API Client
 * 
 * Client for interacting with Black Forest Labs Flux API
 */

import fetch from 'node-fetch';

export class FluxApiClient {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('API key is required');
    }
    
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.bfl.ai';
  }

  getHeaders() {
    return {
      'x-key': this.apiKey,
      'Content-Type': 'application/json'
    };
  }

  async submitGeneration(endpoint, payload) {
    if (!endpoint) {
      throw new Error('Endpoint is required');
    }
    
    if (!payload) {
      throw new Error('Payload is required');
    }

    const url = `${this.baseUrl}/${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error.message.includes('HTTP')) {
        throw error;
      }
      throw new Error(`Network error: ${error.message}`);
    }
  }

  async getResult(taskId) {
    if (!taskId) {
      throw new Error('Task ID is required');
    }

    const url = `${this.baseUrl}/v1/get_result?id=${encodeURIComponent(taskId)}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'x-key': this.apiKey }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error.message.includes('HTTP')) {
        throw error;
      }
      throw new Error(`Network error: ${error.message}`);
    }
  }

  async waitForCompletion(taskId, options = {}) {
    const {
      maxWaitTime = 300000, // 5 minutes
      pollInterval = 2000,   // 2 seconds
      onProgress = null
    } = options;

    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const result = await this.getResult(taskId);
      
      if (onProgress && typeof onProgress === 'function') {
        onProgress(result);
      }
      
      if (result.status === 'Ready') {
        return result;
      }
      
      if (['Error', 'Content Moderated', 'Request Moderated'].includes(result.status)) {
        throw new Error(`Task failed: ${result.status}`);
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
    
    throw new Error('Task timed out');
  }
} 