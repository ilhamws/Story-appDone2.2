import { API_BASE_URL } from '../utils/config';
import { UserSession } from '../services/UserSession';
import { StoryDatabase } from '../services/StoryDatabase';

export class StoryModel {
  constructor() {
    this.storyDatabase = new StoryDatabase();
  }

  async getAllStories() {
    try {
      const token = UserSession.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      try {
        // Coba ambil dari API terlebih dahulu
        const response = await fetch(`${API_BASE_URL}/stories`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message);
        }

        const stories = data.listStory || [];
        
        // Simpan ke IndexedDB untuk penggunaan offline
        await this.storyDatabase.saveStories(stories);
        
        return stories;
      } catch (networkError) {
        console.log('Network error, fetching from IndexedDB', networkError);
        
        // Jika gagal mengambil dari API, coba ambil dari IndexedDB
        const offlineStories = await this.storyDatabase.getStories();
        
        if (offlineStories && offlineStories.length > 0) {
          return offlineStories;
        }
        
        // Jika tidak ada data offline, berikan data dummy
        const dummyStories = this.getDummyStories();
        // Simpan data dummy ke IndexedDB untuk penggunaan berikutnya
        await this.storyDatabase.saveStories(dummyStories);
        return dummyStories;
      }
    } catch (error) {
      throw new Error('Failed to fetch stories: ' + error.message);
    }
  }

  getDummyStories() {
    return [
      {
        id: 'dummy-1',
        name: 'User Demo',
        description: 'Ini adalah cerita dummy untuk penggunaan offline.',
        photoUrl: 'https://picsum.photos/id/237/500/300',
        createdAt: new Date().toISOString(),
        lat: -6.2088,
        lon: 106.8456
      },
      {
        id: 'dummy-2',
        name: 'User Demo',
        description: 'Cerita dummy kedua untuk penggunaan offline.',
        photoUrl: 'https://picsum.photos/id/238/500/300',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        lat: -6.1751,
        lon: 106.8650
      },
      {
        id: 'dummy-3',
        name: 'User Demo',
        description: 'Cerita dummy ketiga untuk penggunaan offline.',
        photoUrl: 'https://picsum.photos/id/239/500/300',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        lat: -6.2000,
        lon: 106.8300
      }
    ];
  }

  async getStoryById(id) {
    try {
      const token = UserSession.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      try {
        // Coba ambil dari API terlebih dahulu
        const response = await fetch(`${API_BASE_URL}/stories/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message);
        }

        const story = data.story;
        
        // Simpan ke IndexedDB untuk penggunaan offline
        await this.storyDatabase.saveStories([story]);
        
        return story;
      } catch (networkError) {
        console.log('Network error, fetching from IndexedDB', networkError);
        
        // Jika gagal mengambil dari API, coba ambil dari IndexedDB
        const offlineStory = await this.storyDatabase.getStoryById(id);
        
        if (offlineStory) {
          return offlineStory;
        }
        
        // Jika tidak ada data offline dan ID adalah dummy, kembalikan cerita dummy
        if (id.startsWith('dummy-')) {
          const dummyStories = this.getDummyStories();
          const dummyStory = dummyStories.find(story => story.id === id);
          if (dummyStory) return dummyStory;
        }
        
        throw new Error('Failed to fetch story: No offline data available');
      }
    } catch (error) {
      throw new Error('Failed to fetch story: ' + error.message);
    }
  }

  async addStory(formData) {
    try {
      const token = UserSession.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      try {
        // Coba kirim ke API terlebih dahulu
        const response = await fetch(`${API_BASE_URL}/stories`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message);
        }

        return data.story;
      } catch (networkError) {
        console.log('Network error, saving offline', networkError);
        
        // Jika offline, simpan cerita ke IndexedDB
        const storyData = {};
        formData.forEach((value, key) => {
          if (key === 'photo') {
            // Untuk file, kita perlu menyimpan URL sementara
            storyData[key] = URL.createObjectURL(value);
            storyData.photoBlob = value; // Simpan juga blob untuk dikirim nanti
          } else {
            storyData[key] = value;
          }
        });
        
        const offlineStory = await this.storyDatabase.saveOfflineStory(storyData);
        return { ...offlineStory, isOffline: true };
      }
    } catch (error) {
      throw new Error('Failed to add story: ' + error.message);
    }
  }

  async getFavoriteStories() {
    try {
      return await this.storyDatabase.getFavoriteStories();
    } catch (error) {
      throw new Error('Failed to get favorite stories: ' + error.message);
    }
  }

  async toggleFavorite(story) {
    try {
      const isFavorite = await this.storyDatabase.isStoryFavorite(story.id);
      
      if (isFavorite) {
        await this.storyDatabase.removeFavoriteStory(story.id);
        return false;
      } else {
        await this.storyDatabase.saveFavoriteStory(story);
        return true;
      }
    } catch (error) {
      throw new Error('Failed to toggle favorite: ' + error.message);
    }
  }

  async getOfflineStories() {
    try {
      return await this.storyDatabase.getOfflineStories();
    } catch (error) {
      throw new Error('Failed to get offline stories: ' + error.message);
    }
  }

  async deleteOfflineStory(tempId) {
    try {
      return await this.storyDatabase.deleteOfflineStory(tempId);
    } catch (error) {
      throw new Error('Failed to delete offline story: ' + error.message);
    }
  }
}