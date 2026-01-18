let state = {
    currentQuestion: 0,
    answers: {},
    isAnswered: {},
    score: 0
};

const screens = {
    start: document.getElementById('startScreen'),
    quiz: document.getElementById('quizScreen'),
    results: document.getElementById('resultsScreen')
};

function showScreen(name) {
    Object.keys(screens).forEach(key => {
        screens[key].style.display = key === name ? 'block' : 'none';
    });
}

function renderQuizScreen() {
    const q = quizQuestions[state.currentQuestion];
    const num = state.currentQuestion + 1;
    const total = quizQuestions.length;
    
    screens.quiz.innerHTML = 
        renderProgressBar(num, total) +
        renderQuestion(q, num, state.answers[q.id], state.isAnswered[q.id]) +
        renderNavigation(state.currentQuestion === 0, state.currentQuestion === total - 1) +
        renderNavDots(quizQuestions, state.currentQuestion, state.answers, state.isAnswered);
    
    if (state.isAnswered[q.id]) {
        const feedback = document.getElementById('feedback');
        const isCorrect = state.answers[q.id] === q.correctAnswer;
        feedback.outerHTML = renderFeedback(isCorrect, q.options[q.correctAnswer]);
    }
    
    attachQuizEvents();
}

function attachQuizEvents() {
    const q = quizQuestions[state.currentQuestion];
    
    document.querySelectorAll('.option input').forEach(input => {
        input.addEventListener('change', () => selectAnswer(parseInt(input.value)));
    });
    
    document.getElementById('prevBtn')?.addEventListener('click', () => {
        if (state.currentQuestion > 0) {
            state.currentQuestion--;
            saveProgress(state);
            renderQuizScreen();
        }
    });
    
    document.getElementById('nextBtn')?.addEventListener('click', () => {
        if (state.currentQuestion < quizQuestions.length - 1) {
            state.currentQuestion++;
            saveProgress(state);
            renderQuizScreen();
        }
    });
    
    document.getElementById('submitBtn')?.addEventListener('click', showResults);
    
    document.querySelectorAll('.nav-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            state.currentQuestion = parseInt(dot.dataset.index);
            saveProgress(state);
            renderQuizScreen();
        });
    });
}

function selectAnswer(index) {
    const q = quizQuestions[state.currentQuestion];
    state.answers[q.id] = index;
    state.isAnswered[q.id] = true;
    saveProgress(state);
    renderQuizScreen();
}

function showResults() {
    let score = 0;
    quizQuestions.forEach(q => {
        if (state.answers[q.id] === q.correctAnswer) score++;
    });
    
    screens.results.innerHTML = renderResults(score, quizQuestions.length, quizQuestions, state.answers);
    showScreen('results');
    clearProgress();
    
    document.getElementById('restartBtn').addEventListener('click', restartQuiz);
}

function startQuiz(resume = false) {
    if (resume) {
        const saved = loadProgress();
        if (saved) {
            state.currentQuestion = saved.currentQuestion;
            state.answers = saved.answers;
            state.isAnswered = saved.isAnswered;
        }
    } else {
        state = { currentQuestion: 0, answers: {}, isAnswered: {}, score: 0 };
        clearProgress();
    }
    showScreen('quiz');
    renderQuizScreen();
}

function restartQuiz() {
    state = { currentQuestion: 0, answers: {}, isAnswered: {}, score: 0 };
    clearProgress();
    init();
}

function init() {
    const hasProgress = hasSavedProgress();
    screens.start.innerHTML = renderStartScreen(startQuiz, startQuiz, hasProgress);
    showScreen('start');
    
    document.getElementById('startBtn').addEventListener('click', () => startQuiz(false));
    document.getElementById('resumeBtn')?.addEventListener('click', () => startQuiz(true));
}

document.addEventListener('keydown', (e) => {
    if (screens.quiz.style.display === 'none') return;
    
    if (e.key === 'ArrowRight') document.getElementById('nextBtn')?.click();
    if (e.key === 'ArrowLeft') document.getElementById('prevBtn')?.click();
    if (['a','b','c','d'].includes(e.key.toLowerCase())) {
        const idx = e.key.toLowerCase().charCodeAt(0) - 97;
        const inputs = document.querySelectorAll('.option input:not(:disabled)');
        if (inputs[idx]) { inputs[idx].checked = true; selectAnswer(idx); }
    }
});

init();
