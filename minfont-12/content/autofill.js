window.MF = window.MF || {};
(() => {
  // Einfache Verschlüsselung für Passwörter (Base64 + XOR)
  const ENCRYPT_KEY = 'MinFont2024SecureKey';
  
  function simpleEncrypt(text) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ ENCRYPT_KEY.charCodeAt(i % ENCRYPT_KEY.length));
    }
    return btoa(result);
  }
  
  function simpleDecrypt(encrypted) {
    try {
      const decoded = atob(encrypted);
      let result = '';
      for (let i = 0; i < decoded.length; i++) {
        result += String.fromCharCode(decoded.charCodeAt(i) ^ ENCRYPT_KEY.charCodeAt(i % ENCRYPT_KEY.length));
      }
      return result;
    } catch {
      return '';
    }
  }

  // Domain-basierte Speicherung
  function getCurrentDomain() {
    try {
      return new URL(window.location.href).hostname;
    } catch {
      return window.location.hostname || 'unknown';
    }
  }

  // Login-Formular-Erkennung
  function findLoginForms() {
    const forms = [];
    
    // Suche nach Formularen mit Passwort-Feldern
    document.querySelectorAll('form').forEach(form => {
      const passwordField = form.querySelector('input[type="password"]');
      const usernameField = form.querySelector(
        'input[type="text"], input[type="email"], input[name*="user"], input[name*="login"], input[name*="email"], input[id*="user"], input[id*="login"], input[id*="email"]'
      );
      
      if (passwordField && usernameField) {
        forms.push({ form, usernameField, passwordField });
      }
    });

    // Fallback: Suche auch außerhalb von Formularen
    if (forms.length === 0) {
      const passwordFields = document.querySelectorAll('input[type="password"]');
      passwordFields.forEach(passwordField => {
        const container = passwordField.closest('div, section, main, body');
        const usernameField = container.querySelector(
          'input[type="text"], input[type="email"], input[name*="user"], input[name*="login"], input[name*="email"]'
        );
        
        if (usernameField) {
          forms.push({ form: null, usernameField, passwordField });
        }
      });
    }

    return forms;
  }

  // Auto-Fill anwenden
  async function applyAutoFill() {
    if (!MF.state.autoFillEnabled) return;

    const domain = getCurrentDomain();
    const savedLogins = await new Promise(resolve => {
      chrome.storage.local.get({ mf_autoFillData: {} }, result => {
        resolve(result.mf_autoFillData || {});
      });
    });

    const loginData = savedLogins[domain];
    if (!loginData) return;

    const forms = findLoginForms();
    if (forms.length === 0) return;

    // Auto-Fill für das erste gefundene Formular
    const { usernameField, passwordField } = forms[0];
    
    try {
      const username = simpleDecrypt(loginData.username);
      const password = simpleDecrypt(loginData.password);

      if (username && password) {
        // Sanfte Animation beim Ausfüllen
        usernameField.style.transition = 'background-color 0.3s ease';
        passwordField.style.transition = 'background-color 0.3s ease';
        
        usernameField.value = username;
        passwordField.value = password;
        
        // Visuelles Feedback
        usernameField.style.backgroundColor = '#e8f5e8';
        passwordField.style.backgroundColor = '#e8f5e8';
        
        // Events triggern für Validierung
        usernameField.dispatchEvent(new Event('input', { bubbles: true }));
        passwordField.dispatchEvent(new Event('input', { bubbles: true }));
        
        setTimeout(() => {
          usernameField.style.backgroundColor = '';
          passwordField.style.backgroundColor = '';
        }, 2000);

        console.log('🔐 MinFont AutoFill: Login-Daten eingefüllt für', domain);
      }
    } catch (error) {
      console.warn('MinFont AutoFill Error:', error);
    }
  }

  // Login-Daten speichern
  function captureLogin() {
    if (!MF.state.autoFillEnabled) return;

    const forms = findLoginForms();
    if (forms.length === 0) return;

    forms.forEach(({ form, usernameField, passwordField }) => {
      const submitHandler = async (e) => {
        const username = usernameField.value.trim();
        const password = passwordField.value.trim();
        
        if (username && password && username.length > 2 && password.length > 3) {
          const domain = getCurrentDomain();
          
          // Kurz warten damit das Formular sich submitten kann
          setTimeout(async () => {
            const savedLogins = await new Promise(resolve => {
              chrome.storage.local.get({ mf_autoFillData: {} }, result => {
                resolve(result.mf_autoFillData || {});
              });
            });

            savedLogins[domain] = {
              username: simpleEncrypt(username),
              password: simpleEncrypt(password),
              lastUpdated: Date.now(),
              url: window.location.href
            };

            chrome.storage.local.set({ mf_autoFillData: savedLogins });
            console.log('🔐 MinFont AutoFill: Login-Daten gespeichert für', domain);
          }, 100);
        }
      };

      // Event-Listener für Form-Submit
      if (form) {
        form.addEventListener('submit', submitHandler, { once: true });
      }
      
      // Fallback: Button-Clicks überwachen
      const submitButtons = document.querySelectorAll('button[type="submit"], input[type="submit"], button[name*="login"], button[id*="login"], button[class*="login"], button[class*="signin"]');
      submitButtons.forEach(button => {
        button.addEventListener('click', submitHandler, { once: true });
      });
    });
  }

  // Auto-Fill initialisieren
  function initAutoFill() {
    // Auto-Fill anwenden nach DOM-Ladung
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(applyAutoFill, 500); // Kurz warten für dynamischen Inhalt
      });
    } else {
      setTimeout(applyAutoFill, 500);
    }

    // Login-Capture initialisieren
    setTimeout(captureLogin, 1000);

    // Überwachung für dynamisch geladene Formulare
    const observer = new MutationObserver(() => {
      setTimeout(() => {
        applyAutoFill();
        captureLogin();
      }, 200);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // API für andere Module
  MF.autoFillInit = initAutoFill;
  MF.autoFillApply = applyAutoFill;
  
  // Gespeicherte Logins abrufen
  MF.getAutoFillData = () => {
    return new Promise(resolve => {
      chrome.storage.local.get({ mf_autoFillData: {} }, result => {
        const data = result.mf_autoFillData || {};
        // Passwörter für Anzeige maskieren
        const maskedData = {};
        Object.keys(data).forEach(domain => {
          maskedData[domain] = {
            ...data[domain],
            username: simpleDecrypt(data[domain].username),
            password: '•'.repeat(simpleDecrypt(data[domain].password).length)
          };
        });
        resolve(maskedData);
      });
    });
  };

  // Login für Domain löschen
  MF.deleteAutoFillData = (domain) => {
    chrome.storage.local.get({ mf_autoFillData: {} }, result => {
      const data = result.mf_autoFillData || {};
      delete data[domain];
      chrome.storage.local.set({ mf_autoFillData: data });
    });
  };
})();