import axios from 'axios';
import { API_BASE_URL } from '@/utils/config.js';
import { UserSession } from '@/services/UserSession.js';

export class UserAuth {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL
    });
  }

  async register({ name, email, password }) {
    try {
      const response = await this.api.post('/register', {
        name,
        email,
        password
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  async login({ email, password }) {
    try {
      const response = await this.api.post('/login', {
        email,
        password
      });
      const { token, name } = response.data.loginResult;
      this.saveSession(token, name);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  saveSession(token, name) {
    UserSession.login(token, name);
  }
}