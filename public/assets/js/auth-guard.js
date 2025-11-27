// Cambia a false solo si quieres ver las páginas sin exigir login (modo diseño)
const AUTH_ENABLED = true;

// Lee usuario y token desde storage
function getCurrentAuth() {
  const rawUser =
    localStorage.getItem("sivet_user") || sessionStorage.getItem("sivet_user");
  const token =
    localStorage.getItem("sivet_jwt") || sessionStorage.getItem("sivet_jwt");

  if (!rawUser || !token) return { user: null, token: null };

  try {
    const user = JSON.parse(rawUser);
    return { user, token };
  } catch (e) {
    console.error("❌ Error parseando sivet_user:", e);
    return { user: null, token: null };
  }
}

// Normaliza nombres/tipos de rol (mayúsculas/minúsculas/espacios)
function normalizeRole(value) {
  return value ? value.toString().trim().toLowerCase() : null;
}

/**
 * Protege la página según login y rol
 * @param {string[]} allowedRoles - ej. ['Administrador', 'Recepcionista']
 *        Se comparan ignorando mayúsculas/minúsculas.
 */
function protectPage(allowedRoles = []) {
  if (!AUTH_ENABLED) {
    console.warn("⚠️ AUTH_ENABLED = false, la página NO está protegida");
    return;
  }

  const { user, token } = getCurrentAuth();

  // 1) Si no hay sesión, fuera ✋
  if (!user || !token) {
    console.warn("🔒 Sin sesión, redirigiendo a login...");
    window.location.replace("login.html");
    return;
  }

  console.log("🧾 Usuario completo en guard:", user);

  // 2) Si no se especifican roles, solo exige estar logueado
  if (!allowedRoles.length) {
    console.log("✅ Usuario autenticado, acceso permitido (sin filtro de rol)");
    return;
  }

  // 3) Intentar obtener el rol desde distintas estructuras
  const roleObject =
    user.role ||
    (Array.isArray(user.roles) && user.roles.length > 0 ? user.roles[0] : null);

  const userRoleName = normalizeRole(roleObject?.name);
  const userRoleType = normalizeRole(roleObject?.type);

  const normalizedAllowed = allowedRoles.map(normalizeRole);

  console.log("👤 Rol del usuario (name):", roleObject?.name);
  console.log("👤 Rol del usuario (type):", roleObject?.type);
  console.log("🎯 Roles permitidos en esta página:", normalizedAllowed);

  const hasAccess =
    normalizedAllowed.includes(userRoleName) ||
    normalizedAllowed.includes(userRoleType);

  if (!hasAccess) {
    alert("No tienes permisos para acceder a esta sección.");
    window.location.replace("index.html");
  } else {
    console.log("✅ Acceso concedido a esta página");
  }
}
