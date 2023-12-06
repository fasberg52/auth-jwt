const Keyv = require("keyv");
const KeyvPostgres = require("@keyv/postgres");
const dotenv = require("dotenv");
dotenv.config();
class CacheService {
  constructor() {
    this.keyv = new Keyv({
      store: new KeyvPostgres({ connectionString: process.env.DATABASE_KEYV }),
    });
    console.log("PostgreSQL Connection String:", process.env.DATABASE_KEYV);
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
