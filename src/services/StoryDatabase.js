import { IndexedDBUtil } from '@/utils/idb';

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
              { name: 'createdAt', keyPath: 'createdAt', unique: false }
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
        isOffline: true
      };
      
      await this.dbUtil.saveData('offlineStories', tempStory);
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