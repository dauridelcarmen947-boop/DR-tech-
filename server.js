const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const app = express();

// Middlewares esenciales
app.use(express.json());
app.use(express.static(__dirname, { maxAge: '1d', etag: true }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d', etag: true }));

// Directorio para datos (credenciales y tokens)
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
const ADMIN_FILE = path.join(DATA_DIR, 'admin.json');
const TOKENS_FILE = path.join(DATA_DIR, 'reset-tokens.json');

// --- Utilidades de hashing (scrypt) ---
function hashPassword(password, salt) {
    salt = salt || crypto.randomBytes(16).toString('hex');
    const derived = crypto.scryptSync(password, salt, 64).toString('hex');
    return { salt, hash: derived };
}

function verifyPassword(password, adminObj) {
    if (!adminObj || !adminObj.salt || !adminObj.hash) return false;
    const derived = crypto.scryptSync(password, adminObj.salt, 64).toString('hex');
    return derived === adminObj.hash;
}

function loadAdmin() {
    if (!fs.existsSync(ADMIN_FILE)) {
        // Crear admin por defecto (usuario: admin, contraseña: 1234) -- recomendado cambiar
        const initial = { username: 'admin', email: 'you@example.com' };
        const p = hashPassword('1234');
        initial.salt = p.salt;
        initial.hash = p.hash;
        fs.writeFileSync(ADMIN_FILE, JSON.stringify(initial, null, 2), 'utf8');
        return initial;
    }
    try {
        const raw = fs.readFileSync(ADMIN_FILE, 'utf8');
        return JSON.parse(raw);
    } catch (e) {
        console.error('Error leyendo admin.json', e);
        return null;
    }
}

function saveAdmin(adminObj) {
    fs.writeFileSync(ADMIN_FILE, JSON.stringify(adminObj, null, 2), 'utf8');
}

function loadTokens() {
    if (!fs.existsSync(TOKENS_FILE)) return {};
    try {
        return JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8')) || {};
    } catch (e) {
        console.error('Error leyendo tokens', e);
        return {};
    }
}

function saveTokens(tokens) {
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2), 'utf8');
}

// Optional: enviar correo si están configuradas las variables de entorno
async function sendResetEmail(toEmail, resetLink) {
    // Intentar usar nodemailer si está disponible y si hay configuración SMTP
    try {
        const nodemailer = require('nodemailer');
        const host = process.env.SMTP_HOST;
        const port = process.env.SMTP_PORT || 587;
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;
        const from = process.env.FROM_EMAIL || user;

        if (host && user && pass) {
            const transporter = nodemailer.createTransport({
                host,
                port: Number(port),
                secure: Number(port) === 465, // true for 465, false for others
                auth: { user, pass }
            });

            await transporter.sendMail({
                from: from,
                to: toEmail,
                subject: 'Recuperación de contraseña - DR Tech Solutions',
                html: `<p>Se solicitó recuperar la contraseña. Haz clic en el enlace para crear una nueva contraseña:</p>
                       <p><a href="${resetLink}">${resetLink}</a></p>
                       <p>Si no lo solicitaste, ignora este correo.</p>`
            });
            return true;
        }
    } catch (e) {
        // nodemailer no instalado o error, se hará fallback
        console.warn('nodemailer no disponible o fallo al enviar correo:', e && e.message);
    }

    // Fallback: registrar en consola (útil para pruebas locales)
    console.log(`Enlace de recuperación para ${toEmail}: ${resetLink}`);
    return false;
}

// Aseguramos archivos iniciales
const adminData = loadAdmin();
if (!fs.existsSync(TOKENS_FILE)) saveTokens({});

// ==========================================
// RUTA PARA INICIAR SESIÓN (/api/login)
// ==========================================
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const admin = loadAdmin();
    if (!admin) return res.json({ success: false, message: 'Configuración de admin inválida.' });

    if (username === admin.username && verifyPassword(password, admin)) {
        return res.json({ success: true, message: 'Login exitoso' });
    }
    return res.json({ success: false, message: 'Credenciales incorrectas' });
});

