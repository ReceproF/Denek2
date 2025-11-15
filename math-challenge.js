document.addEventListener('DOMContentLoaded', () => {
    const challenge = initializeChallengePage();

    const problemElement = document.getElementById('math-problem');
    const answerInput = document.getElementById('math-answer');
    const submitButton = document.getElementById('submit-answer-btn');

    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const correctAnswer = num1 + num2;

    problemElement.textContent = `${num1} + ${num2} = ?`;

    submitButton.addEventListener('click', () => {
        const userAnswer = parseInt(answerInput.value);
        if (userAnswer === correctAnswer) {
            // Call the common dismiss function
            challenge.dismissAlarm();
        } else {
            alert('Yanlış cevap! Tekrar deneyin.');
            answerInput.value = '';
        }
    });
});