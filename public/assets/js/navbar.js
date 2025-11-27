document.addEventListener("DOMContentLoaded", () => {
  // 1) Leer usuario actual desde storage
  const rawUser =
    localStorage.getItem("sivet_user") || sessionStorage.getItem("sivet_user");

  if (!rawUser) {
    console.warn("ℹ️ No hay usuario en storage, menú sin filtro de rol");
    return;
  }

  let user;
  try {
    user = JSON.parse(rawUser);
  } catch (err) {
    console.error("❌ Error parseando sivet_user en navbar:", err);
    return;
  }

  const roleName = (user.role?.name || user.rol || "")
    .toString()
    .trim()
    .toLowerCase();

  if (!roleName) {
    console.warn("⚠️ Usuario sin rol definido en navbar");
    return;
  }

  console.log("👤 Rol del usuario (navbar):", roleName);

  // 2) Ocultar/mostrar opciones de menú según data-roles
  const items = document.querySelectorAll(".navbar-menu li[data-roles]");

  items.forEach((li) => {
    const allowedRoles = li.dataset.roles
      .split(",")
      .map((r) => r.trim().toLowerCase());

    if (!allowedRoles.includes(roleName)) {
      li.style.display = "none"; // ocultamos este item del menú
    }
  });

  // 3) Marcar el enlace activo según la URL
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const links = document.querySelectorAll(".navbar-menu a");

  links.forEach((a) => {
    const href = a.getAttribute("href");
    if (href === currentPath) {
      a.classList.add("active");
    }
  });
});
