// ==UserScript==
// @name         YouTube Center Metadata
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Reliably centers YouTube video metadata (title, channel info, description) under the video player — even on navigation or layout shifts.
// @author       OuttieTV
// @match        https://*.youtube.com/*
// @match        http://*.youtube.com/*
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // This CSS block uses multiple, highly specific selectors to override YouTube's
    // default left-aligned Flexbox layout, ensuring the metadata content is centered.
    const cssToInject = `
        /* 1. Target the main metadata container */
        ytd-watch-metadata {
            max-width: 1280px !important;
            width: 100% !important;
            margin: 0 auto !important; /* simple, strong centering */
            padding: 0 16px !important;
            box-sizing: border-box !important;
            border-radius: 15px;
        }

        /* 2. Force its ancestor containers to center child elements.
           This is the KEY to reliable centering on YouTube's complex Flexbox hierarchy. */
        #below, #primary-inner, #columns {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
        }

        /* 3. Ensure the description section itself is contained and centered */
        #description-inner, #description {
            max-width: 1280px !important;
            width: 100% !important;
            margin: 0 auto !important;
            text-align: center;
        }

        /* 4. Ensure the video owner/channel section is contained and centered */
        ytd-video-owner-renderer {
            max-width: 1280px !important;
            width: 100% !important;
            margin: 0 auto !important;
        }

        /* 5. Optional: Keep title text visually centered */
        #title h1 {
             justify-content: center !important;
             text-align: center !important;
             width: 100%;
        }
    `;

    /**
     * @description Injects the centering CSS into the document head using GM_addStyle.
     */
    function applyStyles() {
        if (typeof GM_addStyle !== 'undefined') {
            GM_addStyle(cssToInject);
            // console.log('[CenterMetadata] Styles applied via GM_addStyle.');
        } else {
            const style = document.createElement('style');
            style.textContent = cssToInject;
            document.head.appendChild(style);
            // console.log('[CenterMetadata] Styles applied via standard <style> tag.');
        }
    }

    /**
     * @description Sets up the MutationObserver to watch for dynamic page changes.
     */
    function setupObserver() {
        const target = document.getElementById('page-manager');
        if (!target) {
            // console.log('[CenterMetadata] Retrying observer setup...');
            setTimeout(setupObserver, 1000);
            return;
        }

        applyStyles();

        // The MutationObserver ensures styles are reapplied when navigating between videos
        const observer = new MutationObserver(() => {
            applyStyles();
        });

        observer.observe(target, { childList: true, subtree: true });
        // console.log('[CenterMetadata] MutationObserver active.');
    }

    setupObserver();
})();
