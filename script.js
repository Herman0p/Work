document.addEventListener("DOMContentLoaded", () => {
    
    // =================================================================
    // 0. SAFETY FAILSAFE (ANTI-MACET)
    // =================================================================
    // Jika dalam 3 detik loading macet, paksa buka
    setTimeout(() => {
        const preloader = document.querySelector(".preloader");
        if (document.body.classList.contains("is-loading")) {
            document.body.classList.remove("is-loading");
            if (preloader) gsap.to(preloader, { yPercent: -100, duration: 1 });
            if (typeof lenis !== 'undefined') lenis.start();
        }
    }, 3500);

    // Register GSAP Plugin
    gsap.registerPlugin(ScrollTrigger);


    // =================================================================
    // 1. LENIS SMOOTH SCROLL (SETTINGAN BERAT ALA VICROJO)
    // =================================================================
    const lenis = new Lenis({
        duration: 1.5, // Lebih lambat = lebih "berat/mahal"
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
    
    // Stop scroll di awal
    lenis.stop();


    // =================================================================
    // 2. LOGIKA LOADING (SESSION BASED)
    // =================================================================
    // Cek apakah user baru datang atau pindah halaman
    const isFirstVisit = !sessionStorage.getItem("visited");
    const preloader = document.querySelector(".preloader");
    const counterElement = document.querySelector(".counter");
    const symbolElement = document.querySelector(".symbol");

    const masterTimeline = gsap.timeline({
        onComplete: () => {
            document.body.classList.remove("is-loading");
            lenis.start();
            initPageAnimations(); // Jalankan animasi konten
            sessionStorage.setItem("visited", "true"); // Tandai sudah berkunjung
        }
    });

    if (isFirstVisit) {
        // --- SKENARIO 1: PENGUNJUNG BARU (Hitung 0-100) ---
        let progress = { value: 0 };

        masterTimeline
            .to(progress, {
                value: 100,
                duration: 2.2,
                ease: "power2.inOut",
                onUpdate: () => {
                    if(counterElement) counterElement.textContent = Math.round(progress.value);
                }
            })
            .to([counterElement, symbolElement], {
                y: -50,
                opacity: 0,
                duration: 0.5,
                ease: "power2.in"
            })
            .to(preloader, {
                yPercent: -100, // Tirai Naik
                duration: 1.2,
                ease: "power4.inOut"
            });

    } else {
        // --- SKENARIO 2: PINDAH HALAMAN (Tanpa Hitung, Langsung Buka) ---
        // Sembunyikan angka karena tidak perlu hitung lagi
        if(counterElement) counterElement.style.display = "none";
        if(symbolElement) symbolElement.style.display = "none";
        
        masterTimeline
            .to(preloader, {
                yPercent: -100, // Langsung naik
                duration: 1.0,
                ease: "power4.inOut",
                delay: 0.2 // Jedah sedikit biar smooth
            });
    }


    // =================================================================
    // 3. ANIMASI KONTEN (PAGE ANIMATIONS)
    // =================================================================
    function initPageAnimations() {
        
        // A. Reveal Text (Judul Hero muncul dari bawah)
        // Mencari semua elemen dengan class .reveal-text atau .hero-title
        const titles = document.querySelectorAll(".hero-title, .reveal-text, .project-title-large, .contact-email-huge");
        
        if (titles.length > 0) {
            gsap.from(titles, {
                y: "110%", // Muncul dari bawah wrapper
                duration: 1.5,
                stagger: 0.1, // Muncul berurutan (Cascade effect)
                ease: "power4.out",
                clearProps: "all" // Bersihkan style setelah animasi
            });
        }

        // B. Work Item Hover Effect (Dimming) - KHUSUS HALAMAN WORK
        const workItems = document.querySelectorAll('.work-item');
        const workList = document.querySelector('.work-list, .work-list-full');

        if (workList && workItems.length > 0) {
            workItems.forEach(item => {
                // Saat mouse masuk: Redupkan yang LAIN
                item.addEventListener('mouseenter', () => {
                    workItems.forEach(other => {
                        if (other !== item) {
                            gsap.to(other, { opacity: 0.3, duration: 0.4 });
                        }
                    });
                });
                // Saat mouse keluar: Kembalikan semua
                workList.addEventListener('mouseleave', () => {
                    workItems.forEach(other => {
                        gsap.to(other, { opacity: 1, duration: 0.4 });
                    });
                });
            });
        }

        // C. Marquee (Teks Berjalan)
        initMarquees();
    }


    // =================================================================
    // 4. INFINITE MARQUEE LOGIC
    // =================================================================
    function initMarquees() {
        const marquees = document.querySelectorAll('.marquee-inner');
        marquees.forEach(wrapper => {
            const span = wrapper.querySelector('span');
            if(!span) return;
            
            // Clone elemen sampai layar penuh
            const contentWidth = span.offsetWidth;
            if(contentWidth === 0) return; // Safety check
            
            const clonesNeeded = Math.ceil(window.innerWidth / contentWidth) + 2;
            
            for(let i=0; i<clonesNeeded; i++) {
                wrapper.appendChild(span.cloneNode(true));
            }

            // Animasi Loop
            gsap.to(wrapper, {
                x: -contentWidth,
                duration: 20,
                ease: "none",
                repeat: -1,
                modifiers: {
                    x: gsap.utils.unitize(x => parseFloat(x) % contentWidth)
                }
            });
        });
    }


    // =================================================================
    // 5. PAGE TRANSITION (EXIT ANIMATION)
    // =================================================================
    // Ini rahasia kenapa web terasa seperti App.
    // Saat link diklik, tirai turun dulu, baru pindah URL.
    
    const links = document.querySelectorAll('a:not([href^="#"]):not([href^="mailto:"]):not([target="_blank"])');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetHref = link.getAttribute('href');
            if (!targetHref || targetHref === window.location.pathname) return; // Jangan reload kalau link sama

            e.preventDefault();

            // Reset posisi preloader ke atas layar
            if(preloader) {
                gsap.set(preloader, { yPercent: -100, display: "flex" });
                
                // Animasi Tirai Turun
                gsap.to(preloader, {
                    yPercent: 0,
                    duration: 0.8,
                    ease: "power4.inOut",
                    onComplete: () => {
                        window.location.href = targetHref;
                    }
                });
            } else {
                window.location.href = targetHref;
            }
        });
    });

});
