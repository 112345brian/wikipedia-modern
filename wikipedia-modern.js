(function () {
    'use strict';

    var STYLE_ID = 'wikipedia-modern-js-styles';
    var ROOT_FLAG = 'wikipediaModernJs';
    var ARTICLE_SELECTOR = '#mw-content-text .mw-parser-output';
    var EXCLUDED_TEXT_SELECTOR = [
        'table',
        'figure',
        '.infobox',
        '.navbox',
        '.vertical-navbox',
        '.metadata',
        '.noprint',
        '.reflist',
        '.references',
        '.reference',
        '.mw-editsection',
        '.catlinks'
    ].join(',');

    function onReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback, { once: true });
            return;
        }

        callback();
    }

    function isEditableElement(element) {
        if (!element) {
            return false;
        }

        var tagName = element.tagName;
        return element.isContentEditable ||
            tagName === 'INPUT' ||
            tagName === 'TEXTAREA' ||
            tagName === 'SELECT';
    }

    function getArticleRoot() {
        return document.querySelector(ARTICLE_SELECTOR);
    }

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) {
            return;
        }

        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = [
            '#wm-reading-progress {',
            '    background: var(--color-progressive, #36c);',
            '    height: 3px;',
            '    left: 0;',
            '    position: fixed;',
            '    top: 0;',
            '    transform: scaleX(0);',
            '    transform-origin: 0 50%;',
            '    transition: transform 80ms linear;',
            '    width: 100%;',
            '    z-index: 1000;',
            '}',
            '#wm-back-to-top {',
            '    align-items: center;',
            '    background: var(--background-color-base, #fff);',
            '    border: 1px solid var(--border-color-subtle, #eaecf0);',
            '    border-radius: 999px;',
            '    bottom: 1rem;',
            '    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.14);',
            '    color: var(--color-base, #202122);',
            '    cursor: pointer;',
            '    display: inline-flex;',
            '    font: 600 0.8125rem/1 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Lato, Helvetica, Arial, sans-serif;',
            '    gap: 0.35rem;',
            '    opacity: 0;',
            '    padding: 0.55rem 0.75rem;',
            '    pointer-events: none;',
            '    position: fixed;',
            '    right: 1rem;',
            '    transform: translateY(0.5rem);',
            '    transition: opacity 160ms ease, transform 160ms ease, background-color 160ms ease;',
            '    z-index: 1000;',
            '}',
            '#wm-back-to-top.is-visible {',
            '    opacity: 1;',
            '    pointer-events: auto;',
            '    transform: translateY(0);',
            '}',
            '#wm-back-to-top:hover {',
            '    background: var(--background-color-interactive-subtle, rgba(0, 24, 73, 0.027));',
            '}',
            '#wm-reading-time {',
            '    color: var(--color-subtle, #54595d);',
            '    font: 500 0.875rem/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Lato, Helvetica, Arial, sans-serif;',
            '    margin: -0.35rem 0 1rem;',
            '}',
            '.wm-heading-with-copy {',
            '    position: relative;',
            '}',
            '.wm-copy-heading-link {',
            '    background: transparent;',
            '    border: 0;',
            '    border-radius: 4px;',
            '    color: var(--color-subtle, #54595d);',
            '    cursor: pointer;',
            '    font: 600 0.8em/1 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Lato, Helvetica, Arial, sans-serif;',
            '    margin-left: 0.4rem;',
            '    opacity: 0;',
            '    padding: 0.15rem 0.3rem;',
            '    transition: opacity 120ms ease, background-color 120ms ease, color 120ms ease;',
            '    vertical-align: middle;',
            '}',
            '.wm-heading-with-copy:hover .wm-copy-heading-link,',
            '.wm-copy-heading-link:focus-visible {',
            '    opacity: 1;',
            '}',
            '.wm-copy-heading-link:hover {',
            '    background: var(--background-color-interactive-subtle, rgba(0, 24, 73, 0.027));',
            '    color: var(--color-progressive, #36c);',
            '}',
            'html.skin-theme-clientpref-night #wm-back-to-top {',
            '    background: #1a1a1a;',
            '    border-color: #343434;',
            '    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);',
            '}',
            '@media (prefers-reduced-motion: reduce) {',
            '    #wm-reading-progress,',
            '    #wm-back-to-top,',
            '    .wm-copy-heading-link {',
            '        transition: none;',
            '    }',
            '}'
        ].join('\n');

        document.head.appendChild(style);
    }

    function createReadingProgress() {
        var progress = document.createElement('div');
        var scheduled = false;

        progress.id = 'wm-reading-progress';
        progress.setAttribute('aria-hidden', 'true');
        document.body.appendChild(progress);

        function update() {
            var documentElement = document.documentElement;
            var maxScroll = documentElement.scrollHeight - window.innerHeight;
            var percent = maxScroll > 0 ? window.scrollY / maxScroll : 0;

            progress.style.transform = 'scaleX(' + Math.min(Math.max(percent, 0), 1) + ')';
            scheduled = false;
        }

        function requestUpdate() {
            if (scheduled) {
                return;
            }

            scheduled = true;
            window.requestAnimationFrame(update);
        }

        window.addEventListener('scroll', requestUpdate, { passive: true });
        window.addEventListener('resize', requestUpdate);
        update();
    }

    function createBackToTopButton() {
        var button = document.createElement('button');
        var scheduled = false;

        button.id = 'wm-back-to-top';
        button.type = 'button';
        button.textContent = 'Top';
        button.setAttribute('aria-label', 'Back to top');
        button.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        document.body.appendChild(button);

        function update() {
            button.classList.toggle('is-visible', window.scrollY > 700);
            scheduled = false;
        }

        function requestUpdate() {
            if (scheduled) {
                return;
            }

            scheduled = true;
            window.requestAnimationFrame(update);
        }

        window.addEventListener('scroll', requestUpdate, { passive: true });
        update();
    }

    function getArticleText(root) {
        return Array.prototype.slice.call(root.querySelectorAll('p, li'))
            .filter(function (node) {
                return !node.closest(EXCLUDED_TEXT_SELECTOR);
            })
            .map(function (node) {
                return node.textContent || '';
            })
            .join(' ');
    }

    function addReadingTime(root) {
        var heading = document.querySelector('#firstHeading');

        if (!heading || document.getElementById('wm-reading-time')) {
            return;
        }

        var text = getArticleText(root);
        var matches = text.match(/\b[\w'-]+\b/g);
        var wordCount = matches ? matches.length : 0;

        if (wordCount < 250) {
            return;
        }

        var minutes = Math.max(1, Math.round(wordCount / 230));
        var readingTime = document.createElement('div');

        readingTime.id = 'wm-reading-time';
        readingTime.textContent = minutes + ' min read';
        heading.insertAdjacentElement('afterend', readingTime);
    }

    function getHeadingId(heading) {
        if (heading.id) {
            return heading.id;
        }

        var childWithId = heading.querySelector('[id]');
        return childWithId ? childWithId.id : '';
    }

    function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }

        return new Promise(function (resolve, reject) {
            var textarea = document.createElement('textarea');

            textarea.value = text;
            textarea.setAttribute('readonly', '');
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.select();

            try {
                document.execCommand('copy');
                resolve();
            } catch (error) {
                reject(error);
            } finally {
                textarea.remove();
            }
        });
    }

    function addHeadingCopyLinks(root) {
        var headings = root.querySelectorAll('h2, h3, h4, h5, h6');

        Array.prototype.forEach.call(headings, function (heading) {
            var id = getHeadingId(heading);
            var button = document.createElement('button');

            if (!id || heading.querySelector('.wm-copy-heading-link')) {
                return;
            }

            heading.classList.add('wm-heading-with-copy');
            button.type = 'button';
            button.className = 'wm-copy-heading-link';
            button.textContent = '#';
            button.setAttribute('aria-label', 'Copy section link');
            button.title = 'Copy section link';
            button.addEventListener('click', function (event) {
                var url = window.location.origin + window.location.pathname + '#' + encodeURIComponent(id);

                event.preventDefault();
                event.stopPropagation();

                copyText(url).then(function () {
                    button.textContent = 'Copied';
                    window.setTimeout(function () {
                        button.textContent = '#';
                    }, 1100);
                });
            });

            heading.appendChild(button);
        });
    }

    function focusSearch() {
        var input = document.querySelector('#searchInput, input[name="search"], input[type="search"]');

        if (!input) {
            return;
        }

        input.focus();
        if (typeof input.select === 'function') {
            input.select();
        }
    }

    function addKeyboardShortcuts() {
        document.addEventListener('keydown', function (event) {
            if (event.defaultPrevented ||
                event.key !== '/' ||
                event.metaKey ||
                event.ctrlKey ||
                event.altKey ||
                isEditableElement(event.target)) {
                return;
            }

            event.preventDefault();
            focusSearch();
        });
    }

    function centerActiveTocItem() {
        var activeLink = document.querySelector('.vector-toc-list-item-active > .vector-toc-link');

        if (!activeLink || typeof activeLink.scrollIntoView !== 'function') {
            return;
        }

        activeLink.scrollIntoView({ block: 'nearest' });
    }

    function improveTocTracking() {
        var toc = document.getElementById('vector-toc');

        if (!toc || typeof MutationObserver === 'undefined') {
            return;
        }

        var scheduled = false;
        var observer = new MutationObserver(function () {
            if (scheduled) {
                return;
            }

            scheduled = true;
            window.requestAnimationFrame(function () {
                centerActiveTocItem();
                scheduled = false;
            });
        });

        observer.observe(toc, {
            attributes: true,
            attributeFilter: ['class'],
            subtree: true
        });
    }

    function init() {
        var root = getArticleRoot();

        if (document.documentElement.dataset[ROOT_FLAG] || !root) {
            return;
        }

        document.documentElement.dataset[ROOT_FLAG] = 'true';
        injectStyles();
        createReadingProgress();
        createBackToTopButton();
        addReadingTime(root);
        addHeadingCopyLinks(root);
        addKeyboardShortcuts();
        improveTocTracking();
    }

    onReady(init);
}());
