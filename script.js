// Basic script.js for potential future interactivity
console.log('Portfolio Loaded');

// Smooth scrolling for anchor links (optional, native CSS scroll-behavior often suffices but JS offers more control)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 100, // Adjust for fixed header
                behavior: 'smooth'
            });
        }
    });
});
