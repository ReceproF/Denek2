const CACHE_NAME = 'analog-clock-cache-v2';
const urlsToCache = [
  '/',
  'index.html',
  'style.css',
  'script.js',
  'manifest.json',
  'math-challenge.html',
  'math-challenge.js',
  'challenge-common.js',
  'shake-challenge.html',
  'shake-challenge.js',
  'alarm-playing.html',
  'wakeup-message.html'
];

let alarms = [];
let checkInterval;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Start checking alarms immediately on activation
  startAlarmChecks();
});

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SET_ALARMS') {
        alarms = event.data.alarms;
        console.log('Service Worker received alarms:', alarms);
        // Restart checks with the new alarm list
        startAlarmChecks();
    }
});

function startAlarmChecks() {
    if (checkInterval) {
        clearInterval(checkInterval);
    }
    checkInterval = setInterval(checkAlarms, 1000 * 30); // Check every 30 seconds for performance
}

function checkAlarms() {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    const currentDay = now.getDay();

    alarms.forEach(alarm => {
        if (alarm.enabled && alarm.time === currentTime && alarm.days.includes(currentDay)) {
            // Prevent re-triggering for the same minute
            if (!alarm.lastTriggered || (now.getTime() - alarm.lastTriggered) > 60000) {
                 alarm.lastTriggered = now.getTime();
                 showNotification(alarm);
            }
        }
    });
}

function showNotification(alarm) {
    // Open the page that will play the sound
    clients.openWindow(`alarm-playing.html?alarmId=${alarm.id}`);

    const title = alarm.label || 'Alarm';
    let options = {
        body: `Saat ${alarm.time}! Kalkma zamanı!`,
        icon: 'images/icon-192.png', // Correct path
        requireInteraction: true,
        data: { alarmId: alarm.id, alarm: alarm } // Pass the whole alarm object
    };

    // All alarms should have a snooze option if enabled
    if (alarm.smartSnooze) {
        options.actions = [{ action: 'snooze', title: 'Ertele (10 dk)' }];
    }

    if (alarm.dismissMethod === 'normal') {
        options.actions = [...(options.actions || []), { action: 'dismiss', title: 'Kapat' }];
    } else if (alarm.dismissMethod === 'math') {
        options.body = "Uyanmak için problemi çözmelisin!";
        options.actions = [...(options.actions || []), { action: 'solve_math', title: 'Problemi Çöz' }];
    } else if (alarm.dismissMethod === 'shake') {
        options.body = "Uyanmak için telefonunu salla!";
        options.actions = [...(options.actions || []), { action: 'start_shake', title: 'Sallamaya Başla' }];
    }

    self.registration.showNotification(title, options);
}

// Store snoozed alarms temporarily
const snoozedAlarms = new Map();

self.addEventListener('notificationclick', event => {
    const alarm = event.notification.data.alarm;
    const alarmId = alarm.id;
    const action = event.action;

    // Close the notification
    event.notification.close();

    // Stop the sound by closing the alarm-playing window
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
        windowClients.forEach(client => {
            if (client.url.includes('alarm-playing.html')) {
                client.close();
            }
        });
    });

    if (action === 'snooze') {
        let snoozeData = snoozedAlarms.get(alarmId) || { duration: 10 }; // Start with 10 minutes

        setTimeout(() => {
            showNotification(alarm);
        }, snoozeData.duration * 60 * 1000);

        // Smart snooze: reduce duration for next time, e.g., half it.
        snoozeData.duration = Math.max(1, Math.floor(snoozeData.duration / 2)); // Minimum 1 minute
        snoozedAlarms.set(alarmId, snoozeData);

    } else if (action === 'solve_math') {
        clients.openWindow(`math-challenge.html?alarmId=${alarmId}`);
    } else if (action === 'start_shake') {
        clients.openWindow(`shake-challenge.html?alarmId=${alarmId}`);
    } else { // 'dismiss' or default click
        snoozedAlarms.delete(alarmId); // Clear any snooze data
        clients.openWindow('wakeup-message.html');
    }
});