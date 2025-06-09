<<<<<<< HEAD
function showToast(title, message, type = "success") {
  const toast = document.createElement("div")
  toast.className = `toast toast-${type}`
  toast.style.position = "fixed"
  toast.style.top = "20px"
  toast.style.right = "20px"
  toast.style.zIndex = "9999"
  toast.style.backgroundColor = type === "error" ? "#f44336" : (type === "warning" ? "#ff9800" : "#4caf50")
  toast.style.color = "white"
  toast.style.padding = "16px"
  toast.style.borderRadius = "5px"
  toast.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)"
  toast.innerHTML = `<strong>${title}</strong><div>${message}</div>`
  document.body.appendChild(toast)

  setTimeout(() => {
    toast.remove()
  }, 3000)
}

=======
function showToast(title, message, type = "info") {
  console.log(`[${type.toUpperCase()}] ${title}: ${message}`)
}


>>>>>>> 72af7943a9086101874681ca49da00ad028eb78a
document.addEventListener("DOMContentLoaded", () => {
  const vehicleForm = document.getElementById("vehicleForm")
  const searchLicensePlateBtn = document.getElementById("searchLicensePlateBtn")

  if (vehicleForm) {
    vehicleForm.addEventListener("submit", handleVehicleRegistration)
  }

  if (searchLicensePlateBtn) {
    searchLicensePlateBtn.addEventListener("click", searchLicensePlate)
  }
})

async function searchLicensePlate() {
  const licensePlateInput = document.getElementById("licensePlate")
  const searchButton = document.getElementById("searchLicensePlateBtn")

  if (!licensePlateInput.value) {
    showToast("Error", "Ingrese una patente para buscar", "error")
    return
  }

  // Cambiar estado del botón
  const originalText = searchButton.textContent
  searchButton.disabled = true
  searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando...'

  try {
    // Buscar en API externa
    const result = await searchExternalVehicle(licensePlateInput.value)

    if (result.success && result.data) {
      // Llenar el formulario con los datos obtenidos
      document.getElementById("make").value = result.data.make || ""
      document.getElementById("model").value = result.data.model || ""
      document.getElementById("year").value = result.data.year || ""
      document.getElementById("color").value = result.data.color || ""

      showToast("Información encontrada", "Se encontró información para la patente " + licensePlateInput.value)
    } else {
      showToast("No se encontró información", "No se encontró información para esta patente", "warning")
    }
  } catch (error) {
    console.error("Error al buscar patente:", error)
    showToast("Error", "Ocurrió un error al buscar la patente", "error")
  } finally {
    // Restaurar el botón
    searchButton.disabled = false
    searchButton.textContent = originalText
  }
}

async function handleVehicleRegistration(e) {
  e.preventDefault()

  const submitButton = document.getElementById("submitVehicleBtn")

  // Cambiar estado del botón
  const originalText = submitButton.textContent
  submitButton.disabled = true
  submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...'

  try {
    // Recopilar datos del formulario
    const formData = {
      licensePlate: document.getElementById("licensePlate").value,
      make: document.getElementById("make").value,
      model: document.getElementById("model").value,
      year: document.getElementById("year").value,
      color: document.getElementById("color").value,
      owner: document.getElementById("owner").value,
      identificationNumber: document.getElementById("identificationNumber").value,
      contactEmail: document.getElementById("contactEmail").value,
      contactPhone: document.getElementById("contactPhone").value,
    }
    async function registerVehicle(data) {
      const response = await fetch('/vehiculos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
      },
      credentials: 'include',  // ⬅️ Esto es clave para mantener la sesión con cookies
      body: JSON.stringify(data)
    });


      return await response.json();
    }

    // Registrar vehículo
    const result = await registerVehicle(formData)

    if (result.success) {
      showToast("Vehículo registrado", "El vehículo ha sido registrado exitosamente")

      // Redirigir al dashboard después de un breve retraso
      setTimeout(() => {
        window.location.href = "dashboard.html"
      }, 1500)
    }
  } catch (error) {
    console.error("Error al registrar vehículo:", error)
    showToast("Error", "Ocurrió un error al registrar el vehículo", "error")
  } finally {
    // Restaurar el botón
    submitButton.disabled = false
    submitButton.textContent = originalText
  }
}
