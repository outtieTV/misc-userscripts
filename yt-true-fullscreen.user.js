// ==UserScript==
// @name         YouTube True Fullscreen (Video Only)
// @namespace    https://github.com/outtieTV
// @version      2.0
// @description  Removes YouTube's reserved fullscreen space and forces the player to occupy the entire screen.
// @author       outtieTV
// @match        https://www.youtube.com/watch*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    function injectCSS() {
        if (document.getElementById('otv-fullscreen-css')) return;

        const style = document.createElement('style');
        style.id = 'otv-fullscreen-css';

        style.textContent = `
            /* Hide title overlays */
            .ytp-title,
            .ytp-chrome-top {
                display: none !important;
            }

            /* When movie_player itself is fullscreen */
            #movie_player:fullscreen,
            #movie_player:-moz-full-screen {
                position: fixed !important;
                inset: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                max-width: none !important;
                max-height: none !important;
                margin: 0 !important;
                padding: 0 !important;
                background: black !important;
                z-index: 2147483647 !important;
            }

            #movie_player:fullscreen .html5-video-player,
            #movie_player:-moz-full-screen .html5-video-player,
            #movie_player:fullscreen video,
            #movie_player:-moz-full-screen video {
                width: 100vw !important;
                height: 100vh !important;
                max-width: none !important;
                max-height: none !important;
                margin: 0 !important;
                padding: 0 !important;
            }

            /* Hide all watch-page content while fullscreen */
            :fullscreen ytd-watch-flexy #columns,
            :-moz-full-screen ytd-watch-flexy #columns,
            :fullscreen ytd-watch-flexy #below,
            :-moz-full-screen ytd-watch-flexy #below,
            :fullscreen ytd-watch-flexy #secondary,
            :-moz-full-screen ytd-watch-flexy #secondary,
            :fullscreen ytd-watch-flexy #comments,
            :-moz-full-screen ytd-watch-flexy #comments,
            :fullscreen ytd-watch-flexy #related,
            :-moz-full-screen ytd-watch-flexy #related {
                display: none !important;
            }

            /* Force player containers to fill viewport */
            :fullscreen #player,
            :-moz-full-screen #player,
            :fullscreen #player-container,
            :-moz-full-screen #player-container,
            :fullscreen .html5-video-player,
            :-moz-full-screen .html5-video-player {
                width: 100vw !important;
                height: 100vh !important;
                max-width: none !important;
                max-height: none !important;
                margin: 0 !important;
                padding: 0 !important;
            }

            /* Optional: hide controls entirely */
            /*
            .ytp-chrome-bottom {
                display: none !important;
            }
            */
        `;

        document.documentElement.appendChild(style);
    }

    function patchFullscreenButton() {
        const btn = document.querySelector('.ytp-fullscreen-button');

        if (!btn || btn.dataset.otvPatched) return;

        btn.dataset.otvPatched = 'true';

        btn.addEventListener(
            'click',
            function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();

                const player = document.getElementById('movie_player');

                if (!player) return;

                if (!document.fullscreenElement) {
                    player.requestFullscreen().catch(() => {});
                } else {
                    document.exitFullscreen().catch(() => {});
                }
            },
            true
        );
    }

    function patchKeyboard() {
        document.addEventListener(
            'keydown',
            e => {
                if (
                    e.key.toLowerCase() === 'f' &&
                    !e.ctrlKey &&
                    !e.altKey &&
                    !e.metaKey
                ) {
                    const player = document.getElementById('movie_player');
                    if (!player) return;

                    e.preventDefault();
                    e.stopImmediatePropagation();

                    if (!document.fullscreenElement) {
                        player.requestFullscreen().catch(() => {});
                    } else {
                        document.exitFullscreen().catch(() => {});
                    }
                }
            },
            true
        );
    }

    injectCSS();

    const observer = new MutationObserver(() => {
        patchFullscreenButton();
    });

    function start() {
        patchFullscreenButton();
        patchKeyboard();

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
