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

    // Функция для случайного перемешивания массива
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Меняем местами элементы
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

        // Сначала перемешиваем варианты ответов
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
        doc.text("Test Results", 10, 20);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text(`Full Name: ${fullName}`, 10, 30);
        doc.text(`Email: ${email}`, 10, 40);
        doc.text(`Correct Answers: ${correctAnswers} / ${questions.length}`, 10, 50);
        doc.text(`Incorrect Answers: ${questions.length - correctAnswers}`, 10, 60);

        let y = 70;
        const pageHeight = doc.internal.pageSize.height;

        // Проверяем все вопросы
        questions.forEach((q, index) => {
            if (y + 30 > pageHeight) { // Переход на новую страницу, если не хватает места
                doc.addPage();
                y = 10;
            }

            doc.setFont("helvetica", "bold");
            doc.text(`${index + 1}. ${q.question}`, 10, y);
            y += 10;

            // Отображаем варианты ответов
            q.options.forEach((option, optionIndex) => {
                doc.setFont("helvetica", "normal");
                doc.text(`${option}`, 10, y);
                y += 5;
            });

            // Отображаем выбранный ответ
            const userAnswer = selectedAnswers[index] || "Not Answered";
            doc.text(`Your Answer: ${userAnswer}`, 10, y);

            // Пометка "Правильно" или "Неправильно"
            if (selectedAnswers[index] === q.correctAnswer) {
                doc.setTextColor(0, 255, 0); // Зеленый для правильного ответа
                doc.text("✔ Correct", 150, y);
                doc.setTextColor(0, 0, 0);
            } else {
                doc.setTextColor(255, 0, 0); // Красный для неправильного ответа
                doc.text("✘ Incorrect", 150, y);
                doc.setTextColor(0, 0, 0);
            }
            y += 15;
        });

        doc.save("Test_Results.pdf");
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
