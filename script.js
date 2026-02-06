document.addEventListener('DOMContentLoaded', () => {
    // 1. Magic Circle Parallax
    const magicCircle = document.querySelector('.magic-circle');
    window.addEventListener('mousemove', (e) => {
        const x = (window.innerWidth / 2 - e.pageX) / 40;
        const y = (window.innerHeight / 2 - e.pageY) / 40;

        if (magicCircle) {
            magicCircle.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
        }
    });

    // 2. Falling Petals Effect
    const petalContainer = document.getElementById('petals-container');
    const petalCount = 15;

    function createPetal() {
        if (!petalContainer) return;
        const petal = document.createElement('div');
        petal.classList.add('petal');

        // Random properties
        const size = Math.random() * 10 + 5;
        const left = Math.random() * 100;
        const duration = Math.random() * 5 + 7;
        const delay = Math.random() * 5;

        petal.style.width = `${size}px`;
        petal.style.height = `${size * 1.5}px`;
        petal.style.left = `${left}%`;
        petal.style.animationDuration = `${duration}s`;
        petal.style.animationDelay = `-${delay}s`;

        // Random opacity & color tint
        petal.style.opacity = Math.random() * 0.4 + 0.3;

        petalContainer.appendChild(petal);

        // Remove petal after animation to keep DOM clean
        setTimeout(() => {
            petal.remove();
            createPetal();
        }, (duration + delay) * 1000);
    }

    for (let i = 0; i < petalCount; i++) {
        setTimeout(createPetal, i * 300);
    }

    // 3. Intersection Observer for Smooth Fade-in
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll(
        '.magic-card, .parchment-container, .spell-item, .hero-text, .timeline-item'
    );

    animatedElements.forEach((el, index) => {
        // Initial state set in JS if not in CSS to ensure no flicker
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
        el.style.transition = `all 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) ${index * 0.1}s`;

        // Define the visible state
        const style = document.createElement('style');
        style.innerHTML = `
            .is-visible {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
        `;
        document.head.appendChild(style);

        observer.observe(el);
    });

    // 4. Smooth Scroll for Nav Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 50,
                    behavior: 'smooth'
                });
            }
        });
    });
});
