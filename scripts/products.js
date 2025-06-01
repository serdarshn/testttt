/**
 * Products Management Script
 * This script handles loading and displaying products from JSON data
 */

let productsData = null;
// Don't declare currentLanguage here, it's already defined in i18n.js

// Load products data from JSON file
function loadProductsData() {
    const url = currentLanguage === 'en' ? 'data/products_en.json' : 'data/products_tr.json';
    const url2 = currentLanguage === 'en' ? 'data/products_en2.json' : 'data/products_tr2.json';
    
    // jQuery Promise ile veri yükleme
    return $.ajax({
        url: url,
        dataType: 'json',
        success: function(data) {
            console.log('Products data loaded successfully for language:', currentLanguage);
            
            // Try to load secondary data
            $.ajax({
                url: url2,
                dataType: 'json',
                success: function(data2) {
                    // Merge products from both files
                    data.products = [...data.products, ...data2.products];
                    
                    // Merge categories if they exist
                    if (data2.categories && data2.categories.length > 0) {
                        data.categories = [...data.categories, ...data2.categories.filter(cat2 => 
                            !data.categories.some(cat => cat.id === cat2.id))];
                    }
                    
                    productsData = data;
                    console.log('Products data merged successfully with secondary file');
                },
                error: function(xhr, status, error) {
                    // Still proceed even if secondary file fails
                    console.warn('Error loading secondary products data:', error);
                    productsData = data;
                }
            });
            
            // Set productsData regardless of secondary file success
            productsData = data;
        },
        error: function(xhr, status, error) {
            console.error('Error loading primary products data:', error);
            // Fallback to alternate product file if primary fails to load
            const fallbackUrl = currentLanguage === 'en' ? 'data/products_tr.json' : 'data/products_en.json';
            console.log('Falling back to ' + fallbackUrl);
            return $.ajax({
                url: fallbackUrl,
                dataType: 'json',
                success: function(data) {
                    productsData = data;
                    console.log('Products data loaded successfully (fallback)');
                    
                    // Try to load secondary fallback file
                    const fallbackUrl2 = currentLanguage === 'en' ? 'data/products_tr2.json' : 'data/products_en2.json';
                    $.ajax({
                        url: fallbackUrl2,
                        dataType: 'json',
                        success: function(data2) {
                            // Merge products from both files
                            data.products = [...data.products, ...data2.products];
                            
                            // Merge categories if they exist
                            if (data2.categories && data2.categories.length > 0) {
                                data.categories = [...data.categories, ...data2.categories.filter(cat2 => 
                                    !data.categories.some(cat => cat.id === cat2.id))];
                            }
                            
                            productsData = data;
                            console.log('Fallback products data merged successfully with secondary file');
                        },
                        error: function(xhr, status, error) {
                            // Still proceed even if secondary fallback file fails
                            console.warn('Error loading secondary fallback products data:', error);
                        }
                    });
                },
                error: function(xhr, status, error) {
                    console.error('Error loading fallback products data:', error);
                }
            });
        }
    });
}

// Initialize products functionality
$(document).ready(function() {
    // Get current language
    currentLanguage = localStorage.getItem('language') || 'tr';
    console.log('Products script - current language:', currentLanguage);

    // AOS animasyon kütüphanesini başlat
    AOS.init({
        duration: 800,
        once: false
    });
    
    // Load products data
    loadProductsData().done(function() {
        // Initialize products display based on the page
        if ($('.products-carousel').length) {
            displayFeaturedProducts();
        }
        
        if ($('#product-list').length) {
            displayAllProducts();
        }
        
        if ($('#product-categories').length) {
            displayProductCategories();
        }
        
        if ($('#product-detail').length) {
            const productId = parseInt($('#product-detail').data('product-id'));
            if (productId) {
                displayProductDetail(productId);
            }
        }
    });
    
    // Ürün verilerini ve kategorileri yükle
    loadCategoriesAndProducts();
    
    // URL parametrelerini kontrol et
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const categoryId = urlParams.get('category');
    
    if (productId) {
        // Ürün detay sayfası göster
        showProductDetail(productId);
    } else if (categoryId) {
        // Kategori filtreleme
        filterProductsByCategory(categoryId);
    }
    
    // Geri dönüş butonu için event listener
    $('.back-to-products').on('click', function(e) {
        e.preventDefault();
        window.history.back();
    });
    
    // Sıralama seçenekleri için event listener
    $('.sort-options').on('change', function() {
        sortProducts(this.value);
    });

    // Listen for language changes
    document.addEventListener('languageChanged', function(event) {
        const lang = event.detail;
        console.log('Language change detected in products.js:', lang);
        currentLanguage = lang;
        
        // Reload products with new language
        loadProductsData().done(function() {
            if (document.querySelector('.products-carousel')) {
                displayFeaturedProducts();
            }
            
            if (document.getElementById('product-list')) {
                displayAllProducts();
            }
        });

        // Force reload categories to update translations
        if (document.getElementById('product-categories')) {
            loadCategoriesAndProducts();
        }
        
        // Check if we're on a product detail page - improved detection
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        
        // Improved detection of product detail view
        if (productId) {
            console.log('Product detail page detected, refreshing product with ID:', productId);
            showProductDetail(productId);
        }
        
        // Update page title if we're showing a filtered category
        const categoryId = urlParams.get('category');
        const subcategoryId = urlParams.get('subcategory');
        const subSubcategoryId = urlParams.get('subsubcategory');
        
        if (subSubcategoryId && subcategoryId && categoryId) {
            updateSubSubcategoryTitle(categoryId, subcategoryId, subSubcategoryId);
        } else if (subcategoryId && categoryId) {
            updateSubcategoryTitle(categoryId, subcategoryId);
        } else if (categoryId) {
            updateCategoryTitle(categoryId);
        }
    });
});

// Display featured products in a carousel
function displayFeaturedProducts() {
    if (!productsData || !productsData.products) return;
    
    // Clear existing carousel
    $('.products-carousel').empty();
    
    // Add featured products to carousel
    const featuredProducts = productsData.products.filter(product => product.featured);
    
    featuredProducts.forEach(product => {
        const translation = product[currentLanguage] || product.tr;
        
        const productCard = `
            <div class="product-card">
                <div class="product-img">
                    <img src="${product.imageUrl}" alt="${translation.name}" class="img-fluid">
                </div>
                <div class="product-info p-3">
                    <h5>${translation.name}</h5>
                    <p>${translation.description}</p>
                    <a href="urunler?id=${product.id}" class="btn btn-outline-primary btn-sm">Detaylar</a>
                </div>
            </div>
        `;
        
        $('.products-carousel').append(productCard);
    });
    
    // Initialize or refresh Slick carousel
    if ($('.products-carousel').hasClass('slick-initialized')) {
        $('.products-carousel').slick('unslick');
    }
    
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
                breakpoint: 991,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 767,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    });
}

