// ==UserScript==
// @name         Force Right Click
// @match        *://*/*
// @run-at       document-start
// ==/UserScript==
document.addEventListener('contextmenu', e => e.stopPropagation(), true);
