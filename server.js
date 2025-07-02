import express from 'express';
import path from 'path';
import session from 'express-session';
import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth2';
import { fileURLToPath } from 'url';
import getDb from './public/js/db.js';
import Authentication from './auth.js';
import { ObjectId } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

const auth = new Authentication(app);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de sesión
app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: true,
}));

// Inicialización de Passport
app.use(passport.initialize());
app.use(passport.session());

// Configurar Google OAuth
const GOOGLE_CLIENT_ID = "1087925047717-ffjvnfrc7dtq1us5plo9m3qnvuq4vkno.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";

passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/callback",
  passReqToCallback: true
}, async (request, accessToken, refreshToken, profile, done) => {
  try {
    const db = await getDb();
    const usuariosCollection = db.collection("usuarios");

    const usuarioExistente = await usuariosCollection.findOne({ email: profile.email });

    if (!usuarioExistente) {
      const nuevoUsuario = {
        nombre: profile.displayName,
        email: profile.email,
        googleId: profile.id,
        foto: profile.picture,
        fechaRegistro: new Date()
      };
      await usuariosCollection.insertOne(nuevoUsuario);
      console.log("✅ Usuario registrado:", profile.email);
    } else {
      console.log("ℹ️ Usuario ya existe:", profile.email);
    }

    return done(null, profile);
  } catch (error) {
    console.error("❌ Error al registrar usuario:", error);
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Middleware de autenticación
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    // Si es una llamada AJAX/fetch que espera JSON, respondemos con error
    return res.status(401).json({ error: 'No autenticado' });
  }

  // Si es navegación directa desde navegador, redireccionamos al login
  res.redirect('/index.html');
}

// ==================
// 🔁 RUTAS BACKEND
// ==================

app.get('/vehiculos/:patente', checkAuthenticated, async (req, res) => {
  try {
    const db = await getDb();
    const patente = req.params.patente.toUpperCase();
    const vehiculo = await db.collection("vehiculos").findOne({ licensePlate: patente });

    if (vehiculo) {
      res.status(200).json(vehiculo);
    } else {
      res.status(404).json(null);
    }
  } catch (error) {
    console.error("Error al buscar vehículo:", error);
    res.status(500).json({ success: false, message: "Error al buscar vehículo" });
  }
});




app.get('/vehiculos', checkAuthenticated, async (req, res) => {
  try {
    const db = await getDb();
    const vehicles = await db
      .collection("vehiculos")
      .find({ userEmail: req.user.email }) // 👈 solo vehículos tuyos
      .toArray();

    res.status(200).json(vehicles);
  } catch (error) {
    console.error("Error al obtener vehículos:", error);
    res.status(500).json({ message: "Error al obtener vehículos" });
  }
});




app.post('/vehiculos', checkAuthenticated, async (req, res) => {
  try {
    console.log("Recibido en /vehiculos:", req.body);
    const db = await getDb();
    
const nuevoVehiculo = {
  ...req.body,
  userEmail: req.user.email
};

const result = await db.collection("vehiculos").insertOne(nuevoVehiculo);

    console.log("Insertado en MongoDB:", result.insertedId);
    res.status(200).json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error("Error al registrar vehículo:", error);
    res.status(500).json({ success: false, message: "Error al registrar vehículo" });
  }
});

app.post('/accidentes', checkAuthenticated, async (req, res) => {
  try {
    const db = await getDb();

    const nuevoAccidente = {
      ...req.body, // copia todo lo que vino del formulario
      userEmail: req.user.email // agrega el email del usuario logueado
      //vehicleId: new ObjectId(req.body.vehicleId) //
    };

    const result = await db.collection("accidentes").insertOne(nuevoAccidente);

    res.status(200).json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error("Error al registrar accidente:", error);
    res.status(500).json({ success: false, message: "Error al registrar accidente" });
  }
});


app.post('/logout', (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    req.session.destroy((err) => {
      if (err) {
        console.error("Error al destruir la sesión:", err);
        return res.status(500).json({ success: false, message: "Error al cerrar sesión" });
      }
      res.clearCookie("connect.sid");
      res.status(200).json({ success: true, message: "Sesión cerrada exitosamente" });
    });
  });
});


// Estado de autenticación
app.get('/api/auth/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      name: req.user.displayName,
      email: req.user.email
    });
  } else {
    res.status(401).json({ error: 'No autenticado' });
  }
});

// Rutas de autenticación
app.get('/auth/google', passport.authenticate('google', {
  scope: ['email', 'profile']
}));

app.get('/auth/google/callback', passport.authenticate('google', {
  successRedirect: '/dashboard.html',
  failureRedirect: '/index.html'
}));

// ==================
// 📁 ARCHIVOS ESTÁTICOS (al final)
// ==================

