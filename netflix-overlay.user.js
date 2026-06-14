// ==UserScript==
// @name         Netflix Enhanced Time Overlay
// @namespace    outtieTV
// @version      1.2
// @description  Shows playback time, remaining time, progress %, and end time. Works in fullscreen and survives episode changes.
// @match        *://www.netflix.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let overlay = null;
    let visibleUntil = 0;
    let updateInterval = null;
    let observer = null;

    function getOverlayParent() {
        return (
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.querySelector('.watch-video') ||
            document.body
        );
    }

    function createOverlay() {
        if (overlay) return;

        overlay = document.createElement('div');
        overlay.id = 'netflix-enhanced-overlay';

        overlay.style.cssText = `
            position: absolute !important;
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
            opacity: 0;
        `;

        const parent = getOverlayParent();

        const computed = getComputedStyle(parent);
        if (computed.position === 'static') {
            parent.style.position = 'relative';
        }

        parent.appendChild(overlay);

        visibleUntil = Date.now() + 3000;

        document.addEventListener('mousemove', resetVisibilityTimer);
        document.addEventListener('keydown', resetVisibilityTimer);
        document.addEventListener('click', resetVisibilityTimer);
    }

    function moveOverlayToCurrentParent() {
        if (!overlay) return;

        const parent = getOverlayParent();

        const computed = getComputedStyle(parent);
        if (computed.position === 'static') {
            parent.style.position = 'relative';
        }

        if (overlay.parentNode !== parent) {
            parent.appendChild(overlay);
        }
    }

    function destroyOverlay() {
        if (overlay) {
            overlay.remove();
            overlay = null;
        }

        document.removeEventListener('mousemove', resetVisibilityTimer);
        document.removeEventListener('keydown', resetVisibilityTimer);
        document.removeEventListener('click', resetVisibilityTimer);
    }

    function resetVisibilityTimer() {
        visibleUntil = Date.now() + 3000;
    }

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

        if (!video) {
            if (updateInterval) {
                clearInterval(updateInterval);
                updateInterval = null;
            }

            destroyOverlay();
            return;
        }

        if (!overlay) {
            createOverlay();
        }

        moveOverlayToCurrentParent();

        const controlsVisible =
            document.querySelector('.PlayerControlsNeo__layout') ||
            document.querySelector('.controls-full-hit-zone') ||
            document.querySelector('[data-uia="player-controls"]');

        if (controlsVisible) {
            visibleUntil = Date.now() + 3000;
        }

        overlay.style.opacity = Date.now() < visibleUntil ? '1' : '0';

        if (!video.duration || isNaN(video.duration)) {
            overlay.textContent = 'Waiting for Netflix video...';
            return;
        }

        const current = video.currentTime;
        const duration = video.duration;
        const remaining = duration - current;
        const percent = ((current / duration) * 100).toFixed(1);
        const endTime = new Date(Date.now() + remaining * 1000);

        overlay.textContent =
`▶ ${formatVideoTime(current)} / ${formatVideoTime(duration)}
⏳ ${formatRemaining(remaining)} remaining
📊 ${percent}% complete
🏁 Ends ${formatClock(endTime)}`;
    }

    function startVideoTracking() {
        if (updateInterval) return;

        createOverlay();
        update();

        updateInterval = setInterval(update, 1000);
    }

    function initPlayerWatcher() {
        observer = new MutationObserver(() => {
            const video = document.querySelector('video');

            if (video && !updateInterval) {
                startVideoTracking();
            }

            moveOverlayToCurrentParent();
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    document.addEventListener('fullscreenchange', moveOverlayToCurrentParent);
    document.addEventListener('webkitfullscreenchange', moveOverlayToCurrentParent);

    initPlayerWatcher();

    if (document.querySelector('video')) {
        startVideoTracking();
    }
})();
