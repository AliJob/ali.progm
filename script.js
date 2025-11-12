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

    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwGk9ih6noyArM9yiVstMQv0olb15mzR66M7Q6Yjh86GYOqUKeicSxUsK8C3Snd4AbQAA/exec";

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
        questionElement.textContent = currentQuestion.question;

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
        if (currentQuestionIndex < questions.length) showQuestion();
        else showResult();
    }

    function showResult() {
        questionContainer.style.display = 'none';
        resultContainer.style.display = 'block';
        resultFullname.textContent = fullnameInput.value;
        resultCorrectElement.textContent = correctAnswers;
    }

    // Отправляем данные в Google Sheets
   function sendToGoogleSheet() {
    const formData = new FormData();
    formData.append("fullname", fullnameInput.value);
    formData.append("email", emailInput.value);
    formData.append("correctAnswers", correctAnswers.toString());
    formData.append("totalQuestions", questions.length.toString());

    fetch(SCRIPT_URL, {
        method: "POST",
        body: formData
    })
    .then(res => {
        if (!res.ok) {
            throw new Error('Network response was not ok');
        }
        return res.text();
    })
    .then(response => {
        console.log('Success:', response);
        try {
            const data = JSON.parse(response);
            if (data.status === "success") {
                alert("✅ Results successfully sent!");
            } else {
                alert("⚠️ " + data.message);
            }
        } catch (e) {
            console.log('Raw response:', response);
            alert("✅ Results sent!");
        }
    })
    .catch(err => {
        console.error('Error:', err);
        alert("⚠️ Error sending data: " + err.message);
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
