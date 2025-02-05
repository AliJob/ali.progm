document.addEventListener('DOMContentLoaded', () => {
    emailjs.init("YVG_87gJlzZuy3NtW"); // ВАШ EmailJS Public Key

    let currentQuestionIndex = 0;
    let time = 10;
    let timerInterval;
    let correctAnswers = 0;
    let selectedAnswers = [];

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
    const resultButton = document.getElementById('download-button');
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
        resultButton.style.display = 'block';

        sendTestResults();
    }

    function sendTestResults() {
        const templateParams = {
            fullname: fullnameInput.value,
            email: emailInput.value,
            correctAnswers: correctAnswers
        };

        emailjs.send("service_6qqeibt", "template_wmbckja", templateParams, "YVG_87gJlzZuy3NtW")
        .then(response => console.log('SUCCESS!', response.status, response.text))
        .catch(error => console.error('FAILED...', error));
    }

    function downloadPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        let fullName = fullnameInput.value;
        let email = emailInput.value;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("English Test Results - Incorrect Answers", 10, 20);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text(`Full Name: ${fullName}`, 10, 30);
        doc.text(`Email: ${email}`, 10, 40);
        doc.text(`Correct Answers: ${correctAnswers} / ${questions.length}`, 10, 50);
        doc.text(`Incorrect Answers: ${questions.length - correctAnswers}`, 10, 60);
        
        let y = 80;
        let hasIncorrectAnswers = false;

        questions.forEach((q, index) => {
            if (selectedAnswers[index] !== q.correctAnswer) {
                hasIncorrectAnswers = true;
                doc.setFont("helvetica", "bold");
                doc.text(`${index + 1}. ${q.question}`, 10, y);
                doc.setFont("helvetica", "normal");
                doc.text(`Your Answer: ${selectedAnswers[index] || "Not Answered"}`, 10, y + 10);
                doc.text(`Correct Answer: ${q.correctAnswer}`, 10, y + 20);

                doc.setTextColor(255, 0, 0);
                doc.text("✘ Incorrect", 150, y + 10);
                doc.setTextColor(0, 0, 0);

                y += 30;
            }
        });

        if (!hasIncorrectAnswers) {
            doc.setFont("helvetica", "bold");
            doc.text("Great job! No incorrect answers!", 10, y);
        }

        doc.save("Test_Results_Incorrect_Answers.pdf");
    }

    startButton.addEventListener('click', () => {
        if (!fullnameInput.value || !emailInput.value) {
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

    resultButton.addEventListener('click', downloadPDF);
});
