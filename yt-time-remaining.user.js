// ==UserScript==
// @name         YouTube Time Remaining
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Shows time remaining (HH:MM:SS) before the video title on YouTube.
// @author       OuttieTV
// @match        https://*.youtube.com/*
// @match        http://*.youtube.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Helper to format seconds as HH:MM:SS
    function formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h.toString().padStart(2, '0')}:${m
            .toString()
            .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    // Update the title with remaining time
    function updateTitle() {
        const video = document.querySelector('video');
        const titleEl = document.querySelector('#title h1 yt-formatted-string[title]');
        if (!video || !titleEl) return;

        const duration = video.duration;
        const current = video.currentTime;
        const remaining = Math.max(0, duration - current);
        const prefix = formatTime(remaining) + ' – ';

        // Avoid duplicating the prefix if it already exists
        if (!titleEl.textContent.startsWith(prefix)) {
            // Preserve the original title for later updates
            titleEl.dataset.originalTitle = titleEl.dataset.originalTitle || titleEl.textContent;
            titleEl.textContent = prefix + titleEl.dataset.originalTitle;
        }
    }

    // Observe changes to the title element (e.g., when navigating to a new video)
    const observer = new MutationObserver(() => {
        // Reset stored original title when a new title element appears
        const titleEl = document.querySelector('#title h1 yt-formatted-string[title]');
        if (titleEl) {
            delete titleEl.dataset.originalTitle;
        }
    });

    // Start observing the container that holds the title
    const titleContainer = document.querySelector('#title');
    if (titleContainer) {
        observer.observe(titleContainer, { childList: true, subtree: true });
    }

    // Periodic update every second
    setInterval(updateTitle, 1000);
})();
