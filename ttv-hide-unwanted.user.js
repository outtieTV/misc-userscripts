// ==UserScript==
// @name         Twitch Hide Unwanted Buttons
// @namespace    https://www.tampermonkey.net/
// @version      1.0
// @description  Hides Subscribe, Gift, and Get Bits buttons on Twitch.
// @author       OuttieTV
// @match        https://www.twitch.tv/*
// @match        http://www.twitch.tv/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // CSS selectors for the buttons we want to hide
    const selectors = [
        'button[data-a-target="subscribe-button"]',
        'button[data-a-target="gift-button"]',
        'button[data-a-target="top-nav-get-bits-button"]'
    ];

    // Hide a node if it matches one of the selectors
    function hideIfMatch(node) {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        selectors.forEach(sel => {
            if (node.matches(sel)) {
                node.style.display = 'none';
            }
        });
    }

    // Observe the whole document for added nodes
    const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            // Check newly added nodes
            mutation.addedNodes.forEach(node => {
                // Direct match
                hideIfMatch(node);
                // Also check its descendants
                if (node.querySelectorAll) {
                    node.querySelectorAll(selectors.join(',')).forEach(el => {
                        el.style.display = 'none';
                    });
                }
            });
        }
    });

    // Start observing after the document is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }

    function start() {
        observer.observe(document.body, { childList: true, subtree: true });
        // Hide any buttons that are already present
        document.querySelectorAll(selectors.join(',')).forEach(el => {
            el.style.display = 'none';
        });
    }
})();
