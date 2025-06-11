import express from 'express';
import path from 'path';
import session from 'express-session';
import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth2';
import { fileURLToPath } from 'url';
import getDb from './public/js/db.js';
import Authentication from './auth.js'; // ✅ cambiado

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express(); // ✅ movido arriba
const PORT = process.env.PORT || 3000;

const auth = new Authentication(app); // ✅ ya puede usarse

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
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

    // Verificar si el usuario ya existe
    const usuarioExistente = await usuariosCollection.findOne({ email: profile.email });

    if (!usuarioExistente) {
      // Insertar nuevo usuario
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

app.get('/vehiculos/buscar/:patente', checkAuthenticated, async (req, res) => {
  try {
    const db = await getDb();
    const patente = req.params.patente.toUpperCase(); // Por si vienen en minúsculas
    const vehiculo = await db.collection("vehiculos").findOne({ licensePlate: patente });

    if (vehiculo) {
      res.status(200).json(vehiculo);
    } else {
      res.status(404).json(null);
    }
  } catch (error) {
    console.error("Error al buscar vehículo por patente:", error);
    res.status(500).json({ success: false, message: "Error al buscar vehículo" });
  }
});


passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Middleware para verificar autenticación
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/index.html');
}

// Ruta de inicio
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Rutas de autenticación
app.get('/auth/google', passport.authenticate('google', {
  scope: ['email', 'profile']
}));

app.get('/auth/google/callback', passport.authenticate('google', {
  successRedirect: '/dashboard.html',
  failureRedirect: '/index.html'
}));

// Ruta protegida de ejemplo
app.get('/dashboard', checkAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/dashboard.html'));
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

// Cerrar sesión
app.post('/api/auth/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/index.html');
  });
});

// Ruta para obtener vehículos desde MongoDB
app.get('/vehiculos', checkAuthenticated, async (req, res) => {
  try {
    const db = await getDb();
    const vehiculos = await db.collection("vehiculos").find().toArray();
    res.json(vehiculos);
  } catch (error) {
    console.error("Error al obtener los vehículos:", error);
    res.status(500).send("Error al obtener los vehículos");
  }
});

// Ruta para registrar vehículos
app.post('/vehiculos', checkAuthenticated, async (req, res) => {
  try {
    const db = await getDb();
    const result = await db.collection("vehiculos").insertOne(req.body);
    res.status(200).json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error("Error al registrar vehículo:", error);
    res.status(500).json({ success: false, message: "Error al registrar vehículo" });
  }
});


app.post('/vehiculos', checkAuthenticated, async (req, res) => {
  try {
    console.log("Recibido en /vehiculos:", req.body); // 👈
    const db = await getDb();
    const result = await db.collection("vehiculos").insertOne(req.body);
    console.log("Insertado en MongoDB:", result.insertedId); // 👈
    res.status(200).json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error("Error al registrar vehículo:", error);
    res.status(500).json({ success: false, message: "Error al registrar vehículo" });
  }
});

// Ruta para registrar accidentes
app.post('/accidentes', checkAuthenticated, async (req, res) => {
  try {
    const db = await getDb();
    const result = await db.collection("accidentes").insertOne(req.body);
    res.status(200).json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error("Error al registrar accidente:", error);
    res.status(500).json({ success: false, message: "Error al registrar accidente" });
  }
});


// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
