/**
 * IndexedDB Utility
 * Kelas untuk mengelola operasi IndexedDB
 */
export class IndexedDBUtil {
  constructor(dbName, version) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
  }

  /**
   * Membuka koneksi ke database
   * @param {Object} options - Opsi untuk membuat object store
   * @returns {Promise} - Promise yang mengembalikan instance database
   */
  async openDB(options) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = (event) => {
        reject(new Error(`Database error: ${event.target.errorCode}`));
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        options.stores.forEach(store => {
          if (!db.objectStoreNames.contains(store.name)) {
            const objectStore = db.createObjectStore(store.name, { keyPath: store.keyPath });
            
            if (store.indexes) {
              store.indexes.forEach(index => {
                objectStore.createIndex(index.name, index.keyPath, { unique: index.unique });
              });
            }
          }
        });
      };
    });
  }

  /**
   * Menyimpan data ke object store
   * @param {string} storeName - Nama object store
   * @param {Object} data - Data yang akan disimpan
   * @returns {Promise} - Promise yang menyelesaikan operasi
   */
  async saveData(storeName, data) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onerror = (event) => {
        reject(new Error(`Error saving data: ${event.target.errorCode}`));
      };

      request.onsuccess = () => {
        resolve(true);
      };
    });
  }

  /**
   * Mengambil semua data dari object store
   * @param {string} storeName - Nama object store
   * @returns {Promise} - Promise yang mengembalikan array data
   */
  async getAllData(storeName) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = (event) => {
        reject(new Error(`Error getting data: ${event.target.errorCode}`));
      };

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
    });
  }

  /**
   * Mengambil data berdasarkan key
   * @param {string} storeName - Nama object store
   * @param {string|number} key - Key untuk mencari data
   * @returns {Promise} - Promise yang mengembalikan data
   */
  async getData(storeName, key) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = (event) => {
        reject(new Error(`Error getting data: ${event.target.errorCode}`));
      };

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
    });
  }

  /**
   * Menghapus data dari object store
   * @param {string} storeName - Nama object store
   * @param {string|number} key - Key untuk menghapus data
   * @returns {Promise} - Promise yang menyelesaikan operasi
   */
  async deleteData(storeName, key) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = (event) => {
        reject(new Error(`Error deleting data: ${event.target.errorCode}`));
      };

      request.onsuccess = () => {
        resolve(true);
      };
    });
  }

  /**
   * Menghapus semua data dari object store
   * @param {string} storeName - Nama object store
   * @returns {Promise} - Promise yang menyelesaikan operasi
   */
  async clearStore(storeName) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = (event) => {
        reject(new Error(`Error clearing store: ${event.target.errorCode}`));
      };

      request.onsuccess = () => {
        resolve(true);
      };
    });
  }
} 