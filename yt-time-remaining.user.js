// ==UserScript==
// @name         YouTube Enhanced Time Overlay
// @namespace    outtieTV
// @version      3.0
// @description  Current time, remaining time, %, end time, playback speed. Fullscreen compatible and lightweight.
// @match        https://*.youtube.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let overlay = null;
    let updateTimer = null;

    function formatTime(seconds) {
        seconds = Math.max(0, Math.floor(seconds));

        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        return h > 0
            ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
            : `${m}:${String(s).padStart(2, '0')}`;
    }

    function formatClock(date) {
        return date.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    function getVideo() {
        return document.querySelector('video');
    }

    function getPlayer() {
        return document.getElementById('movie_player');
    }

    function createOverlay() {
        const player = getPlayer();

        if (!player) return;

        const existing = document.getElementById('yt-enhanced-overlay');
        if (existing) {
            overlay = existing;
            return;
        }

        overlay = document.createElement('div');
        overlay.id = 'yt-enhanced-overlay';

        Object.assign(overlay.style, {
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(0,0,0,0.75)',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '14px',
            lineHeight: '1.5',
            whiteSpace: 'pre-line',
            pointerEvents: 'none',
            zIndex: '99999',
            fontFamily: 'Arial, sans-serif',
            transition: 'opacity 0.2s ease'
        });

        player.appendChild(overlay);
    }

    function updateOverlay() {
        const video = getVideo();
        const player = getPlayer();

        if (!video || !player) return;

        if (!overlay || !overlay.isConnected) {
            createOverlay();
        }

        if (!overlay) return;

        if (!video.duration || isNaN(video.duration)) {
            overlay.textContent = 'Loading video...';
            return;
        }

        const current = video.currentTime;
        const duration = video.duration;
        const remaining = duration - current;
        const percent = ((current / duration) * 100).toFixed(1);

        const endTime = new Date(
            Date.now() + (remaining * 1000) / video.playbackRate
        );

        const controlsVisible =
            !player.classList.contains('ytp-autohide');

        overlay.style.opacity = controlsVisible ? '1' : '0';

        overlay.textContent =
`▶ ${formatTime(current)} / ${formatTime(duration)}
⏳ ${formatTime(remaining)}
📊 ${percent}%
🏁 ${formatClock(endTime)}
⚡ ${video.playbackRate.toFixed(2)}x`;
    }

    function startUpdater() {
        if (updateTimer) {
            clearInterval(updateTimer);
        }

        updateOverlay();
        updateTimer = setInterval(updateOverlay, 1000);
    }

    function pageChanged() {
        if (overlay) {
            overlay.remove();
            overlay = null;
        }

        setTimeout(startUpdater, 750);
    }

    window.addEventListener('yt-navigate-finish', pageChanged);
    document.addEventListener('fullscreenchange', updateOverlay);

    startUpdater();
})();
