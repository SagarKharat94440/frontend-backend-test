const STORAGE_KEY = 'quizProgress';

function saveProgress(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentQuestion: state.currentQuestion,
        answers: state.answers,
        isAnswered: state.isAnswered
    }));
}

function loadProgress() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
}

function clearProgress() {
    localStorage.removeItem(STORAGE_KEY);
}

function hasSavedProgress() {
    const saved = loadProgress();
    return saved && Object.keys(saved.answers).length > 0;
}
