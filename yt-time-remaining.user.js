// ==UserScript==
// @name         YouTube Time Remaining (floating badge)
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Shows time remaining (HH:MM:SS) as a floating badge next to the title on YouTube.
// @author       OuttieTV (modified by ChatGPT)
// @match        https://*.youtube.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // ---------- helpers ----------
    function formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h.toString().padStart(2, '0')}:${m
            .toString()
            .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    // create (or retrieve) the floating element
    function getBadge() {
        let badge = document.getElementById('yt-remaining-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.id = 'yt-remaining-badge';
            // basic styling – adjust as you like
            Object.assign(badge.style, {
                background: '#222',
                color: '#fff',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '12px',
                marginLeft: '8px',
                verticalAlign: 'middle',
                opacity: '0.9',
                cursor: 'default'
            });
            // insert next to the title element
            const titleEl = document.querySelector('#title h1 yt-formatted-string[title]');
            if (titleEl) titleEl.parentNode.appendChild(badge);
        }
        return badge;
    }

    // ---------- main logic ----------
    function updateBadge() {
        const video = document.querySelector('video');
        const titleEl = document.querySelector('#title h1 yt-formatted-string[title]');
        if (!video || !titleEl) return;

        const remaining = Math.max(0, video.duration - video.currentTime);
        const badge = getBadge();
        badge.textContent = formatTime(remaining);
    }

    // Reset badge when the title changes (e.g., navigation to another video)
    const titleObserver = new MutationObserver(() => {
        // remove the old badge so a fresh one can be attached to the new title element
        const oldBadge = document.getElementById('yt-remaining-badge');
        if (oldBadge) oldBadge.remove();
    });

    const titleContainer = document.querySelector('#title');
    if (titleContainer) {
        titleObserver.observe(titleContainer, { childList: true, subtree: true });
    }

    // update every second
    setInterval(updateBadge, 1000);
})();