// Display all products
function displayAllProducts(category = null) {
    if (!productsData || !productsData.products) return;
    
    // Clear existing product list
    $('#product-list').empty();
    
    // Filter products by category if specified
    let filteredProducts = productsData.products;
    if (category) {
        filteredProducts = productsData.products.filter(product => product.category === category);
    }
    
    // Add products to the list
    filteredProducts.forEach(product => {
        const translation = product[currentLanguage] || product.tr;
        
        const productCard = `
            <div class="col-lg-4 col-md-6 mb-4">
                <div class="product-card h-100">
                    <div class="product-img">
                        <img src="${product.imageUrl}" alt="${translation.name}" class="img-fluid">
                    </div>
                    <div class="product-info p-3">
                        <h5>${translation.name}</h5>
                        <p>${translation.description}</p>
                        <div class="specs mb-3">
                            <small>${translation.specs}</small>
                        </div>
                        <a href="urunler?id=${product.id}" class="btn btn-outline-primary btn-sm">Detaylar</a>
                    </div>
                </div>
            </div>
        `;
        
        $('#product-list').append(productCard);
    });
    
    // Apply animations
    $('#product-list .product-card').each(function(index) {
        $(this).attr('data-aos', 'fade-up');
        $(this).attr('data-aos-delay', (index * 100) + 100);
    });
    
    // Refresh AOS
    AOS.refresh();
}

// Display product categories
function displayProductCategories() {
    if (!productsData || !productsData.categories) return;
    
    // Clear existing categories
    $('#product-categories').empty();
    
    // Add categories
    productsData.categories.forEach(category => {
        const categoryName = category.tr.name;
        
        const categoryBtn = `
            <button class="btn btn-outline-primary category-btn m-2" data-category="${category.id}">
                ${categoryName}
            </button>
        `;
        
        $('#product-categories').append(categoryBtn);
    });
    
    // Add "All Products" button
    const allCategoriesBtn = `
        <button class="btn btn-primary category-btn m-2 active" data-category="all">
            Tüm Ürünler
        </button>
    `;
    
    $('#product-categories').prepend(allCategoriesBtn);
    
    // Add click event to filter products by category
    $('.category-btn').on('click', function() {
        $('.category-btn').removeClass('active');
        $(this).addClass('active');
        
        const category = $(this).data('category');
        if (category === 'all') {
            displayAllProducts();
        } else {
            displayAllProducts(category);
        }
    });
}

// Display product detail
function displayProductDetail(productId) {
    if (!productsData || !productsData.products) return;
    
    // Find the product
    const product = productsData.products.find(p => p.id === productId);
    if (!product) {
        console.error('Product not found:', productId);
        return;
    }
    
    // Get translation based on current language
    const translation = product[currentLanguage] || product.tr;
    
    // Update product detail display
    $('#product-detail .product-name').text(translation.name);
    $('#product-detail .product-description').text(translation.description);
    $('#product-detail .product-specs').text(translation.specs);
    $('#product-detail .product-details').text(translation.details);
    $('#product-detail .product-image').attr('src', product.imageUrl).attr('alt', translation.name);
    
    // Find category name
    if (productsData.categories) {
        const category = productsData.categories.find(c => c.id === product.category);
        if (category) {
            // Use the correct language for category name
            let categoryName;
            if (category[currentLanguage] && category[currentLanguage].name) {
                categoryName = category[currentLanguage].name;
            } else if (category.tr && category.tr.name) {
                categoryName = category.tr.name;
            } else {
                categoryName = category.name || category.id;
            }
            $('#product-detail .product-category').text(categoryName);
        }
    }
}

// Ürün verilerini ve kategorileri yükleme fonksiyonu
async function loadCategoriesAndProducts() {
    try {
        // Use products_en.json if language is English
        const productsJsonUrl = currentLanguage === 'en' ? 'data/products_en.json' : 'data/products_tr.json';
        const products2JsonUrl = currentLanguage === 'en' ? 'data/products_en2.json' : 'data/products_tr2.json';
        
        // JSON dosyalarını yükle
        const response = await fetch(productsJsonUrl);
        const data = await response.json();
        
        // İkinci JSON dosyasını yükle ve birleştir
        try {
            const response2 = await fetch(products2JsonUrl);
            const data2 = await response2.json();
            
            // Ürünleri birleştir
            data.products = [...data.products, ...data2.products];
            
            // Kategorileri birleştir (varsa)
            if (data2.categories && data2.categories.length > 0) {
                data.categories = [...data.categories, ...data2.categories.filter(cat2 => 
                    !data.categories.some(cat => cat.id === cat2.id))];
            }
            
            console.log('Products loaded and merged from both JSON files');
        } catch (err) {
            console.warn(`Could not load secondary products file (${products2JsonUrl}):`, err);
        }
        
        console.log('Loading categories and products with language:', currentLanguage);
        
        // Kategori ve ürünleri render et
        renderCategories(data.categories);
        renderProducts(data.products);
        
        // Kategori tıklama olaylarını ekle
        addCategoryClickEvents();
    } catch (error) {
        console.error('Ürün verisi yüklenirken hata oluştu:', error);
        
        // Fallback to alternative products file if main one fails
        try {
            console.log('Falling back to alternative products file after error');
            const fallbackUrl = currentLanguage === 'en' ? 'data/products_tr.json' : 'data/products_en.json';
            const fallback2Url = currentLanguage === 'en' ? 'data/products_tr2.json' : 'data/products_en2.json';
            
            const response = await fetch(fallbackUrl);
            const data = await response.json();
            
            // Try to load and merge the secondary fallback file
            try {
                const response2 = await fetch(fallback2Url);
                const data2 = await response2.json();
                
                // Merge products
                data.products = [...data.products, ...data2.products];
                
                // Merge categories if they exist
                if (data2.categories && data2.categories.length > 0) {
                    data.categories = [...data.categories, ...data2.categories.filter(cat2 => 
                        !data.categories.some(cat => cat.id === cat2.id))];
                }
                
                console.log('Fallback products loaded and merged from both JSON files');
            } catch (err) {
                console.warn(`Could not load secondary fallback products file (${fallback2Url}):`, err);
            }
            
            renderCategories(data.categories);
            renderProducts(data.products);
            addCategoryClickEvents();
        } catch (fallbackError) {
            console.error('Fallback ürün verisi yüklenirken hata oluştu:', fallbackError);
        }
    }
}

