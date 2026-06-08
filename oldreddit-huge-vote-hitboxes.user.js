// ==UserScript==
// @name         Old Reddit - Huge Vote Hitboxes
// @namespace    https://old.reddit.com/
// @version      1.0
// @match        https://old.reddit.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const style = document.createElement('style');
    style.textContent = `
        .midcol .arrow {
            position: relative !important;
            z-index: 10;
        }

        .midcol .arrow::before {
            content: "";
            position: absolute;
            left: -20px;
            right: -20px;
            top: -8px;
            bottom: -8px;
            pointer-events: auto;
        }
    `;
    document.head.appendChild(style);
})();
