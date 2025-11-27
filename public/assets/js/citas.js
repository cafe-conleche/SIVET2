// citas.js - Funcionalidades específicas de citas
let modal;
let currentClients = [];

// ========== FUNCIONES GLOBALES PARA EL MODAL ==========
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
  const form = document.querySelector("#clientModal form");
  if (form) {
    form.reset();
    form.removeAttribute("data-edit-mode");
    form.removeAttribute("data-cita-id");

    const modalTitle = document.querySelector("#clientModal .modal-header h2");
    if (modalTitle) {
      modalTitle.textContent = "Agendar Nueva Cita";
    }
  }
}

// ========== FUNCIONES DE CARGA DE DATOS ==========
async function loadClientsForDropdown() {
  try {
    const response = await apiGet("clientes?populate=persona");
    currentClients = response.data;

    const clienteSelect = document.getElementById("cliente");
    if (clienteSelect) {
      while (clienteSelect.options.length > 1) {
        clienteSelect.remove(1);
      }

      currentClients.forEach((client) => {
        const persona = client.persona || {};
        const option = document.createElement("option");
        option.value = client.documentId;
        option.textContent =
          capitalizarNombre(
            `${persona.nombre || ""} ${persona.apellidos || ""}`.trim()
          ) || `Cliente #${client.id}`;
        clienteSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error("Error cargando clientes:", error);
  }
}

async function loadMascotasForCliente(clienteDocumentId) {
  try {
    const mascotaSelect = document.getElementById("mascota");
    if (!mascotaSelect) return;

    while (mascotaSelect.options.length > 1) {
      mascotaSelect.remove(1);
    }

    if (!clienteDocumentId) {
      // Agregar opción por defecto
      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = "Seleccionar mascota...";
      mascotaSelect.appendChild(defaultOption);
      return;
    }

    const response = await apiGet(
      `mascotas?filters[cliente][documentId][$eq]=${clienteDocumentId}`
    );

    // Agregar opción por defecto
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Seleccionar mascota...";
    mascotaSelect.appendChild(defaultOption);

    response.data.forEach((mascota) => {
      const option = document.createElement("option");
      option.value = mascota.documentId;
      option.textContent = `${capitalizarNombre(mascota.nombre)} - ${capitalizarTexto(mascota.especie)}`;
      mascotaSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error cargando mascotas:", error);
  }
}

// ========== FUNCIONES DE VALIDACIÓN ==========
function validarFechaHora(fecha, hora) {
  const ahora = new Date();

  // Crear fecha de la cita en zona horaria local
  const [year, month, day] = fecha.split("-");
  const [hours, minutes] = hora.split(":");
  const fechaCita = new Date(year, month - 1, day, hours, minutes);

  // Validar que la fecha sea válida
  if (isNaN(fechaCita.getTime())) {
    return "La fecha y hora seleccionadas no son válidas";
  }

  // No permitir fechas pasadas (con margen de 5 minutos)
  const ahoraMas5Min = new Date(ahora.getTime() + 5 * 60000);
  if (fechaCita < ahoraMas5Min) {
    return "No se pueden agendar citas en fechas/horas pasadas";
  }

  // Validar horario laboral (8am - 5pm)
  const horaCita = fechaCita.getHours();
  const minutosCita = fechaCita.getMinutes();

  if (horaCita < 8 || (horaCita === 17 && minutosCita > 0) || horaCita >= 17) {
    return "El horario laboral es de 8:00 AM a 5:00 PM";
  }

  // Validar que no sea domingo
  if (fechaCita.getDay() === 0) {
    return "No se agendan citas los domingos";
  }

  return null;
}

// ========== FUNCIONES DE MANEJO DE FECHAS ==========
function formatearFechaHoraParaStrapi(fecha, hora) {
  if (!fecha || !hora) return null;

  // Crear fecha en zona horaria local sin conversión a UTC
  const [year, month, day] = fecha.split("-");
  const [hours, minutes] = hora.split(":");

  // Crear fecha local - Strapi v5 maneja la zona horaria automáticamente
  // Usar formato: YYYY-MM-DD HH:MM:SS (sin Z, para que sea hora local)
  return `${year}-${month}-${day} ${hours}:${minutes}:00`;
}

function formatearFechaHoraParaInput(fechaISO) {
  if (!fechaISO) return { fecha: "", hora: "" };

  const fecha = new Date(fechaISO);

  // Ajustar por diferencia de zona horaria
  const offset = fecha.getTimezoneOffset();
  const fechaAjustada = new Date(fecha.getTime() - offset * 60 * 1000);

  return {
    fecha: fechaAjustada.toISOString().split("T")[0],
    hora: fechaAjustada.toISOString().split("T")[1].substring(0, 5),
  };
}

function validarFormulario() {
  const cliente = document.getElementById("cliente").value;
  const mascota = document.getElementById("mascota").value;
  const fecha = document.getElementById("fecha").value;
  const hora = document.getElementById("hora").value;
  const tipo = document.getElementById("tipo").value;
  const duracion = document.getElementById("duracion").value;

  if (!cliente) return "Debe seleccionar un cliente";
  if (!mascota) return "Debe seleccionar una mascota";
  if (!fecha) return "Debe seleccionar una fecha";
  if (!hora) return "Debe seleccionar una hora";
  if (!tipo) return "Debe seleccionar un tipo de cita";
  if (!duracion) return "Debe seleccionar una duración";

  const errorFecha = validarFechaHora(fecha, hora);
  if (errorFecha) return errorFecha;

  return null;
}

// ========== FUNCIONES DE FORMATEO ==========
function formatearFechaHora(fechaISO) {
  if (!fechaISO) return "—";

  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatearHora(fechaISO) {
  if (!fechaISO) return "—";

  const fecha = new Date(fechaISO);
  return fecha.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getEstadoClass(estado) {
  switch (estado) {
    case "programada":
      return "confirmed";
    case "en-curso":
      return "in-progress";
    case "atendida":
      return "completed";
    case "cancelada":
      return "cancelled";
    case "no-asistio":
      return "cancelled";
    default:
      return "pending";
  }
}

function getEstadoText(estado) {
  switch (estado) {
    case "programada":
      return "Programada";
    case "en-curso":
      return "En Curso";
    case "atendida":
      return "Atendida";
    case "cancelada":
      return "Cancelada";
    case "no-asistio":
      return "No Asistió";
    default:
      return "Programada";
  }
}

function extraerTextoNotas(notas) {
  if (!notas || !Array.isArray(notas)) return "Sin notas adicionales";

  let texto = "";
  notas.forEach((nota) => {
    if (nota.children && Array.isArray(nota.children)) {
      nota.children.forEach((child) => {
        if (child.text) {
          texto += child.text + " ";
        }
      });
    }
  });
  return texto.trim() || "Sin notas adicionales";
}

// ========== FUNCIÓN GET PRINCIPAL ==========
async function loadCitas() {
  try {
    const response = await apiGet(
      "citas?populate[cliente][populate][persona]=true&populate[mascota]=true"
    );

    const appointmentsGrid = document.querySelector(".appointments-grid");
    if (!appointmentsGrid) {
      console.error("No se encontró el contenedor de citas");
      return;
    }

    appointmentsGrid.innerHTML = "";

    if (!response.data || response.data.length === 0) {
      appointmentsGrid.innerHTML = `
                <div class="appointment-empty-new" style="grid-column: 1 / -1;">
                    <div class="empty-icon">📭</div>
                    <p>No hay citas programadas</p>
                    <button class="btn-add-quick" id="btnAgregarCitaVacio">
                        + Agregar Cita
                    </button>
                </div>
            `;

      document
        .getElementById("btnAgregarCitaVacio")
        ?.addEventListener("click", () => {
          resetModalToCreateMode();
          openModal();
        });
      return;
    }

    const citasOrdenadas = response.data.sort(
      (a, b) => new Date(a.fecha_programada) - new Date(b.fecha_programada)
    );

    citasOrdenadas.forEach((cita) => {
      const estadoClass = getEstadoClass(cita.estado);
      const estadoText = getEstadoText(cita.estado);
      const notasTexto = extraerTextoNotas(cita.notas);

      const mascota = cita.mascota || {};
      const cliente = cita.cliente || {};
      const persona = cliente.persona || {};

      const card = `
                <div class="appointment-card-new ${estadoClass}">
                    <div class="card-top">
                        <div class="time-info">
                            <span class="time">${formatearHora(cita.fecha_programada)}</span>
                            <span class="duration">${cita.duracion_minutos || 30} min</span>
                        </div>
                        <span class="status-badge ${estadoClass}">${estadoText}</span>
                    </div>

                    <div class="card-main">
                        <div class="pet-info">
                            <div class="pet-avatar">🐕</div>
                            <div class="pet-details">
                                <h3>${capitalizarNombre(mascota.nombre) || "Mascota no asignada"}</h3>
                                <p class="breed">${capitalizarTexto(mascota.especie) || "—"} ${capitalizarNombre(mascota.raza) || ""}</p>
                            </div>
                        </div>

                        <div class="appointment-type">
                            <span class="type-text">${cita.motivo || "Consulta General"}</span>
                        </div>
                    </div>

                    <div class="card-info">
                        <div class="info-row">
                            <span class="info-label">👤 Cliente:</span>
                            <span class="info-value">${capitalizarNombre(persona.nombre) || "—"} ${capitalizarNombre(persona.apellidos) || ""}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">📞 Teléfono:</span>
                            <span class="info-value">${persona.telefono || "—"}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">📅 Fecha:</span>
                            <span class="info-value">${formatearFechaHora(cita.fecha_programada)}</span>
                        </div>
                    </div>

                    <div class="card-notes">📝 ${notasTexto}</div>

                    <div class="card-actions">
                        ${
                          cita.estado === "programada"
                            ? `<button class="card-btn btn-primary-action" data-cita-id="${cita.documentId}">▶️ Iniciar</button>`
                            : cita.estado === "en-curso"
                              ? `<button class="card-btn btn-success-action" data-cita-id="${cita.documentId}">✅ Completar</button>`
                              : ""
                        }
                        <button class="card-btn btn-secondary-action" data-cita-id="${cita.documentId}">✏️</button>
                        <button class="card-btn btn-danger-action" data-cita-id="${cita.documentId}">❌</button>
                    </div>
                </div>
            `;

      appointmentsGrid.insertAdjacentHTML("beforeend", card);
    });

    addCitasEventListeners();
  } catch (error) {
    console.error("Error cargando citas:", error);
    mostrarError();
  }
}

// ========== FUNCIONES DE EVENTOS ==========
function addCitasEventListeners() {
  // Botones de editar
  document.querySelectorAll(".btn-secondary-action").forEach((button) => {
    button.addEventListener("click", (e) => {
      const citaId = e.target.getAttribute("data-cita-id");
      openEditModal(citaId);
    });
  });

  // Botones de eliminar
  document.querySelectorAll(".btn-danger-action").forEach((button) => {
    button.addEventListener("click", (e) => {
      const citaId = e.target.getAttribute("data-cita-id");
      deleteCita(citaId, e);
    });
  });

  // Botones de estado
  document
    .querySelectorAll(".btn-success-action, .btn-primary-action")
    .forEach((button) => {
      button.addEventListener("click", (e) => {
        const citaId = e.target.getAttribute("data-cita-id");
        const action = e.target.textContent.includes("Iniciar")
          ? "iniciar"
          : "completar";
        cambiarEstadoCita(citaId, action, e);
      });
    });
}

// ========== FUNCIONES CRUD ==========
async function openEditModal(citaDocumentId) {
  try {
    const citaResponse = await apiGet(
      `citas/${citaDocumentId}?populate[cliente][populate][persona]=true&populate[mascota]=true`
    );
    const cita = citaResponse.data;

    // CORREGIDO: Usar la nueva función para formatear fecha y hora
    const { fecha, hora } = formatearFechaHoraParaInput(cita.fecha_programada);

    document.getElementById("fecha").value = fecha || "";
    document.getElementById("hora").value = hora || "";
    document.getElementById("tipo").value = cita.motivo || "";
    document.getElementById("duracion").value = cita.duracion_minutos || 30;
    document.getElementById("motivo").value = cita.motivo || "";
    document.getElementById("notas").value = extraerTextoNotas(cita.notas);

    // Cargar cliente y mascota
    if (cita.cliente) {
      document.getElementById("cliente").value = cita.cliente.documentId;
      await loadMascotasForCliente(cita.cliente.documentId);
    }
    if (cita.mascota) {
      document.getElementById("mascota").value = cita.mascota.documentId;
    }

    const modalTitle = document.querySelector("#clientModal .modal-header h2");
    if (modalTitle) {
      modalTitle.textContent = "Editar Cita";
    }

    const form = document.querySelector("#clientModal form");
    form.setAttribute("data-edit-mode", "true");
    form.setAttribute("data-cita-id", citaDocumentId);

    openModal();
  } catch (error) {
    console.error("Error al cargar datos para editar:", error);
    alert("Error al cargar los datos de la cita");
  }
}

async function deleteCita(citaDocumentId, event) {
  if (!confirm("¿Estás seguro de que quieres eliminar esta cita?")) return;

  try {
    event.target.disabled = true;
    event.target.textContent = "⏳";

    await apiDelete(`citas/${citaDocumentId}`);
    alert("Cita eliminada correctamente");
    loadCitas();
  } catch (error) {
    console.error("Error al eliminar cita:", error);
    event.target.disabled = false;
    event.target.textContent = "❌";
    alert("Error al eliminar la cita: " + error.message);
  }
}

// ========== FUNCIÓN PARA CREAR CITA ==========
async function crearCita(citaData) {
  try {
    await apiPost("citas", citaData);
    alert("Cita agendada correctamente");
    closeModal();
    loadCitas();
  } catch (error) {
    console.error("Error creando cita:", error);
    alert("Error al agendar la cita");
  }
}

// ========== FUNCIÓN PARA ACTUALIZAR CITA ==========
async function actualizarCita(citaId, citaData) {
  try {
    await apiPut(`citas/${citaId}`, citaData);
    alert("Cita actualizada correctamente");
    closeModal();
    loadCitas();
  } catch (error) {
    console.error("Error actualizando cita:", error);
    alert("Error al actualizar la cita");
  }
}

function mostrarError() {
  const appointmentsGrid = document.querySelector(".appointments-grid");
  if (appointmentsGrid) {
    appointmentsGrid.innerHTML = `
            <div class="appointment-empty-new" style="grid-column: 1 / -1; color: red;">
                <div class="empty-icon">❌</div>
                <p>Error al cargar las citas</p>
                <button class="btn-add-quick" onclick="loadCitas()">
                    🔄 Reintentar
                </button>
            </div>
        `;
  }
}

// ========== FUNCIÓN PARA PESTAÑAS ==========
function showTab(tab) {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  event.target.classList.add("active");
  console.log("Mostrando pestaña:", tab);
}

// ========== FUNCIÓN PARA CAMBIAR ESTADO DE CITA ==========
async function cambiarEstadoCita(citaDocumentId, action, event) {
  try {
    let nuevoEstado;
    if (action === "iniciar") {
      nuevoEstado = "en-curso";
    } else if (action === "completar") {
      nuevoEstado = "atendida";
    }

    const citaData = {
      data: {
        estado: nuevoEstado,
      },
    };

    await apiPut(`citas/${citaDocumentId}`, citaData);
    alert(
      `Cita ${action === "iniciar" ? "iniciada" : "completada"} correctamente`
    );
    loadCitas();
  } catch (error) {
    console.error("Error cambiando estado de cita:", error);
    alert("Error al cambiar el estado de la cita");
  }
}

// ========== INICIALIZACIÓN ==========
document.addEventListener("DOMContentLoaded", () => {
  modal = document.getElementById("clientModal");

  // Cargar datos iniciales
  loadCitas();
  loadClientsForDropdown();

  const form = document.querySelector("#clientModal form");

  // Event listeners
  document.getElementById("cliente")?.addEventListener("change", (e) => {
    loadMascotasForCliente(e.target.value);
  });

  // Configurar fecha mínima (hoy)
  const fechaInput = document.getElementById("fecha");
  if (fechaInput) {
    const hoy = new Date().toISOString().split("T")[0];
    fechaInput.min = hoy;
  }

  document.querySelector(".btn-primary")?.addEventListener("click", () => {
    resetModalToCreateMode();
    openModal();
  });

  document
    .getElementById("btnAbrirModalPrincipal")
    ?.addEventListener("click", () => {
      resetModalToCreateMode();
      openModal();
    });

  document.querySelector(".modal-close")?.addEventListener("click", closeModal);
  document
    .querySelector(".btn-secondary")
    ?.addEventListener("click", closeModal);

  window.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  // Pestañas
  document.querySelectorAll(".tab-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const tab = e.target.getAttribute("data-tab");
      showTab(tab);
    });
  });

  // Submit del formulario - CORREGIDO
  // Reemplaza solo la parte del event listener del submit en DOMContentLoaded:

  // Submit del formulario - CORREGIDO PARA STRAPI v4
  // Submit del formulario - CORREGIDO CON FORMATO DE FECHA
  // Submit del formulario - CORREGIDO PARA STRAPI v5
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validar formulario
    const errorValidacion = validarFormulario();
    if (errorValidacion) {
      alert(errorValidacion);
      return;
    }

    // Obtener valores del formulario
    const clienteDocumentId = document.getElementById("cliente").value;
    const mascotaDocumentId = document.getElementById("mascota").value;
    const fecha = document.getElementById("fecha").value;
    const hora = document.getElementById("hora").value;
    const tipo = document.getElementById("tipo").value;
    const duracion = document.getElementById("duracion").value;
    const motivo = document.getElementById("motivo").value;
    const notas = document.getElementById("notas").value;

    try {
      // CORREGIDO: Usar nuevo formato para Strapi v5
      const fechaProgramada = formatearFechaHoraParaStrapi(fecha, hora);

      console.log("Fecha programada enviada:", fechaProgramada); // Para debug

      // Buscar el cliente en currentClients para obtener el ID numérico
      const clienteData = currentClients.find(
        (c) => c.documentId === clienteDocumentId
      );

      if (!clienteData) {
        alert("Error: Cliente no encontrado");
        return;
      }

      // Para la mascota, necesitamos hacer una consulta para obtener su ID numérico
      const mascotasResponse = await apiGet(
        `mascotas?filters[cliente][documentId][$eq]=${clienteDocumentId}`
      );
      const mascotaData = mascotasResponse.data.find(
        (m) => m.documentId === mascotaDocumentId
      );

      if (!mascotaData) {
        alert("Error: Mascota no encontrada");
        return;
      }

      // PREPARAR DATOS PARA STRAPI v5
      const citaData = {
        data: {
          fecha_programada: fechaProgramada,
          motivo: motivo || tipo,
          duracion_minutos: parseInt(duracion),
          notas: notas
            ? [
                {
                  type: "paragraph",
                  children: [{ type: "text", text: notas }],
                },
              ]
            : [],
          estado: "programada",
          cliente: clienteData.id,
          mascota: mascotaData.id,
        },
      };

      console.log("Datos completos enviados:", citaData);

      const isEditMode = form.getAttribute("data-edit-mode") === "true";

      if (isEditMode) {
        const citaId = form.getAttribute("data-cita-id");
        await actualizarCita(citaId, citaData);
      } else {
        await crearCita(citaData);
      }
    } catch (err) {
      console.error("Error guardando cita:", err);
      alert(
        "Error guardando cita: " +
          (err.message || "Verifica la consola para más detalles")
      );
    }
  });
});
