// ==UserScript==
// @name         Kick.com Sidebar Toggle Overlay
// @namespace    https://duckduckgo.com/
// @version      1.0
// @description  Adds a floating button to collapse/expand the Kick.com sidebar.
// @author       outtieTV
// @match        https://kick.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    // Wait for the sidebar element to exist
    const SIDEBAR_SELECTOR = '#sidebar-wrapper';
    const CHECK_INTERVAL = 500; // ms

    let button, sidebar;

    function createButton() {
        button = document.createElement('button');
        button.textContent = 'Collapse';
        button.style.position = 'fixed';
        button.style.top = '10px';
        button.style.left = '10px';
        button.style.zIndex = '10000';
        button.style.padding = '6px 12px';
        button.style.background = '#111';
        button.style.color = '#fff';
        button.style.border = 'none';
        button.style.borderRadius = '4px';
        button.style.cursor = 'pointer';
        button.style.fontSize = '14px';
        button.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
        document.body.appendChild(button);
    }

    function toggleSidebar() {
        if (!sidebar) return;

        const isCollapsed = sidebar.dataset.collapsed === 'true';
        if (isCollapsed) {
            // Expand
            sidebar.style.width = '';
            sidebar.style.display = '';
            button.textContent = 'Collapse';
            sidebar.dataset.collapsed = 'false';
        } else {
            // Collapse
            // Store current width so we can restore it later
            const computed = getComputedStyle(sidebar);
            sidebar.dataset.prevWidth = computed.width;
            sidebar.style.width = '0';
            sidebar.style.display = 'none';
            button.textContent = 'Expand';
            sidebar.dataset.collapsed = 'true';
        }
    }

    function init() {
        sidebar = document.querySelector(SIDEBAR_SELECTOR);
        if (!sidebar) return false;

        // Ensure the sidebar has a data attribute we can use
        if (!sidebar.dataset.collapsed) sidebar.dataset.collapsed = 'false';

        createButton();
        button.addEventListener('click', toggleSidebar);
        return true;
    }

    // Poll until the sidebar appears (useful for SPA navigation)
    const intervalId = setInterval(() => {
        if (init()) {
            clearInterval(intervalId);
        }
    }, CHECK_INTERVAL);
})();
