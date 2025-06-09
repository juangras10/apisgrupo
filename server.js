import express from 'express';
import path from 'path';
import session from 'express-session';
import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth2';
import { fileURLToPath } from 'url';
import getDb from './public/js/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;


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
}, (request, accessToken, refreshToken, profile, done) => {
  console.log(profile);
  return done(null, profile);
}));

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

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
