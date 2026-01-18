function escapeHtml(text) {
    return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderStartScreen(onStart, onResume, hasProgress) {
    return `
        <div class="start-content">
            <h2>Welcome to the Quiz!</h2>
            <p>Test your knowledge with ${quizQuestions.length} questions.</p>
            <ul class="features-list">
                <li>✅ Immediate feedback</li>
                <li>✅ Progress tracking</li>
                <li>✅ Auto-save progress</li>
            </ul>
            <button class="btn btn-primary btn-large" id="startBtn">Start Quiz</button>
            ${hasProgress ? '<button class="btn btn-secondary" id="resumeBtn">Resume Quiz</button>' : ''}
        </div>
    `;
}

function renderProgressBar(current, total) {
    const percent = (current / total) * 100;
    return `
        <div class="progress-container">
            <div class="progress-text">${current} / ${total}</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${percent}%"></div>
            </div>
        </div>
    `;
}

function renderQuestion(question, questionNum, selectedAnswer, wasAnswered) {
    let optionsHtml = question.options.map((opt, i) => {
        let classes = 'option';
        let indicator = '';
        let disabled = '';
        
        if (selectedAnswer === i) classes += ' selected';
        
        if (wasAnswered) {
            disabled = 'disabled';
            if (i === question.correctAnswer) {
                classes += ' correct';
                indicator = '✓';
            } else if (selectedAnswer === i) {
                classes += ' incorrect';
                indicator = '✗';
            }
        }
        
        return `
            <label class="${classes}">
                <input type="radio" name="q${question.id}" value="${i}" 
                    ${selectedAnswer === i ? 'checked' : ''} ${disabled}>
                <span class="option-text">${escapeHtml(opt)}</span>
                <span class="option-indicator">${indicator}</span>
            </label>
        `;
    }).join('');

    return `
        <div class="question-card">
            <h2 class="question-number">Question ${questionNum}</h2>
            <p class="question-text">${question.question}</p>
            <div class="options-container">${optionsHtml}</div>
            <div class="feedback" id="feedback"></div>
        </div>
    `;
}

function renderNavigation(isFirst, isLast) {
    return `
        <div class="navigation">
            <button class="btn btn-secondary" id="prevBtn" ${isFirst ? 'disabled' : ''}>← Previous</button>
            ${isLast 
                ? '<button class="btn btn-success" id="submitBtn">Submit ✓</button>'
                : '<button class="btn btn-primary" id="nextBtn">Next →</button>'
            }
        </div>
    `;
}

function renderNavDots(questions, currentIndex, answers, isAnswered) {
    let dots = questions.map((q, i) => {
        let classes = 'nav-dot';
        if (i === currentIndex) classes += ' active';
        if (answers[q.id] !== undefined) {
            classes += ' answered';
            if (isAnswered[q.id]) {
                classes += answers[q.id] === q.correctAnswer ? ' correct-dot' : ' incorrect-dot';
            }
        }
        return `<button class="${classes}" data-index="${i}">${i + 1}</button>`;
    }).join('');

    return `
        <div class="question-navigator">
            <p>Jump to question:</p>
            <div class="nav-dots">${dots}</div>
        </div>
    `;
}

function renderFeedback(isCorrect, correctAnswer) {
    if (isCorrect) {
        return `<div class="feedback show correct">✓ Correct!</div>`;
    }
    return `<div class="feedback show incorrect">✗ Wrong! Answer: ${escapeHtml(correctAnswer)}</div>`;
}

function renderResults(score, total, questions, answers) {
    const percent = Math.round((score / total) * 100);
    let icon = '📚', message = 'Keep learning!';
    
    if (percent >= 80) { icon = '🏆'; message = 'Excellent!'; }
    else if (percent >= 60) { icon = '🎉'; message = 'Great job!'; }
    else if (percent >= 40) { icon = '💪'; message = 'Good effort!'; }

    let reviewHtml = questions.map((q, i) => {
        const userAns = answers[q.id];
        const isCorrect = userAns === q.correctAnswer;
        return `
            <div class="review-item ${isCorrect ? 'correct' : 'incorrect'}">
                <div class="review-question">${i + 1}. ${q.question}</div>
                <div class="review-answer">
                    Your answer: <strong>${userAns !== undefined ? escapeHtml(q.options[userAns]) : 'Not answered'}</strong>
                    ${!isCorrect ? `<br>Correct: <strong>${escapeHtml(q.options[q.correctAnswer])}</strong>` : ''}
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="results-content">
            <div class="results-icon">${icon}</div>
            <h2>Quiz Complete!</h2>
            <div class="score-display">
                <div class="score-circle">
                    <span class="score-number">${score}</span>
                    <span class="score-total">/ ${total}</span>
                </div>
            </div>
            <p class="score-message">${message}</p>
            <p class="score-percentage">You scored ${percent}%</p>
            <div class="answer-review">
                <h3>Review:</h3>
                <div class="review-list">${reviewHtml}</div>
            </div>
            <button class="btn btn-primary btn-large" id="restartBtn">🔄 Try Again</button>
        </div>
    `;
}
