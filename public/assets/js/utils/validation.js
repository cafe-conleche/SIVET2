// Función para capitalizar texto (primera letra mayúscula, resto minúsculas)
function capitalizarTexto(texto) {
  if (!texto || typeof texto !== 'string') return "—";
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

// Función para capitalizar nombres propios (cada palabra)
function capitalizarNombre(texto) {
  if (!texto || typeof texto !== 'string') return "—";
  return texto
    .toLowerCase()
    .split(' ')
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(' ');
}

// Función para calcular edad desde fecha de nacimiento
function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return "—";
  
  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();
  
  let años = hoy.getFullYear() - nacimiento.getFullYear();
  let meses = hoy.getMonth() - nacimiento.getMonth();
  
  if (meses < 0) {
    años--;
    meses += 12;
  }
  
  if (años === 0) {
    return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
  } else if (años === 1 && meses === 0) {
    return "1 año";
  } else {
    return `${años} ${años === 1 ? 'año' : 'años'}`;
  }
}

// Función para formatear fecha
function formatearFecha(fecha) {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

//Funcion para normalizar texto
function normalizarTexto(texto) {
  if (!texto || typeof texto !== "string") return texto;
  return texto.toLowerCase().trim();
}

function validarTexto(valor) {
  return /^[A-Za-zÁ-ÿ\s]+$/.test(valor.trim());
}

function validarTelefono(valor) {
  return /^[0-9]{8}$/.test(valor.trim());
}

function validarEmail(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim());
}

// function validarCedula(valor) {
//   return /^[0-9]{11}[A-Za-z]$/.test(valor.trim());
// }
