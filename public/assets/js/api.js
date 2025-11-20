const API_URL = "http://localhost:1337/api";

async function apiGet(endpoint) {
  const res = await fetch(`${API_URL}/${endpoint}`);
  const data = await res.json();
  return data;
}

async function apiPost(endpoint, body) {
  const res = await fetch(`${API_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return await res.json();
}

async function apiPut(endpoint, body) {
  const res = await fetch(`${API_URL}/${endpoint}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return await res.json();
}

async function apiDelete(endpoint) {
  const res = await fetch(`${API_URL}/${endpoint}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Error ${res.status}: ${res.statusText}`);
  }

  // Intentamos parsear JSON, si falla significa que la respuesta está vacía (normal en DELETE)
  try {
    return await res.json();
  } catch (error) {
    // Si no hay JSON, devolvemos un objeto de éxito
    return { success: true, message: "Deleted successfully" };
  }
}