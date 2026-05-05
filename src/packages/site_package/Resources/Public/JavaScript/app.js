console.log('Say Hello to the dev: dhackiewicz@gmail.com');

(function () {
    const path = window.location.pathname.replace(/\/+$/, '') || '/';

    function getHeroSection() {
        if (path === '/work') {
            return document.querySelector('.herecheckman [class*="cycle-"]:not(.is-hidden)');
        }
        return document.querySelector('.herecheckman');
    }

    const heroNav = document.getElementById('heroNav');
    const scrollNav = document.getElementById('scrollNav');

    if (!scrollNav) return;

    let lastY = window.scrollY;
    let ticking = false;

    function heroBottom() {
        const heroSection = getHeroSection();
        return heroSection ? (heroSection.getBoundingClientRect().bottom + window.scrollY) : 0;
    }

    function onScroll() {
        const currentHero = getHeroSection();

        if (!currentHero) {
            scrollNav.classList.add('-translate-y-full');
            ticking = false;
            return;
        }

        const y = window.scrollY;
        const goingDown = y > lastY + 100;
        const passedHero = y > heroBottom() + 100;

        if (passedHero) {
            if (goingDown) {
                scrollNav.classList.add('-translate-y-full');
            } else {
                scrollNav.classList.remove('-translate-y-full');
            }
        } else {
            scrollNav.classList.add('-translate-y-full');
        }

        lastY = y;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(onScroll);
            ticking = true;
        }
    }, { passive: true });

    window.addEventListener('resize', () => {
        onScroll();
    });

    document.addEventListener('click', function (e) {
        const filterLink = e.target.closest('[data-category-main-uid]');
        if (!filterLink) return;

        requestAnimationFrame(() => {
            onScroll();
        });
    });

    onScroll();
})();

