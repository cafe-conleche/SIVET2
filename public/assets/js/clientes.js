// Movemos las funciones del modal fuera del DOMContentLoaded
let modal;

// Modal functions
function openModal() {
  if (modal) {
    modal.classList.add("open");
  }
}

function closeModal() {
  if (modal) {
    modal.classList.remove("open");
  }
}

function resetModalToCreateMode() {
  const form = document.getElementById("formCliente");
  if (form) {
    form.removeAttribute("data-edit-mode");
    form.removeAttribute("data-client-id");
    form.removeAttribute("data-persona-id");
  }

  const modalTitle = document.querySelector(
    '.modal-title, h2, [class*="title"]'
  );
  if (modalTitle) {
    modalTitle.textContent = "Agregar Nuevo Cliente";
  }
}

// Función para abrir el modal en modo edición
async function openEditModal(clientDocumentId, personaDocumentId) {
  try {
    // Usar directamente los documentId
    const clientResponse = await apiGet(
      `clientes/${clientDocumentId}?populate=persona`
    );
    const client = clientResponse.data;
    const personaData = client.persona;

    // Llenar el formulario con los datos existentes
    document.getElementById("cedula").value = personaData.cedula || "";
    document.getElementById("nombre").value = personaData.nombre || "";
    document.getElementById("apellidos").value = personaData.apellidos || "";
    document.getElementById("telefono").value = personaData.telefono || "";
    document.getElementById("email").value = personaData.email || "";
    document.getElementById("fecha_nacimiento").value =
      personaData.fecha_nacimiento || "";

    // Manejo seguro del título del modal
    const modalTitle = document.querySelector(
      '.modal-title, h2, [class*="title"]'
    );
    if (modalTitle) {
      modalTitle.textContent = "Editar Cliente";
    }

    // Guardar los documentId en el formulario
    const form = document.getElementById("formCliente");
    form.setAttribute("data-edit-mode", "true");
    form.setAttribute("data-client-id", clientDocumentId);
    form.setAttribute("data-persona-id", personaDocumentId);

    openModal();
  } catch (error) {
    console.error("Error al cargar datos para editar:", error);
    alert("Error al cargar los datos del cliente");
  }
}

// Función para agregar event listeners a los botones de editar
function addEditEventListeners() {
  const editButtons = document.querySelectorAll(".btn-edit");

  editButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const clientDocumentId = e.target.getAttribute("data-client-id");
      const personaDocumentId = e.target.getAttribute("data-persona-id");
      openEditModal(clientDocumentId, personaDocumentId);
    });
  });
}

// Función para agregar event listeners a los botones de eliminar
function addDeleteEventListeners() {
  const deleteButtons = document.querySelectorAll(".btn-delete");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const clientDocumentId = e.target.getAttribute("data-client-id");
      const personaDocumentId = e.target.getAttribute("data-persona-id");
      const clientName = e.target.getAttribute("data-client-name");

      deleteClient(clientDocumentId, personaDocumentId, clientName);
    });
  });
}

// Función GET clientes
async function loadClients() {
  const response = await apiGet("clientes?populate=persona");

  const tbody = document.querySelector(".clients-table tbody");
  tbody.innerHTML = "";

  response.data.forEach((item) => {
    const persona = item.persona || {};

    const row = `
      <tr>
        <td>
          <div class="client-info">
            <div class="client-avatar">
              ${capitalizarNombre(persona.nombre?.charAt(0)) || "?"}${capitalizarNombre(persona.apellidos?.charAt(0)) || ""}
            </div>
            <div>
              <div class="client-name">${capitalizarNombre(persona.nombre) || "—"} ${capitalizarNombre(persona.apellidos) || ""}</div>
            </div>
          </div>
        </td>
        <td>${persona.telefono || "-"}</td>
        <td>${persona.email || "-"}</td>
        <td>—</td>
        <td>—</td>
        <td><span class="status-badge ${persona.activo ? "active" : "inactive"}">${persona.activo ? "Activo" : "Inactivo"}</span></td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon btn-view">👁️</button>
            <button class="btn-icon btn-edit" data-client-id="${item.documentId}" data-persona-id="${persona.documentId}">✏️</button>
            <button class="btn-icon btn-delete" data-client-id="${item.documentId}" data-persona-id="${persona.documentId}" data-client-name="${persona.nombre}">🗑️</button>
          </div>
        </td>
      </tr>
    `;

    tbody.insertAdjacentHTML("beforeend", row);
  });

  addEditEventListeners();
  addDeleteEventListeners();
}

