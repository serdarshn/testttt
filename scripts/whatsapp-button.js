/**
 * WhatsApp Contact Button
 * This script adds a floating WhatsApp button to all pages of the site
 */

document.addEventListener('DOMContentLoaded', function() {
    // Create the WhatsApp button element
    const whatsappButton = document.createElement('a');
    whatsappButton.href = 'https://wa.me/905304040778'; // WhatsApp link with phone number
    whatsappButton.target = '_blank'; // Open in new tab
    whatsappButton.rel = 'noopener noreferrer'; // Security best practice for external links
    whatsappButton.className = 'whatsapp-float';
    whatsappButton.setAttribute('aria-label', 'Contact us via WhatsApp');
    whatsappButton.setAttribute('data-i18n-attr', 'aria-label:whatsapp_aria_label');
    
    // Create the WhatsApp icon
    const whatsappIcon = document.createElement('img');
    whatsappIcon.src = 'images/icons8-whatsapp-240.svg';
    whatsappIcon.alt = 'WhatsApp';
    
    // Create the text element
    const whatsappText = document.createElement('span');
    whatsappText.className = 'whatsapp-text';
    whatsappText.setAttribute('data-i18n', 'whatsapp_contact');
    whatsappText.textContent = 'Bize Ulaşın';
    
    // Assemble the button
    whatsappButton.appendChild(whatsappIcon);
    whatsappButton.appendChild(whatsappText);
    
    // Add the button to the body
    document.body.appendChild(whatsappButton);
    
    // If i18n is loaded, translate the button
    if (typeof window.updateContent === 'function') {
        setTimeout(function() {
            window.updateContent();
        }, 500);
    } else if (typeof window.applyTranslations === 'function') {
        setTimeout(function() {
            const currentLang = localStorage.getItem('language') || 'tr';
            window.applyTranslations(currentLang);
        }, 500);
    }
    
    console.log('WhatsApp contact button added to page');
}); 