// challenge-common.js

function initializeChallengePage() {
    const channel = new BroadcastChannel('alarm_channel');

    return {
        dismissAlarm: function() {
            // Send a message to the alarm-playing page to stop the sound
            channel.postMessage({ command: 'stop' });
            // Redirect to the motivational message page
            window.location.href = 'wakeup-message.html';
        }
    };
}