// ==UserScript==
// @name         YouTube Auto-Expand Description
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Expands the video description automatically without breaking YouTube's right-click menu.
// @author       OuttieTV
// @match        https://*.youtube.com/*
// @match        http://*.youtube.com/*
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  // Deep selector that can look into shadow DOMs
  function deepQuerySelector(root, selector) {
    const el = root.querySelector(selector);
    if (el) return el;
    for (const child of root.querySelectorAll('*')) {
      if (child.shadowRoot) {
        const found = deepQuerySelector(child.shadowRoot, selector);
        if (found) return found;
      }
    }
    return null;
  }

  // Finds the "...more" button robustly
  function getExpandButton() {
    return (
      deepQuerySelector(document, 'tp-yt-paper-button#expand') ||
      deepQuerySelector(document, 'tp-yt-paper-button[aria-label="Show more"]') ||
      deepQuerySelector(document, 'tp-yt-paper-button[aria-label="More"]')
    );
  }

  // Safely clicks using a native event (not .click())
  function clickExpandButton() {
    const btn = getExpandButton();
    if (!btn) return false;
    if (btn.hasAttribute('disabled') || btn.getAttribute('aria-disabled') === 'true') return false;

    const evt = new MouseEvent('click', { bubbles: true, cancelable: true, composed: true });
    btn.dispatchEvent(evt);
    return true;
  }

  // Detects when video contextmenu works
  function playerContextMenuReady() {
    const vid = document.querySelector('video');
    if (!vid) return false;
    // heuristic: video has listeners and controls visible
    return vid.readyState >= 1 && vid.clientWidth > 0;
  }

  function clickIfReadyWithSafety() {
    // only expand after right-click menu is available
    if (!playerContextMenuReady()) {
      setTimeout(clickIfReadyWithSafety, 500);
      return;
    }
    clickExpandButton();
  }

  // Observe navigation & mutations
  function startObserver() {
    let lastHref = location.href;
    let timer = null;

    const observer = new MutationObserver(() => {
      if (location.href !== lastHref) {
        lastHref = location.href;
        clearTimeout(timer);
        // delay expansion to allow YouTube to attach player event handlers first
        timer = setTimeout(clickIfReadyWithSafety, 1200);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Try on first page load
    setTimeout(clickIfReadyWithSafety, 1200);
  }

  startObserver();
})();