// ==========================================
// RUTA PARA CAMBIAR CONTRASEÑA (/api/change-password)
// Requiere: username, currentPassword, newPassword
// ==========================================
app.post('/api/change-password', (req, res) => {
    const { username, currentPassword, newPassword } = req.body;
    const admin = loadAdmin();
    if (!admin) return res.json({ success: false, message: 'No hay configuración de admin.' });
    if (username !== admin.username) return res.json({ success: false, message: 'Usuario inválido.' });
    if (!verifyPassword(currentPassword, admin)) return res.json({ success: false, message: 'Contraseña actual incorrecta.' });

    const p = hashPassword(newPassword);
    admin.salt = p.salt;
    admin.hash = p.hash;
    saveAdmin(admin);
    return res.json({ success: true, message: 'Contraseña cambiada correctamente.' });
});

// ==========================================
// RUTA PARA SOLICITAR RECUPERACIÓN (/api/request-reset)
// Requiere: email
// ==========================================
app.post('/api/request-reset', async (req, res) => {
    const { email } = req.body;
    const admin = loadAdmin();
    // Por seguridad, respondemos siempre con éxito (no revelamos si el correo existe)
    const tokens = loadTokens();

    if (admin && admin.email && email === admin.email) {
        const token = crypto.randomBytes(20).toString('hex');
        const expires = Date.now() + 1000 * 60 * 60; // 1 hora
        tokens[token] = { email, expires, used: false };
        saveTokens(tokens);

        const resetLink = `${req.protocol}://${req.get('host')}/admin-reset.html?token=${token}`;
        await sendResetEmail(email, resetLink);
    }

    return res.json({ success: true, message: 'Si el correo existe, se envió un enlace de recuperación.' });
});

// ==========================================
// RUTA PARA RESETEAR CONTRASEÑA (/api/reset-password)
// Requiere: token, newPassword
// ==========================================
app.post('/api/reset-password', (req, res) => {
    const { token, newPassword } = req.body;
    const tokens = loadTokens();
    const entry = tokens[token];

    if (!entry || entry.used || entry.expires < Date.now()) {
        return res.json({ success: false, message: 'Token inválido o expirado.' });
    }

    // Encontramos admin por email
    const admin = loadAdmin();
    if (!admin || admin.email !== entry.email) {
        return res.json({ success: false, message: 'No se encontró el usuario asociado al token.' });
    }

    // Cambiamos la contraseña
    const p = hashPassword(newPassword);
    admin.salt = p.salt;
    admin.hash = p.hash;
    saveAdmin(admin);

    // Marcar token como usado
    entry.used = true;
    saveTokens(tokens);

    return res.json({ success: true, message: 'Contraseña restablecida correctamente.' });
});

// ==========================================
//  RUTAS EXISTENTES PARA EDICIÓN DE ARCHIVOS
// ==========================================
app.get('/api/editar/:archivo', (req, res) => {
    const nombreArchivo = req.params.archivo;
    const rutaCompleta = path.join(__dirname, 'public', nombreArchivo);

    fs.readFile(rutaCompleta, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.json({ success: false, message: 'No se pudo encontrar el archivo.' });
        }
        res.json({ success: true, contenido: data });
    });
});

app.post('/api/guardar/:archivo', (req, res) => {
    const nombreArchivo = req.params.archivo;
    const { codigoHtml } = req.body;
    const rutaCompleta = path.join(__dirname, 'public', nombreArchivo);

    fs.writeFile(rutaCompleta, codigoHtml, 'utf8', (err) => {
        if (err) {
            console.error(err);
            return res.json({ success: false, message: 'No se pudo guardar el archivo.' });
        }
        res.json({ success: true, message: 'Archivo guardado correctamente' });
    });
});

// ==========================================
// INICIO DEL SERVIDOR
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor de DR Tech Solutions corriendo en http://localhost:${PORT}`);
});