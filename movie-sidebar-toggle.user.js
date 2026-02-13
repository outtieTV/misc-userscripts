// ==UserScript==
// @name         iShowMovies Sidebar
// @namespace    outtieTV
// @description  sidebar toggle
// @version      1.0
// @match        *://ishowmovies.org/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 1. SELECTORS
    const SIDEBAR_SELECTOR = 'div.w-full.overflow-hidden';
    // We target the grid container using the classes you found
    const GRID_SELECTOR = 'div.grid.md\\:grid-cols-3';

    const waitForElements = () => {
        const sidebar = document.querySelector(SIDEBAR_SELECTOR);
        const gridContainer = document.querySelector(GRID_SELECTOR);

        if (!sidebar || !gridContainer) {
            requestAnimationFrame(waitForElements);
            return;
        }
        initUI(sidebar, gridContainer);
    };

    const initUI = (sidebar, gridContainer) => {
        const container = document.createElement('div');
        Object.assign(container.style, {
            position: 'fixed',
            top: '12px',
            right: '12px',
            zIndex: '9999',
            display: 'flex',
            gap: '6px'
        });

        const toggleBtn = document.createElement('button');
        toggleBtn.textContent = 'Collapse Sidebar';
        styleBtn(toggleBtn);

        let isExpanded = false;

        toggleBtn.onclick = () => {
            isExpanded = !isExpanded;

            if (isExpanded) {
                // Hide Sidebar
                sidebar.style.display = 'none';

                // Change Grid from 3 columns to 1 column
                gridContainer.classList.replace('md:grid-cols-3', 'md:grid-cols-1');

                toggleBtn.textContent = 'Expand Sidebar';
                toggleBtn.style.background = '#d7191c';
            } else {
                // Show Sidebar
                sidebar.style.display = '';

                // Change Grid back to 3 columns
                gridContainer.classList.replace('md:grid-cols-1', 'md:grid-cols-3');

                toggleBtn.textContent = 'Collapse Sidebar & Expand Video';
                toggleBtn.style.background = '#0060df';
            }
        };

        container.appendChild(toggleBtn);
        document.body.appendChild(container);
    };

    const styleBtn = (btn) => {
        Object.assign(btn.style, {
            padding: '8px 12px',
            fontSize: '13px',
            fontWeight: 'bold',
            cursor: 'pointer',
            background: '#0060df',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            fontFamily: 'sans-serif'
        });
    };

    waitForElements();
})();