// Render categories in the sidebar
function renderCategories(categories) {
    // Clear existing categories
    $('#product-categories').empty();
    
    // Get current language from storage again to ensure it's correct
    const lang = localStorage.getItem('language') || 'tr';
    console.log('Rendering categories with language:', lang);
    
    // Loop through all categories
    categories.forEach(category => {
        // Get category name based on current language
        let categoryName;
        
        // First check if category has direct translation
        if (category[lang] && category[lang].name) {
            categoryName = category[lang].name;
        } 
        // Then check translations.js for category ID-based translation
        else if (lang === 'en' && translations && translations.en && 
                 translations.en[category.id.replace(/-/g, '_')]) {
            categoryName = translations.en[category.id.replace(/-/g, '_')];
        }
        // Fall back to TR direct translation
        else if (category.tr && category.tr.name) {
            categoryName = category.tr.name;
        } 
        // Last resort fallback
        else {
            categoryName = category.name || category.id;
        }
        
        // Create category element
        let categoryElement = `
            <div class="list-group-item category-item" data-category-id="${category.id}">
                ${categoryName}
                ${category.subcategories && category.subcategories.length > 0 ? '<span class="category-toggle"><i class="fas fa-chevron-down"></i></span>' : ''}
            </div>
        `;
        
        // If category has subcategories, create elements for them
        if (category.subcategories && category.subcategories.length > 0) {
            let subcategoriesHtml = `<div id="subcategory-${category.id}" class="subcategory-list">`;
            
            category.subcategories.forEach(subcategory => {
                // Get subcategory name based on current language
                let subcategoryName;
                
                // First check if subcategory has direct translation
                if (subcategory[lang] && subcategory[lang].name) {
                    subcategoryName = subcategory[lang].name;
                }
                // Then check translations.js for subcategory ID-based translation
                else if (lang === 'en' && translations && translations.en && 
                         translations.en[subcategory.id.replace(/-/g, '_')]) {
                    subcategoryName = translations.en[subcategory.id.replace(/-/g, '_')];
                }
                // Fall back to TR direct translation
                else if (subcategory.tr && subcategory.tr.name) {
                    subcategoryName = subcategory.tr.name;
                }
                // Last resort fallback
                else {
                    subcategoryName = subcategory.name || subcategory.id;
                }
                
                let subcategoryElement = `
                    <div class="list-group-item subcategory-item pl-4" data-category-id="${category.id}" data-subcategory-id="${subcategory.id}">
                        ${subcategoryName}
                        ${subcategory.subcategories && subcategory.subcategories.length > 0 ? '<span class="subcategory-toggle"><i class="fas fa-chevron-down"></i></span>' : ''}
                    </div>
                `;
                
                // If subcategory has sub-subcategories, create elements for them
                if (subcategory.subcategories && subcategory.subcategories.length > 0) {
                    let subSubcategoriesHtml = `<div id="subsubcategory-${subcategory.id}" class="sub-subcategory-list">`;
                    
                    subcategory.subcategories.forEach(subSubcategory => {
                        // Get sub-subcategory name based on current language
                        let subSubcategoryName;
                        
                        // First check if sub-subcategory has direct translation
                        if (subSubcategory[lang] && subSubcategory[lang].name) {
                            subSubcategoryName = subSubcategory[lang].name;
                        }
                        // Then check translations.js for sub-subcategory ID-based translation
                        else if (lang === 'en' && translations && translations.en && 
                                 translations.en[subSubcategory.id.replace(/-/g, '_')]) {
                            subSubcategoryName = translations.en[subSubcategory.id.replace(/-/g, '_')];
                        }
                        // Fall back to TR direct translation
                        else if (subSubcategory.tr && subSubcategory.tr.name) {
                            subSubcategoryName = subSubcategory.tr.name;
                        }
                        // Last resort fallback
                        else {
                            subSubcategoryName = subSubcategory.name || subSubcategory.id;
                        }
                        
                        let subSubcategoryElement = `
                            <div class="list-group-item sub-subcategory-item pl-5" data-category-id="${category.id}" 
                                data-subcategory-id="${subcategory.id}" data-sub-subcategory-id="${subSubcategory.id}">
                                ${subSubcategoryName}
                            </div>
                        `;
                        
                        subSubcategoriesHtml += subSubcategoryElement;
                    });
                    
                    subSubcategoriesHtml += '</div>';
                    subcategoryElement += subSubcategoriesHtml;
                }
                
                subcategoriesHtml += subcategoryElement;
            });
            
            subcategoriesHtml += '</div>';
            categoryElement += subcategoriesHtml;
        }
        
        // Add category element to DOM
        $('#product-categories').append(categoryElement);
    });

    console.log('Categories rendered with language:', lang);
}

// Ürünleri listeye yükleyen fonksiyon
function renderProducts(products, filteredProducts = null) {
    const productsContainer = document.getElementById('product-list');
    if (!productsContainer) return;
    
    const displayProducts = filteredProducts || products;
    let html = '';
    
    if (displayProducts.length === 0) {
        html = '<div class="col-12 text-center py-5"><p>Bu kategoride ürün bulunamadı.</p></div>';
    } else {
        displayProducts.forEach(product => {
            // Get product name based on current language
            let productName;
            if (product[currentLanguage] && product[currentLanguage].name) {
                productName = product[currentLanguage].name;
            } else if (product.tr && product.tr.name) {
                productName = product.tr.name;
            } else {
                productName = product.name;
            }
            
            // Resim yolunu kontrol et
            const imagePath = product.image || product.imageUrl || 'images/placeholder.jpg';
            
            // Button text based on language
            const detailsText = currentLanguage === 'en' ? 'Details' : 'Detaylar';
            
            html += `
                <div class="col-md-6 col-lg-4 mb-4" data-product-id="${product.id}">
                    <div class="product-card h-100">
                        <div class="product-img-container">
                            <img src="${imagePath}" alt="${productName}" class="product-img">
                        </div>
                        <div class="product-info">
                            <h5 class="product-title">${productName}</h5>
                            <a href="urunler?id=${product.id}" class="btn btn-sm btn-primary">${detailsText}</a>
                        </div>
                    </div>
                </div>`;
        });
    }
    
    productsContainer.innerHTML = html;
    updateProductCount(displayProducts.length);
}

