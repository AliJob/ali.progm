document.addEventListener('DOMContentLoaded', () => {
    // Initialize EmailJS with your user ID
    emailjs.init(YVG_87gJlzZuy3NtW);  // Replace with your actual EmailJS user ID

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

    // DOM elements
    const questionContainer = document.getElementById('question-container');
    const questionElement = document.getElementById('question');
    const optionsElement = document.getElementById('options');
    const timeElement = document.getElementById('time');
    const startButton = document.getElementById('start-button');
    const introContainer = document.getElementById('intro');
    const resultContainer = document.getElementById('result');
    const resultCorrectElement = document.getElementById('correct-answers'); // Correct answers element
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
        resultCorrectElement.textContent = correctAnswers; // Update correct answers display

        reviewButton.style.display = 'block';
        
        // Send results to email
        sendResultsToEmail();
    }

    reviewButton.addEventListener('click', () => {
        resultContainer.style.display = 'none';
        showReview();
    });

    function showReview() {
        reviewContainer.innerHTML = '';
        questions.forEach((question, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.innerHTML = `
                <p><strong>${question.question}</strong></p>
                <p>Your answer: ${selectedAnswers[index] || 'Not answered'}</p>
                <p>Correct answer: ${question.correctAnswer}</p>
            `;
            reviewContainer.appendChild(questionDiv);
        });
        reviewContainer.style.display = 'block';
    }

    function sendResultsToEmail() {
        const fullname = fullnameInput.value;
        const email = emailInput.value;

        const resultMessage = `
            Test Results:
            Full Name: ${fullname}
            Email: ${email}
            Correct Answers: ${correctAnswers} / ${questions.length}

            Answers:
            ${questions.map((q, index) => {
                return `${q.question}
                        Your answer: ${selectedAnswers[index] || 'Not answered'}
                        Correct answer: ${q.correctAnswer}\n`;
            }).join("\n")}
        `;

        // Send email using EmailJS
        const emailData = {
            from_name: fullname,
            to_name: 'Ali Jobirov',
            user_email: email,
            message: resultMessage
        };

        emailjs.send('service_6qqeibt', 'template_wmbckja', emailData)
            .then((response) => {
                console.log('Success', response);
            }, (error) => {
                console.error('Error', error);
            });
    }

    startButton.addEventListener('click', () => {
        userEmail = emailInput.value.trim();
        if (fullnameInput.value.trim() === "" || userEmail === "") {
            alert("Please enter your full name and email!");
            return;
        }
        introContainer.style.display = 'none';
        questionContainer.style.display = 'block';
        showQuestion();
    });
});
