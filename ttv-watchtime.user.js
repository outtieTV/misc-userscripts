// ==UserScript==
// @name         ttv-watchtime.user.js
// @namespace    https://github.com/outtieTV
// @version      2.0
// @description  Per-channel Twitch watch timer. Each channel has its own saved timer that survives refreshes and resets at local midnight.
// @author       outtieTV
// @match        https://www.twitch.tv/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const OVERLAY_ID = 'ttv-watchtime-overlay';
    const UPDATE_MS = 1000;

    let currentChannel = null;
    let joinTime = null;
    let interval = null;

    function getChannelName() {
        const path = location.pathname.split('/').filter(Boolean);

        if (!path.length) return null;

        const excluded = [
            'directory',
            'downloads',
            'jobs',
            'settings',
            'subscriptions',
            'wallet',
            'inventory',
            'friends',
            'messages',
            'search',
            'videos',
            'collections',
            'turbo',
            'prime'
        ];

        const channel = path[0].toLowerCase();

        if (excluded.includes(channel)) {
            return null;
        }

        return channel;
    }

    function getStorageKey(channel) {
        return `ttv-watchtime-join-${channel}`;
    }

    function getStoredJoinTime(channel) {
        const raw = localStorage.getItem(getStorageKey(channel));

        if (!raw) return null;

        const date = new Date(raw);

        return isNaN(date.getTime()) ? null : date;
    }

    function setStoredJoinTime(channel, date) {
        localStorage.setItem(
            getStorageKey(channel),
            date.toISOString()
        );
    }

    function clearStoredJoinTime(channel) {
        localStorage.removeItem(getStorageKey(channel));
    }

    function createOverlay() {
        let overlay = document.getElementById(OVERLAY_ID);

        if (overlay) return overlay;

        overlay = document.createElement('div');
        overlay.id = OVERLAY_ID;

        overlay.style.position = 'fixed';
        overlay.style.bottom = '20px';
        overlay.style.left = '50%';
        overlay.style.transform = 'translateX(-50%)';
        overlay.style.padding = '6px 12px';
        overlay.style.background = 'rgba(0,0,0,0.75)';
        overlay.style.color = '#fff';
        overlay.style.fontFamily = 'Arial, Helvetica, sans-serif';
        overlay.style.fontSize = '14px';
        overlay.style.borderRadius = '4px';
        overlay.style.zIndex = '999999';
        overlay.style.pointerEvents = 'none';

        document.body.appendChild(overlay);

        return overlay;
    }

    function formatElapsed(ms) {
        const totalSeconds = Math.floor(ms / 1000);

        const hours = String(
            Math.floor(totalSeconds / 3600)
        ).padStart(2, '0');

        const minutes = String(
            Math.floor((totalSeconds % 3600) / 60)
        ).padStart(2, '0');

        const seconds = String(
            totalSeconds % 60
        ).padStart(2, '0');

        return `${hours}:${minutes}:${seconds}`;
    }

    function initializeChannel(channel) {
        if (!channel) {
            joinTime = null;
            currentChannel = null;
            return;
        }

        currentChannel = channel;

        const now = new Date();
        let stored = getStoredJoinTime(channel);

        if (
            !stored ||
            stored.toDateString() !== now.toDateString()
        ) {
            stored = now;
            setStoredJoinTime(channel, stored);
        }

        if (stored.getTime() > now.getTime()) {
            stored = now;
            setStoredJoinTime(channel, stored);
        }

        joinTime = stored;
    }

    function updateTimer() {
        const overlay = createOverlay();

        if (!currentChannel || !joinTime) {
            overlay.textContent = 'Watch time: --:--:--';
            return;
        }

        const now = new Date();

        if (now.toDateString() !== joinTime.toDateString()) {
            clearStoredJoinTime(currentChannel);

            joinTime = now;

            setStoredJoinTime(
                currentChannel,
                joinTime
            );
        }

        const elapsed =
            now.getTime() - joinTime.getTime();

        overlay.textContent =
            `@${currentChannel} • Watch time: ${formatElapsed(elapsed)}`;
    }

    function startTimer() {
        if (interval) {
            clearInterval(interval);
        }

        updateTimer();

        interval = setInterval(
            updateTimer,
            UPDATE_MS
        );
    }

    function checkForChannelChange() {
        const channel = getChannelName();

        if (channel !== currentChannel) {
            initializeChannel(channel);
            updateTimer();
        }
    }

    function installNavigationHooks() {
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function () {
            const result = originalPushState.apply(this, arguments);

            setTimeout(checkForChannelChange, 100);

            return result;
        };

        history.replaceState = function () {
            const result = originalReplaceState.apply(this, arguments);

            setTimeout(checkForChannelChange, 100);

            return result;
        };

        window.addEventListener(
            'popstate',
            () => setTimeout(checkForChannelChange, 100)
        );
    }

    initializeChannel(getChannelName());

    createOverlay();
    startTimer();
    installNavigationHooks();

    setInterval(checkForChannelChange, 1000);

    window.addEventListener('beforeunload', () => {
        if (interval) {
            clearInterval(interval);
        }
    });
})();