// Kategori tıklama olaylarını ekleyen fonksiyon
function addCategoryClickEvents() {
    // Ana kategori tıklama olayları
    document.querySelectorAll('.category-item').forEach(item => {
        item.style.cursor = 'pointer'; // Ensure pointer cursor
        item.addEventListener('click', function() {
            const categoryId = this.dataset.categoryId;
            const subcategoryContainer = document.getElementById(`subcategory-${categoryId}`);
            
            // Eğer ürün detay sayfasındaysak, önce ürün listesini göster
            if (document.getElementById('product-detail').style.display === 'block') {
                document.getElementById('product-detail').style.display = 'none';
                document.getElementById('product-list-container').style.display = 'block';
            }
            
            if (subcategoryContainer) {
                // Alt kategorileri toggle et
                const isVisible = window.getComputedStyle(subcategoryContainer).display !== 'none';
                subcategoryContainer.style.display = isVisible ? 'none' : 'block';
                
                // Toggle göstergesini değiştir
                const toggleIcon = this.querySelector('.category-toggle i');
                if (toggleIcon) {
                    toggleIcon.classList.toggle('fa-chevron-down', isVisible);
                    toggleIcon.classList.toggle('fa-chevron-up', !isVisible);
                }
            }
            
            // Kategori filtreleme yap
            filterProductsByCategory(categoryId);
            
            // Aktif kategori sınıfını ekle
            document.querySelectorAll('.category-item').forEach(cat => cat.classList.remove('active'));
            this.classList.add('active');
            
            // URL'yi güncelle
            updateURL({ category: categoryId });
        });
    });
    
    // Alt kategori tıklama olayları
    document.querySelectorAll('.subcategory-item').forEach(item => {
        item.style.cursor = 'pointer'; // Ensure pointer cursor
        item.addEventListener('click', function(e) {
            e.stopPropagation(); // Ana kategori tıklama olayını engelle
            
            // Eğer ürün detay sayfasındaysak, önce ürün listesini göster
            if (document.getElementById('product-detail').style.display === 'block') {
                document.getElementById('product-detail').style.display = 'none';
                document.getElementById('product-list-container').style.display = 'block';
            }
            
            const categoryId = this.dataset.categoryId;
            const subcategoryId = this.dataset.subcategoryId;
            const subSubcategoryId = this.dataset.subSubcategoryId;
            const subsubcategoryContainer = document.getElementById(`subsubcategory-${subcategoryId}`);
            
            if (subsubcategoryContainer) {
                // Alt-alt kategorileri toggle et
                const isVisible = window.getComputedStyle(subsubcategoryContainer).display !== 'none';
                subsubcategoryContainer.style.display = isVisible ? 'none' : 'block';
                
                // Toggle göstergesini değiştir
                const toggleIcon = this.querySelector('.subcategory-toggle i');
                if (toggleIcon) {
                    toggleIcon.classList.toggle('fa-chevron-down', isVisible);
                    toggleIcon.classList.toggle('fa-chevron-up', !isVisible);
                }
            }
            
            // Kategori filtreleme yap
            if (subSubcategoryId) {
                filterProductsBySubSubcategory(categoryId, subcategoryId, subSubcategoryId);
            } else {
                filterProductsBySubcategory(categoryId, subcategoryId);
            }
            
            // Aktif alt kategori sınıfını ekle
            document.querySelectorAll('.subcategory-item').forEach(subcat => subcat.classList.remove('active'));
            this.classList.add('active');
            
            // URL'yi güncelle
            updateURL({ 
                category: categoryId, 
                subcategory: subcategoryId,
                subsubcategory: subSubcategoryId || null
            });
        });
    });
    
    // Alt-alt kategori tıklama olayları
    document.querySelectorAll('.sub-subcategory-item').forEach(item => {
        item.style.cursor = 'pointer'; // Ensure pointer cursor
        item.addEventListener('click', function(e) {
            e.stopPropagation(); // Üst kategori tıklama olayını engelle
            
            // Eğer ürün detay sayfasındaysak, önce ürün listesini göster
            if (document.getElementById('product-detail').style.display === 'block') {
                document.getElementById('product-detail').style.display = 'none';
                document.getElementById('product-list-container').style.display = 'block';
            }
            
            const categoryId = this.dataset.categoryId;
            const subcategoryId = this.dataset.subcategoryId;
            const subSubcategoryId = this.dataset.subSubcategoryId;
            
            // Kategori filtreleme yap
            filterProductsBySubSubcategory(categoryId, subcategoryId, subSubcategoryId);
            
            // Aktif alt-alt kategori sınıfını ekle
            document.querySelectorAll('.sub-subcategory-item').forEach(subsubcat => subsubcat.classList.remove('active'));
            this.classList.add('active');
            
            // URL'yi güncelle
            updateURL({ 
                category: categoryId, 
                subcategory: subcategoryId,
                subsubcategory: subSubcategoryId
            });
        });
    });
}

// Ürünleri kategoriye göre filtreleme
async function filterProductsByCategory(categoryId) {
    try {
        // Use products_en.json if language is English
        const productsJsonUrl = currentLanguage === 'en' ? 'data/products_en.json' : 'data/products_tr.json';
        const products2JsonUrl = currentLanguage === 'en' ? 'data/products_en2.json' : 'data/products_tr2.json';
        
        // JSON dosyasını yükle
        const response = await fetch(productsJsonUrl);
        const data = await response.json();
        
        // İkinci JSON dosyasını yükle ve birleştir
        try {
            const response2 = await fetch(products2JsonUrl);
            const data2 = await response2.json();
            
            // Ürünleri birleştir
            data.products = [...data.products, ...data2.products];
        } catch (err) {
            console.warn(`Could not load secondary products file for category filtering:`, err);
        }
        
        // Filter products by category
        const filteredProducts = data.products.filter(product => product.category === categoryId);
        
        // Show filtered products
        renderProducts(data.products, filteredProducts);
        
        // Update the category title
        updateCategoryTitle(categoryId);
        
        // Update URL with category parameter
        updateURL({ category: categoryId, subcategory: null, subsubcategory: null });
    } catch (error) {
        console.error('Ürünler filtrelenirken hata oluştu:', error);
        
        // Fallback to products.json if products_en.json fails
        if (currentLanguage === 'en') {
            try {
                console.log('Falling back to products.json for category filtering');
                const response = await fetch('data/products_tr.json');
                const data = await response.json();
                
                // Try to load and merge the secondary fallback file
                try {
                    const response2 = await fetch('data/products_tr2.json');
                    const data2 = await response2.json();
                    
                    // Merge products
                    data.products = [...data.products, ...data2.products];
                } catch (err) {
                    console.warn(`Could not load secondary fallback products file for category filtering:`, err);
                }
                
                const filteredProducts = data.products.filter(product => product.category === categoryId);
                
                renderProducts(data.products, filteredProducts);
                updateCategoryTitle(categoryId);
                updateURL({ category: categoryId, subcategory: null, subsubcategory: null });
            } catch (fallbackError) {
                console.error('Fallback kategoriye göre filtrelenirken hata oluştu:', fallbackError);
            }
        }
    }
}

// Alt kategoriye göre ürünleri filtreleme
async function filterProductsBySubcategory(categoryId, subcategoryId) {
    try {
        // Use products_en.json if language is English
        const productsJsonUrl = currentLanguage === 'en' ? 'data/products_en.json' : 'data/products_tr.json';
        const products2JsonUrl = currentLanguage === 'en' ? 'data/products_en2.json' : 'data/products_tr2.json';
        
        // JSON dosyasını yükle
        const response = await fetch(productsJsonUrl);
        const data = await response.json();
        
        // İkinci JSON dosyasını yükle ve birleştir
        try {
            const response2 = await fetch(products2JsonUrl);
            const data2 = await response2.json();
            
            // Ürünleri birleştir
            data.products = [...data.products, ...data2.products];
        } catch (err) {
            console.warn(`Could not load secondary products file for subcategory filtering:`, err);
        }
        
        // Filter products by category and subcategory
        const filteredProducts = data.products.filter(product => 
            product.category === categoryId && product.subcategory === subcategoryId);
        renderProducts(data.products, filteredProducts);
        
        // Alt kategori başlığını güncelle
        updateSubcategoryTitle(categoryId, subcategoryId);
        
        // Update URL parameters
        updateURL({ category: categoryId, subcategory: subcategoryId, subsubcategory: null });
    } catch (error) {
        console.error('Ürünler filtrelenirken hata oluştu:', error);
        
        // Fallback to products.json if products_en.json fails
        if (currentLanguage === 'en') {
            try {
                console.log('Falling back to products.json for subcategory filtering');
                const response = await fetch('data/products_tr.json');
                const data = await response.json();
                
                // Try to load and merge the secondary fallback file
                try {
                    const response2 = await fetch('data/products_tr2.json');
                    const data2 = await response2.json();
                    
                    // Merge products
                    data.products = [...data.products, ...data2.products];
                } catch (err) {
                    console.warn(`Could not load secondary fallback products file for subcategory filtering:`, err);
                }
                
                const filteredProducts = data.products.filter(product => 
                    product.category === categoryId && product.subcategory === subcategoryId);
                renderProducts(data.products, filteredProducts);
                updateSubcategoryTitle(categoryId, subcategoryId);
                updateURL({ category: categoryId, subcategory: subcategoryId, subsubcategory: null });
            } catch (fallbackError) {
                console.error('Fallback alt kategoriye göre filtrelenirken hata oluştu:', fallbackError);
            }
        }
    }
}

