document.addEventListener('DOMContentLoaded', () => {
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
    const doneButton = document.getElementById('done-button');
    const fullnameInput = document.getElementById('fullname');
    const emailInput = document.getElementById('email');

    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwMkzsTMDGy7VdhSAjqtcvY0vAevvqU_73nyL8ZNH52mZ0KYi3-nwyDj0Kgika40aRa/exec";

    // Обновляем инструкции чтобы отражать реальное количество вопросов
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
                selectedAnswers[currentQuestionIndex] = 'Not Answered';
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
        selectedAnswers[currentQuestionIndex] = selectedOption;
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

  function sendToGoogleSheet() {
    const data = {
        fullname: fullnameInput.value,
        email: emailInput.value,
        correctAnswers: correctAnswers.toString(),
        totalQuestions: questions.length.toString()
    };

    console.log('Sending data:', data);

    // Добавляем обработку ошибок сети
    fetch(SCRIPT_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        mode: 'no-cors' // Попробуйте этот режим если не работает
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(result => {
        console.log('Success:', result);
        if (result.status === 'success') {
            alert('✅ Results successfully sent!');
            if (result.spreadsheetUrl) {
                console.log('Spreadsheet URL:', result.spreadsheetUrl);
                // Можно показать ссылку пользователю
                // alert('Spreadsheet: ' + result.spreadsheetUrl);
            }
        } else {
            alert('❌ Error: ' + result.message);
        }
    })
    .catch(error => {
        console.error('Fetch error:', error);
        alert('❌ Network error. Please check console for details.');
    });
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

    doneButton.addEventListener('click', sendToGoogleSheet);
});
