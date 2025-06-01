/**
 * Internationalization System
 * This script manages language switching and content translation
 */

// Default language
let currentLanguage = 'tr';

// Check if this is the first visit or localStorage exists
if (!localStorage.getItem('firstVisit')) {
    // First visit, force Turkish
    localStorage.setItem('firstVisit', 'true');
    localStorage.setItem('language', 'tr');
    console.log("First visit detected - setting default language to Turkish");
} else if (localStorage.getItem('language')) {
    currentLanguage = localStorage.getItem('language');
}

// Flag to track if MutationObserver is already set up
let observerActive = false;

// Initialize language system as soon as the script loads
console.log("i18n.js is loading - current language: " + currentLanguage);

// Run initialization as soon as DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM Content Loaded - initializing i18n system");
    initLanguage();
    setupLanguageSystem();
});

// Initialize language settings
function initLanguage() {
    console.log('Initializing language: ' + currentLanguage);
    
    // Set HTML lang attribute
    document.documentElement.lang = currentLanguage;
    
    // Update content based on selected language
    window.updateContent();
    
    // Update language selector visuals if they exist
    updateLanguageSelector();
}

// Setup the entire language system including event listeners and observers
function setupLanguageSystem() {
    // Global click handler for language buttons
    document.addEventListener('click', function(event) {
        // Find if the click was on or inside a language button
        const langBtn = event.target.closest('.language-btn');
        if (langBtn) {
            const lang = langBtn.getAttribute('data-lang');
            if (lang) {
                console.log("Language button clicked via delegation: " + lang);
                event.preventDefault();
                event.stopPropagation();
                switchLanguage(lang);
                return false;
            }
        }
    }, true);  // Use capture phase to catch events early

    // Setup a MutationObserver to detect when header/language buttons are added to the DOM
    if (!observerActive) {
        console.log("Setting up MutationObserver for language buttons");
        const observer = new MutationObserver(function(mutations) {
            let buttonsFound = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    // Check if any language buttons are present after DOM changes
                    const langButtons = document.querySelectorAll('.language-btn');
                    if (langButtons.length > 0 && !buttonsFound) {
                        buttonsFound = true;
                        console.log("Language buttons found via MutationObserver: " + langButtons.length);
                        updateLanguageSelector();
                        
                        // Add direct click handlers to each button for extra reliability
                        langButtons.forEach(function(btn) {
                            // Remove any existing listeners first
                            btn.removeEventListener('click', languageBtnClickHandler);
                            // Add new event listener
                            btn.addEventListener('click', languageBtnClickHandler);
                            console.log("Added direct click handler to " + btn.getAttribute('data-lang') + " button");
                        });
                    }
                }
            });
        });
        
        // Observe the entire document to catch any DOM changes
        observer.observe(document.documentElement, { 
            childList: true, 
            subtree: true 
        });
        
        observerActive = true;
        
        // Stop observing after 10 seconds to avoid performance issues
        setTimeout(function() {
            observer.disconnect();
            console.log("MutationObserver disconnected after timeout");
        }, 10000);
    }
    
    // Also try to immediately find and update any language buttons that are already in the DOM
    const existingButtons = document.querySelectorAll('.language-btn');
    if (existingButtons.length > 0) {
        console.log("Found existing language buttons: " + existingButtons.length);
        updateLanguageSelector();
        
        existingButtons.forEach(function(btn) {
            btn.removeEventListener('click', languageBtnClickHandler);
            btn.addEventListener('click', languageBtnClickHandler);
        });
    }
}

// Event handler for language button clicks
function languageBtnClickHandler(e) {
    e.preventDefault();
    e.stopPropagation();
    const lang = this.getAttribute('data-lang');
    console.log('Language button clicked directly: ' + lang);
    switchLanguage(lang);
    return false;
}

// Switch language
function switchLanguage(lang) {
    console.log('Switching language to: ' + lang);
    
    // Only proceed if this is actually a language change
    if (lang === currentLanguage) {
        console.log('Already using language: ' + lang);
        return;
    }
    
    // Store language preference
    localStorage.setItem('language', lang);
    currentLanguage = lang;
    
    // Set HTML lang attribute
    document.documentElement.lang = currentLanguage;
    
    // Update page content
    window.updateContent();
    
    // Refresh language selector visuals
    updateLanguageSelector();
    
    // Dispatch a custom event for other scripts to listen for
    const event = new CustomEvent('languageChanged', { detail: lang });
    document.dispatchEvent(event);
    
    // jQuery bağımlılığını kaldırıyoruz - artık sadece native event kullanıyoruz
    // Geriye dönük uyumluluk için eski sistemleri destekleyelim
    if (typeof window.dispatchEvent === 'function') {
        // Bu event herhangi bir yerden dinlenebilir:
        // document.addEventListener('languageChanged', function(e) { console.log(e.detail); });
        console.log('Dispatched native languageChanged event with: ' + lang);
    }
    
    // Let user know the language was changed
    console.log('Language switched to: ' + lang);
}

