document.addEventListener('DOMContentLoaded', () => {
    // Initialize EmailJS
    emailjs.init("YOUR_USER_ID"); // Replace with your actual User ID from EmailJS

    const questions = [
        {
            question: "George is ................ than Nick.",
            options: ["tall", "taller", "tallest"],
            correctAnswer: "taller"
        },
        {
            question: "What time ..... Calais tomorrow afternoon?",
            options: ["do the ferry reach", "is the ferry reaching", "does the ferry reach"],
            correctAnswer: "does the ferry reach"
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
            question: "Who is the president of USA?",
            options: ["Barak Obama", "Donald Trump", "Ali Jobirov", "Joe Biden"],
            correctAnswer: "Ali Jobirov"
        },
    ];

    let currentQuestionIndex = 0;
    let time = 10;
    let timerInterval;
    let correctAnswers = 0;
    let selectedAnswers = [];
    let userEmail = '';

    // DOM elements
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
        resultCorrectElement.textContent = correctAnswers; 

        reviewButton.style.display = 'block';
    }

    reviewButton.addEventListener('click', () => {
        resultContainer.style.display = 'none';
        showReview();
    });

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

    startButton.addEventListener('click', () => {
        if (fullnameInput.value.trim() === "" || emailInput.value.trim() === "") {
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
});
