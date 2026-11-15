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

    
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxGdOYR3BVR1__wvLqAbqVkYmMH4icpqb76dGBo50PYlPOq-TNKuAgfR_EIc66dx_X1/exec";

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
        time = 10;
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

    function sendToGoogleSheet() {
        if (testCompleted || sending) return;
        sending = true;

        doneButton.disabled = true;
        doneButton.textContent = 'Sending...';

        const body = new URLSearchParams({
            fullname: fullnameInput.value.trim(),
            email: emailInput.value.trim(),
            correctAnswers: correctAnswers.toString(),
            totalQuestions: questions.length.toString()
        });

        console.log('Sending:', body.toString());

        // Без no-cors, чтобы можно было прочитать ответ сервера
        fetch(SCRIPT_URL, { method: 'POST', body })
            .then(res => res.json())
            .then(result => {
                console.log('Server response:', result);
                sending = false;
                if (result.status === 'success') {
                    doneButton.textContent = 'Result sent ✓';
                    saveTestResult();
                    testCompleted = true;
                } else if (/already taken/i.test(result.message || '')) {
                    doneButton.textContent = 'Already Taken';
                    alert(result.message);
                } else {
                    alert(result.message || 'Server error. Press the button to try again.');
                    doneButton.disabled = false;
                    doneButton.textContent = 'Retry sending';
                }
            })
            .catch(err => {
                console.error('Send failed:', err);
                sending = false;
                alert('Failed to send the result. Check your connection and press "Retry sending".');
                doneButton.disabled = false;
                doneButton.textContent = 'Retry sending';
            });
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