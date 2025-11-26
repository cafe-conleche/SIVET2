document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 dashboard.js cargado");

  const toggle = document.getElementById("userMenuToggle");
  const dropdown = document.getElementById("userDropdown");
  const logoutBtn = document.getElementById("logoutBtn");

  // 1) Abrir/cerrar menú
  if (toggle && dropdown) {
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("open");
      console.log("🔽 Menú usuario:", dropdown.classList.contains("open"));
    });

    document.addEventListener("click", () => {
      dropdown.classList.remove("open");
    });
  }

  // 2) Cerrar sesión
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      console.log("👋 Cerrando sesión...");
      localStorage.removeItem("sivet_jwt");
      localStorage.removeItem("sivet_user");
      sessionStorage.removeItem("sivet_jwt");
      sessionStorage.removeItem("sivet_user");

      window.location.href = "login.html";
    });
  }

  // 3) (Opcional) mostrar nombre desde storage
  const rawUser =
    localStorage.getItem("sivet_user") || sessionStorage.getItem("sivet_user");

  if (rawUser) {
    try {
      const user = JSON.parse(rawUser);
      const nameEl = document.getElementById("userName");
      const roleEl = document.getElementById("userRole");
      const avatarEl = document.getElementById("userAvatar");

      const displayName =
        user.username || user.nombre || user.email || "Usuario";
      const roleName = user.role?.name || user.rol || "Usuario";

      if (nameEl) nameEl.textContent = displayName;
      if (roleEl) roleEl.textContent = roleName;

      if (avatarEl && displayName) {
        const initials = displayName
          .split(" ")
          .map((p) => p[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        avatarEl.textContent = initials;
      }
    } catch (err) {
      console.error("❌ Error leyendo sivet_user:", err);
    }
  }
});