// Alt alt kategoriye göre ürünleri filtreleme
async function filterProductsBySubSubcategory(categoryId, subcategoryId, subSubcategoryId) {
    try {
        // Use products_en.json if language is English
        const productsJsonUrl = currentLanguage === 'en' ? 'data/products_en.json' : 'data/products_tr.json';
        const products2JsonUrl = currentLanguage === 'en' ? 'data/products_en2.json' : 'data/products_tr2.json';
        
        // JSON dosyasını yükle
        const response = await fetch(productsJsonUrl);
        const data = await response.json();
        
        // İkinci JSON dosyasını yükle ve birleştir
        try {
            const response2 = await fetch(products2JsonUrl);
            const data2 = await response2.json();
            
            // Ürünleri birleştir
            data.products = [...data.products, ...data2.products];
        } catch (err) {
            console.warn(`Could not load secondary products file for sub-subcategory filtering:`, err);
        }
        
        // Filter products by category, subcategory, and sub-subcategory
        const filteredProducts = data.products.filter(product => 
            product.category === categoryId && 
            product.subcategory === subcategoryId && 
            product.subSubcategory === subSubcategoryId);
        renderProducts(data.products, filteredProducts);
        
        // Kategori başlığını güncelle
        updateSubSubcategoryTitle(categoryId, subcategoryId, subSubcategoryId);
        
        // Update URL parameters
        updateURL({ 
            category: categoryId, 
            subcategory: subcategoryId,
            subsubcategory: subSubcategoryId
        });
    } catch (error) {
        console.error('Ürünler filtrelenirken hata oluştu:', error);
        
        // Fallback to products.json if products_en.json fails
        if (currentLanguage === 'en') {
            try {
                console.log('Falling back to products.json for sub-subcategory filtering');
                const response = await fetch('data/products_tr.json');
                const data = await response.json();
                
                // Try to load and merge the secondary fallback file
                try {
                    const response2 = await fetch('data/products_tr2.json');
                    const data2 = await response2.json();
                    
                    // Merge products
                    data.products = [...data.products, ...data2.products];
                } catch (err) {
                    console.warn(`Could not load secondary fallback products file for sub-subcategory filtering:`, err);
                }
                
                const filteredProducts = data.products.filter(product => 
                    product.category === categoryId && 
                    product.subcategory === subcategoryId && 
                    product.subSubcategory === subSubcategoryId);
                renderProducts(data.products, filteredProducts);
                updateSubSubcategoryTitle(categoryId, subcategoryId, subSubcategoryId);
                updateURL({ 
                    category: categoryId, 
                    subcategory: subcategoryId,
                    subsubcategory: subSubcategoryId
                });
            } catch (fallbackError) {
                console.error('Fallback alt-alt kategoriye göre filtrelenirken hata oluştu:', fallbackError);
            }
        }
    }
}

