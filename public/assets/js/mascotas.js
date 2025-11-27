let modal;
let currentClients = [];

// Funciones globales para el modal
function openModal() {
  const modal = document.getElementById("clientModal");
  if (modal) {
    modal.style.display = "flex";
  }
}

function closeModal() {
  const modal = document.getElementById("clientModal");
  if (modal) {
    modal.style.display = "none";
  }
  resetModalToCreateMode();
}

function resetModalToCreateMode() {
  const form = document.getElementById("formMascota");
  if (form) {
    form.reset();
    form.removeAttribute("data-edit-mode");
    form.removeAttribute("data-mascota-id");

    const modalTitle = document.getElementById("modalTitle");
    if (modalTitle) {
      modalTitle.textContent = "Agregar Nueva Mascota";
    }
  }
}

// Función para cargar clientes en el dropdown
async function loadClientsForDropdown() {
  try {
    const response = await apiGet("clientes?populate=persona");
    currentClients = response.data;

    const duenoSelect = document.getElementById("dueno");
    if (duenoSelect) {
      // Limpiar opciones excepto la primera
      while (duenoSelect.options.length > 1) {
        duenoSelect.remove(1);
      }

      // Agregar clientes
      currentClients.forEach((client) => {
        const persona = client.persona || {};
        const option = document.createElement("option");
        option.value = client.documentId;
        option.textContent =
          capitalizarNombre(
            `${persona.nombre || ""} ${persona.apellidos || ""}`.trim()
          ) || `Cliente #${client.id}`;
        duenoSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error("Error cargando clientes:", error);
  }
}

// Función para normalizar texto a minúsculas
function normalizarTexto(texto) {
  if (!texto || typeof texto !== "string") return texto;
  return texto.toLowerCase().trim();
}

// Función GET mascotas
async function loadMascotas() {
  try {
    const response = await apiGet("mascotas?populate=cliente.persona");

    const tbody = document.querySelector(".clients-table tbody");
    tbody.innerHTML = "";

    response.data.forEach((mascota) => {
      const cliente = mascota.cliente || {};
      const persona = cliente.persona || {};
      const nombreCliente =
        `${persona.nombre || ""} ${persona.apellidos || ""}`.trim() || "—";

      // Determinar emoji para la especie
      let especieEmoji = "🐾";
      switch (mascota.especie?.toLowerCase()) {
        case "perro":
          especieEmoji = "🐕";
          break;
        case "gato":
          especieEmoji = "🐈";
          break;
        case "conejo":
          especieEmoji = "🐰";
          break;
        case "ave":
          especieEmoji = "🦜";
          break;
        case "reptil":
          especieEmoji = "🦎";
          break;
        default:
          especieEmoji = "🐾";
      }

      const row = `
        <tr>
          <td>
            <div class="client-info">
              <div class="pet-avatar">${especieEmoji}</div>
              <div>
                <div class="client-name">${capitalizarNombre(mascota.nombre) || "—"}</div>
                <div class="client-id">ID: #${mascota.id}</div>
              </div>
            </div>
          </td>
          <td>
            <div class="pet-species">${capitalizarTexto(mascota.especie) || "—"}</div>
            <div class="pet-breed">${capitalizarNombre(mascota.raza) || "Sin raza especificada"}</div>
          </td>
          <td>${capitalizarNombre(nombreCliente)}</td>
          <td>${calcularEdad(mascota.fecha_nacimiento)}</td>
          <td>${mascota.peso_actual ? `${mascota.peso_actual} kg` : "—"}</td>
          <td>${formatearFecha(mascota.updatedAt)}</td>
          <td>
            <div class="action-buttons">
              <button class="btn-icon btn-view">👁️</button>
              <button class="btn-icon btn-edit" data-mascota-id="${mascota.documentId}">✏️</button>
              <button class="btn-icon btn-delete" data-mascota-id="${mascota.documentId}" data-mascota-nombre="${mascota.nombre}">🗑️</button>
            </div>
          </td>
        </tr>
      `;

      tbody.insertAdjacentHTML("beforeend", row);
    });

    // Agregar event listeners después de cargar los datos
    addEditEventListeners();
    addDeleteEventListeners();
  } catch (error) {
    console.error("Error cargando mascotas:", error);
  }
}

// Función para agregar event listeners a los botones de editar
function addEditEventListeners() {
  const editButtons = document.querySelectorAll(".btn-edit");

  editButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const mascotaId = e.target.getAttribute("data-mascota-id");
      openEditModal(mascotaId);
    });
  });
}

// Función para agregar event listeners a los botones de eliminar
function addDeleteEventListeners() {
  const deleteButtons = document.querySelectorAll(".btn-delete");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const mascotaId = e.target.getAttribute("data-mascota-id");
      const mascotaNombre = e.target.getAttribute("data-mascota-nombre");
      deleteMascota(mascotaId, mascotaNombre, e);
    });
  });
}

