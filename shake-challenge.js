document.addEventListener('DOMContentLoaded', () => {
    const challenge = initializeChallengePage();

    const shakeCounterElement = document.getElementById('shake-counter').querySelector('strong');
    const shakeProgressElement = document.getElementById('shake-progress');

    let shakeCount = 0;
    const requiredShakes = 10;
    const shakeThreshold = 15;
    let last_x = null, last_y = null, last_z = null;
    let lastUpdate = 0;

    function handleMotion(event) {
        const acceleration = event.accelerationIncludingGravity;
        const currentTime = new Date().getTime();

        if ((currentTime - lastUpdate) > 100) {
            const diffTime = currentTime - lastUpdate;
            lastUpdate = currentTime;
            const speed = Math.abs(acceleration.x + acceleration.y + acceleration.z - last_x - last_y - last_z) / diffTime * 10000;

            if (speed > shakeThreshold) {
                shakeCount++;
                updateUI();
                if (shakeCount >= requiredShakes) {
                    alarmDismissed();
                }
            }

            last_x = acceleration.x;
            last_y = acceleration.y;
            last_z = acceleration.z;
        }
    }

    function updateUI() {
        const remainingShakes = requiredShakes - shakeCount;
        shakeCounterElement.textContent = remainingShakes;
        const progressPercent = (shakeCount / requiredShakes) * 100;
        shakeProgressElement.style.width = `${progressPercent}%`;
    }

    function alarmDismissed() {
        window.removeEventListener('devicemotion', handleMotion);
        // Call the common dismiss function
        challenge.dismissAlarm();
    }

    if (typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    window.addEventListener('devicemotion', handleMotion);
                } else {
                    alert('Hareket sensörlerine erişim izni reddedildi.');
                }
            })
            .catch(console.error);
    } else {
        window.addEventListener('devicemotion', handleMotion);
    }
});