// Wait for DOM content to be fully loaded
document.addEventListener('DOMContentLoaded', () => {

    // Initialize Lucide icons
    lucide.createIcons();

    // ==========================================================================
    // THEME SWITCHER
    // ==========================================================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    // Load existing theme preference from local storage, or fall back to system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
    } else {
        htmlElement.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');
    }

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // ==========================================================================
    // MOBILE NAVIGATIONDRAWER MENU
    // ==========================================================================
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const menuIcon = mobileToggle.querySelector('.menu-icon');
    const closeIcon = mobileToggle.querySelector('.close-icon');

    function toggleMobileMenu() {
        navMenu.classList.toggle('open');
        const isOpen = navMenu.classList.contains('open');

        if (isOpen) {
            menuIcon.style.display = 'none';
            closeIcon.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Lock scrolling
        } else {
            menuIcon.style.display = 'block';
            closeIcon.style.display = 'none';
            document.body.style.overflow = ''; // Unlock scrolling
        }
    }

    mobileToggle.addEventListener('click', toggleMobileMenu);

    // Close mobile menu when clicking a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('open')) {
                toggleMobileMenu();
            }
        });
    });

    // Close menu when clicking outside of nav
    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('open') &&
            !navMenu.contains(e.target) &&
            !mobileToggle.contains(e.target)) {
            toggleMobileMenu();
        }
    });

    // ==========================================================================
    // TYPING EFFECT IN HERO
    // ==========================================================================
    const typingTarget = document.getElementById('typing-text');
    const words = ["Full Stack Engineer.", "Problem Solver.", "Creative Builder."];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
        const currentWord = words[wordIndex];

        if (isDeleting) {
            // Remove character
            typingTarget.textContent = currentWord.substring(0, charIndex - 1); charIndex--;
            typingSpeed = 50; // faster deletion
        } else {
            // Add character
            typingTarget.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100; // standard typing speed
        }

        // Handle word completion transitions
        if (!isDeleting && charIndex === currentWord.length) {
            typingSpeed = 2000; // Pause at end of word
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typingSpeed = 500; // Pause before typing next word
        }

        setTimeout(type, typingSpeed);
    }

    if (typingTarget) {
        type();
    }

    // ==========================================================================
    // HIGH-PERFORMANCE SCROLL REVEAL OBSERVER
    // ==========================================================================
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');

                // If it's the skills section, animate progress bars
                if (entry.target.id === 'skills') {
                    entry.target.classList.add('active');
                }

                // Once element is shown, we can stop observing it
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15 // trigger when 15% of section is visible
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // ==========================================================================
    // STICKY NAVBAR NAVIGATION HIGHLIGHT OBSERVER
    // ==========================================================================
    const sections = document.querySelectorAll('.section');

    const navHighlightObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeId = entry.target.getAttribute('id');

                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('data-sec') === activeId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        threshold: 0.35 // trigger highlight when section takes up 35% viewport
    });

    sections.forEach(sec => {
        navHighlightObserver.observe(sec);
    });

    // ==========================================================================
    // CONTACT FORM VALIDATION & HANDLING
    // ==========================================================================
    const contactForm = document.getElementById('contact-form');
    const formFeedback = document.getElementById('form-feedback');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Elements
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');

            // Helper flags
            let isNameValid = false;
            let isEmailValid = false;
            let isMessageValid = false;

            // Validate Name
            if (nameInput.value.trim() === '') {
                nameInput.parentElement.classList.add('error');
            } else {
                nameInput.parentElement.classList.remove('error');
                isNameValid = true;
            }

            // Validate Email
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(emailInput.value.trim())) {
                emailInput.parentElement.classList.add('error');
            } else {
                emailInput.parentElement.classList.remove('error');
                isEmailValid = true;
            }

            // Validate Message
            if (messageInput.value.trim() === '') {
                messageInput.parentElement.classList.add('error');
            } else {
                messageInput.parentElement.classList.remove('error');
                isMessageValid = true;
            }

            // If all fields are valid, submit form
            if (isNameValid && isEmailValid && isMessageValid) {
                // Clear any styling error states
                formFeedback.className = 'form-feedback';
                formFeedback.style.display = 'none';

                const name = nameInput.value;
                const email = emailInput.value;
                const message = messageInput.value;

                // Construct Gmail compose URL
                const subject = `Portfolio Contact from ${name}`;
                const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
                const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=vishalmaratha286@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

                // Open Gmail compose in a new tab
                window.open(gmailUrl, '_blank');

                // Show success feedback
                formFeedback.textContent = 'Redirecting to Gmail compose page...';
                formFeedback.classList.add('success');

                // Reset input values
                contactForm.reset();

                // Remove feedback after 4 seconds
                setTimeout(() => {
                    formFeedback.className = 'form-feedback';
                    formFeedback.style.display = 'none';
                }, 4000);
            }
        });

        // Add blur listener to inputs for dynamic error removal
        const inputs = contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                if (input.parentElement.classList.contains('error')) {
                    if (input.type === 'email') {
                        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (emailPattern.test(input.value.trim())) {
                            input.parentElement.classList.remove('error');
                        }
                    } else {
                        if (input.value.trim() !== '') {
                            input.parentElement.classList.remove('error');
                        }
                    }
                }
            });
        });
    }
});
