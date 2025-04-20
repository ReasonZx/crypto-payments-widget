document.addEventListener('DOMContentLoaded', () => {
        
    // Burger Menu
    const burgerMenu = document.querySelector('.burger-menu');
    const burgerContent = document.querySelector('.burger-content');
    const body = document.body;


    if (burgerMenu && burgerContent) {
        burgerMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            burgerMenu.classList.toggle('active');
            burgerContent.classList.toggle('active');
            body.classList.toggle('menu-open');
        });

        // Close burger menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!burgerMenu.contains(e.target) && !burgerContent.contains(e.target)) {
                burgerMenu.classList.remove('active');
                burgerContent.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });

        // Close menu when clicking a link
        burgerContent.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                burgerMenu.classList.remove('active');
                burgerContent.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
    }

    // Navigation scroll
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            
            // Check if it's an internal anchor link
            if (targetId.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(i => i.classList.remove('active'));
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // Demo Modal
    const demoBtn = document.querySelector('.demo-button');
    const modal = document.querySelector('.demo-modal');
    const closeBtn = document.querySelector('.close-modal');

    if (demoBtn && modal && closeBtn) {
        demoBtn.addEventListener('click', () => {
            modal.classList.add('active');
        });

        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    // Form Validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            // Add your form validation and submission logic here
        });
    });

    const background = document.createElement('div');
    background.className = 'scroll-background';
    document.body.appendChild(background);

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const scrollProgress = (scrolled / maxScroll) * 100;
        
        background.style.transform = `scale(${1 + scrollProgress * 0.001})`;
        background.style.backgroundPosition = `${scrollProgress}% ${scrollProgress}%`;
    });

    // Pricing calculator functionality
    const paymentInput = document.getElementById('payment-amount');
    const feeResult = document.getElementById('fee-result');
    
    function calculateFee() {
        if (!paymentInput || !feeResult) return;
        
        const amount = parseFloat(paymentInput.value);
        if (isNaN(amount)) {
            feeResult.textContent = '$0.00';
            return;
        }
        
        const percentFee = amount * 0.005;
        const finalFee = Math.max(0.3, percentFee);
        feeResult.textContent = '$' + finalFee.toFixed(2);
    }
    
    // Calculate on page load
    calculateFee();
    
    // Calculate on input change
    if (paymentInput) {
        paymentInput.addEventListener('input', calculateFee);
    }
});





function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        // Get the navbar height to use as offset
        const navbar = document.querySelector('.navbar');
        const navbarHeight = navbar ? navbar.offsetHeight : 0;
        
        // Add extra padding for visual comfort (20px)
        const scrollOffset = navbarHeight + 20;
        
        // Get the position of the section relative to the top of the page
        const sectionPosition = section.getBoundingClientRect().top + window.pageYOffset;
        
        // Scroll to the section with offset
        window.scrollTo({
            top: sectionPosition - scrollOffset,
            behavior: 'smooth'
        });
    }
}