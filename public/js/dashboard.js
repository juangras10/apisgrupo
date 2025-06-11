
document.addEventListener("DOMContentLoaded", async () => {
  // Cargar datos
  try {
    const allVehicles = await getAllVehicles()
    const accidentVehicles = await getAccidentVehicles()
    const notifications = await getNotifications()

    // Renderizar tablas
    renderVehiclesTable(allVehicles)
    renderAccidentsTable(accidentVehicles)
    renderNotificationsTable(notifications)

    // Configurar búsqueda
    setupSearch("searchVehicles", allVehicles, renderVehiclesTable)
    setupSearch("searchAccidents", accidentVehicles, renderAccidentsTable)
    setupSearch("searchNotifications", notifications, renderNotificationsTable)

    // Configurar tabs
    setupTabs()
  } catch (error) {
    console.error("Error al cargar datos:", error)
    showToast("Error", "No se pudieron cargar los datos", "error")
  }
})

// Renderizar tabla de vehículos
function renderVehiclesTable(vehicles) {
  const tableBody = document.getElementById("vehiclesTableBody")

  if (!tableBody) return

  tableBody.innerHTML = ""

  if (vehicles.length === 0) {
    tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">No se encontraron vehículos.</td>
            </tr>
        `
    return
  }

  vehicles.forEach((vehicle) => {
    const row = document.createElement("tr")

    row.innerHTML = `
            <td class="font-medium">${vehicle.licensePlate}</td>
            <td>${vehicle.make}</td>
            <td>${vehicle.model}</td>
            <td>${vehicle.year}</td>
            <td>${vehicle.owner}</td>
            <td>${new Date(vehicle.registeredAt).toLocaleDateString()}</td>
        `

    tableBody.appendChild(row)
  })
}

// Renderizar tabla de accidentes
function renderAccidentsTable(vehicles) {
  const tableBody = document.getElementById("accidentsTableBody")

  if (!tableBody) return

  tableBody.innerHTML = ""

  if (vehicles.length === 0) {
    tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">No se encontraron vehículos con accidentes.</td>
            </tr>
        `
    return
  }

  vehicles.forEach((vehicle) => {
    const row = document.createElement("tr")

    let severityBadge = ""
    if (vehicle.accident?.severity === "high") {
      severityBadge = `<span class="badge badge-danger"><i class="fas fa-exclamation-triangle"></i> Alta</span>`
    } else if (vehicle.accident?.severity === "medium") {
      severityBadge = `<span class="badge badge-warning">Media</span>`
    } else {
      severityBadge = `<span class="badge badge-outline">Baja</span>`
    }

    const statusBadge = vehicle.accident?.notified
      ? `<span class="badge badge-success">Notificado</span>`
      : `<span class="badge badge-warning">Pendiente</span>`

    row.innerHTML = `
            <td class="font-medium">${vehicle.licensePlate}</td>
            <td>${vehicle.make} ${vehicle.model}</td>
            <td>${vehicle.accident?.date ? new Date(vehicle.accident.date).toLocaleDateString() : "N/A"}</td>
            <td>${vehicle.accident?.location || "N/A"}</td>
            <td>${severityBadge}</td>
            <td>${statusBadge}</td>
        `

    tableBody.appendChild(row)
  })
}

