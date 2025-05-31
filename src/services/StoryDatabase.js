import { IndexedDBUtil } from '@/utils/idb';
import { UserSession } from '@/services/UserSession';
import { API_BASE_URL } from '@/utils/config';

export class StoryDatabase {
  constructor() {
    this.dbUtil = new IndexedDBUtil('story-app-db', 1);
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    try {
      await this.dbUtil.openDB({
        stores: [
          {
            name: 'stories',
            keyPath: 'id',
            indexes: [
              { name: 'createdAt', keyPath: 'createdAt', unique: false }
            ]
          },
          {
            name: 'favorites',
            keyPath: 'id',
            indexes: [
              { name: 'createdAt', keyPath: 'createdAt', unique: false }
            ]
          },
          {
            name: 'offlineStories',
            keyPath: 'tempId',
            indexes: [
              { name: 'createdAt', keyPath: 'createdAt', unique: false },
              { name: 'status', keyPath: 'status', unique: false }
            ]
          }
        ]
      });
      this.initialized = true;
      console.log('Story database initialized');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  async saveStories(stories) {
    await this.init();
    
    try {
      for (const story of stories) {
        await this.dbUtil.saveData('stories', story);
      }
      return true;
    } catch (error) {
      console.error('Failed to save stories:', error);
      throw error;
    }
  }

  async getStories() {
    await this.init();
    
    try {
      const stories = await this.dbUtil.getAllData('stories');
      return stories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Failed to get stories:', error);
      throw error;
    }
  }

  async getStoryById(id) {
    await this.init();
    
    try {
      return await this.dbUtil.getData('stories', id);
    } catch (error) {
      console.error(`Failed to get story with id ${id}:`, error);
      throw error;
    }
  }

  async saveOfflineStory(story) {
    await this.init();
    
    try {
      // Tambahkan tempId dan timestamp untuk offline stories
      const tempStory = {
        ...story,
        tempId: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        isOffline: true,
        status: 'pending' // pending, synced, failed
      };
      
      await this.dbUtil.saveData('offlineStories', tempStory);
      
      // Trigger background sync if available
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-stories');
      }
      
      return tempStory;
    } catch (error) {
      console.error('Failed to save offline story:', error);
      throw error;
    }
  }

  async getOfflineStories() {
    await this.init();
    
    try {
      const stories = await this.dbUtil.getAllData('offlineStories');
      return stories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Failed to get offline stories:', error);
      throw error;
    }
  }

  async updateOfflineStoryStatus(tempId, status, serverId = null) {
    await this.init();
    
    try {
      const story = await this.dbUtil.getData('offlineStories', tempId);
      if (!story) {
        throw new Error(`Offline story with tempId ${tempId} not found`);
      }
      
      const updatedStory = {
        ...story,
        status,
        id: serverId || story.id
      };
      
      await this.dbUtil.saveData('offlineStories', updatedStory);
      return updatedStory;
    } catch (error) {
      console.error(`Failed to update offline story status with tempId ${tempId}:`, error);
      throw error;
    }
  }

  async syncOfflineStories() {
    await this.init();
    
    if (!navigator.onLine) {
      console.log('Device is offline, cannot sync stories');
      return false;
    }
    
    try {
      const pendingStories = await this.getPendingOfflineStories();
      
      if (pendingStories.length === 0) {
        console.log('No pending offline stories to sync');
        return true;
      }
      
      console.log(`Found ${pendingStories.length} pending offline stories to sync`);
      
      const token = UserSession.getToken();
      if (!token) {
        console.error('No authentication token found');
        return false;
      }
      
      for (const story of pendingStories) {
        try {
          console.log(`Syncing offline story: ${story.tempId}`);
          
          // Implementasi API upload sebenarnya akan dilakukan di sini
          // Untuk contoh, kita anggap berhasil
          const response = await this.simulateApiUpload(story);
          
          if (response.success) {
            // Update status dan simpan ID dari server
            await this.updateOfflineStoryStatus(story.tempId, 'synced', response.id);
            
            // Simpan cerita yang sudah disinkronkan ke store stories
            if (response.story) {
              await this.dbUtil.saveData('stories', response.story);
            }
          } else {
            await this.updateOfflineStoryStatus(story.tempId, 'failed');
          }
        } catch (error) {
          console.error(`Failed to sync offline story ${story.tempId}:`, error);
          await this.updateOfflineStoryStatus(story.tempId, 'failed');
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to sync offline stories:', error);
      return false;
    }
  }

  async getPendingOfflineStories() {
    await this.init();
    
    try {
      const transaction = this.dbUtil.db.transaction('offlineStories', 'readonly');
      const store = transaction.objectStore('offlineStories');
      const index = store.index('status');
      const request = index.getAll('pending');
      
      return new Promise((resolve, reject) => {
        request.onerror = () => reject(new Error('Failed to get pending offline stories'));
        request.onsuccess = () => resolve(request.result);
      });
    } catch (error) {
      console.error('Failed to get pending offline stories:', error);
      throw error;
    }
  }

  // Simulasi API upload untuk tujuan demonstrasi
  async simulateApiUpload(story) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.2; // 80% chance of success
        
        if (success) {
          resolve({
            success: true,
            id: `server-${Date.now()}`,
            story: {
              ...story,
              id: `server-${Date.now()}`,
              isOffline: false
            }
          });
        } else {
          resolve({
            success: false,
            error: 'Simulasi kegagalan API'
          });
        }
      }, 1000);
    });
  }

  async deleteOfflineStory(tempId) {
    await this.init();
    
    try {
      await this.dbUtil.deleteData('offlineStories', tempId);
      return true;
    } catch (error) {
      console.error(`Failed to delete offline story with tempId ${tempId}:`, error);
      throw error;
    }
  }

  async saveFavoriteStory(story) {
    await this.init();
    
    try {
      await this.dbUtil.saveData('favorites', {
        ...story,
        addedToFavoritesAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Failed to save favorite story:', error);
      throw error;
    }
  }

  async removeFavoriteStory(id) {
    await this.init();
    
    try {
      await this.dbUtil.deleteData('favorites', id);
      return true;
    } catch (error) {
      console.error(`Failed to remove favorite story with id ${id}:`, error);
      throw error;
    }
  }

  async getFavoriteStories() {
    await this.init();
    
    try {
      const favorites = await this.dbUtil.getAllData('favorites');
      return favorites.sort((a, b) => new Date(b.addedToFavoritesAt) - new Date(a.addedToFavoritesAt));
    } catch (error) {
      console.error('Failed to get favorite stories:', error);
      throw error;
    }
  }

  async isStoryFavorite(id) {
    await this.init();
    
    try {
      const story = await this.dbUtil.getData('favorites', id);
      return !!story;
    } catch (error) {
      console.error(`Failed to check if story with id ${id} is favorite:`, error);
      throw error;
    }
  }

  async clearAllStories() {
    await this.init();
    
    try {
      await this.dbUtil.clearStore('stories');
      return true;
    } catch (error) {
      console.error('Failed to clear all stories:', error);
      throw error;
    }
  }
} 