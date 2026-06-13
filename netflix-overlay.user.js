// ==UserScript==
// @name         Netflix Enhanced Time Overlay
// @namespace    outtieTV
// @version      1.0
// @description  Shows playback time, remaining time, progress %, and end time.
// @match        https://www.netflix.com/watch/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const overlay = document.createElement('div');

    overlay.style.cssText = `
        position: fixed !important;
        top: 12px !important;
        right: 12px !important;
        background: rgba(0,0,0,0.75) !important;
        color: white !important;
        padding: 10px 14px !important;
        border-radius: 8px !important;
        font-size: 15px !important;
        font-family: Arial, sans-serif !important;
        line-height: 1.5 !important;
        white-space: pre-line !important;
        pointer-events: none !important;
        z-index: 2147483647 !important;
        transition: opacity 0.25s ease !important;
        opacity: 1 !important;
    `;

    document.documentElement.appendChild(overlay);

    let visibleUntil = Date.now() + 3000;

    document.addEventListener('mousemove', () => {
        visibleUntil = Date.now() + 3000;
    });

    document.addEventListener('keydown', () => {
        visibleUntil = Date.now() + 3000;
    });

    function formatClock(date) {
        return date.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    function formatVideoTime(seconds) {
        seconds = Math.floor(seconds);

        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        if (h > 0) {
            return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }

        return `${m}:${String(s).padStart(2, '0')}`;
    }

    function formatRemaining(seconds) {
        seconds = Math.max(0, Math.floor(seconds));

        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        if (h > 0) {
            return `${h}h ${m}m ${s}s`;
        }

        return `${m}m ${s}s`;
    }

    function update() {
        const video = document.querySelector('video');

        overlay.style.opacity =
            Date.now() < visibleUntil ? '1' : '0';

        if (!video || !video.duration || isNaN(video.duration)) {
            overlay.textContent = 'Waiting for Netflix video...';
            return;
        }

        const current = video.currentTime;
        const duration = video.duration;
        const remaining = duration - current;

        const percent = (
            (current / duration) * 100
        ).toFixed(1);

        const endTime = new Date(
            Date.now() + (remaining * 1000)
        );

        overlay.textContent =
`▶ ${formatVideoTime(current)} / ${formatVideoTime(duration)}
⏳ ${formatRemaining(remaining)} remaining
📊 ${percent}% complete
🏁 Ends ${formatClock(endTime)}`;
    }

    setInterval(update, 1000);
})();