// Renderizar tabla de notificaciones
function renderNotificationsTable(notifications) {
  const tableBody = document.getElementById("notificationsTableBody")

  if (!tableBody) return

  tableBody.innerHTML = ""

  if (notifications.length === 0) {
    tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">No se encontraron notificaciones.</td>
            </tr>
        `
    return
  }

  notifications.forEach((notification) => {
    const row = document.createElement("tr")

    const methodIcon =
      notification.method === "email" ? `<i class="fas fa-envelope"></i> Email` : `<i class="fas fa-sms"></i> SMS`

    let statusBadge = ""
    if (notification.status === "delivered") {
      statusBadge = `<span class="badge badge-success"><i class="fas fa-check"></i> Entregado</span>`
    } else if (notification.status === "pending") {
      statusBadge = `<span class="badge badge-warning">Pendiente</span>`
    } else {
      statusBadge = `<span class="badge badge-danger">Fallido</span>`
    }

    row.innerHTML = `
            <td class="font-medium">${notification.vehicle.licensePlate}</td>
            <td>${notification.recipient}</td>
            <td>${methodIcon}</td>
            <td>${new Date(notification.sentAt).toLocaleDateString()}</td>
            <td>${statusBadge}</td>
            <td><button class="button button-sm">Reenviar</button></td>
        `

    tableBody.appendChild(row)
  })
}

// Configurar búsqueda
function setupSearch(inputId, data, renderFunction) {
  const searchInput = document.getElementById(inputId)

  if (!searchInput) return

  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase()

    const filteredData = data.filter((item) => {
      // Para vehículos
      if (item.licensePlate) {
        return (
          item.licensePlate.toLowerCase().includes(searchTerm) ||
          item.make?.toLowerCase().includes(searchTerm) ||
          item.model?.toLowerCase().includes(searchTerm) ||
          item.owner?.toLowerCase().includes(searchTerm)
        )
      }
      // Para notificaciones
      else if (item.vehicle) {
        return (
          item.vehicle.licensePlate.toLowerCase().includes(searchTerm) ||
          item.recipient.toLowerCase().includes(searchTerm)
        )
      }

      return false
    })

    renderFunction(filteredData)
  })
}

// Configurar tabs
function setupTabs() {
  const tabButtons = document.querySelectorAll(".tab-button")
  const tabContents = document.querySelectorAll(".tab-content")

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabId = button.getAttribute("data-tab")

      // Desactivar todos los tabs
      tabButtons.forEach((btn) => btn.classList.remove("active"))
      tabContents.forEach((content) => content.classList.remove("active"))

      // Activar el tab seleccionado
      button.classList.add("active")
      document.getElementById(tabId).classList.add("active")
    })
  })
}

async function getAllVehicles() {
  // Replace with your actual implementation to fetch all vehicles
  return [
    {
      licensePlate: "ABC-123",
      make: "Toyota",
      model: "Corolla",
      year: 2020,
      owner: "John Doe",
      registeredAt: new Date(),
    },
    {
      licensePlate: "XYZ-789",
      make: "Honda",
      model: "Civic",
      year: 2021,
      owner: "Jane Smith",
      registeredAt: new Date(),
    },
  ]
}

async function getAccidentVehicles() {
  // Replace with your actual implementation to fetch accident vehicles
  return [
    {
      licensePlate: "ABC-123",
      make: "Toyota",
      model: "Corolla",
      accident: { date: new Date(), location: "Main Street", severity: "high", notified: true },
    },
  ]
}

async function getNotifications() {
  // Replace with your actual implementation to fetch notifications
  return [
    {
      vehicle: { licensePlate: "ABC-123" },
      recipient: "john.doe@example.com",
      method: "email",
      sentAt: new Date(),
      status: "delivered",
    },
  ]
}

function showToast(title, message, type) {
  // Replace with your actual implementation to show a toast notification
  console.log(`Toast: ${title} - ${message} - ${type}`)
}
document.getElementById("logoutButton").addEventListener("click", function (e) {
    e.preventDefault();

    // Opcional: limpiar tokens en localStorage/sessionStorage
    localStorage.removeItem("token");

    // Llamar al backend para cerrar sesión
    fetch("/logout", {
        method: "POST",
        credentials: "include", // para enviar cookies si se usan
    })
    .then(res => {
        if (res.ok) {
            // Redirigir al login
            window.location.href = "/index.html";
        } else {
            alert("Error al cerrar sesión");
        }
    })
    .catch(err => {
        console.error("Logout error", err);
    });
    logoutBtn.addEventListener("click", async () => {
  try {
    const response = await fetch("/logout", {
      method: "POST",
      credentials: "include", // Esto es importante
    });

    if (response.ok) {
      window.location.href = "/login";
    } else {
      alert("Error al cerrar sesión");
    }
  } catch (error) {
    console.error("Error en logout:", error);
    alert("Error al cerrar sesión");
  }
});

});
