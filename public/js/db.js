import { MongoClient } from "mongodb";

const connectionString = "mongodb+srv://juangras:timoprograma@cluster0.oopcyug.mongodb.net/";
const client = new MongoClient(connectionString);

let conn;
let db;

async function connectToDb() {
  if (!conn) {
    try {
      conn = await client.connect();
      console.log("✅ Conectado a MongoDB Atlas");
      db = conn.db("accidentepatente"); // 👈 asegurate que este sea el nombre correcto de tu base
    } catch (e) {
      console.error("❌ Error al conectar con MongoDB:", e);
      throw e;
    }
  }
  return db;
}

export default connectToDb;

