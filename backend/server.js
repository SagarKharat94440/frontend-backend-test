const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let courses = {};
let userProgress = {};

const authMiddleware = (req, res, next) => {
    if (req.headers['x-api-key'] !== 'my-secret-key-123') {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    next();
};

app.use('/courses', authMiddleware);

const generateId = () => 'course_' + Date.now();

const validateCourse = (data) => {
    if (!data.title) return 'Title required';
    if (!data.lessons || !Array.isArray(data.lessons)) return 'Lessons array required';
    for (let i = 0; i < data.lessons.length; i++) {
        if (!data.lessons[i].lessonId || !data.lessons[i].title) {
            return `Lesson ${i + 1}: lessonId and title required`;
        }
    }
    return null;
};

const getQuizScore = (course, progressData) => {
    if (!progressData?.quizAnswers) return { correct: 0, total: 0, percentage: 0 };
    let total = 0, correct = 0;
    course.lessons.forEach(lesson => {
        (lesson.quizQuestions || []).forEach(q => {
            total++;
            if (progressData.quizAnswers[q.questionId] === q.correctAnswer) correct++;
        });
    });
    return { correct, total, percentage: total ? Math.round((correct / total) * 100) : 0 };
};

app.post('/courses', (req, res) => {
    const error = validateCourse(req.body);
    if (error) return res.status(400).json({ success: false, error });

    const id = generateId();
    courses[id] = {
        id,
        title: req.body.title,
        description: req.body.description || '',
        lessons: req.body.lessons.map(l => ({
            lessonId: l.lessonId,
            title: l.title,
            content: l.content || '',
            quizQuestions: l.quizQuestions || []
        })),
        createdAt: new Date().toISOString()
    };

    res.status(201).json({ success: true, data: courses[id] });
});

app.get('/courses', (req, res) => {
    const list = Object.values(courses).map(c => ({
        id: c.id, title: c.title, lessonCount: c.lessons.length
    }));
    res.json({ success: true, data: list });
});

app.get('/courses/:id', (req, res) => {
    const course = courses[req.params.id];
    if (!course) return res.status(404).json({ success: false, error: 'Course not found' });
    res.json({ success: true, data: course });
});

app.post('/courses/:id/progress', (req, res) => {
    const { userId, lessonId, quizAnswers } = req.body;

    if (!userId) return res.status(400).json({ success: false, error: 'userId required' });
    if (!lessonId) return res.status(400).json({ success: false, error: 'lessonId required' });

    const course = courses[req.params.id];
    if (!course) return res.status(404).json({ success: false, error: 'Course not found' });

    if (!course.lessons.find(l => l.lessonId === lessonId)) {
        return res.status(404).json({ success: false, error: 'Lesson not found' });
    }

    const key = `${req.params.id}_${userId}`;
    if (!userProgress[key]) {
        userProgress[key] = { courseId: req.params.id, userId, completedLessons: [], quizAnswers: {} };
    }

    if (!userProgress[key].completedLessons.includes(lessonId)) {
        userProgress[key].completedLessons.push(lessonId);
    }

    if (quizAnswers) {
        userProgress[key].quizAnswers = { ...userProgress[key].quizAnswers, ...quizAnswers };
    }

    res.json({ success: true, data: { ...userProgress[key], quizScore: getQuizScore(course, userProgress[key]) } });
});

app.get('/courses/:id/progress/:userId', (req, res) => {
    const course = courses[req.params.id];
    if (!course) return res.status(404).json({ success: false, error: 'Course not found' });

    const progress = userProgress[`${req.params.id}_${req.params.userId}`];
    if (!progress) return res.status(404).json({ success: false, error: 'Progress not found' });

    res.json({
        success: true,
        data: {
            ...progress,
            totalLessons: course.lessons.length,
            completionPercent: Math.round((progress.completedLessons.length / course.lessons.length) * 100),
            quizScore: getQuizScore(course, progress)
        }
    });
});

app.use((req, res) => res.status(404).json({ success: false, error: 'Route not found' }));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('API Key: my-secret-key-123');
});
