// Base de datos de preguntas aleatorias
const allQuestions = [
    {
        pregunta: "¿Cuál es el océano más grande del mundo?",
        opciones: ["Océano Atlántico", "Océano Índico", "Océano Pacífico", "Océano Ártico"],
        correcta: "Océano Pacífico"
    },
    {
        pregunta: "¿En qué país se encuentra la torre de Pisa?",
        opciones: ["Francia", "Italia", "España", "Grecia"],
        correcta: "Italia"
    },
    {
        pregunta: "¿Qué planeta es conocido como el planeta rojo?",
        opciones: ["Venus", "Marte", "Júpiter", "Saturno"],
        correcta: "Marte"
    },
    {
        pregunta: "¿Cuántos colores tiene el arcoíris?",
        opciones: ["5", "6", "7", "8"],
        correcta: "7"
    },
    {
        pregunta: "¿Cuál es el mamífero terrestre más rápido del mundo?",
        opciones: ["León", "Guepardo", "Caballo", "Tigre"],
        correcta: "Guepardo"
    },
    {
        pregunta: "¿Qué elemento químico tiene el símbolo 'O'?",
        opciones: ["Oro", "Osmio", "Oxígeno", "Oculto"],
        correcta: "Oxígeno"
    },
    {
        pregunta: "¿Quién pintó la famosa obra de la Mona Lisa?",
        opciones: ["Pablo Picasso", "Vincent van Gogh", "Leonardo da Vinci", "Miguel Ángel"],
        correcta: "Leonardo da Vinci"
    }
];

let currentQuestions = [];
let currentIndex = 0;
let score = 0;

const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const scoreDisplay = document.getElementById("score");
const questionCountDisplay = document.getElementById("question-count");

function startGame() {
    // Seleccionar 5 preguntas al azar y barajarlas
    currentQuestions = [...allQuestions].sort(() => Math.random() - 0.5).slice(0, 5);
    currentIndex = 0;
    score = 0;
    scoreDisplay.textContent = score;
    loadQuestion();
}

function loadQuestion() {
    if (currentIndex < currentQuestions.length) {
        questionCountDisplay.textContent = currentIndex + 1;
        const q = currentQuestions[currentIndex];
        questionText.textContent = q.pregunta;

        // Limpiar opciones anteriores
        optionsContainer.innerHTML = "";

        // Mezclar las opciones de respuesta
        const shuffledOptions = [...q.opciones].sort(() => Math.random() - 0.5);

        shuffledOptions.forEach(option => {
            const btn = document.createElement("button");
            btn.classList.add("option-btn");
            btn.textContent = option;
            btn.addEventListener("click", () => checkAnswer(option, q.correcta));
            optionsContainer.appendChild(btn);
        });
    } else {
        // Pantalla final del juego
        questionText.textContent = `¡Juego terminado! Tu puntuación final es ${score} de 50 puntos.`;
        optionsContainer.innerHTML = `<button class="option-btn" onclick="startGame()" style="grid-column: span 2; background: #00f2fe; color: #000; font-weight: bold;">Jugar de Nuevo 🔄</button>`;
    }
}

function checkAnswer(selected, correct) {
    if (selected === correct) {
        score += 10;
        scoreDisplay.textContent = score;
        alert("🎉 ¡Correcto! ¡Muy bien!");
    } else {
        alert(`❌ ¡Fallaste! La respuesta correcta era: ${correct}`);
    }
    currentIndex++;
    loadQuestion();
}

// Iniciar el juego automáticamente al cargar la página
startGame();