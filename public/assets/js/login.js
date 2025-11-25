class SivetLogin {
  constructor() {
    this.strapiUrl = 'http://localhost:1337';
    this.init();
  }

  init() {
    this.bindEvents();
    this.checkExistingSession();
  }

  bindEvents() {
    const form = document.querySelector('form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleLogin(e));
    }
  }

  async handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember')?.checked || false;

    console.log('🔐 Intentando login con:', { email });

    if (!email || !password) {
      this.showMessage('Por favor, completa todos los campos', 'error');
      return;
    }

    this.showLoading(true);

    try {
      const response = await fetch(`${this.strapiUrl}/api/auth/local`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: email,
          password: password,
        }),
      });

      const data = await response.json();

      console.log('📨 Respuesta de Strapi:', data);

      if (response.ok && data.jwt) {
        this.handleSuccess(data, rememberMe);
      } else {
        this.handleError(data);
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      this.showMessage('Error de conexión. Verifica que Strapi esté corriendo en http://localhost:1337', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  handleSuccess(loginData, rememberMe) {
    const storage = rememberMe ? localStorage : sessionStorage;
    
    storage.setItem('sivet_jwt', loginData.jwt);
    storage.setItem('sivet_user', JSON.stringify(loginData.user));

    console.log('✅ Login exitoso! Usuario:', loginData.user);
    
    this.showMessage(`¡Bienvenido ${loginData.user.username}! Redirigiendo...`, 'success');
    
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2000);
  }

  handleError(errorData) {
    let errorMessage = 'Error en el login';
    
    if (errorData.error && errorData.error.message) {
      switch (errorData.error.message) {
        case 'Invalid identifier or password':
          errorMessage = 'Correo electrónico o contraseña incorrectos';
          break;
        case 'Your account email is not confirmed':
          errorMessage = 'Por favor, confirma tu correo electrónico en Strapi';
          break;
        default:
          errorMessage = errorData.error.message;
      }
    }
    
    this.showMessage(errorMessage, 'error');
  }

  showMessage(message, type) {
    const existingMessage = document.querySelector('.login-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `login-message ${type}`;
    messageDiv.innerHTML = `
      <span class="message-icon">${type === 'success' ? '✅' : '❌'}</span>
      <span class="message-text">${message}</span>
    `;

    const logoSection = document.querySelector('.logo-section');
    logoSection.parentNode.insertBefore(messageDiv, logoSection.nextSibling);

    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 5000);
  }

  showLoading(show) {
    const loginButton = document.querySelector('.btn-login');
    if (loginButton) {
      if (show) {
        loginButton.disabled = true;
        loginButton.innerHTML = '<div class="loading-spinner"></div> Iniciando sesión...';
      } else {
        loginButton.disabled = false;
        loginButton.innerHTML = 'Iniciar Sesión';
      }
    }
  }

  checkExistingSession() {
    const token = localStorage.getItem('sivet_jwt') || sessionStorage.getItem('sivet_jwt');
    if (token) {
      console.log('🔄 Usuario ya está logueado, redirigiendo...');
      window.location.href = 'index.html';
    }
  }
}

// Inicializar cuando la página cargue
document.addEventListener('DOMContentLoaded', () => {
  new SivetLogin();
  console.log('🚀 Sistema de login inicializado');
});