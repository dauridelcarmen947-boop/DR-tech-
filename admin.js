// --- LÓGICA DE AUTENTICACIÓN REAL ---
async function login() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const alertBox = document.getElementById('login-alert');
    
    try {
        // Hacemos la petición al servidor Node.js
        const respuesta = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
        });

        const datos = await respuesta.json();

        if(datos.success) {
            document.getElementById('auth-container').style.display = 'none';
            document.getElementById('app-container').style.display = 'block';
            alertBox.style.display = 'none';
        } else {
            alertBox.style.display = 'block';
            alertBox.innerText = datos.message;
        }
    } catch (error) {
        alert("Error de conexión. ¿Está encendido el servidor Node.js?");
    }
}

// --- LÓGICA PARA LEER EL ARCHIVO REAL ---
let archivoActual = '';

async function goToEdit(pageName) {
    switchTab('tab-editor', document.querySelectorAll('.nav-item')[1]);
    document.getElementById('editing-title').innerHTML = `Editando: <strong>${pageName}</strong>`;
    document.getElementById('html-editor').value = "Cargando código...";
    archivoActual = pageName; // Guardamos el nombre del archivo para saber cuál guardar después

    try {
        const respuesta = await fetch(`http://localhost:3000/api/editar/${pageName}`);
        const datos = await respuesta.json();

        if(datos.success) {
            // Mostramos el código real del archivo en el textarea
            document.getElementById('html-editor').value = datos.contenido;
        } else {
            document.getElementById('html-editor').value = "Error: " + datos.message;
        }
    } catch (error) {
        document.getElementById('html-editor').value = "Error de conexión con el servidor.";
    }
}

// --- LÓGICA PARA GUARDAR LOS CAMBIOS ---
async function saveCode() {
    const codigoModificado = document.getElementById('html-editor').value;

    try {
        const respuesta = await fetch(`http://localhost:3000/api/guardar/${archivoActual}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ codigoHtml: codigoModificado })
        });

        const datos = await respuesta.json();

        if(datos.success) {
            alert("✅ " + datos.message);
        } else {
            alert("❌ Error al guardar: " + datos.message);
        }
    } catch (error) {
        alert("Error de conexión al intentar guardar.");
    }
}