// Ürün detayını gösteren fonksiyon - make it globally accessible
window.showProductDetail = async function(productId) {
    try {
        // Use products_en.json if language is English
        const productsJsonUrl = currentLanguage === 'en' ? 'data/products_en.json' : 'data/products_tr.json';
        const products2JsonUrl = currentLanguage === 'en' ? 'data/products_en2.json' : 'data/products_tr2.json';
        
        // JSON dosyasını yükle
        const response = await fetch(productsJsonUrl);
        const data = await response.json();
        
        // İkinci JSON dosyasını yükle ve birleştir
        let product = data.products.find(p => p.id.toString() === productId);
        
        if (!product) {
            try {
                console.log('Product not found in primary file, checking secondary file');
                const response2 = await fetch(products2JsonUrl);
                const data2 = await response2.json();
                
                product = data2.products.find(p => p.id.toString() === productId);
                
                // Ürün ikinci dosyada bulunursa özellikle günlüğe not edelim
                if (product) {
                    console.log('Product found in secondary file:', product.id);
                }
            } catch (err) {
                console.warn(`Could not load secondary products file for product detail:`, err);
            }
        }
        
        if (product) {
            // Liste görünümünü gizle, detay görünümünü göster
            document.getElementById('product-list-container').style.display = 'none';
            document.getElementById('product-detail').style.display = 'block';
            
            // Ürün bilgilerini doldur
            const productImageEl = document.querySelector('.product-image');
            productImageEl.src = product.image;
            productImageEl.alt = product.name;
            
            // Resme tıklama olayı ekle
            productImageEl.style.cursor = 'pointer';
            productImageEl.onclick = function() {
                openImageModal(product.image, product.name);
            };
            
            // Dil kontrolü - mevcut dile göre ürün adını göster
            let productName = product.name;
            if (product[currentLanguage] && product[currentLanguage].name) {
                productName = product[currentLanguage].name;
            } else if (product.tr && product.tr.name) {
                productName = product.tr.name;
            }
            
            document.querySelector('.product-name').textContent = productName;
            document.querySelector('.product-name-specs').textContent = `${productName} ${translations[currentLanguage].teknik_ozellikler_table || 'TEKNİK ÖZELLİKLERİ'}`;
            
            // Ürün bilgileri - dile göre
            if (product.generalInfo) {
                let generalInfo = product.generalInfo;
                if (product[currentLanguage] && product[currentLanguage].generalInfo) {
                    generalInfo = product[currentLanguage].generalInfo;
                }
                document.querySelector('.product-info-text').textContent = generalInfo;
            }
            
            // Check if catalog exists for this product
            checkCatalogAvailability(product, productName);
            
            // Ürün özellikleri - dile göre
            if (product.features && product.features.length > 0) {
                const featuresContainer = document.querySelector('.product-features');
                featuresContainer.innerHTML = '';
                
                // Özelliklerin dile göre versiyonunu al
                let features = product.features;
                if (product[currentLanguage] && product[currentLanguage].features) {
                    features = product[currentLanguage].features;
                }
                
                features.forEach(feature => {
                    const featureItem = document.createElement('div');
                    featureItem.className = 'feature-item';
                    featureItem.textContent = feature;
                    featuresContainer.appendChild(featureItem);
                });
            }
            
            // Teknik özellikler - dile göre
            if (product.specifications && Object.keys(product.specifications).length > 0) {
                const specsTable = document.querySelector('.product-specs-table');
                specsTable.innerHTML = '';
                
                // Özelliklerin dile göre versiyonunu al
                let specs = product.specifications;
                if (product[currentLanguage] && product[currentLanguage].specifications) {
                    specs = product[currentLanguage].specifications;
                }
                
                for (const [key, value] of Object.entries(specs)) {
                    const row = document.createElement('tr');
                    
                    // Anahtar ve değer çevirileri
                    let translatedKey = key;
                    if (translations[currentLanguage] && translations[currentLanguage][key.toLowerCase()]) {
                        translatedKey = translations[currentLanguage][key.toLowerCase()];
                    }
                    
                    row.innerHTML = `
                        <td>${translatedKey}</td>
                        <td>${value}</td>
                    `;
                    specsTable.appendChild(row);
                }
            }
            
            // Standart aksesuarlar - dile göre
            if (product.standardAccessories && product.standardAccessories.length > 0) {
                const standardAccessoriesList = document.querySelector('.standard-accessories');
                standardAccessoriesList.innerHTML = '';
                
                // Aksesuarların dile göre versiyonunu al
                let stdAccessories = product.standardAccessories;
                if (product[currentLanguage] && product[currentLanguage].standardAccessories) {
                    stdAccessories = product[currentLanguage].standardAccessories;
                }
                
                stdAccessories.forEach(accessory => {
                    const listItem = document.createElement('li');
                    listItem.className = 'list-group-item accessory-item';
                    listItem.textContent = accessory;
                    standardAccessoriesList.appendChild(listItem);
                });
            }
            
            // Opsiyonel aksesuarlar - dile göre
            if (product.optionalAccessories && product.optionalAccessories.length > 0) {
                const optionalAccessoriesList = document.querySelector('.optional-accessories');
                optionalAccessoriesList.innerHTML = '';
                
                // Aksesuarların dile göre versiyonunu al
                let optAccessories = product.optionalAccessories;
                if (product[currentLanguage] && product[currentLanguage].optionalAccessories) {
                    optAccessories = product[currentLanguage].optionalAccessories;
                }
                
                optAccessories.forEach(accessory => {
                    const listItem = document.createElement('li');
                    listItem.className = 'list-group-item accessory-item';
                    listItem.textContent = accessory;
                    optionalAccessoriesList.appendChild(listItem);
                });
            }
            
            // Kategori bilgisini doldur - çevirili haliyle
            // Use merged categories if available
            const categories = data.categories || [];
            const categoryName = getCategoryName(categories, product.category);
            document.querySelector('.product-category').textContent = categoryName || '';
            
            // i18n sistemini yeniden çalıştır - yeni eklenen elementler için çevirileri uygula
            if (window.updateContent) {
                window.updateContent();
            }
        } else {
            console.error('Product not found in any file:', productId);
        }
    } catch (error) {
        console.error('Ürün detayı yüklenirken hata oluştu:', error);
        
        // Fallback to products.json if products_en.json fails
        if (currentLanguage === 'en') {
            try {
                console.log('Falling back to products.json for product detail');
                const response = await fetch('data/products_tr.json');
                const data = await response.json();
                
                // Check secondary fallback file
                let product = data.products.find(p => p.id.toString() === productId);
                
                if (!product) {
                    try {
                        console.log('Product not found in primary fallback, checking secondary fallback');
                        const response2 = await fetch('data/products_tr2.json');
                        const data2 = await response2.json();
                        
                        product = data2.products.find(p => p.id.toString() === productId);
                    } catch (err) {
                        console.warn(`Could not load secondary fallback products file:`, err);
                    }
                }
                
                if (product) {
                    // Rest of the product display code for fallback
                    document.getElementById('product-list-container').style.display = 'none';
                    document.getElementById('product-detail').style.display = 'block';
                    
                    document.querySelector('.product-image').src = product.image;
                    document.querySelector('.product-image').alt = product.name;
                    document.querySelector('.product-name').textContent = product.name;
                    document.querySelector('.product-name-specs').textContent = `${product.name} ${translations[currentLanguage].teknik_ozellikler_table || 'TEKNİK ÖZELLİKLERİ'}`;
                    
                    // Check if catalog exists for this product
                    checkCatalogAvailability(product, product.name);
                    
                    if (product.generalInfo) {
                        document.querySelector('.product-info-text').textContent = product.generalInfo;
                    }
                    
                    // Display remaining product details...
                    if (window.updateContent) {
                        window.updateContent();
                    }
                }
            } catch (fallbackError) {
                console.error('Fallback ürün detayı yüklenirken hata oluştu:', fallbackError);
            }
        }
    }
}

