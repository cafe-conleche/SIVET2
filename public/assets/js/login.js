class SivetLogin {
  constructor() {
    this.strapiUrl = "http://localhost:1337";
    this.init();
  }

  init() {
    this.bindEvents();
    this.checkExistingSession();
  }

  bindEvents() {
    const form = document.querySelector("form");
    if (form) {
      form.addEventListener("submit", (e) => this.handleLogin(e));
    }
  }

  async handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const rememberMe = document.getElementById("remember")?.checked || false;

    console.log("🔐 Intentando login con:", { email });

    if (!email || !password) {
      this.showMessage("Por favor, completa todos los campos", "error");
      return;
    }

    this.showLoading(true);

    try {
      const response = await fetch(`${this.strapiUrl}/api/auth/local`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: email,
          password: password,
        }),
      });

      const data = await response.json();

      console.log("📨 Respuesta de Strapi (auth/local):", data);

      if (response.ok && data.jwt) {
        // Esperamos a que handleSuccess termine
        await this.handleSuccess(data, rememberMe);
      } else {
        this.handleError(data);
      }
    } catch (error) {
      console.error("❌ Error de conexión:", error);
      this.showMessage(
        "Error de conexión. Verifica que Strapi esté corriendo en http://localhost:1337",
        "error"
      );
    } finally {
      this.showLoading(false);
    }
  }

  // 👉 función auxiliar para “forzar” rol si Strapi no lo devuelve bien
  inferRole(user) {
    const email = (user?.email || "").toLowerCase().trim();

    if (email === "jossua29@gmail.com") {
      return { name: "Administrador", type: "administrador" };
    }

    if (email === "ahmed@gmail.com") {
      return { name: "Recepcionista", type: "recepcionista" };
    }

    if (email === "leotapia09@gmail.com") {
      return { name: "Veterinario", type: "veterinario" };
    }

    // si no coincide con ninguno de los 3, devolvemos null
    return null;
  }

  // Pide /users/me?populate=role y guarda el usuario completo
  async handleSuccess(loginData, rememberMe) {
    const storage = rememberMe ? localStorage : sessionStorage;

    // Guardamos SIEMPRE el token primero
    storage.setItem("sivet_jwt", loginData.jwt);

    let userToStore = loginData.user; // por si todo falla

    try {
      // Pedimos al backend los datos completos del usuario (incluye el rol)
      const meResponse = await fetch(
        `${this.strapiUrl}/api/users/me?populate=role`,
        {
          headers: {
            Authorization: `Bearer ${loginData.jwt}`,
          },
        }
      );

      if (!meResponse.ok) {
        console.error("❌ Error al obtener /users/me:", meResponse.status);
      } else {
        const meUser = await meResponse.json();
        console.log("👤 Usuario /users/me:", meUser);

        if (meUser && Object.keys(meUser).length > 0) {
          userToStore = meUser;
        }
      }
    } catch (err) {
      console.error("❌ Error cargando /users/me:", err);
    }

    // 👉 Asegurarnos de que tenga role (de Strapi o inferido)
    if (!userToStore.role) {
      const inferred = this.inferRole(userToStore);
      if (inferred) {
        console.warn("⚠️ Rol no venido de Strapi, usando rol inferido:", inferred);
        userToStore.role = inferred;
      } else {
        console.warn("⚠️ Usuario sin rol definido, no se pudo inferir rol.");
      }
    }

    // Guardamos el usuario final
    storage.setItem("sivet_user", JSON.stringify(userToStore));

    console.log("✅ Login exitoso! Usuario con datos:", userToStore);

    this.showMessage(
      `¡Bienvenido ${
        userToStore.username || userToStore.email || "usuario"
      }! Redirigiendo...`,
      "success"
    );

    setTimeout(() => {
      window.location.href = "index.html";
    }, 2000);
  }

  handleError(errorData) {
    let errorMessage = "Error en el login";

    if (errorData.error && errorData.error.message) {
      switch (errorData.error.message) {
        case "Invalid identifier or password":
          errorMessage = "Correo electrónico o contraseña incorrectos";
          break;
        case "Your account email is not confirmed":
          errorMessage =
            "Por favor, confirma tu correo electrónico en Strapi";
          break;
        default:
          errorMessage = errorData.error.message;
      }
    }

    this.showMessage(errorMessage, "error");
  }

  showMessage(message, type) {
    const existingMessage = document.querySelector(".login-message");
    if (existingMessage) {
      existingMessage.remove();
    }

    const messageDiv = document.createElement("div");
    messageDiv.className = `login-message ${type}`;
    messageDiv.innerHTML = `
      <span class="message-icon">${type === "success" ? "✅" : "❌"}</span>
      <span class="message-text">${message}</span>
    `;

    const logoSection = document.querySelector(".logo-section");
    logoSection.parentNode.insertBefore(messageDiv, logoSection.nextSibling);

    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 5000);
  }

  showLoading(show) {
    const loginButton = document.querySelector(".btn-login");
    if (loginButton) {
      if (show) {
        loginButton.disabled = true;
        loginButton.innerHTML =
          '<div class="loading-spinner"></div> Iniciando sesión...';
      } else {
        loginButton.disabled = false;
        loginButton.innerHTML = "Iniciar Sesión";
      }
    }
  }

  checkExistingSession() {
    const token =
      localStorage.getItem("sivet_jwt") ||
      sessionStorage.getItem("sivet_jwt");
    if (token) {
      console.log("🔄 Usuario ya está logueado, redirigiendo...");
      window.location.href = "index.html";
    }
  }
}

// Inicializar cuando la página cargue
document.addEventListener("DOMContentLoaded", () => {
  new SivetLogin();
  console.log("🚀 Sistema de login inicializado");
});