// Función para abrir el modal en modo edición
async function openEditModal(mascotaDocumentId) {
  try {
    const mascotaResponse = await apiGet(
      `mascotas/${mascotaDocumentId}?populate=cliente`
    );
    const mascota = mascotaResponse.data;

    // Llenar el formulario con los datos existentes
    document.getElementById("nombre").value = mascota.nombre || "";
    document.getElementById("especie").value = mascota.especie || "";
    document.getElementById("raza").value = mascota.raza || "";
    document.getElementById("sexo").value = mascota.sexo || "";
    document.getElementById("fecha_nacimiento").value =
      mascota.fecha_nacimiento || "";
    document.getElementById("peso").value = mascota.peso_actual || "";
    document.getElementById("rasgo_distintivo").value =
      mascota.rasgo_distintivo || "";
    document.getElementById("esterilizado").value = mascota.esterilizado
      ? "true"
      : "false";

    // Seleccionar el dueño si existe
    if (mascota.cliente) {
      document.getElementById("dueno").value = mascota.cliente.documentId;
    }

    // Cambiar título del modal
    const modalTitle = document.getElementById("modalTitle");
    if (modalTitle) {
      modalTitle.textContent = "Editar Mascota";
    }

    // Guardar el ID en el formulario
    const form = document.getElementById("formMascota");
    form.setAttribute("data-edit-mode", "true");
    form.setAttribute("data-mascota-id", mascotaDocumentId);

    openModal();
  } catch (error) {
    console.error("Error al cargar datos para editar:", error);
    notifyError("Error al cargar los datos de la mascota");
  }
}

// Función para eliminar mascota
async function deleteMascota(mascotaDocumentId, mascotaNombre, event) {
  const confirmDelete = confirm(
    `¿Estás seguro de que quieres eliminar a la mascota ${capitalizarNombre(mascotaNombre)}? Esta acción no se puede deshacer.`
  );

  if (!confirmDelete) return;

  try {
    // Mostrar indicador de carga
    event.target.disabled = true;
    event.target.textContent = "⏳";

    await apiDelete(`mascotas/${mascotaDocumentId}`);

    notifySuccess("Mascota eliminada correctamente");
    loadMascotas(); // Recargar la lista
  } catch (error) {
    console.error("Error al eliminar mascota:", error);

    // Restaurar botón
    event.target.disabled = false;
    event.target.textContent = "🗑️";

    notifyError("Error al eliminar la mascota: " + error.message);
  }
}

// DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  // Inicializar modal
  modal = document.getElementById("clientModal");

  // Cargar datos iniciales
  loadMascotas();
  loadClientsForDropdown();

  const form = document.getElementById("formMascota");
  const btnAbrirModal = document.querySelector(".btn-primary");
  const btnCerrarModal = document.getElementById("btnCerrarModal");
  const btnCancelar = document.getElementById("btnCancelar");

  // Event listeners del modal
  if (btnAbrirModal) {
    btnAbrirModal.addEventListener("click", () => {
      resetModalToCreateMode();
      openModal();
    });
  }

  // AGREGAR ESTOS NUEVOS EVENT LISTENERS:
  const btnAbrirModalPrincipal = document.getElementById(
    "btnAbrirModalPrincipal"
  );
  if (btnAbrirModalPrincipal) {
    btnAbrirModalPrincipal.addEventListener("click", () => {
      resetModalToCreateMode();
      openModal();
    });
  }

  if (btnCerrarModal) {
    btnCerrarModal.addEventListener("click", closeModal);
  }

  if (btnCancelar) {
    btnCancelar.addEventListener("click", closeModal);
  }

  // Cerrar modal al hacer clic fuera
  window.addEventListener("click", (event) => {
    const modal = document.getElementById("clientModal");
    if (event.target === modal) {
      closeModal();
    }
  });

  // Función para manejar el submit (tanto crear como editar)
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Obtener valores del formulario
    const nombre = document.getElementById("nombre").value;
    const duenoId = document.getElementById("dueno").value;
    const especie = document.getElementById("especie").value;
    const raza = document.getElementById("raza").value;
    const sexo = document.getElementById("sexo").value;
    const fecha_nacimiento = document.getElementById("fecha_nacimiento").value;
    const peso = document.getElementById("peso").value;
    const rasgo_distintivo = document.getElementById("rasgo_distintivo").value;
    const esterilizado =
      document.getElementById("esterilizado").value === "true";

    // Validaciones básicas
    if (!validarTexto(nombre)) return notifyError("Nombre de mascota inválido");
    if (!duenoId) return notifyError("Debe seleccionar un dueño");
    if (!especie) return notifyError("Debe seleccionar una especie");
    if (!sexo) return notifyError("Debe seleccionar un sexo");
    if (!fecha_nacimiento) return notifyError("Fecha de nacimiento inválida");
    if (!peso || peso <= 0) return notifyError("Peso inválido");

    const isEditMode = form.getAttribute("data-edit-mode") === "true";

    try {
      // Normalizar datos a minúsculas
      const mascotaData = {
        data: {
          nombre: normalizarTexto(nombre),
          especie: normalizarTexto(especie),
          raza: normalizarTexto(raza),
          sexo: normalizarTexto(sexo),
          fecha_nacimiento: fecha_nacimiento,
          peso_actual: parseFloat(peso),
          rasgo_distintivo: normalizarTexto(rasgo_distintivo),
          esterilizado: esterilizado,
          publishedAt: new Date().toISOString(),
        },
      };

      // Agregar relación con cliente solo si no está en modo edición
      if (!isEditMode) {
        mascotaData.data.cliente = duenoId;
      }

      if (isEditMode) {
        // MODO EDICIÓN
        const mascotaId = form.getAttribute("data-mascota-id");
        await apiPut(`mascotas/${mascotaId}`, mascotaData);
        notifySuccess("Mascota actualizada correctamente");
      } else {
        // MODO CREACIÓN
        await apiPost("mascotas", mascotaData);
        notifySuccess("Mascota guardada correctamente");
      }

      closeModal();
      loadMascotas(); // Recargar la lista
    } catch (err) {
      console.error("Error guardando mascota:", err);
      notifyError(`Error ${isEditMode ? "actualizando" : "guardando"} mascota`);
    }
  });
});
