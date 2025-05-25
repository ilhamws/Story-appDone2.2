import axios from 'axios';
import { API_BASE_URL } from '@/utils/config.js';
import { UserSession } from '@/services/UserSession.js';

export class StoryData {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL
    });
  }

  async addStory(formData) {
    try {
      const token = UserSession.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      const response = await this.api.post('/stories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add story');
    }
  }
}