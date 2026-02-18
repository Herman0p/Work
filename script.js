document.addEventListener("DOMContentLoaded", () => {
    
    // =================================================================
    // 1. LENIS SMOOTH SCROLL SETUP
    // =================================================================
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    // Sinkronisasi Lenis dengan GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    
    gsap.ticker.lagSmoothing(0);

    // Stop scroll saat awal (karena sedang loading)
    lenis.stop();


    // =================================================================
    // 2. PRELOADER ANIMATION (ENTRY)
    // =================================================================
    function startLoader() {
        const counterElement = document.querySelector(".counter");
        const preloader = document.querySelector(".preloader");
        const heroTitles = document.querySelectorAll(".hero-title"); // Judul Hero

        // Pastikan elemen ada sebelum dijalankan
        if (!counterElement || !preloader) return;

        // Objek proxy untuk animasi angka
        let loadingProgress = { value: 0 };

        const tl = gsap.timeline({
            onComplete: () => {
                document.body.classList.remove("is-loading");
                lenis.start(); // Ijinkan scroll lagi
                initMarquees(); // Jalankan marquee setelah loading selesai
            }
        });

        tl
        // Langkah 1: Hitung 0 sampai 100
        .to(loadingProgress, {
            value: 100,
            duration: 2.5, // Durasi loading
            ease: "power2.inOut",
            onUpdate: function() {
                counterElement.textContent = Math.round(loadingProgress.value);
            }
        })
        // Langkah 2: Angka menghilang
        .to(counterElement.parentNode, {
            opacity: 0,
            duration: 0.5,
            ease: "power2.inOut"
        })
        // Langkah 3: Layar Hitam Naik ke Atas (Curtain Reveal)
        .to(preloader, {
            yPercent: -100,
            duration: 1.2,
            ease: "power4.inOut" // Easing dramatis ala Vicrojo
        })
        // Langkah 4: Judul Hero Muncul (Staggered)
        .from(heroTitles, {
            y: 150, // Muncul dari bawah
            opacity: 0,
            duration: 1.5,
            stagger: 0.1, // Muncul berurutan
            ease: "power4.out"
        }, "-=0.8"); // Mulai sedikit lebih awal sebelum tirai selesai naik
    }

    startLoader();


    // =================================================================
    // 3. INFINITE MARQUEE (TEXT LOOP)
    // =================================================================
    function initMarquees() {
        const marquees = document.querySelectorAll('.marquee-inner');

        marquees.forEach(wrapper => {
            // 1. Ambil konten asli (span)
            const originalContent = wrapper.querySelector('span');
            if(!originalContent) return;

            // 2. Clone konten secukupnya untuk memenuhi layar + buffer
            const containerWidth = window.innerWidth;
            const contentWidth = originalContent.offsetWidth;
            
            // Hitung berapa banyak clone yang dibutuhkan (minimal 2 set penuh)
            const clonesNeeded = Math.ceil(containerWidth / contentWidth) + 2;

            for (let i = 0; i < clonesNeeded; i++) {
                const clone = originalContent.cloneNode(true);
                wrapper.appendChild(clone);
            }

            // 3. Animasi GSAP (Bergerak ke kiri selamanya)
            gsap.to(wrapper, {
                x: -contentWidth, // Bergerak sejauh lebar satu elemen
                duration: 15,     // Kecepatan (makin besar makin lambat)
                ease: "none",
                repeat: -1,       // Loop selamanya
                modifiers: {
                    x: gsap.utils.unitize(x => parseFloat(x) % contentWidth) // Reset posisi mulus tanpa lompat
                }
            });
        });
    }


    // =================================================================
    // 4. PAGE TRANSITION (EXIT ANIMATION)
    // =================================================================
    // Setiap kali link diklik, layar hitam turun dulu baru pindah
    const links = document.querySelectorAll('a:not([href^="#"]):not([href^="mailto:"]):not([target="_blank"])');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Cegah pindah langsung
            const targetHref = link.getAttribute('href');
            const preloader = document.querySelector(".preloader");

            // Animasi Tirai Turun
            gsap.to(preloader, {
                yPercent: 0, // Kembali menutupi layar (0%)
                duration: 0.8,
                ease: "power4.inOut",
                onComplete: () => {
                    window.location.href = targetHref; // Pindah halaman setelah tertutup
                }
            });
        });
    });


    // =================================================================
    // 5. MAGNETIC BUTTONS (OPSIONAL POLISH)
    // =================================================================
    // Efek magnet saat mouse mendekati tombol/link tertentu
    const magneticBtns = document.querySelectorAll('.work-item, .footer-email');

    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(btn, {
                x: x * 0.1, // Bergerak sedikit mengikuti mouse
                y: y * 0.1,
                duration: 0.3,
                ease: "power2.out"
            });
        });

        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.3)"
            });
        });
    });

});
