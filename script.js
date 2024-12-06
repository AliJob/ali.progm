document.addEventListener('DOMContentLoaded', () => {
    const questions = [
        {
            question: "George is ................ than Nick.",
            options: ["tall", "taller", "tallest"],
            correctAnswer: "taller"
        },
        {
            question: "What time ..... Calais tomorrow afternoon?",
            options: ["do the ferry reach ", "is the ferry reaching", "does the ferry reach"],
            correctAnswer: "do the ferry reach "
        },
        {
            question: "My friend ..................... lives in Australia is a nurse.",
            options: ["who", "which", "whose"],
            correctAnswer: "who"
        },
        {
            question: "I like walking in the park ............. hot days.",
            options: ["at", "on", "in"],
            correctAnswer: "in"
        },
        {
            question: "Centuries ago, people .......... animals for food.",
            options: ["transport", "played", "hunted"],
            correctAnswer: "hunted"
        },
        {
            question: "If he ................... the lottery, he'll go on a round-the-world trip",
            options: ["won", "wins", "will win"],
            correctAnswer: "wins"
        },
        {
            question: "Who is the president of USA",
            options: ["Alisher Jobirov", "Donald Trump", "Ali", "Jobirov"],
            correctAnswer: "Ali"
        },
    ];

    let currentQuestionIndex = 0;
    let time = 10;
    let timerInterval;
    let correctAnswers = 0;
    let selectedAnswers = [];
    let userEmail = '';

    // DOM элементы
    const questionContainer = document.getElementById('question-container');
    const questionElement = document.getElementById('question');
    const optionsElement = document.getElementById('options');
    const timeElement = document.getElementById('time');
    const startButton = document.getElementById('start-button');
    const introContainer = document.getElementById('intro');
    const resultContainer = document.getElementById('result');
    const fullnameInput = document.getElementById('fullname');
    const emailInput = document.getElementById('email');
    const resultFullname = document.getElementById('result-fullname');
    const resultCorrect = document.getElementById('result-correct');
    const reviewButton = document.getElementById('review-button');
    const reviewAnswersButton = document.getElementById('review-answers-button');
    const reviewContainer = document.getElementById('review-container');

    function startTimer() {
        time = 10;
        timeElement.textContent = time;
        timerInterval = setInterval(() => {
            time--;
            timeElement.textContent = time;
            if (time <= 0) {
                clearInterval(timerInterval);
                alert("Время вышло!");
                nextQuestion();
            }
        }, 1000);
    }

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

    function selectAnswer(selectedOption) {
        clearInterval(timerInterval);
        const currentQuestion = questions[currentQuestionIndex];
        selectedAnswers[currentQuestionIndex] = selectedOption;

        if (selectedOption === currentQuestion.correctAnswer) {
            correctAnswers++;
            alert("Правильный ответ!");
        } else {
            alert("Неправильный ответ!");
        }
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
        resultFullname.textContent = fullnameInput.value;
        resultCorrect.textContent = correctAnswers;

        // Автоматическая отправка результатов на почту
        sendResultsToEmail();

        reviewButton.style.display = 'block';
        reviewAnswersButton.style.display = 'block'; // Показать кнопку для просмотра
    }

    function sendResultsToEmail() {
        const templateParams = {
            from_email: "your_email@example.com", // Замените на ваш email
            to_email: userEmail,
            fullname: fullnameInput.value,
            correct_answers: correctAnswers,
            questions: questions.map((q, index) => ({
                question: q.question,
                userAnswer: selectedAnswers[index] || 'Не выбран',
                correctAnswer: q.correctAnswer
            }))
        };

        emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
            .then(function(response) {
                console.log('SUCCESS!', response.status, response.text);
            }, function(error) {
                console.log('FAILED...', error);
                alert("Не удалось отправить результаты на почту. Попробуйте снова.");
            });
    }

    reviewButton.addEventListener('click', () => {
        resultContainer.style.display = 'none';
        showReview();
    });

    reviewAnswersButton.addEventListener('click', () => {
        resultContainer.style.display = 'none';
        showAnswersReview();
    });

    function showReview() {
        reviewContainer.innerHTML = '';
        questions.forEach((question, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.innerHTML = `
                <p><strong>${question.question}</strong></p>
                <p>Ваш ответ: ${selectedAnswers[index] || 'Не выбран'}</p>
                <p>Правильный ответ: ${question.correctAnswer}</p>
            `;
            reviewContainer.appendChild(questionDiv);
        });
        reviewContainer.style.display = 'block';
    }

    function showAnswersReview() {
        reviewContainer.innerHTML = '';
        questions.forEach((question, index) => {
            const questionDiv = document.createElement('div');
            const isCorrect = selectedAnswers[index] === question.correctAnswer;

            questionDiv.innerHTML = `
                <p><strong>${question.question}</strong></p>
                <p style="color: ${isCorrect ? 'green' : 'red'};">Ваш ответ: <strong>${selectedAnswers[index] || 'Не выбран'}</strong></p>
                <p>Правильный ответ: <strong>${question.correctAnswer}</strong></p>
                ${!isCorrect ? "<p style='color: red;'>Вы допустили ошибку в этом вопросе.</p>" : ""}
            `;
            reviewContainer.appendChild(questionDiv);
        });
        reviewContainer.style.display = 'block';
    }

    startButton.addEventListener('click', () => {
        userEmail = emailInput.value.trim();
        if (fullnameInput.value.trim() === "" || userEmail === "") {
            alert("Пожалуйста, введите ваше ФИО и email!");
            return;
        }
        introContainer.style.display = 'none';
        questionContainer.style.display = 'block';
        showQuestion();
    });
});
