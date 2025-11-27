/* document.addEventListener('DOMContentLoaded', () => {
  const notyf = new Notyf();

  // Mostrar una notificación al entrar a la página
  notyf.success("Notyf está funcionando perfectamente 🚀");
}); 

*/


// assets/js/utils/notyf.js

// 1) Crear una instancia GLOBAL de Notyf con buena configuración
window.notyf = new Notyf({
  duration: 3000,       // 3 segundos
  ripple: true,         // efecto de onda
  position: {
    x: 'right',         // derecha
    y: 'top',           // arriba
  },
  dismissible: true,    // que se pueda cerrar
});

// 2) Helpers globales para que sea más fácil usarlas en cualquier archivo
window.notifySuccess = (message) => {
  if (window.notyf) {
    window.notyf.success(message);
  } else {
    alert(message);
  }
};

window.notifyError = (message) => {
  if (window.notyf) {
    window.notyf.error(message);
  } else {
    alert(message);
  }
};

// 3) Si quieres probar que funciona, puedes descomentar esto:
// document.addEventListener('DOMContentLoaded', () => {
//   notifySuccess('Notyf está funcionando perfectamente 🚀');
// });
