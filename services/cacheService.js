const Keyv = require("keyv");
const KeyvPostgres = require("@keyv/postgres");

class CacheService {
  constructor() {
    this.keyv = new Keyv({ store: new KeyvPostgres(process.env.DATABASE_URL) });
  }

  async get(key) {
    try {
      return await this.keyv.get(key);
    } catch (error) {
      console.error("Error getting from cache:", error);
      throw error;
    }
  }

  async set(key, value, ttl = 0) {
    try {
      await this.keyv.set(key, value, ttl);
    } catch (error) {
      console.error("Error setting in cache:", error);
      throw error;
    }
  }

  async delete(key) {
    try {
      await this.keyv.delete(key);
    } catch (error) {
      console.error("Error deleting from cache:", error);
      throw error;
    }
  }
}

module.exports = new CacheService();
