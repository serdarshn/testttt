// Header ve Footer bileşenlerinin yüklenmesi ve yönetilmesi
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
    
    // Header bileşenini yükle
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        console.log("Loading header component");
        fetch('components/header.html')
            .then(response => response.text())
            .then(html => {
                headerPlaceholder.innerHTML = html;
                console.log("Header loaded");
                
                // Header yüklendikten sonra aktif sayfayı işaretle
                initActiveNavLink();
                
                // Header yüklendikten sonra scroll event'i dinleyicisini ekle
                initScrollEffect();
                
                // Sayfa zaten aşağıdaysa header'ı hemen güncelle
                checkScrollPosition();
            })
            .catch(error => {
                console.error("Error loading header:", error);
            });
    } else {
        console.warn("Header placeholder not found");
    }

    // Footer bileşenini yükle
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        console.log("Loading footer component");
        fetch('components/footer.html')
            .then(response => response.text())
            .then(html => {
                footerPlaceholder.innerHTML = html;
                console.log("Footer loaded");
            })
            .catch(error => {
                console.error("Error loading footer:", error);
            });
    } else {
        console.warn("Footer placeholder not found");
    }
});

// Aktif sayfa bağlantısını işaretleme
function initActiveNavLink() {
    // Şu anki URL'yi al
    const currentPage = window.location.pathname.split('/').pop();
    
    // Menü bağlantılarını bul
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    // Her bağlantıyı kontrol et
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        
        // Eğer bağlantı şu anki sayfa ile eşleşiyorsa aktif yap
        if (linkHref === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Navbar scroll efektini başlat
function initScrollEffect() {
    console.log("Initializing scroll effect for navbar");
    window.addEventListener('scroll', handleScroll);
}

// Scroll pozisyonunu kontrol et ve navbar görünümünü güncelle
function handleScroll() {
    const navbar = document.querySelector('.navbar');
    
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
}

// Sayfa yüklendiğinde mevcut scroll pozisyonunu kontrol et
function checkScrollPosition() {
    // Sayfa yüklendiğinde zaten aşağıya scroll yapılmışsa
    if (window.scrollY > 50) {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.classList.add('scrolled');
        }
    }
} 