// Function to check if a catalog PDF exists for a product and add a button to view it
function checkCatalogAvailability(product, productName) {
    // List of possible PDF patterns based on product name, model, and category
    const possibleFilenames = [
        // Main product name
        productName,
        productName.replace(/\s+/g, '_'),
        productName.replace(/\s+/g, '-'),
        
        // Main product model (usually first word or two)
        product.specifications?.MODEL,
        product.name.split(' ').slice(0, 2).join(' '),
        
        // Category + model combinations
        `${product.subcategory} ${productName}`.replace(/\s+/g, '-'),
        `${product.subcategory} ${productName}`.replace(/\s+/g, '_'),
        
        // Series based names (if product belongs to a series)
        product.name.match(/([A-Z]+\s?[A-Z0-9-]+)\s?/)?.[1]
    ];
    
    // Look for catalog matches - start with an async check
    fetch('catalogs/')
        .then(response => response.text())
        .then(html => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            
            // Extract PDF filenames from directory listing
            const pdfFiles = Array.from(tempDiv.querySelectorAll('a'))
                .map(a => a.href)
                .filter(href => href.toLowerCase().endsWith('.pdf'))
                .map(href => href.split('/').pop());
            
            if (!pdfFiles || pdfFiles.length === 0) {
                console.log('No PDF catalogs found in directory');
                return;
            }
            
            // Find possible catalog match
            let catalogFile = null;
            
            // First check for exact product name match
            for (const possibleName of possibleFilenames) {
                if (!possibleName) continue;
                
                const exactMatch = pdfFiles.find(file => 
                    file.toLowerCase() === `${possibleName.toLowerCase()}.pdf`
                );
                
                if (exactMatch) {
                    catalogFile = exactMatch;
                    break;
                }
            }
            
            // If no exact match, check for partial matches
            if (!catalogFile) {
                for (const possibleName of possibleFilenames) {
                    if (!possibleName) continue;
                    
                    const partialMatch = pdfFiles.find(file => 
                        file.toLowerCase().includes(possibleName.toLowerCase())
                    );
                    
                    if (partialMatch) {
                        catalogFile = partialMatch;
                        break;
                    }
                }
            }
            
            // If no matches using product name, try the category or subcategory
            if (!catalogFile) {
                if (product.subcategory) {
                    const subcategoryMatch = pdfFiles.find(file => 
                        file.toLowerCase().includes(product.subcategory.toLowerCase().replace(/-/g, ' '))
                    );
                    
                    if (subcategoryMatch) {
                        catalogFile = subcategoryMatch;
                    }
                }
                
                if (!catalogFile && product.category) {
                    const categoryMatch = pdfFiles.find(file => 
                        file.toLowerCase().includes(product.category.toLowerCase().replace(/-/g, ' '))
                    );
                    
                    if (categoryMatch) {
                        catalogFile = categoryMatch;
                    }
                }
            }
            
            // If catalog found, add button to view it
            if (catalogFile) {
                console.log('Catalog found:', catalogFile);
                
                // Check if button already exists
                if (!document.querySelector('.catalog-button')) {
                    const catalogButton = document.createElement('a');
                    catalogButton.href = `catalogs/${catalogFile}`;
                    catalogButton.className = 'btn btn-success catalog-button';
                    catalogButton.target = '_blank';
                    catalogButton.innerHTML = `
                        <i class="fas fa-file-pdf me-1"></i> 
                        <span data-i18n="katalog_goruntule">${currentLanguage === 'en' ? 'Catalog' : 'Katalog'}</span>
                    `;
                    
                    // Insert into the button container
                    const buttonsContainer = document.querySelector('.product-overview').nextElementSibling;
                    
                    // If the container doesn't have the button-group class already, reorganize the buttons
                    if (!buttonsContainer.classList.contains('button-group')) {
                        buttonsContainer.classList.add('button-group', 'd-flex', 'flex-wrap', 'gap-2');
                        
                        // Get existing buttons
                        const existingButtons = buttonsContainer.querySelectorAll('a.btn');
                        
                        // Clear the container
                        buttonsContainer.innerHTML = '';
                        
                        // Add catalog button first
                        buttonsContainer.appendChild(catalogButton);
                        
                        // Add back other buttons
                        existingButtons.forEach(button => {
                            buttonsContainer.appendChild(button);
                        });
                        
                        // Add custom style to make buttons responsive
                        const style = document.createElement('style');
                        style.textContent = `
                            .button-group {
                                display: flex;
                                flex-wrap: wrap;
                                gap: 10px;
                                width: 100%;
                            }
                            .button-group .btn {
                                flex: 1;
                                min-width: 120px;
                                white-space: nowrap;
                                text-overflow: ellipsis;
                                overflow: hidden;
                            }
                            
                            @media (max-width: 576px) {
                                .button-group .btn {
                                    flex: 1 0 100%;
                                    margin-bottom: 5px;
                                }
                            }
                            
                            @media (min-width: 577px) and (max-width: 768px) {
                                .button-group .btn {
                                    flex: 1 0 48%;
                                }
                            }
                        `;
                        document.head.appendChild(style);
                    } else {
                        // Just append the button if container is already organized
                        buttonsContainer.prepend(catalogButton);
                    }
                    
                    // Update translations
                    if (window.updateContent) {
                        window.updateContent();
                    }
                }
            } else {
                console.log('No matching catalog found for:', productName);
            }
        })
        .catch(error => {
            console.error('Error checking catalog availability:', error);
        });
}

// Function to open image in modal
function openImageModal(imageSrc, imageAlt) {
    const imageModal = new bootstrap.Modal(document.getElementById('imageModal'));
    document.getElementById('modalImage').src = imageSrc;
    document.getElementById('modalImage').alt = imageAlt;
    document.getElementById('imageModalLabel').textContent = imageAlt;
    imageModal.show();
}

// Ürünleri sıralama fonksiyonu
async function sortProducts(sortOrder) {
    try {
        // Use products_en.json if language is English
        const productsJsonUrl = currentLanguage === 'en' ? 'data/products_en.json' : 'data/products_tr.json';
        
        // JSON dosyasını yükle
        const response = await fetch(productsJsonUrl);
        const data = await response.json();
        
        // URL parametrelerini al
        const urlParams = new URLSearchParams(window.location.search);
        const categoryId = urlParams.get('category');
        const subcategoryId = urlParams.get('subcategory');
        const subSubcategoryId = urlParams.get('subsubcategory');
        
        // Filtreleme için ürünleri seç
        let filteredProducts = [...data.products];
        
        if (categoryId) {
            filteredProducts = filteredProducts.filter(product => product.category === categoryId);
            
            if (subcategoryId) {
                filteredProducts = filteredProducts.filter(product => product.subcategory === subcategoryId);
                
                if (subSubcategoryId) {
                    filteredProducts = filteredProducts.filter(product => product.subSubcategory === subSubcategoryId);
                }
            }
        }
        
        // Sıralama yap
        if (sortOrder === 'name-asc') {
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortOrder === 'name-desc') {
            filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
        }
        
        // Ürünleri yeniden render et
        renderProducts(data.products, filteredProducts);
        
    } catch (error) {
        console.error('Ürünleri sıralarken hata oluştu:', error);
        
        // Fallback to products.json if products_en.json fails
        if (currentLanguage === 'en') {
            try {
                console.log('Falling back to products.json for sorting');
                const response = await fetch('data/products_tr.json');
                const data = await response.json();
                
                // Repeat the filtering and sorting logic
                let filteredProducts = [...data.products];
                
                const urlParams = new URLSearchParams(window.location.search);
                const categoryId = urlParams.get('category');
                const subcategoryId = urlParams.get('subcategory');
                const subSubcategoryId = urlParams.get('subsubcategory');
                
                if (categoryId) {
                    filteredProducts = filteredProducts.filter(product => product.category === categoryId);
                    
                    if (subcategoryId) {
                        filteredProducts = filteredProducts.filter(product => product.subcategory === subcategoryId);
                        
                        if (subSubcategoryId) {
                            filteredProducts = filteredProducts.filter(product => product.subSubcategory === subSubcategoryId);
                        }
                    }
                }
                
                if (sortOrder === 'name-asc') {
                    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                } else if (sortOrder === 'name-desc') {
                    filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
                }
                
                renderProducts(data.products, filteredProducts);
            } catch (fallbackError) {
                console.error('Fallback sıralama işleminde hata oluştu:', fallbackError);
            }
        }
    }
}

