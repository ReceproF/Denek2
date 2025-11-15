const hourHand = document.querySelector('[data-hour-hand]');
const minuteHand = document.querySelector('[data-minute-hand]');
const secondHand = document.querySelector('[data-second-hand]');

function setClock() {
    const currentDate = new Date();
    const secondsRatio = currentDate.getSeconds() / 60;
    const minutesRatio = (secondsRatio + currentDate.getMinutes()) / 60;
    const hoursRatio = (minutesRatio + currentDate.getHours()) / 12;
    setRotation(secondHand, secondsRatio);
    setRotation(minuteHand, minutesRatio);
    setRotation(hourHand, hoursRatio);
}

function setRotation(element, rotationRatio) {
    element.style.setProperty('--rotation', rotationRatio * 360);
}

setInterval(setClock, 1000);

setClock();

// Alarm Modal Logic
const addAlarmBtn = document.getElementById('add-alarm-btn');
const alarmModal = document.getElementById('alarm-modal');
const closeButton = document.querySelector('.close-button');
const saveAlarmBtn = document.getElementById('save-alarm-btn');
const quickProfilesContainer = document.querySelector('.quick-profiles');
const alarmsList = document.getElementById('alarms-list');
const alarmTimeInput = document.getElementById('alarm-time');
const alarmLabelInput = document.getElementById('alarm-label');
const weekdaysContainer = document.querySelector('.weekdays');
const dismissMethodInput = document.getElementById('dismiss-method');
const crescendoInput = document.getElementById('crescendo-sound');
const smartSnoozeInput = document.getElementById('smart-snooze');


let alarms = JSON.parse(localStorage.getItem('alarms')) || [];

function saveAlarms() {
    localStorage.setItem('alarms', JSON.stringify(alarms));
}

function renderAlarms() {
    alarmsList.innerHTML = '';
    alarms.forEach(alarm => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${alarm.time} - ${alarm.label}</span>
            <button class="delete-alarm-btn" data-id="${alarm.id}">Sil</button>
        `;
        alarmsList.appendChild(li);
    });
}

addAlarmBtn.addEventListener('click', () => {
    alarmModal.style.display = 'block';
});

closeButton.addEventListener('click', () => {
    alarmModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target == alarmModal) {
        alarmModal.style.display = 'none';
    }
});

weekdaysContainer.addEventListener('click', (event) => {
    if (event.target.tagName === 'SPAN') {
        event.target.classList.toggle('active');
    }
});

saveAlarmBtn.addEventListener('click', () => {
    const time = alarmTimeInput.value;
    const label = alarmLabelInput.value || 'Alarm';
    const activeDays = [...weekdaysContainer.querySelectorAll('.active')].map(el => parseInt(el.dataset.day));
    const dismissMethod = dismissMethodInput.value;
    const crescendo = crescendoInput.checked;
    const smartSnooze = smartSnoozeInput.checked;

    const newAlarm = {
        id: Date.now(),
        time,
        label,
        days: activeDays,
        enabled: true,
        dismissMethod: dismissMethod,
        crescendo: crescendo,
        smartSnooze: smartSnooze
    };

    alarms.push(newAlarm);
    saveAlarms();
    renderAlarms();
    sendAlarmsToServiceWorker();
    alarmModal.style.display = 'none';

    // Request notification permission on first alarm set
    if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Notification permission granted.');
            }
        });
    }
});

alarmsList.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete-alarm-btn')) {
        const alarmId = parseInt(event.target.dataset.id);
        alarms = alarms.filter(alarm => alarm.id !== alarmId);
        saveAlarms();
        renderAlarms();
        sendAlarmsToServiceWorker();
    }
});

function sendAlarmsToServiceWorker() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            type: 'SET_ALARMS',
            alarms: alarms
        });
    }
}

quickProfilesContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('profile-btn')) {
        const profile = event.target.dataset.profile;
        const allDays = weekdaysContainer.querySelectorAll('span');

        // Clear current selections
        allDays.forEach(day => day.classList.remove('active'));

        if (profile === 'workday') {
            alarmTimeInput.value = '07:00';
            alarmLabelInput.value = 'İş Günü Alarmı';
            // Select Monday (1) to Friday (5)
            allDays.forEach(day => {
                const dayIndex = parseInt(day.dataset.day);
                if (dayIndex >= 1 && dayIndex <= 5) {
                    day.classList.add('active');
                }
            });
        } else if (profile === 'weekend') {
            alarmTimeInput.value = '09:00';
            alarmLabelInput.value = 'Hafta Sonu Keyfi';
            // Select Saturday (6) and Sunday (0)
            allDays.forEach(day => {
                const dayIndex = parseInt(day.dataset.day);
                if (dayIndex === 6 || dayIndex === 0) {
                    day.classList.add('active');
                }
            });
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    renderAlarms();
    // Apply saved theme on load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.classList.add(savedTheme);
        themeToggleBtn.textContent = savedTheme === 'dark-theme' ? '☀️' : '🌙';
    }
});

// Theme Toggle Logic
const themeToggleBtn = document.getElementById('theme-toggle-btn');
themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    if (document.body.classList.contains('dark-theme')) {
        localStorage.setItem('theme', 'dark-theme');
        themeToggleBtn.textContent = '☀️';
    } else {
        localStorage.removeItem('theme');
        themeToggleBtn.textContent = '🌙';
    }
});


// Sleep Sounds Logic
const soundOptions = document.querySelector('.sound-options');
const timerOptions = document.querySelector('.timer-options');
const playSleepSoundBtn = document.getElementById('play-sleep-sound-btn');
const sleepAudio = new Audio();
let selectedSound = null;
let selectedDuration = null;
let sleepTimer;

const soundFiles = {
    rain: 'sounds/rain.mp3',
    waves: 'sounds/waves.mp3',
    noise: 'sounds/noise.mp3'
};

soundOptions.addEventListener('click', (event) => {
    if (event.target.classList.contains('sound-btn')) {
        document.querySelectorAll('.sound-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        selectedSound = event.target.dataset.sound;
        checkPlayButtonState();
    }
});

timerOptions.addEventListener('click', (event) => {
    if (event.target.classList.contains('timer-btn')) {
        document.querySelectorAll('.timer-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        selectedDuration = parseInt(event.target.dataset.duration);
        checkPlayButtonState();
    }
});

function checkPlayButtonState() {
    playSleepSoundBtn.disabled = !(selectedSound && selectedDuration);
}

playSleepSoundBtn.addEventListener('click', () => {
    if (playSleepSoundBtn.textContent === 'Çal') {
        startSleepSound();
    } else {
        stopSleepSound();
    }
});

function startSleepSound() {
    sleepAudio.src = soundFiles[selectedSound];
    sleepAudio.loop = true;
    sleepAudio.volume = 1.0;
    sleepAudio.play();
    playSleepSoundBtn.textContent = 'Durdur';

    sleepTimer = setTimeout(() => {
        fadeOutSleepSound();
    }, selectedDuration * 60 * 1000);
}

function stopSleepSound() {
    clearTimeout(sleepTimer);
    fadeOutSleepSound();
}

function fadeOutSleepSound() {
    const fadeInterval = setInterval(() => {
        if (sleepAudio.volume > 0.1) {
            sleepAudio.volume -= 0.1;
        } else {
            clearInterval(fadeInterval);
            sleepAudio.pause();
            playSleepSoundBtn.textContent = 'Çal';
        }
    }, 200);
}