
const { MongoClient } = require("mongodb");

const connectionString = "mongodb+srv://juangras:timoprograma@cluster0.oopcyug.mongodb.net/";

const client = new MongoClient(connectionString);

let db;

async function getDb() {
  if (!db) {
    try {
      const conn = await client.connect();
      console.log("✅ Conectado a MongoDB Atlas");
      db = conn.db("accidentepatente"); // nombre de tu base de datos
    } catch (e) {
      console.error("❌ Error al conectar con MongoDB Atlas:", e);
    }
  }
  return db;
}

module.exports = getDb;


