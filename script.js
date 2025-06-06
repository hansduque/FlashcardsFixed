
// ===== Data and Initialization =====
let flashcards = JSON.parse(localStorage.getItem("flashcards")) || [
  { question: "What is the capital of France?", answer: "Paris", category: "Geography" },
  { question: "What is 2 + 2?", answer: "4", category: "Math" },
  { question: "Who wrote '1984'?", answer: "George Orwell", category: "Literature" },
  { question: "What is the largest ocean?", answer: "Pacific Ocean", category: "Geography" },
  { question: "What is the capital of Spain?", answer: "Madrid", category: "Geography" },
  { question: "Which is the best national soccer team in history?", answer: "Brazil", category: "Sports" },
  { question: "Who was the last American Nobel Peace Price winer?", answer: "Barack Obama", category: "Politics" }
];

let currentCategory = "all";
let selectedCategory = "";
let quizQuestions = [];
let currentQuestionIndex = 0;
let totalQuestions = 0;
let correctAnswers = 0;

// ===== DOM Elements =====
const flashcardContainer = document.getElementById("flashcardContainer");
const form = document.getElementById("flashcardForm");
const questionInput = document.getElementById("questionInput");
const answerInput = document.getElementById("answerInput");
const categoryInput = document.getElementById("categoryInput");
const shuffleButton = document.getElementById("shuffleButton");
const clearButton = document.getElementById("clearButton");
const exportButton = document.getElementById("exportButton");
const importFile = document.getElementById("importFile");
const categoryFilter = document.getElementById("categoryFilter");
const themeToggle = document.getElementById("themeToggle");
const startQuizButton = document.getElementById("startQuizButton");
const quizContainer = document.getElementById("quizContainer");

// ===== Utility Functions =====
function saveFlashcards() {
  localStorage.setItem("flashcards", JSON.stringify(flashcards));
}

function renderFlashcards() {
  flashcardContainer.innerHTML = "";
  const filtered = currentCategory === "all"
    ? flashcards
    : flashcards.filter(card => card.category === currentCategory);

  filtered.forEach(card => {
    const flashcard = document.createElement("div");
    flashcard.className = "flashcard";

    const inner = document.createElement("div");
    inner.className = "flashcard-inner";

    const front = document.createElement("div");
    front.className = "front";
    front.innerHTML = `<p>${card.question}</p>`;

    const back = document.createElement("div");
    back.className = "back";
    back.innerHTML = `<p>${card.answer}</p>`;

    inner.appendChild(front);
    inner.appendChild(back);
    flashcard.appendChild(inner);
    flashcardContainer.appendChild(flashcard);
  });

  updateCategoryFilter();
}

function updateCategoryFilter() {
  const categories = ["all", ...new Set(flashcards.map(card => card.category))];
  categoryFilter.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join("");
  categoryFilter.value = currentCategory;
}

function resetFlashcards() {
  localStorage.removeItem("flashcards");
  flashcards = [
    { question: "What is the capital of France?", answer: "Paris", category: "Geography" },
    { question: "What is 2 + 2?", answer: "4", category: "Math" },
    { question: "Who wrote '1984'?", answer: "George Orwell", category: "Literature" },
    { question: "What is the largest ocean?", answer: "Pacific Ocean", category: "Geography" },
    { question: "What is the capital of Spain?", answer: "Madrid", category: "Geography" },
    { question: "Which is the best national soccer team in history?", answer: "Brazil", category: "Sports" },
    { question: "Who was the last American Nobel Peace Price winer?", answer: "Barack Obama", category: "Politics" }
  ];
  currentCategory = "all";
  saveFlashcards();
  renderFlashcards();
}

// ===== Event Listeners =====
form.addEventListener("submit", e => {
  e.preventDefault();
  const newCard = {
    question: questionInput.value,
    answer: answerInput.value,
    category: categoryInput.value || "General"
  };
  flashcards.push(newCard);
  saveFlashcards();
  renderFlashcards();
  form.reset();
});

shuffleButton.addEventListener("click", () => {
  flashcards.sort(() => Math.random() - 0.5);
  renderFlashcards();
});

clearButton.addEventListener("click", resetFlashcards);

exportButton.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(flashcards, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "flashcards.json";
  link.click();
});

importFile.addEventListener("change", e => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      flashcards = imported;
      saveFlashcards();
      renderFlashcards();
    } catch {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
});

categoryFilter.addEventListener("change", e => {
  currentCategory = e.target.value;
  renderFlashcards();
});

themeToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark-mode", themeToggle.checked);
});

// ===== Quiz Mode (Enhanced) =====
startQuizButton.addEventListener("click", () => {
  startQuiz(currentCategory);
});

function startQuiz(category) {
  selectedCategory = category;
  quizQuestions = (selectedCategory === "all"
    ? [...flashcards]
    : flashcards.filter(card => card.category === selectedCategory)
  ).sort(() => Math.random() - 0.5);

  if (quizQuestions.length === 0) {
    alert("No flashcards in this category to quiz.");
    return;
  }

  currentQuestionIndex = 0;
  totalQuestions = 0;
  correctAnswers = 0;

  flashcardContainer.style.display = "none";
  quizContainer.style.display = "block";

  showQuestion();
}

function showQuestion() {
  const card = quizQuestions[currentQuestionIndex];
  const options = shuffleOptions(card);

  quizContainer.innerHTML = `
    <h2>${card.question}</h2>
    <div id="options-container">
      ${options.map(option => `
        <button class="option-btn" onclick="checkAnswer(this, '${card.answer}', '${option}')">
          ${option}
        </button>
      `).join('')}
    </div>
  `;
}

function shuffleOptions(card) {
  const options = [card.answer];
  const wrongAnswers = flashcards
    .map(c => c.answer)
    .filter(ans => ans !== card.answer);
  options.push(...wrongAnswers.sort(() => Math.random() - 0.5).slice(0, 3));
  return options.sort(() => Math.random() - 0.5);
}

function checkAnswer(button, correctAnswer, selectedOption) {
  totalQuestions++;

  const buttons = document.querySelectorAll(".option-btn");
  buttons.forEach(btn => btn.disabled = true);

  if (selectedOption === correctAnswer) {
    correctAnswers++;
    button.classList.add("correct");
  } else {
    button.classList.add("wrong");
    buttons.forEach(btn => {
      if (btn.innerText === correctAnswer) {
        btn.classList.add("correct");
      }
    });
  }

  setTimeout(() => {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizQuestions.length) {
      showQuestion();
    } else {
      showResults();
    }
  }, 1200);
}

function showResults() {
  quizContainer.innerHTML = `
    <h2>Quiz Complete!</h2>
    <p>You scored ${correctAnswers} out of ${totalQuestions}.</p>
    <button id="restartQuizButton">Restart Quiz</button>
    <button id="backToFlashcardsButton">Back to Flashcards</button>
  `;

  document.getElementById("restartQuizButton").addEventListener("click", () => {
    startQuiz(selectedCategory);
  });

  document.getElementById("backToFlashcardsButton").addEventListener("click", () => {
    quizContainer.style.display = "none";
    flashcardContainer.style.display = "flex";
    renderFlashcards();
  });
}

// ===== Initial Render =====
renderFlashcards();
