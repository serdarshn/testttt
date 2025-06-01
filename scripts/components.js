/**
 * Components Management Script
 * This script handles loading header and footer components
 */

// Add a function to ensure translations are applied after components are loaded
function ensureTranslationsApplied() {
    if (typeof window.applyTranslations === 'function') {
        const currentLang = localStorage.getItem('language') || 'tr';
        window.applyTranslations(currentLang);
        console.log("Applied translations to dynamically loaded components");
    }
}

// Setup Mega Menu Functionality
function setupGlobalMegaMenu() {
    console.log("Setting up global mega menu...");
    
    // Check if mega menu elements exist
    const megaMenuTrigger = document.querySelector('.mega-menu-trigger');
    const megaMenuWrapper = document.querySelector('.mega-menu-wrapper');
    
    if (megaMenuTrigger && megaMenuWrapper) {
        console.log("Mega menu elements found, adding event listeners");
        
        // MegaMenu interactions with direct DOM events
        megaMenuTrigger.addEventListener('mouseenter', function() {
            megaMenuTrigger.classList.add('show');
            megaMenuWrapper.classList.add('show');
            megaMenuWrapper.style.display = 'block';
        });
        
        megaMenuTrigger.addEventListener('mouseleave', function() {
            setTimeout(function() {
                if (!megaMenuWrapper.matches(':hover')) {
                    megaMenuTrigger.classList.remove('show');
                    megaMenuWrapper.classList.remove('show');
                    megaMenuWrapper.style.display = 'none';
                }
            }, 200);
        });
        
        megaMenuWrapper.addEventListener('mouseleave', function() {
            setTimeout(function() {
                megaMenuTrigger.classList.remove('show');
                megaMenuWrapper.classList.remove('show');
                megaMenuWrapper.style.display = 'none';
            }, 200);
        });
        
        // Mobile touch support
        document.querySelector('.mega-menu-link').addEventListener('click', function(e) {
            if (!megaMenuTrigger.classList.contains('show')) {
                e.preventDefault();
                megaMenuTrigger.classList.add('show');
                megaMenuWrapper.classList.add('show');
                megaMenuWrapper.style.display = 'block';
            }
        });
    } else {
        console.log("Mega menu elements not found, will try again later");
        // Try again later if header might still be loading
        setTimeout(setupGlobalMegaMenu, 500);
    }
}

// Header and Footer injection
$(document).ready(function() {
    // Get current page
    const currentPage = window.location.pathname.split('/').pop().split('.')[0] || 'index';
    
    // Load header
    $("#header-placeholder").load("components/header.html", function() {
        // After header is loaded
        console.log("Header loaded successfully");
        
        // Set active menu item
        setActiveMenuItem();
        
        // Setup mega menu after header is loaded
        setupGlobalMegaMenu();
        
        // Update language selector
        if (typeof updateLanguageSelector === "function") {
            updateLanguageSelector();
        }
        
        // Apply translations
        ensureTranslationsApplied();
    });
    
    // Load footer
    $("#footer-placeholder").load("components/footer.html", function() {
        // After footer is loaded
        
        // Initialize back to top button
        initBackToTop();
        
        // Apply translations
        ensureTranslationsApplied();
    });
    
    // Initialize WhatsApp button if the script is loaded
    if (typeof initWhatsAppButton === 'function') {
        initWhatsAppButton();
    }
    
    // Initialize additional components based on page
    switch (currentPage) {
        case 'index':
            // Home page specific components
            break;
        case 'urunler':
            // Products page specific components
            break;
        case 'kurumsal':
            // Corporate page specific components
            break;
        case 'iletisim':
            // Contact page specific components
            break;
        }
});

// Set active menu item based on current page
function setActiveMenuItem() {
    var currentPage = window.location.pathname.split("/").pop();
    
    // If index.html or just the domain, set currentPage accordingly
    if (currentPage === "" || currentPage === "/" || currentPage === "index.html") {
        currentPage = "index";
    }
    
    // Remove file extension if present
    currentPage = currentPage.replace('.html', '');
    
    // If product detail page (has ID parameter)
    if (currentPage === "urunler" && window.location.search.includes("id=")) {
        currentPage = "urunler";
    }
    
    // Remove all active classes first
    $('.navbar-nav .nav-link').removeClass('active');
    
    // Add active class to current page link
    $('.navbar-nav .nav-link[href="' + currentPage + '"]').addClass('active');
}

// Initialize back to top button
function initBackToTop() {
    // Back to top button click
    $('.back-to-top').click(function(e) {
        e.preventDefault();
        $('html, body').animate({scrollTop: 0}, 500);
    });
    
    // Show/hide back to top button based on scroll position
    $(window).scroll(function() {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').addClass('active');
        } else {
            $('.back-to-top').removeClass('active');
        }
    });
} 