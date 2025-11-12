// script.js
document.addEventListener('DOMContentLoaded', () => {
    let currentQuestionIndex = 0;
    let time = 10;
    let timerInterval;
    let correctAnswers = 0;
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

    // ВАЖНО: Замените на ваш актуальный URL
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwXBo6mY37Jvntmo02qGNga7GXC5QkEIgnby8HK_kxrvxjuCBjM4KVJu1qwv4kBTUIV2Q/exec";

    // Обновляем инструкции
    document.querySelector('#info-window p').innerHTML =
        `The test consists of <strong>${questions.length} questions</strong>. Each question must be answered within <strong>10 seconds</strong>.`;

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
    }

   // script.js (в sendToGoogleSheet)
function sendToGoogleSheet() {
    const data = {
        fullname: fullnameInput.value.trim(),
        email: emailInput.value.trim(),
        correctAnswers: correctAnswers.toString(),
        totalQuestions: questions.length.toString()
    };

    console.log('Sending:', data);

    // Используем FormData + no-cors
    const formData = new FormData();
    for (const key in data) {
        formData.append(key, data[key]);
    }

    fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',  // Без этого — CORS блок
        body: formData
    })
    .then(() => {
        alert('Results sent successfully!');
    })
    .catch(err => {
        console.error('Send failed:', err);
        alert('Failed to send. Check internet connection.');
    });
}

    startButton.addEventListener('click', () => {
        if (!fullnameInput.value.trim() || !emailInput.value.trim()) {
            alert("Please enter both your full name and email!");
            return;
        }
        introContainer.style.display = 'none';
        infoWindow.style.display = 'block';
    });

    okButton.addEventListener('click', () => {
        infoWindow.style.display = 'none';
        questionContainer.style.display = 'block';
        showQuestion();
    });

    doneButton.addEventListener('click', sendToGoogleSheet);
});
