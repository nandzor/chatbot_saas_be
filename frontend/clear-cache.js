/**
 * Clear Cache Script
 * This script clears all browser cache and local storage that might contain old redirects
 */

// Clear all local storage
localStorage.clear();

// Clear all session storage
sessionStorage.clear();

// Clear all cookies
document.cookie.split(";").forEach(function(c) {
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});

// Clear all caches
if ('caches' in window) {
    caches.keys().then(function(names) {
        for (let name of names) {
            caches.delete(name);
        }
    });
}

// Clear service worker if exists
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
            registration.unregister();
        }
    });
}

// Force reload
window.location.reload(true);

console.log('✅ Cache cleared successfully!');
