// ==UserScript==
// @name         YouTube Auto-Next Stopper
// @namespace    http://tampermonkey.net/
// @version      1.31
// @description  Automatically pauses the YouTube video 3 seconds before the end to prevent the auto-next video feature from starting.
// @author       OuttieTV
// @match        https://*.youtube.com/*
// @match        http://*.youtube.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    const PAUSE_THRESHOLD_SECONDS = 3.0; // seconds before end when pause is active
    const STORAGE_KEY = 'yt-auto-next-pause-active';

    let currentVideoId = null;
    let rafId = null;

    // ---------- Persistence ----------
    function loadState() {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored === null ? true : stored === 'true'; // default: pause enabled (gray)
    }
    function saveState(v) {
        localStorage.setItem(STORAGE_KEY, v);
    }
    let pauseActive = loadState(); // true = pause enabled (gray), false = no pause (white)

    // ---------- UI ----------
    function createToggleButton() {
        const btn = document.createElement('button');
        btn.id = 'auto-next-toggle';
        btn.style.border = 'none';
        btn.style.background = 'transparent';
        btn.style.cursor = 'pointer';
        btn.style.fontSize = '18px';
        btn.style.verticalAlign = 'middle';
        btn.style.marginLeft = '8px';
        btn.title = 'Toggle Auto‑Next Stopper (white = no pause)';
        updateButtonAppearance(btn);
        btn.addEventListener('click', () => {
            pauseActive = !pauseActive;
            saveState(pauseActive);
            updateButtonAppearance(btn);
            const video = findVideoElement();
            if (pauseActive && video) watchVideo(video);
        });
        return btn;
    }

    function updateButtonAppearance(btn) {
        btn.textContent = '→';
        // Gray when pause is active, white when pause is disabled
        btn.style.color = pauseActive ? '#888' : '#fff';
    }

    // New selector: #title > h1 > yt-formatted-string[title]
    function injectToggle() {
        const titleEl = document.querySelector('#title h1 yt-formatted-string[title]');
        if (!titleEl) return false;
        if (document.getElementById('auto-next-toggle')) return true;
        const btn = createToggleButton();
        titleEl.parentNode.insertBefore(btn, titleEl.nextSibling);
        return true;
    }

    // ---------- Video ----------
    function findVideoElement() {
        return document.querySelector('video');
    }

    function watchVideo(video) {
        if (!video || video.dataset._preventAttached) return;
        video.dataset._preventAttached = '1';
        if (rafId) cancelAnimationFrame(rafId);

        function loop() {
            // If pause is disabled (white arrow) just keep looping
            if (!pauseActive) {
                rafId = requestAnimationFrame(loop);
                return;
            }

            if (video.paused || isNaN(video.duration) || video.duration <= 0) {
                rafId = requestAnimationFrame(loop);
                return;
            }

            const timeLeft = video.duration - video.currentTime;
            if (timeLeft <= PAUSE_THRESHOLD_SECONDS) {
                video.pause();
                console.log(`[Auto-Next Stopper] Paused ${timeLeft.toFixed(3)}s before end (pause active).`);
                return;
            }
            rafId = requestAnimationFrame(loop);
        }

        rafId = requestAnimationFrame(loop);
    }

    function initialize() {
        const video = findVideoElement();
        if (video) watchVideo(video);
        else setTimeout(initialize, 500);
    }

    // ---------- URL change ----------
    function monitorUrlChanges() {
        const url = window.location.href;
        if (!url.includes('/watch')) return;
        const newVideoId = new URLSearchParams(window.location.search).get('v');
        if (newVideoId && newVideoId !== currentVideoId) {
            currentVideoId = newVideoId;
            injectToggle(); // ensure button exists for the new video
            setTimeout(initialize, 1000);
        }
    }

    // ---------- MutationObserver ----------
    const observer = new MutationObserver(() => injectToggle());
    observer.observe(document.body, { childList: true, subtree: true });

    // ---------- Startup ----------
    injectToggle(); // early attempt
    window.addEventListener('yt-page-data-updated', monitorUrlChanges);
    setInterval(monitorUrlChanges, 2000);
    initialize();
})();
