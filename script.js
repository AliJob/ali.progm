document.addEventListener('DOMContentLoaded', () => {
    // Initialize EmailJS
    emailjs.init("service_6qqeibt"); 

    let currentQuestionIndex = 0;
    let time = 10;
    let timerInterval;
    let correctAnswers = 0;
    let selectedAnswers = [];

    // DOM элементы
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
    const reviewButton = document.getElementById('review-button');
    const reviewContainer = document.getElementById('review-container');
    const fullnameInput = document.getElementById('fullname');
    const emailInput = document.getElementById('email');

    // Функция таймера для каждого вопроса
    function startTimer() {
        time = 10;
        timeElement.textContent = time;
        timerInterval = setInterval(() => {
            time--;
            timeElement.textContent = time;
            if (time <= 0) {
                clearInterval(timerInterval);
                selectedAnswers[currentQuestionIndex] = 'Not Answered';
                nextQuestion();
            }
        }, 1000);
    }

    // Функция отображения вопроса
    function showQuestion() {
        clearInterval(timerInterval);
        startTimer();

        const currentQuestion = questions[currentQuestionIndex];
        questionElement.textContent = currentQuestion.question;

        optionsElement.innerHTML = '';
        currentQuestion.options.forEach((option) => {
            const button = document.createElement('button');
            button.textContent = option;
            button.onclick = () => selectAnswer(option);
            optionsElement.appendChild(button);
        });
    }

    // Функция обработки выбранного ответа
    function selectAnswer(selectedOption) {
        clearInterval(timerInterval);
        const currentQuestion = questions[currentQuestionIndex];
        selectedAnswers[currentQuestionIndex] = selectedOption;

        if (selectedOption === currentQuestion.correctAnswer) {
            correctAnswers++;
        }
        nextQuestion();
    }

    // Переход к следующему вопросу или отображение результатов
    function nextQuestion() {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            showQuestion();
        } else {
            showResult();
        }
    }

    // Функция отображения результатов теста
    function showResult() {
        questionContainer.style.display = 'none';
        resultContainer.style.display = 'block';
        resultFullname.textContent = fullnameInput.value;
        resultCorrectElement.textContent = correctAnswers; 
        reviewButton.style.display = 'block';

        // Отправляем результаты теста по email
        sendTestResults();
    }

    // Функция отправки результатов теста через EmailJS
    function sendTestResults() {
        const fullname = fullnameInput.value;
        const email = emailInput.value;
        const templateParams = {
            fullname: fullname,
            email: email,
            correctAnswers: correctAnswers
        };

       
        emailjs.send("service_6qqeibt", "template_wmbckja", templateParams)
            .then(function(response) {
                console.log('SUCCESS!', response.status, response.text);
                // Можно добавить уведомление для пользователя об успешной отправке письма
            }, function(error) {
                console.error('FAILED...', error);
                // Обработка ошибок отправки
            });
    }

    // Обработчик кнопки просмотра результатов теста (ревью)
    reviewButton.addEventListener('click', () => {
        resultContainer.style.display = 'none';
        showReview();
    });

    // Функция для отображения ревью теста
    function showReview() {
        reviewContainer.innerHTML = '';
        questions.forEach((question, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.classList.add('no-copy');
            questionDiv.innerHTML = `
                <p><strong>${question.question}</strong></p>
                <p>Your answer: ${selectedAnswers[index] || 'Not answered'}</p>
                <p>Correct answer: ${question.correctAnswer}</p>
            `;
            reviewContainer.appendChild(questionDiv);
        });
        reviewContainer.style.display = 'block';
    }

    // Запуск теста при клике на кнопку "Start Test"
    startButton.addEventListener('click', () => {
        if (fullnameInput.value.trim() === "" || emailInput.value.trim() === "") {
            alert("Please enter both your full name and email!");
            return;
        }
        introContainer.style.display = 'none';
        infoWindow.style.display = 'block';
    });

    // Обработчик для перехода к вопросам после окна с инструкциями
    okButton.addEventListener('click', () => {
        infoWindow.style.display = 'none';
        questionContainer.style.display = 'block';
        showQuestion();
    });
});
