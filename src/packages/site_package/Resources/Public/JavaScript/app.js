console.log('Say Hello to the dev: dhackiewicz@gmail.com');

(function(){
    //const heroSection = document.querySelector('main > section');
    const heroSection = document.querySelector('.herecheckman');
    const heroNav = document.getElementById('heroNav');
    const scrollNav = document.getElementById('scrollNav');

    if(!heroSection){
        scrollNav.classList.add('-translate-y-full');
        return;
    }
    
    let lastY = window.scrollY;
    let ticking = false;

    //const heroBottom = () => heroSection.getBoundingClientRect().bottom + window.scrollY;
    const heroBottom = () => heroSection ? (heroSection.getBoundingClientRect().bottom + window.scrollY) : 0;

    function onScroll(){
        const y = window.scrollY;
        const goingDown = y > lastY + 100; // small threshold to avoid flicker
        //const passedHero = y > heroBottom() - window.innerHeight * 0.35; // start enabling after hero mostly gone
        const passedHero = y > heroBottom() + 100;

        // Primary nav sits under later images: handled by z-index in markup.
        // Toggle the scroll-up nav
        if(passedHero){
            if(goingDown){
                // hide when user scrolls down
                scrollNav.classList.add('-translate-y-full');
            } else {
                // show when user scrolls up
                scrollNav.classList.remove('-translate-y-full');
            }
        } else {
            // near top: never show the scroll-up nav
            scrollNav.classList.add('-translate-y-full');
        }

        lastY = y;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if(!ticking){
            window.requestAnimationFrame(onScroll);
            ticking = true;
        }
    }, {passive:true});

    // Recompute on resize to keep the trigger accurate
    window.addEventListener('resize', () => {
        onScroll();
    });

    // kick once
    onScroll();

})();