// Función para eliminar cliente
async function deleteClient(clientDocumentId, personaDocumentId, clientName) {
  const confirmDelete = confirm(
    `¿Estás seguro de que quieres eliminar al cliente ${clientName}? Esta acción no se puede deshacer.`
  );

  if (!confirmDelete) return;

  try {
    // Primero eliminamos el cliente
    await apiDelete(`clientes/${clientDocumentId}`);

    // Luego eliminamos la persona asociada
    await apiDelete(`personas/${personaDocumentId}`);

    alert("Cliente eliminado correctamente");
    loadClients(); // Recargar la lista
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    alert("Error al eliminar el cliente");
  }
}

// DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  // Inicializar modal
  modal = document.getElementById("clientModal");

  loadClients();

  const form = document.getElementById("formCliente");
  const btnAbrirModal = document.getElementById("btnAbrirModal");
  const btnCerrarModal = document.getElementById("btnCerrarModal");
  const btnCerrarModalIcon = document.getElementById("btnCerrarModalIcon");

  // Event listeners del modal
  btnAbrirModal.addEventListener("click", () => {
    resetModalToCreateMode();
    openModal();
  });

  btnCerrarModal.addEventListener("click", () => {
    closeModal();
    resetModalToCreateMode();
  });

  btnCerrarModalIcon.addEventListener("click", () => {
    closeModal();
    resetModalToCreateMode();
  });

  // Función para manejar el submit (tanto crear como editar)
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const cedula = document.getElementById("cedula").value;
    const nombre = document.getElementById("nombre").value;
    const apellidos = document.getElementById("apellidos").value;
    const telefono = document.getElementById("telefono").value;
    const email = document.getElementById("email").value;
    const fecha_nacimiento = document.getElementById("fecha_nacimiento").value;

    // Validaciones
    if (!validarTexto(nombre)) return alert("Nombre inválido");
    if (!validarTexto(apellidos)) return alert("Apellidos inválidos");
    if (!validarTelefono(telefono)) return alert("Teléfono inválido");
    if (!validarEmail(email)) return alert("Correo inválido");

    const isEditMode = form.getAttribute("data-edit-mode") === "true";

    try {
      if (isEditMode) {
        // MODO EDICIÓN
        const personaDocumentId = form.getAttribute("data-persona-id");
        const clientDocumentId = form.getAttribute("data-client-id");

        // Actualizar persona usando documentId
        await apiPut(`personas/${personaDocumentId}`, {
          data: {
            nombre: normalizarTexto(nombre),
            apellidos: normalizarTexto(apellidos),
            telefono: normalizarTexto(telefono),
            email: normalizarTexto(email),
            cedula: normalizarTexto(cedula),
            fecha_nacimiento,
          },
        });

        alert("Cliente actualizado correctamente");
      } else {
        // MODO CREACIÓN
        const personaResp = await apiPost("personas", {
          data: {
            nombre: normalizarTexto(nombre),
            apellidos: normalizarTexto(apellidos),
            telefono: normalizarTexto(telefono),
            email: normalizarTexto(email),
            cedula: normalizarTexto(cedula),
            fecha_nacimiento,
            activo: true,
          },
        });

        await apiPost("clientes", {
          data: {
            persona: {
              connect: [personaResp.data.documentId],
            },
            publishedAt: new Date().toISOString(),
          },
        });

        alert("Cliente guardado correctamente");
      }

      form.reset();
      closeModal();
      resetModalToCreateMode();
      loadClients();
    } catch (err) {
      console.error("Error real:", err);
      alert(`Error ${isEditMode ? "actualizando" : "guardando"} cliente`);
    }
  });
});
