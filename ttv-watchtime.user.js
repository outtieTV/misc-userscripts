// ==UserScript==
// @name         ttv-watchtime.user.js
// @namespace    https://github.com/outtieTV
// @version      1.2
// @description  Bottom‑center watch‑time counter for Twitch. Stores the exact join moment (ISO‑8601 UTC) and always counts up from that value, even after a page reload. The value is cleared at midnight local time.
// @author       outtieTV
// @match        https://www.twitch.tv/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // -------------------------------------------------
    // Configuration
    // -------------------------------------------------
    const STORAGE_KEY   = 'ttv-watchtime-join';      // localStorage key
    const OVERLAY_ID    = 'ttv-watchtime-overlay';   // DOM id for the timer
    const UPDATE_MS     = 1000;                      // update interval (1 s)

    // -------------------------------------------------
    // Helpers
    // -------------------------------------------------

    /** Retrieve the stored join time (as a Date object). */
    function getStoredJoinTime() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const d = new Date(raw);            // raw is a full ISO‑8601 string with “Z”
        return isNaN(d.getTime()) ? null : d;
    }

    /** Store the current moment as a full ISO‑8601 UTC string. */
    function setJoinTime(date) {
        // Keep the trailing “Z” so the value is interpreted as UTC on read.
        localStorage.setItem(STORAGE_KEY, date.toISOString());
    }

    /** Remove the saved time (called at midnight). */
    function clearJoinTime() {
        localStorage.removeItem(STORAGE_KEY);
    }

    /** Create the floating overlay that will show the timer. */
    function createOverlay() {
        const el = document.createElement('div');
        el.id = OVERLAY_ID;
        el.style.position = 'fixed';
        el.style.bottom = '20px';               // space from bottom edge
        el.style.left   = '50%';                // horizontal centre
        el.style.transform = 'translateX(-50%)';
        el.style.padding = '6px 12px';
        el.style.background = 'rgba(0,0,0,0.7)';
        el.style.color = '#fff';
        el.style.fontFamily = 'Arial, Helvetica, sans-serif';
        el.style.fontSize = '14px';
        el.style.borderRadius = '4px';
        el.style.zIndex = '9999';
        el.style.pointerEvents = 'none';
        el.textContent = 'Watch time: 00:00:00';
        document.body.appendChild(el);
        return el;
    }

    /** Convert milliseconds to a HH:MM:SS string. */
    function formatElapsed(ms) {
        const totalSec = Math.floor(ms / 1000);
        const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
        const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
        const s = String(totalSec % 60).padStart(2, '0');
        return `${h}:${m}:${s}`;
    }

    // -------------------------------------------------
    // Initialise / Reset logic
    // -------------------------------------------------

    let joinTime = getStoredJoinTime();
    const now = new Date();

    // If there is no saved value **or** the saved value belongs to a previous
    // local calendar day, start a fresh timer.
    if (!joinTime || now.toDateString() !== joinTime.toDateString()) {
        joinTime = now;
        setJoinTime(joinTime);
    }

    // In the very unlikely case the stored UTC moment is *ahead* of the current
    // local time (e.g., due to clock changes), fall back to “now” to avoid
    // negative deltas.
    if (joinTime.getTime() > now.getTime()) {
        joinTime = now;
        setJoinTime(joinTime);
    }

    const overlay = createOverlay();

    // -------------------------------------------------
    // Timer update loop
    // -------------------------------------------------
    const interval = setInterval(() => {
        const now = new Date();

        // Midnight rollover – clear stored value and start a new one.
        if (now.toDateString() !== joinTime.toDateString()) {
            clearJoinTime();
            joinTime = now;
            setJoinTime(joinTime);
        }

        const elapsed = now.getTime() - joinTime.getTime();
        overlay.textContent = `Watch time: ${formatElapsed(elapsed)}`;
    }, UPDATE_MS);

    // Clean up when Twitch navigates away (it’s a SPA).
    window.addEventListener('beforeunload', () => clearInterval(interval));
})();