app.use(express.static(path.join(__dirname, 'public')));

// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Dashboard (protegido)
app.get('/dashboard', checkAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/dashboard.html'));
});


app.get('accidentes/:patente', checkAuthenticated, async (req, res) => {
  try {
    const db = await getDb();
    const patente = req.params.patente.toUpperCase();

    const accidente = await db.collection("accidentes").findOne({ licensePlate: patente });
    if (!accidente) return res.status(404).json({ error: "No se encontró accidente" });

    const vehiculo = await db.collection("vehiculos").findOne({ licensePlate: patente });
    if (!vehiculo) return res.status(404).json({ error: "Vehículo no encontrado" });

    res.json({ ...vehiculo, accident: accidente });
  } catch (err) {
    console.error("Error en /api/accidentes/:patente", err);
    res.status(500).json({ error: "Error del servidor" });
  }
  

});




app.get('/vehiculos-con-accidentes', checkAuthenticated, async (req, res) => {
  try {
    const db = await getDb();
    const vehicles = await db.collection("vehiculos").aggregate([
      {
        $lookup: {
          from: "accidentes",
          localField: "_id",
          foreignField: "vehicleId",
          as: "accident"
        }
      },
      { $unwind: "$accident" },
      { $match: { userEmail: req.user.email } }
    ]).toArray();

    res.status(200).json(vehicles);
  } catch (error) {
    console.error("Error al obtener vehículos con accidentes:", error);
    res.status(500).json({ message: "Error al obtener vehículos con accidentes" });
  }
});





app.get("/accidentes", checkAuthenticated, async (req, res) => {
  try {
    const db = await getDb();

    // Solo traemos los accidentes del usuario logueado
    const accidentes = await db
      .collection("accidentes")
      .find({ userEmail: req.user.email })
      .toArray();

    res.status(200).json(accidentes);
  } catch (error) {
    console.error("Error al obtener accidentes:", error);
    res.status(500).json({ message: "Error al obtener accidentes" });
  }
});






app.get("/accidentes/:id", checkAuthenticated, async (req, res) => {
  try {
    const db = await getDb();
    const accident = await db.collection("accidentes").findOne({
      _id: new ObjectId(req.params.id),
      userEmail: req.user.email, // Solo si el usuario es dueño
    });

    if (!accident) {
      return res.status(404).json({ error: "Accidente no encontrado" });
    }

    res.json(accident);
  } catch (err) {
    console.error("Error buscando accidente:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});






// Editar accidente
app.put("/accidentes/:id", checkAuthenticated, async (req, res) => {
  try {
    const db = await getDb();
    const updateFields = {
      location: req.body.location,
      description: req.body.description,
      severity: req.body.severity,
      date: `${req.body.date}T${req.body.time}:00Z`,
    };

    const result = await db.collection("accidentes").updateOne(
      { _id: new ObjectId(req.params.id), userEmail: req.user.email },
      { $set: updateFields }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "No se pudo actualizar" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error actualizando accidente:", err);
    res.status(500).json({ error: "Error interno" });
  }
});







app.delete("/accidentes/:id", async (req, res) => {
  const db = await getDb();
 

const accidentId = req.params.id;

if (!ObjectId.isValid(accidentId)) {
  return res.status(400).send("ID inválido");
}

const accident = await db.collection("accidentes").findOne({ _id: new ObjectId(accidentId) });


  if (!accident) return res.status(404).send("Accidente no encontrado");

  // Verificamos que el accidente sea del usuario actual
  if (accident.userEmail !== req.user.email) {
    return res.status(403).send("No autorizado");
  }

  await db.collection("accidentes").deleteOne({ _id: new ObjectId(accidentId) });

  res.status(200).send("Accidente eliminado");
});

app.patch("/accidentes/:id", async (req, res) => {
  const db = await getDb();
 

const accidentId = req.params.id;

if (!ObjectId.isValid(accidentId)) {
  return res.status(400).send("ID inválido");
}

const accident = await db.collection("accidentes").findOne({ _id: new ObjectId(accidentId) });


  if (!accident) return res.status(404).send("Accidente no encontrado");

  // Verificamos que el accidente sea del usuario actual
  if (accident.userEmail !== req.user.email) {
    return res.status(403).send("No autorizado");
  }

  const updateData = {
    licensePlate: req.body.licensePlate,
    location: req.body.location,
    description: req.body.description,
    severity: req.body.severity
  };

  await db.collection("accidentes").updateOne(
    { _id: new ObjectId(accidentId) },
    { $set: updateData }
  );

  res.status(200).send("Accidente actualizado");
});



// ==================
// 🚀 INICIAR SERVIDOR
// ==================

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
