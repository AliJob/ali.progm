// script.js
document.addEventListener('DOMContentLoaded', () => {
    let currentQuestionIndex = 0;
    let time = 10;
    let timerInterval;
    let correctAnswers = 0;
    let testCompleted = false;

    const questionContainer = document.getElementById('question-container');
    const questionElement = document.getElementById('question');
    const optionsElement = document.getElementById('options');
    const timeElement = document.getElementById('time');
    const startButton = document.getElementById('start-button');
    const infoWindow = document.getElementById('info-window');
    const okButton = document.getElementById('ok-button');
    const introContainer = document.getElementById('intro');
    const resultContainer = document.getElementById('result');
    const resultCorrectElement = document.getElementById('correct-answers');
    const resultFullname = document.getElementById('result-fullname');
    const doneButton = document.getElementById('done-button');
    const fullnameInput = document.getElementById('fullname');
    const emailInput = document.getElementById('email');

    
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw_e3rS0_uS4vz8Tyr60seUZMozIJ73v0qxm524eNt56_ONAi9FSM0gw1JKPtAOfx_2/exec";

    // Обновляем инструкции
    document.querySelector('#info-window p').innerHTML =
        `The test consists of <strong>${questions.length} questions</strong>. Each question must be answered within <strong>10 seconds</strong>.`;

    // Проверка: уже проходил?
    function checkIfAlreadyTaken() {
        const savedEmail = localStorage.getItem('englishTestEmail');
        const savedScore = localStorage.getItem('englishTestScore');
        const savedDate = localStorage.getItem('englishTestDate');

        if (savedEmail && savedScore) {
            introContainer.style.display = 'none';
            resultContainer.style.display = 'block';
            resultFullname.textContent = `Student: ${savedEmail}`;
            resultCorrectElement.textContent = `${savedScore} out of ${questions.length}`;
            doneButton.disabled = true;
            doneButton.textContent = 'Already Taken';
            alert(`You already took the test!\nScore: ${savedScore}/${questions.length}\nDate: ${savedDate}`);
            return true;
        }
        return false;
    }

    // Сохранить результат локально
    function saveTestResult() {
        localStorage.setItem('englishTestEmail', emailInput.value.trim());
        localStorage.setItem('englishTestScore', correctAnswers);
        localStorage.setItem('englishTestDate', new Date().toLocaleDateString());
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function startTimer() {
        time = 15;
        timeElement.textContent = time;
        timerInterval = setInterval(() => {
            time--;
            timeElement.textContent = time;
            if (time <= 0) {
                clearInterval(timerInterval);
                nextQuestion();
            }
        }, 1000);
    }

    function showQuestion() {
        clearInterval(timerInterval);
        startTimer();
        const currentQuestion = questions[currentQuestionIndex];
        questionElement.textContent = `${currentQuestionIndex + 1}. ${currentQuestion.question}`;
        optionsElement.innerHTML = '';
        const shuffledOptions = [...currentQuestion.options];
        shuffleArray(shuffledOptions);
        shuffledOptions.forEach((option) => {
            const button = document.createElement('button');
            button.textContent = option;
            button.onclick = () => selectAnswer(option);
            optionsElement.appendChild(button);
        });
    }

    function selectAnswer(selectedOption) {
        clearInterval(timerInterval);
        const currentQuestion = questions[currentQuestionIndex];
        if (selectedOption === currentQuestion.correctAnswer) correctAnswers++;
        nextQuestion();
    }

    function nextQuestion() {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            showQuestion();
        } else {
            showResult();
        }
    }

    function showResult() {
        questionContainer.style.display = 'none';
        resultContainer.style.display = 'block';
        resultFullname.textContent = `Student: ${fullnameInput.value}`;
        resultCorrectElement.textContent = `${correctAnswers} out of ${questions.length}`;
        clearInterval(timerInterval);
        sendToGoogleSheet(); // отправляем автоматически
    }

    let sending = false;
    let submissionId = null;

    const sleep = ms => new Promise(r => setTimeout(r, ms));

    // Чтение ответа без CORS (через <script>) — работает на любых телефонах
    function jsonp(url, timeoutMs = 8000) {
        return new Promise((resolve, reject) => {
            const cb = 'cb_' + Date.now() + '_' + Math.floor(Math.random() * 1e6);
            const script = document.createElement('script');
            const cleanup = () => { clearTimeout(timer); delete window[cb]; script.remove(); };
            const timer = setTimeout(() => { cleanup(); reject(new Error('timeout')); }, timeoutMs);
            window[cb] = data => { cleanup(); resolve(data); };
            script.onerror = () => { cleanup(); reject(new Error('script error')); };
            script.src = url + (url.includes('?') ? '&' : '?') + 'callback=' + cb;
            document.head.appendChild(script);
        });
    }

    function makeId() {
        return (window.crypto && crypto.randomUUID)
            ? crypto.randomUUID()
            : 'id' + Date.now() + Math.random().toString(36).slice(2);
    }

    // Возвращает 'saved' | 'taken' | 'failed'
    async function submitResult(body, email) {
        for (let attempt = 1; attempt <= 3; attempt++) {
            // 1. Отправка (ответ не читаем — так надёжнее)
            try {
                await fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', body });
            } catch (err) {
                console.warn('POST error (attempt ' + attempt + '):', err);
            }
            // 2. Проверка: действительно ли результат записался
            try {
                const checkUrl = SCRIPT_URL + '?action=check'
                    + '&id=' + encodeURIComponent(submissionId)
                    + '&email=' + encodeURIComponent(email);
                const res = await jsonp(checkUrl);
                console.log('Check:', res);
                if (res.status === 'saved') return 'saved';
                if (res.status === 'taken') return 'taken';
            } catch (err) {
                console.warn('Check error (attempt ' + attempt + '):', err);
            }
            await sleep(1500 * attempt);
        }
        return 'failed';
    }

    async function sendToGoogleSheet() {
        if (testCompleted || sending) return;
        sending = true;
        if (!submissionId) submissionId = makeId();

        doneButton.disabled = true;
        doneButton.textContent = 'Sending...';

        const email = emailInput.value.trim();
        const body = new URLSearchParams({
            fullname: fullnameInput.value.trim(),
            email: email,
            correctAnswers: correctAnswers.toString(),
            totalQuestions: questions.length.toString(),
            submissionId: submissionId
        });

        const status = await submitResult(body, email);
        sending = false;

        if (status === 'saved') {
            doneButton.textContent = 'Result sent ✓';
            saveTestResult();
            testCompleted = true;
        } else if (status === 'taken') {
            doneButton.textContent = 'Already Taken';
            alert('This email has already taken the test!');
        } else {
            alert('Could not confirm that the result was saved. Check your connection and press "Retry sending".');
            doneButton.disabled = false;
            doneButton.textContent = 'Retry sending';
        }
    }

    // === Проверка email ===
    const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i;
    const COMMON_TYPOS = {
        'gmail.co': 'gmail.com', 'gmail.con': 'gmail.com', 'gmail.cm': 'gmail.com',
        'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gamil.com': 'gmail.com',
        'gmail.ru': 'gmail.com', 'gmaill.com': 'gmail.com',
        'mail.ry': 'mail.ru', 'mail.ri': 'mail.ru', 'mal.ru': 'mail.ru',
        'yandex.ry': 'yandex.ru', 'yaho.com': 'yahoo.com', 'yahho.com': 'yahoo.com',
        'outlok.com': 'outlook.com', 'hotmial.com': 'hotmail.com'
    };

    // Возвращает true, если email можно принять
    function validateEmail(email) {
        if (!EMAIL_RE.test(email)) {
            alert('Please enter a valid email address (for example: name@gmail.com).');
            return false;
        }
        const domain = email.split('@')[1].toLowerCase();
        const fix = COMMON_TYPOS[domain];
        if (fix) {
            const suggested = email.split('@')[0] + '@' + fix;
            if (confirm(`Is your email correct?\n\n${email}\n\nPress Cancel to fix it (maybe you meant ${suggested}).\nPress OK if it is correct.`)) {
                return true;
            }
            emailInput.focus();
            return false;
        }
        return true;
    }

    // === СТАРТ ===
    startButton.addEventListener('click', () => {
        const fullname = fullnameInput.value.trim();
        const email = emailInput.value.trim();

        if (!fullname || !email) {
            alert("Please enter both your full name and email!");
            return;
        }

        if (!validateEmail(email)) return;

        if (checkIfAlreadyTaken()) return;

        introContainer.style.display = 'none';
        infoWindow.style.display = 'block';
    });

    okButton.addEventListener('click', () => {
        infoWindow.style.display = 'none';
        questionContainer.style.display = 'block';
        showQuestion();
    });

    doneButton.addEventListener('click', sendToGoogleSheet);

    // Проверка при загрузке
    if (checkIfAlreadyTaken()) {
        // Уже проходил
    }
});
