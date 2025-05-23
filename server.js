const express = require('express');
const path = require('path');
const getDb = require("./public/js/db"); // Asegurate de que el path sea correcto

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal que sirve el index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Ruta para obtener los vehículos desde MongoDB
app.get('/vehiculos', async (req, res) => {
  try {
    const db = await getDb();
    const vehiculos = await db.collection("vehiculos").find().toArray();
    res.json(vehiculos);
  } catch (error) {
    console.error("Error al obtener los vehículos:", error);
    res.status(500).send("Error al obtener los vehículos");
  }
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
