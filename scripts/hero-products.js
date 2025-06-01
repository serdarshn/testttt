/**
 * Hero Products Carousel Script
 * Displays a random selection of 5 products on the hero section
 */

$(document).ready(function() {
    // Get current language from localStorage or default to Turkish
    const currentLang = localStorage.getItem('language') || 'tr';
    
    // Load products from the appropriate language JSON file
    $.getJSON(`data/products_${currentLang}.json`, function(data) {
        // Extract all products
        const allProducts = data.products;
        
        // Filter out products from "ikinci-el-urunler" and "makina-aksesuarlari" categories
        const filteredProducts = allProducts.filter(product => {
            return product.category !== 'ikinci-el-urunler' && 
                   !product.category.includes('makina-aksesuarlari');
        });
        
        // Get 5 random products from filtered list
        const randomProducts = getRandomProducts(filteredProducts, 5);
        
        // Initialize the carousel
        initFeaturedProductsCarousel(randomProducts, data.categories, currentLang);
    });
    
    /**
     * Get a number of random products from an array
     * @param {Array} products - The products array
     * @param {Number} count - Number of products to get
     * @returns {Array} Random selection of products
     */
    function getRandomProducts(products, count) {
        const shuffled = [...products].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
    
    /**
     * Find category name by its ID
     * @param {Array} categories - The categories array
     * @param {String} categoryId - The category ID to find
     * @returns {String} The category name
     */
    function findCategoryName(categories, categoryId) {
        // Split the category path (e.g. "parent-category/child-category")
        const categoryPath = categoryId.split('/');
        const mainCategoryId = categoryPath[0];
        
        // Find the main category
        const mainCategory = categories.find(cat => cat.id === mainCategoryId);
        if (!mainCategory) return '';
        
        return mainCategory.name;
    }
    
    /**
     * Initialize the featured products carousel
     * @param {Array} products - The products to display
     * @param {Array} categories - The categories array
     * @param {String} lang - Current language
     */
    function initFeaturedProductsCarousel(products, categories, lang) {
        const $carousel = $('.featured-products-carousel');
        $carousel.empty(); // Clear any existing carousel items
        
        // Get the proper translation for the button text
        let detailBtnText = 'Detay'; // Default Turkish text
        if (translations && translations[lang] && translations[lang]['detay']) {
            detailBtnText = translations[lang]['detay'];
        }
        
        // Create carousel items
        products.forEach(product => {
            const categoryName = findCategoryName(categories, product.category);
            const $item = $(`
                <div class="featured-product-card">
                    <div class="featured-product-image">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                    <div class="featured-product-content">
                        <span class="featured-product-category">${categoryName}</span>
                        <h3 class="featured-product-title">${product.name}</h3>
                        <a href="urunler?id=${product.id}" class="featured-product-btn" data-i18n="detay">${detailBtnText}</a>
                    </div>
                </div>
            `);
            
            $carousel.append($item);
        });
        
        // Initialize slick carousel
        $carousel.slick({
            dots: true,
            arrows: false,
            autoplay: true,
            autoplaySpeed: 3000,
            slidesToShow: 1,
            slidesToScroll: 1,
            fade: true,
            cssEase: 'linear',
            adaptiveHeight: true,
            vertical: false
        });
        
        // Apply translations to the newly added elements
        if (typeof applyTranslations === 'function') {
            applyTranslations(lang);
        }
    }
    
    // Listen for language changes and update the carousel accordingly
    document.addEventListener('languageChanged', function(event) {
        const lang = event.detail;
        console.log(`Hero carousel detected language change to: ${lang}`);
        
        // Reload products with the new language
        fetch(`data/products_${lang}.json`)
            .then(response => response.json())
            .then(data => {
                const allProducts = data.products;
                const filteredProducts = allProducts.filter(product => {
                    return product.category !== 'ikinci-el-urunler' && 
                          !product.category.includes('makina-aksesuarlari');
                });
                
                const randomProducts = getRandomProducts(filteredProducts, 5);
                
                // Destroy existing carousel
                if ($('.featured-products-carousel').hasClass('slick-initialized')) {
                    $('.featured-products-carousel').slick('unslick');
                }
                
                // Reinitialize with new data
                initFeaturedProductsCarousel(randomProducts, data.categories, lang);
            })
            .catch(error => console.error('Error loading products:', error));
    });
}); 