// Update content based on selected language
window.updateContent = function() {
    console.log('Updating content for language:', currentLanguage);
    
    // Get all elements with data-i18n attribute
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        
        // Only update if translation exists
        if (translations[currentLanguage] && translations[currentLanguage][key]) {
            // Special handling for keys with apostrophes or special characters
            if (key === "guvenal_strong_brand") {
                console.log('Special handling for guvenal_strong_brand:', translations[currentLanguage][key]);
                // Force the content to be updated with the correct language value
                if (currentLanguage === 'tr') {
                    element.innerHTML = 'Güvenal Group\'un Güçlü Markası';
                } else {
                    element.textContent = translations[currentLanguage][key];
                }
            } else {
                // Normal handling for other keys
            element.textContent = translations[currentLanguage][key];
            }
        }
    });
    
    // Update page title if it has translation
    const titleKey = document.querySelector('meta[name="i18n-title"]')?.getAttribute('content');
    if (titleKey && translations[currentLanguage] && translations[currentLanguage][titleKey]) {
        document.title = translations[currentLanguage][titleKey];
    }
    
    // Force refresh product details if we're on a product page
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId && typeof window.showProductDetail === 'function' && !window.isUpdatingProductDetail) {
        console.log('i18n: Product page detected, refreshing product details');
        // Set flag to prevent infinite loop
        window.isUpdatingProductDetail = true;
        try {
            window.showProductDetail(productId);
        } finally {
            // Reset flag after execution
            setTimeout(() => {
                window.isUpdatingProductDetail = false;
            }, 100);
        }
    }
    
    // Check for category filters and update titles
    const categoryId = urlParams.get('category');
    const subcategoryId = urlParams.get('subcategory');
    const subSubcategoryId = urlParams.get('subsubcategory');
    
    if (categoryId && !window.isUpdatingCategory) {
        window.isUpdatingCategory = true;
        try {
            if (subSubcategoryId && subcategoryId && typeof window.updateSubSubcategoryTitle === 'function') {
                window.updateSubSubcategoryTitle(categoryId, subcategoryId, subSubcategoryId);
            } else if (subcategoryId && typeof window.updateSubcategoryTitle === 'function') {
                window.updateSubcategoryTitle(categoryId, subcategoryId);
            } else if (typeof window.updateCategoryTitle === 'function') {
                window.updateCategoryTitle(categoryId);
            }
        } finally {
            // Reset flag after execution
            setTimeout(() => {
                window.isUpdatingCategory = false;
            }, 100);
        }
    }
}

// Global function to apply translations to elements (especially for dynamically created content)
window.applyTranslations = function(lang) {
    const targetLang = lang || currentLanguage;
    console.log('Applying translations to dynamic elements, language:', targetLang);
    
    // Get all elements with data-i18n attribute
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        
        // Only update if translation exists
        if (translations[targetLang] && translations[targetLang][key]) {
            // Special handling for keys with apostrophes or special characters
            if (key === "guvenal_strong_brand") {
                console.log('Special handling for guvenal_strong_brand in applyTranslations:', translations[targetLang][key]);
                // Force the content to be updated with the correct language value
                if (targetLang === 'tr') {
                    element.innerHTML = 'Güvenal Group\'un Güçlü Markası';
                } else {
                    element.textContent = translations[targetLang][key];
                }
            } else {
                // Normal handling for other keys
                element.textContent = translations[targetLang][key];
            }
        }
    });
    
    return true;
}

// Update language selector visuals (active language)
function updateLanguageSelector() {
    console.log('Updating language selector buttons for: ' + currentLanguage);
    
    const languageButtons = document.querySelectorAll('.language-switcher .language-btn');
    
    languageButtons.forEach(button => {
        const lang = button.getAttribute('data-lang');
        if (lang === currentLanguage) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
} 