(function () {
    "use strict";

    const SELECTOR = 'header[id^="heroNav-"]';
    const SNAP_PX = 2;

    let headers = [];
    let spacers = [];
    let originalDocY = [];
    let activeIndex = -1;

    let isRafScheduled = false;
    let enforcementStarted = false; // <-- key: don't touch classes until this becomes true

    function getHeaders() {
        return Array.from(document.querySelectorAll(SELECTOR));
    }

    function ensureSpacers() {
        spacers = headers.map((h) => {
            const prev = h.previousElementSibling;
            if (prev && prev.dataset && prev.dataset.heroNavSpacerFor === h.id) return prev;

            const spacer = document.createElement("div");
            spacer.dataset.heroNavSpacerFor = h.id;
            spacer.style.height = "0px";
            spacer.style.pointerEvents = "none";
            spacer.style.visibility = "hidden";
            h.parentNode.insertBefore(spacer, h);
            return spacer;
        });
    }

    function setSpacer(i, px) {
        const s = spacers[i];
        if (!s) return;
        s.style.height = `${Math.max(0, Math.round(px))}px`;
    }

    function clearAllSpacers() {
        spacers.forEach((s) => {
            if (s) s.style.height = "0px";
        });
    }

    function detectActiveIndexFromMarkup() {
        // If multiple are fixed, pick the first fixed as "active"
        const idx = headers.findIndex((h) => h.classList.contains("fixed"));
        return idx >= 0 ? idx : -1;
    }

    function syncSpacerForActive() {
        if (activeIndex < 0) return;
        setSpacer(activeIndex, headers[activeIndex].offsetHeight);
    }

    function measureOriginalPositions() {
        // Measure original doc positions by temporarily removing fixed, but do it hidden.
        // IMPORTANT: this is allowed (you said toggle is OK), but it must not happen "on start" visibly.
        const fixedState = headers.map((h) => h.classList.contains("fixed"));

        const prevVis = document.documentElement.style.visibility;
        document.documentElement.style.visibility = "hidden";

        clearAllSpacers();
        headers.forEach((h) => h.classList.remove("fixed"));

        originalDocY = headers.map((h) => h.getBoundingClientRect().top + window.scrollY);

        headers.forEach((h, i) => h.classList.toggle("fixed", fixedState[i]));

        document.documentElement.style.visibility = prevVis || "";
    }

    function applyFixedByIndex(index) {
        activeIndex = index;

        headers.forEach((h, i) => {
            const makeFixed = i === activeIndex;
            h.classList.toggle("fixed", makeFixed);

            // Spacer only for the fixed one
            if (makeFixed) setSpacer(i, h.offsetHeight);
            else setSpacer(i, 0);
        });
    }

    function atomicSwitchFixed(toIndex) {
        const fromIndex = activeIndex;
        if (toIndex === fromIndex) return;

        // Prepare spacers FIRST
        if (toIndex >= 0) setSpacer(toIndex, headers[toIndex].offsetHeight);
        if (fromIndex >= 0) setSpacer(fromIndex, 0);

        // Toggle fixed
        headers.forEach((h, i) => h.classList.toggle("fixed", i === toIndex));
        activeIndex = toIndex;

        // Keep spacer synced
        syncSpacerForActive();
    }

    function evaluateAndEnforce() {
        if (!headers.length) return;

        // Start enforcing only after first evaluation (your request)
        if (!enforcementStarted) {
            enforcementStarted = true;

            // Decide current active based on markup *as-is*
            activeIndex = detectActiveIndexFromMarkup();

            // Ensure we have original positions (needed for correct scroll-up behavior)
            measureOriginalPositions();

            // If something is already fixed, prevent jump by reserving its space now
            syncSpacerForActive();

            // Do NOT change any classes in this first phase besides spacer sync.
            // BUT on the SAME evaluation we can now enforce rules below.
        }

        const scrollY = window.scrollY;

        if (!originalDocY.length) return;

        // Above first original -> none fixed
        if (scrollY <= originalDocY[0] + SNAP_PX) {
            atomicSwitchFixed(-1);
            return;
        }

        // If none fixed but scrolled past first -> fix first
        if (activeIndex === -1) {
            atomicSwitchFixed(0);
            return;
        }

        // Scroll UP: if reached original position of current fixed -> previous becomes fixed (or none)
        const currentOrigY = originalDocY[activeIndex];
        if (scrollY <= currentOrigY + SNAP_PX) {
            const prev = activeIndex - 1;
            atomicSwitchFixed(prev >= 0 ? prev : -1);
            return;
        }

        // Scroll DOWN: if next reaches top -> next becomes fixed
        const next = activeIndex + 1;
        if (next < headers.length) {
            const nextTop = headers[next].getBoundingClientRect().top;
            if (nextTop <= SNAP_PX) {
                atomicSwitchFixed(next);
                return;
            }
        }

        // Keep spacer height synced
        syncSpacerForActive();
    }

    function scheduleEval() {
        if (isRafScheduled) return;
        isRafScheduled = true;

        requestAnimationFrame(() => {
            isRafScheduled = false;
            evaluateAndEnforce();
        });
    }

    function init() {
        headers = getHeaders();
        if (!headers.length) return;

        ensureSpacers();

        // IMPORTANT: do not touch `fixed` here. Leave markup as-is.
        // Start enforcing only after first evaluation trigger.

        window.addEventListener("scroll", scheduleEval, { passive: true });
        window.addEventListener("resize", () => {
            headers = getHeaders();
            if (!headers.length) return;

            ensureSpacers();

            // Re-measure originals on resize, but only once enforcement started
            if (enforcementStarted) {
                activeIndex = detectActiveIndexFromMarkup();
                measureOriginalPositions();
                syncSpacerForActive();
            }

            scheduleEval();
        }, { passive: true });

        const observer = new MutationObserver(() => {
            const newHeaders = getHeaders();
            if (!newHeaders.length) return;

            const changed =
                newHeaders.length !== headers.length ||
                newHeaders.some((h, i) => headers[i] !== h);

            if (!changed) return;

            headers = newHeaders;
            ensureSpacers();

            if (enforcementStarted) {
                activeIndex = detectActiveIndexFromMarkup();
                measureOriginalPositions();
                syncSpacerForActive();
            }

            scheduleEval();
        });

        observer.observe(document.documentElement, { childList: true, subtree: true });

        // Optional: if you want it to kick in "soon" but still not "at start",
        // defer one frame (no immediate class changes, but will enforce after paint).
        requestAnimationFrame(() => scheduleEval());
    }

    init();
})();

(function () {
    const path = window.location.pathname;

    // adjust if your detail structure changes
    const isWorkDetail = path.startsWith('/work/') && path !== '/work';

    if (!isWorkDetail) {
        sessionStorage.setItem('lastNonDetailPage', window.location.href);
    }
})();

