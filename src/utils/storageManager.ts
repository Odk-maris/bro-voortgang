
// Utility for managing localStorage and cookie expiration
const STORAGE_EXPIRY_KEY = 'storage_last_cleared';
const STORAGE_EXPIRY_DAYS = 10;

export const checkAndClearExpiredStorage = () => {
  try {
    const lastCleared = localStorage.getItem(STORAGE_EXPIRY_KEY);
    const now = Date.now();
    
    if (!lastCleared) {
      // First time - set the timestamp
      localStorage.setItem(STORAGE_EXPIRY_KEY, now.toString());
      return;
    }
    
    const lastClearedTime = parseInt(lastCleared);
    const daysSinceCleared = (now - lastClearedTime) / (1000 * 60 * 60 * 24);
    
    if (daysSinceCleared >= STORAGE_EXPIRY_DAYS) {
      console.log('Clearing expired storage data...');
      clearAllStorageAndCookies();
      localStorage.setItem(STORAGE_EXPIRY_KEY, now.toString());
    }
  } catch (error) {
    console.error('Error checking storage expiry:', error);
  }
};

export const clearAllStorageAndCookies = () => {
  try {
    // Clear localStorage except for the expiry key
    const expiryValue = localStorage.getItem(STORAGE_EXPIRY_KEY);
    localStorage.clear();
    if (expiryValue) {
      localStorage.setItem(STORAGE_EXPIRY_KEY, expiryValue);
    }
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear cookies for this domain
    document.cookie.split(";").forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      if (name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
      }
    });
    
    console.log('Storage and cookies cleared successfully');
  } catch (error) {
    console.error('Error clearing storage and cookies:', error);
  }
};

export const forceStorageClear = () => {
  clearAllStorageAndCookies();
  localStorage.setItem(STORAGE_EXPIRY_KEY, Date.now().toString());
  // Reload the page to ensure clean state
  window.location.reload();
};
