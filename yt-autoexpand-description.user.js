// ==UserScript==
// @name         Youtube Auto-Expand Description
// @version      1.0
// @description  Clicks the “more” button as soon as it appears.
// @author       OuttieTV
// @match        *://*.youtube.com/watch*
// @grant        none
// ==/UserScript==

/**
 * Click the description‑expander button when it becomes available.
 */
function clickIfReady() {
  const btn = document.querySelector('#expand');
  if (btn) {
    btn.click();
    return true; // button was found and clicked
  }
  return false; // not yet in the DOM
}

/**
 * Observe mutations in the page and trigger the click as soon as the button
 * is added. The observer stays active to handle navigation between videos.
 */
function startObserver() {
  let lastHref = location.href;

  const observer = new MutationObserver(() => {
    // Detect SPA navigation (URL change without reload)
    if (location.href !== lastHref) {
      lastHref = location.href;
      // Give the new page a moment to start rendering; the observer will
      // catch the button when it appears.
    }

    // Try to click the button on every DOM change
    if (clickIfReady()) {
      // Optional: stop observing after the first successful click
      // observer.disconnect();
    }
  });

  // Watch the whole body – YouTube injects the button deep inside the
  // description container, so a broad scope is safest.
  observer.observe(document.body, { childList: true, subtree: true });

  // In case the button is already present on script load
  clickIfReady();
}

// Run the setup
startObserver();
