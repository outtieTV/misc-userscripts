// ==UserScript==
// @name         YouTube Auto-Next Stopper
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatically pauses the YouTube video 3 seconds before the end to prevent the auto-next video feature from starting.
// @author       OuttieTV
// @match        *://*.youtube.com/watch*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    const PAUSE_THRESHOLD_SECONDS = 3.0; // 3 seconds before end, 1.5 seconds before end appears to be smallest I can go.
    let currentVideoId = null;
    let rafId = null;

    function findVideoElement() {
        return document.querySelector('video');
    }

    function watchVideo(video) {
        if (!video || video.dataset._preventAttached) return;
        video.dataset._preventAttached = '1';

        console.log('[Auto-Next Stopper] Watching video for near-end pause.');

        // Cancel any previous frame loop
        if (rafId) cancelAnimationFrame(rafId);

        function loop() {
            if (video.paused || isNaN(video.duration) || video.duration <= 0) {
                rafId = requestAnimationFrame(loop);
                return;
            }

            const timeLeft = video.duration - video.currentTime;
            if (timeLeft <= PAUSE_THRESHOLD_SECONDS) {
                video.pause();
                console.log(`[Auto-Next Stopper] Paused ${timeLeft.toFixed(3)}s before end.`);
                return; // stop loop once paused
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

    function monitorUrlChanges() {
        const url = window.location.href;
        if (url.includes('/watch')) {
            const newVideoId = new URLSearchParams(window.location.search).get('v');
            if (newVideoId && newVideoId !== currentVideoId) {
                currentVideoId = newVideoId;
                setTimeout(initialize, 1000);
            }
        }
    }

    window.addEventListener('yt-page-data-updated', monitorUrlChanges);
    setInterval(monitorUrlChanges, 2000);
    initialize();
})();
