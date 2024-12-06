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
    const reviewContainer = document.getElementById('review-container');

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

        const feedback = document.createElement('p');
        feedback.style.color = selectedOption === currentQuestion.correctAnswer ? 'green' : 'red';
        feedback.textContent =
            selectedOption === currentQuestion.correctAnswer
                ? "Правильный ответ!"
                : `Неправильный ответ! Правильный: ${currentQuestion.correctAnswer}`;

        optionsElement.appendChild(feedback);

        if (selectedOption === currentQuestion.correctAnswer) {
            correct