// Kategori adını ID'ye göre bulan yardımcı fonksiyon
function getCategoryName(categories, categoryId) {
    const lang = localStorage.getItem('language') || 'tr';
    
    // Check if we have a direct translation in the translations object
    if (lang === 'en' && translations && translations.en && 
        translations.en[categoryId.replace(/-/g, '_')]) {
        return translations.en[categoryId.replace(/-/g, '_')];
    }
    
    // Otherwise search in the categories array
    for (const category of categories) {
        if (category.id === categoryId) {
            // Mevcut dile göre kategori adını al
            let categoryName;
            if (category[lang] && category[lang].name) {
                categoryName = category[lang].name;
            } else if (category.tr && category.tr.name) {
                categoryName = category.tr.name;
            } else {
                categoryName = category.name || category.id;
            }
            return categoryName;
        }
        
        if (category.subcategories) {
            for (const subcategory of category.subcategories) {
                if (subcategory.id === categoryId) {
                    // Mevcut dile göre alt kategori adını al
                    let subcategoryName;
                    
                    // First check for direct translation
                    if (subcategory[lang] && subcategory[lang].name) {
                        subcategoryName = subcategory[lang].name;
                    } 
                    // Then check translations.js
                    else if (lang === 'en' && translations && translations.en && 
                             translations.en[subcategory.id.replace(/-/g, '_')]) {
                        subcategoryName = translations.en[subcategory.id.replace(/-/g, '_')];
                    }
                    // Fall back to TR
                    else if (subcategory.tr && subcategory.tr.name) {
                        subcategoryName = subcategory.tr.name;
                    } else {
                        subcategoryName = subcategory.name || subcategory.id;
                    }
                    return subcategoryName;
                }
                
                if (subcategory.subcategories) {
                    for (const subSubcategory of subcategory.subcategories) {
                        if (subSubcategory.id === categoryId) {
                            // Mevcut dile göre alt-alt kategori adını al
                            let subSubcategoryName;
                            
                            // First check for direct translation
                            if (subSubcategory[lang] && subSubcategory[lang].name) {
                                subSubcategoryName = subSubcategory[lang].name;
                            } 
                            // Then check translations.js
                            else if (lang === 'en' && translations && translations.en && 
                                     translations.en[subSubcategory.id.replace(/-/g, '_')]) {
                                subSubcategoryName = translations.en[subSubcategory.id.replace(/-/g, '_')];
                            }
                            // Fall back to TR
                            else if (subSubcategory.tr && subSubcategory.tr.name) {
                                subSubcategoryName = subSubcategory.tr.name;
                            } else {
                                subSubcategoryName = subSubcategory.name || subSubcategory.id;
                            }
                            return subSubcategoryName;
                        }
                    }
                }
            }
        }
    }
    
    return null;
}

// Kategori başlığını güncelleyen fonksiyon
async function updateCategoryTitle(categoryId) {
    try {
        // Use products_en.json if language is English
        const productsJsonUrl = currentLanguage === 'en' ? 'data/products_en.json' : 'data/products_tr.json';
        
        // JSON dosyasını yükle
        const response = await fetch(productsJsonUrl);
        const data = await response.json();
        
        // Get current language
        const lang = localStorage.getItem('language') || 'tr';
        
        // Try to find the category name using getCategoryName helper
        const categoryName = getCategoryName(data.categories, categoryId);
        
        // Update the category title if we found a name
        if (categoryName) {
            document.querySelector('.current-category-title').textContent = categoryName;
        }
    } catch (error) {
        console.error('Kategori başlığı güncellenirken hata oluştu:', error);
        
        // Fallback to products.json if products_en.json fails
        if (currentLanguage === 'en') {
            try {
                console.log('Falling back to products.json for category title');
                const response = await fetch('data/products_tr.json');
                const data = await response.json();
                
                const categoryName = getCategoryName(data.categories, categoryId);
                
                if (categoryName) {
                    document.querySelector('.current-category-title').textContent = categoryName;
                }
            } catch (fallbackError) {
                console.error('Fallback kategori başlığı güncellenirken hata oluştu:', fallbackError);
            }
        }
    }
}

// Alt kategori başlığını güncelleyen fonksiyon
async function updateSubcategoryTitle(categoryId, subcategoryId) {
    try {
        // Use products_en.json if language is English
        const productsJsonUrl = currentLanguage === 'en' ? 'data/products_en.json' : 'data/products_tr.json';
        
        // JSON dosyasını yükle
        const response = await fetch(productsJsonUrl);
        const data = await response.json();
        
        // Get current language
        const lang = localStorage.getItem('language') || 'tr';
        
        // Try to find the subcategory name using getCategoryName helper
        const subcategoryName = getCategoryName(data.categories, subcategoryId);
        
        // Update the category title if we found a name
        if (subcategoryName) {
                document.querySelector('.current-category-title').textContent = subcategoryName;
        }
    } catch (error) {
        console.error('Alt kategori başlığı güncellenirken hata oluştu:', error);
        
        // Fallback to products.json if products_en.json fails
        if (currentLanguage === 'en') {
            try {
                console.log('Falling back to products.json for subcategory title');
                const response = await fetch('data/products_tr.json');
                const data = await response.json();
                
                const subcategoryName = getCategoryName(data.categories, subcategoryId);
                
                if (subcategoryName) {
                    document.querySelector('.current-category-title').textContent = subcategoryName;
                }
            } catch (fallbackError) {
                console.error('Fallback alt kategori başlığı güncellenirken hata oluştu:', fallbackError);
            }
        }
    }
}

// Alt alt kategori başlığını güncelleyen fonksiyon
async function updateSubSubcategoryTitle(categoryId, subcategoryId, subSubcategoryId) {
    try {
        // Use products_en.json if language is English
        const productsJsonUrl = currentLanguage === 'en' ? 'data/products_en.json' : 'data/products_tr.json';
        
        // JSON dosyasını yükle
        const response = await fetch(productsJsonUrl);
        const data = await response.json();
        
        // Get current language
        const lang = localStorage.getItem('language') || 'tr';
        
        // Try to find the sub-subcategory name using getCategoryName helper
        const subSubcategoryName = getCategoryName(data.categories, subSubcategoryId);
        
        // Update the category title if we found a name
        if (subSubcategoryName) {
                    document.querySelector('.current-category-title').textContent = subSubcategoryName;
        }
    } catch (error) {
        console.error('Alt alt kategori başlığı güncellenirken hata oluştu:', error);
        
        // Fallback to products.json if products_en.json fails
        if (currentLanguage === 'en') {
            try {
                console.log('Falling back to products.json for sub-subcategory title');
                const response = await fetch('data/products_tr.json');
                const data = await response.json();
                
                const subSubcategoryName = getCategoryName(data.categories, subSubcategoryId);
                
                if (subSubcategoryName) {
                    document.querySelector('.current-category-title').textContent = subSubcategoryName;
                }
            } catch (fallbackError) {
                console.error('Fallback alt alt kategori başlığı güncellenirken hata oluştu:', fallbackError);
            }
        }
    }
}

// URL parametrelerini güncelleyen fonksiyon
function updateURL(params) {
    const url = new URL(window.location);
    
    // Mevcut parametreleri temizle
    url.searchParams.delete('category');
    url.searchParams.delete('subcategory');
    url.searchParams.delete('subsubcategory');
    
    // Yeni parametreleri ekle
    Object.entries(params).forEach(([key, value]) => {
        if (value) {
            url.searchParams.set(key, value);
        }
    });
    
    // URL'yi güncelle
    window.history.pushState({}, '', url);
}

// Ürün sayısını güncelleyen fonksiyon
function updateProductCount(count) {
    const title = document.querySelector('.current-category-title').textContent;
    // Remove product count from current title (if it exists)
    let cleanTitle = title.replace(/\s*\(\d+\s*ürün\)\s*$/, '');
    document.querySelector('.current-category-title').textContent = cleanTitle;
} 

// Make category title functions global
window.updateCategoryTitle = updateCategoryTitle;
window.updateSubcategoryTitle = updateSubcategoryTitle;
window.updateSubSubcategoryTitle = updateSubSubcategoryTitle; 