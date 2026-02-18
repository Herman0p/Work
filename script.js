// Initialize Lenis for smooth scrolling
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
});

// Get time and update Lenis on every frame
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Integrate GSAP ScrollTrigger with Lenis
gsap.registerPlugin(ScrollTrigger);

// Preloader Animation
function startLoader() {
    const counterElement = document.querySelector('.counter');
    const preloaderElement = document.querySelector('.preloader');

    // Disable scrolling during preloader
    document.body.style.overflow = 'hidden';
    lenis.stop();

    if (counterElement && preloaderElement) {
        let currentValue = 0;

        // Sequence 1: The Count
        const updateCounter = () => {
            if (currentValue === 100) return;

            currentValue += Math.floor(Math.random() * 10) + 1;

            if (currentValue > 100) currentValue = 100;

            counterElement.textContent = currentValue;

            const delay = Math.floor(Math.random() * 200) + 50;

            if (currentValue < 100) {
                setTimeout(updateCounter, delay);
            } else {
                // Sequence 2: The Exit
                setTimeout(() => {
                    const tl = gsap.timeline({
                        onComplete: () => {
                            document.body.style.overflow = '';
                            lenis.start();
                            initPageAnimations(); // Start other animations after loader
                        }
                    });

                    tl.to(counterElement, {
                        opacity: 0,
                        duration: 0.5,
                        ease: "power2.inOut"
                    })
                        .to(preloaderElement, {
                            y: "-100%",
                            duration: 1.5,
                            ease: "power4.inOut"
                        });
                }, 500); // Short pause at 100
            }
        };

        updateCounter();
    } else {
        // Fallback if elements missing
        initPageAnimations();
    }
}

// Wrap existing animations in a function
function initPageAnimations() {
    // Hero Text Reveal Animation
    const revealTexts = document.querySelectorAll('.reveal-text');

    revealTexts.forEach((text, i) => {
        // Check if it's the hero section text vs footer text for different delays
        const isHero = text.closest('.hero');
        const delay = isHero ? 0.2 + (i * 0.1) : 0;

        if (isHero) {
            // Immediate animation for hero
            gsap.to(text, {
                y: 0,
                duration: 1.5,
                ease: "power4.out",
                delay: delay
            });
        } else {
            // ScrollTrigger for other sections (like Footer)
            gsap.to(text, {
                scrollTrigger: {
                    trigger: text,
                    start: "top 90%", // Start when top of element hits 90% of viewport height
                    toggleActions: "play none none reverse"
                },
                y: 0,
                duration: 1.5,
                ease: "power4.out"
            });
        }
    });

    // Infinite Marquee (Refactored for Seamless Loop)
    const marqueeContainer = document.querySelector('.marquee-container');
    const marqueeWrapper = document.querySelector('.marquee-wrapper');
    const marqueeItem = document.querySelector('.marquee-item');

    if (marqueeContainer && marqueeWrapper && marqueeItem) {
        // 1. Fill the screen width with clones
        const containerWidth = window.innerWidth;
        const itemWidth = marqueeItem.offsetWidth;
        const copiesNeeded = Math.ceil(containerWidth / itemWidth) + 1;

        for (let i = 0; i < copiesNeeded; i++) {
            marqueeWrapper.appendChild(marqueeItem.cloneNode(true));
        }

        // 2. Duplicate ENTIRE set for keyframe loop
        const allItems = Array.from(marqueeWrapper.children);
        allItems.forEach(item => {
            marqueeWrapper.appendChild(item.cloneNode(true));
        });

        // 3. Animate xPercent -50% (move 1 full set width)
        const marqueeTween = gsap.to(marqueeWrapper, {
            xPercent: -50,
            repeat: -1,
            duration: 25,
            ease: "none",
        });

        // 4. Hover Effect
        marqueeContainer.addEventListener('mouseenter', () => {
            gsap.to(marqueeTween, { timeScale: 0.2, duration: 0.5 });
        });

        marqueeContainer.addEventListener('mouseleave', () => {
            gsap.to(marqueeTween, { timeScale: 1, duration: 0.5 });
        });
    }
}

// Start everything
startLoader();

// Magnetic Button Effect (kept global as it doesn't interfere with load)
const magneticLinks = document.querySelectorAll('.magnetic-link');

magneticLinks.forEach(link => {
    link.addEventListener('mousemove', (e) => {
        const rect = link.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(link, {
            x: x * 0.3,
            y: y * 0.3,
            duration: 0.3,
            ease: "power2.out"
        });
    });

    link.addEventListener('mouseleave', () => {
        gsap.to(link, {
            x: 0,
            y: 0,
            duration: 0.3,
            ease: "power2.out"
        });
    });
});

// Page Transition / Link Interception
document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        const target = this.getAttribute('target');

        // Return if it's a hash link, empty, opens in new tab, or mailto
        if (!href || href.startsWith('#') || target === '_blank' || href.startsWith('mailto:')) return;

        e.preventDefault();

        const preloaderElement = document.querySelector('.preloader');

        if (preloaderElement) {
            // Animate curtain back DOWN to cover screen
            gsap.to(preloaderElement, {
                y: "0%",
                duration: 1.0, // Faster exit
                ease: "power4.inOut",
                onComplete: () => {
                    window.location.href = href;
                }
            });
        } else {
            window.location.href = href;
        }
    });
});

console.log('Swiss Minimalist Portfolio Initialized');
