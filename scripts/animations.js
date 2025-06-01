// GSAP ve Particles.js animasyonlarının konfigürasyonu
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS Animation Library
    AOS.init({
        duration: 800,
        once: false,
        offset: 100,
        delay: 100,
        startEvent: 'DOMContentLoaded',
        disableMutationObserver: false,
        mirror: true,
    });

    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        // Sayfa yüklendiğinde scroll pozisyonunu kontrol et
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Scroll event listener
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Initialize Brands Carousel
    if (document.querySelector('.brands-carousel')) {
        $('.brands-carousel').slick({
            dots: false,
            infinite: true,
            speed: 500,
            slidesToShow: 5,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 2000,
            arrows: false,
            responsive: [
                {
                    breakpoint: 992,
                    settings: {
                        slidesToShow: 3
                    }
                },
                {
                    breakpoint: 576,
                    settings: {
                        slidesToShow: 2
                    }
                }
            ]
        });
    }

    // Hero Section Background Slider Animation
    if (document.querySelector('.hero-modern-slider')) {
        let currentSlide = 0;
        const slides = document.querySelectorAll('.hero-bg');
        const totalSlides = slides.length;
        const slideCounter = document.querySelector('.hero-slide-counter .current');
        const slideTotal = document.querySelector('.hero-slide-counter .total');
        const slideInterval = 10000; // 10 saniye
        
        // Update slide counter
        if (slideTotal) {
            slideTotal.textContent = totalSlides < 10 ? '0' + totalSlides : totalSlides;
        }
        
        // İlk slaytta Ken Burns efektini başlat
        slides[0].classList.add('bg-active');
        
        // Her slayt için GSAP animasyonu
        function animateSlide(slideIndex) {
            const slide = slides[slideIndex];
            
            // Önceki aktif slaytların class'ını kaldır
            slides.forEach((s, i) => {
                if (i !== slideIndex) {
                    s.classList.remove('bg-active');
                }
            });
            
            // Yeni slayta aktif class'ı ekle
            slide.classList.add('bg-active');
            
            // Update slide counter
            if (slideCounter) {
                slideCounter.textContent = slideIndex + 1 < 10 ? '0' + (slideIndex + 1) : (slideIndex + 1);
            }
            
            // GSAP ile Ken Burns efektini güçlendir
            gsap.fromTo(slide,
                { scale: 1.02, opacity: 0 },
                { 
                    scale: 1.1, 
                    opacity: 1, 
                    duration: 1.5,
                    onComplete: function() {
                        // Ken Burns efektini daha dramatik yap
                        gsap.to(slide, {
                            scale: 1.15, 
                            duration: slideInterval / 1000 - 1.5, 
                            ease: "none", 
                            transformOrigin: "center center"
                        });
                    }
                }
            );
        }
        
        // İlk slaytı hemen göster
        animateSlide(0);
        
        // Belirli aralıklarla slaytları değiştir
        setInterval(function() {
            currentSlide = (currentSlide + 1) % totalSlides;
            animateSlide(currentSlide);
        }, slideInterval);
        
        // Hero Section Text Animations
        gsap.to(".hero-title", { 
            opacity: 1, 
            y: 0, 
            duration: 1, 
            delay: 0.5,
            ease: "power3.out" 
        });
        
        gsap.to(".hero-subtitle", { 
            opacity: 1, 
            y: 0, 
            duration: 1, 
            delay: 0.8,
            ease: "power3.out" 
        });
        
        gsap.to(".hero-buttons", { 
            opacity: 1, 
            y: 0, 
            duration: 1, 
            delay: 1.1,
            ease: "power3.out" 
        });

        // Circuit animation
        const circuitTimeline = gsap.timeline();

        // Animate horizontal lines
        circuitTimeline.to(".h-line-1", {
            width: "40%",
            duration: 1.5,
            ease: "power1.inOut"
        });

        circuitTimeline.to(".h-line-2", {
            width: "35%",
            duration: 1.2,
            ease: "power1.inOut"
        }, "-=0.8");

        circuitTimeline.to(".h-line-3", {
            width: "30%",
            duration: 1,
            ease: "power1.inOut"
        }, "-=0.8");

        // Animate vertical lines
        circuitTimeline.to(".v-line-1", {
            height: "25%",
            duration: 1.3,
            ease: "power1.inOut"
        }, "-=1.5");

        circuitTimeline.to(".v-line-2", {
            height: "35%",
            duration: 1.4,
            ease: "power1.inOut"
        }, "-=1.2");

        // Animate dots
        circuitTimeline.to(".circuit-dot", {
            opacity: 1,
            scale: 1.5,
            duration: 0.3,
            stagger: 0.1,
            ease: "power1.out"
        }, "-=1");

        circuitTimeline.to(".circuit-dot", {
            scale: 1,
            duration: 0.2,
            ease: "power1.in"
        });

        // Animate nodes
        circuitTimeline.to(".circuit-node", {
            opacity: 1,
            scale: 1.2,
            duration: 0.5,
            stagger: 0.1,
            ease: "back.out"
        }, "-=0.5");

        circuitTimeline.to(".circuit-node", {
            scale: 1,
            duration: 0.3,
            ease: "power1.in"
        });

        // Animate SVG paths
        circuitTimeline.to(".circuit-path", {
            strokeDashoffset: 0,
            duration: 3,
            stagger: 0.2,
            ease: "power1.inOut"
        }, "-=2");

        // Floating gears rotation
        gsap.to(".gear-1", {
            rotation: 360,
            duration: 20,
            repeat: -1,
            ease: "linear"
        });

        gsap.to(".gear-2", {
            rotation: -360,
            duration: 30,
            repeat: -1,
            ease: "linear"
        });

        gsap.to(".gear-3", {
            rotation: 360,
            duration: 15,
            repeat: -1,
            ease: "linear"
        });

        // Pulsating effect for nodes
        gsap.to(".circuit-node", {
            boxShadow: "0 0 10px rgba(252, 114, 21, 0.7)",
            repeat: -1,
            yoyo: true,
            duration: 1.5,
            ease: "sine.inOut"
        });

        // Add floating animation to dots
        gsap.to(".dot-1, .dot-3", {
            y: "-=5",
            repeat: -1,
            yoyo: true,
            duration: 2,
            ease: "sine.inOut"
        });

        gsap.to(".dot-2, .dot-4", {
            y: "+=5",
            repeat: -1,
            yoyo: true,
            duration: 2.5,
            ease: "sine.inOut",
            delay: 0.5
        });
    }
    
    // Initialize Counter Animation
    const counterElements = document.querySelectorAll('.counter');
    if (counterElements.length > 0) {
        counterElements.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count')) || 0;
            
            // Counter değerini direk atayalım önce
            counter.textContent = target;
            
            // Sonra animasyon için GSAP kullanabiliriz
            gsap.from(counter, {
                textContent: 0,
                duration: 2,
                ease: "power2.out",
                snap: { textContent: 1 },
                onUpdate: function() {
                    counter.textContent = Math.round(this.targets()[0].textContent);
                }
            });
        });
    }
    
    // Parallax Effect for Section Backgrounds
    if (window.innerWidth > 768) {
        gsap.utils.toArray('[data-parallax]').forEach(section => {
            const depth = section.dataset.speed || 0.2;
            const movement = -(section.offsetHeight * depth);
            
            gsap.fromTo(section,
                { backgroundPosition: `50% 0px` },
                {
                    backgroundPosition: `50% ${movement}px`,
                    ease: "none",
                    scrollTrigger: {
                        trigger: section,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true
                    }
                }
            );
        });
    }
    
    // Animate Service Cards on hover
    const serviceCards = document.querySelectorAll('.service-card');
    if (serviceCards.length > 0) {
        serviceCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                gsap.to(this, { 
                    y: -10, 
                    duration: 0.3, 
                    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.15)' 
                });
            });
            
            card.addEventListener('mouseleave', function() {
                gsap.to(this, { 
                    y: 0, 
                    duration: 0.3, 
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)' 
                });
            });
        });
    }
    
    // Scroll Trigger Animations
    if (typeof ScrollTrigger !== 'undefined') {
        // Animate elements when scrolling into view
        gsap.utils.toArray('.fade-up').forEach(elem => {
            gsap.from(elem, { 
                y: 50,
                opacity: 0,
                duration: 1,
                scrollTrigger: {
                    trigger: elem,
                    start: "top bottom-=100",
                    toggleActions: "play none none none"
                }
            });
        });
        
        // Animate section titles
        gsap.utils.toArray('.section-title').forEach(title => {
            const timeline = gsap.timeline({
                scrollTrigger: {
                    trigger: title,
                    start: "top bottom-=100",
                    toggleActions: "play none none none"
                }
            });
            
            timeline
                .from(title, { opacity: 0, y: 30, duration: 0.7 })
                .from(title.nextElementSibling, { 
                    width: 0, 
                    duration: 0.5 
                }, "-=0.3");
        });
    }
    
    // Initialize Particles.js for hero background
    if (document.getElementById('particles-js')) {
        particlesJS("particles-js", {
            particles: {
                number: {
                    value: 80,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: "#ffffff"
                },
                shape: {
                    type: "circle",
                    stroke: {
                        width: 0,
                        color: "#000000"
                    },
                    polygon: {
                        nb_sides: 5
                    }
                },
                opacity: {
                    value: 0.3,
                    random: false,
                    anim: {
                        enable: false,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: false,
                        speed: 40,
                        size_min: 0.1,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: "#ffffff",
                    opacity: 0.2,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: "none",
                    random: false,
                    straight: false,
                    out_mode: "out",
                    bounce: false,
                    attract: {
                        enable: false,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: {
                        enable: true,
                        mode: "grab"
                    },
                    onclick: {
                        enable: true,
                        mode: "push"
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 140,
                        line_linked: {
                            opacity: 0.5
                        }
                    },
                    bubble: {
                        distance: 400,
                        size: 40,
                        duration: 2,
                        opacity: 8,
                        speed: 3
                    },
                    repulse: {
                        distance: 200,
                        duration: 0.4
                    },
                    push: {
                        particles_nb: 4
                    },
                    remove: {
                        particles_nb: 2
                    }
                }
            },
            retina_detect: true
        });
    }
    
    // Initialize Slick Carousels
    if ($.fn.slick) {
        // Products Carousel
        $('.products-carousel').slick({
            dots: true,
            infinite: true,
            speed: 500,
            slidesToShow: 3,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 3000,
            responsive: [
                {
                    breakpoint: 992,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 1
                    }
                },
                {
                    breakpoint: 576,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1
                    }
                }
            ]
        });
    }
    
    // Back to top button
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTop.classList.add('active');
            } else {
                backToTop.classList.remove('active');
            }
        });
        
        backToTop.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Adding a floating animation to specific elements
    const floatingElements = document.querySelectorAll('.floating');
    if (floatingElements.length > 0) {
        floatingElements.forEach(elem => {
            gsap.to(elem, {
                y: '+=15',
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        });
    }
    
    // Kendo UI initialization for specific components
    if (window.kendo) {
        // Initialize Kendo DatePicker if exists
        if ($(".k-datepicker").length) {
            $(".k-datepicker").kendoDatePicker();
        }
        
        // Initialize Kendo DropDownList if exists
        if ($(".k-dropdownlist").length) {
            $(".k-dropdownlist").kendoDropDownList();
        }
    }
}); 