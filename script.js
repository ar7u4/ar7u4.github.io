/**
 * arjun.betageri — GitHub-style portfolio
 * Minimal, functional, no bloat
 */

document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const backToTop = document.getElementById('backToTop');
    const sections = document.querySelectorAll('section[id]');

    // ============================================
    // NAVBAR SCROLL
    // ============================================
    function onScroll() {
        const y = window.scrollY;
        navbar.style.boxShadow = y > 10 ? '0 1px 0 rgba(48, 54, 61, 0.8)' : 'none';

        // Back to top
        if (y > 400) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }

        // Active nav link
        let current = '';
        sections.forEach(sec => {
            const top = sec.offsetTop - 80;
            if (y >= top) current = sec.getAttribute('id');
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ============================================
    // MOBILE MENU
    // ============================================
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = navToggle.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const icon = navToggle.querySelector('i');
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
        });
    });

    // ============================================
    // BACK TO TOP
    // ============================================
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ============================================
    // SMOOTH SCROLL
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 64,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ============================================
    // CONTRIBUTION GRAPH
    // ============================================
    const grid = document.getElementById('contribGrid');
    if (grid) {
        const levels = ['level-0', 'level-1', 'level-2', 'level-3', 'level-4'];
        const weights = [0.55, 0.2, 0.12, 0.08, 0.05];

        for (let i = 0; i < 53 * 7; i++) {
            const cell = document.createElement('div');
            cell.className = 'contrib-cell';
            const rand = Math.random();
            let cum = 0;
            for (let j = 0; j < weights.length; j++) {
                cum += weights[j];
                if (rand < cum) {
                    cell.classList.add(levels[j]);
                    break;
                }
            }
            grid.appendChild(cell);
        }
    }

    // ============================================
    // CONSOLE SIGNATURE
    // ============================================
    console.log('%c arjun.betageri ', 'background:#238636;color:#fff;padding:4px 8px;border-radius:4px;font-weight:600;');
    console.log('%c Senior Platform Engineer · CKA · Bengaluru ', 'color:#8b949e;');
});
