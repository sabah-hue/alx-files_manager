import { MongoClient } from 'mongodb';

const HOST = process.env.DB_HOST || 'localhost';
const PORT = process.env.DB_PORT || 27017;
const DATABASE = process.env.DB_DATABASE || 'files_manager';

// MongoDB utils
class DBClient {
  constructor() {
    this.client = new MongoClient(`mongodb://${HOST}:${PORT}`);
    this.client.connect()
      .then(() => this.db = this.client.db(`${DATABASE}`))
      .catch((e) => console.log(e));
  }

  // true when connection to MongoDB is a success otherwise, false
  isAlive() {
    return this.client.isConnected();
  }

  //  returns the number of documents in the collection users
  async nbUsers() {
    return await this.db.collection('users').countDocuments();
  }

  // returns the number of documents in the collection files
  async nbFiles() {
    return await this.db.collection('files').countDocuments();
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
