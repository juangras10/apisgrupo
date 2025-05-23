document.addEventListener("DOMContentLoaded", () => {
  const notificationForm = document.getElementById("notificationForm")
  const searchVehicleBtn = document.getElementById("searchVehicleBtn")
  const methodSelect = document.getElementById("method")

  if (notificationForm) {
    notificationForm.addEventListener("submit", handleNotificationSubmit)
  }

  if (searchVehicleBtn) {
    searchVehicleBtn.addEventListener("click", searchAccidentVehicle)
  }

  if (methodSelect) {
    methodSelect.addEventListener("change", updateContactInfoLabel)
  }
})

function updateContactInfoLabel() {
  const methodSelect = document.getElementById("method")
  const contactInfoLabel = document.getElementById("contactInfoLabel")
  const contactInfoInput = document.getElementById("contactInfo")

  if (methodSelect.value === "email") {
    contactInfoLabel.textContent = "Correo Electrónico *"
    contactInfoInput.type = "email"
    contactInfoInput.placeholder = "correo@ejemplo.com"
  } else {
    contactInfoLabel.textContent = "Número de Teléfono *"
    contactInfoInput.type = "tel"
    contactInfoInput.placeholder = "+56 9 1234 5678"
  }
}

async function searchAccidentVehicle() {
  const searchInput = document.getElementById("searchVehicleInput")
  const searchButton = document.getElementById("searchVehicleBtn")
  const searchResults = document.getElementById("searchResults")

  if (!searchInput.value) {
    showToast("Error", "Ingrese una patente para buscar", "error")
    return
  }

  // Cambiar estado del botón
  const originalText = searchButton.textContent
  searchButton.disabled = true
  searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando...'

  try {
    // Buscar vehículos con accidentes
    const vehicles = await searchAccidentVehicles(searchInput.value)

    // Mostrar resultados
    searchResults.classList.remove("hidden")

    if (vehicles && vehicles.length > 0) {
      let resultsHTML = "<p>Resultados:</p>"

      vehicles.forEach((vehicle) => {
        resultsHTML += `
                    <div class="search-result-item" 
                         data-id="${vehicle.id}" 
                         data-plate="${vehicle.licensePlate}"
                         data-owner="${vehicle.owner}"
                         data-accident-date="${new Date(vehicle.accident?.date || "").toLocaleDateString()}"
                         data-accident-location="${vehicle.accident?.location || ""}">
                        <div class="search-result-info">
                            <p class="license-plate">${vehicle.licensePlate}</p>
                            <p class="vehicle-details">${vehicle.make} ${vehicle.model} (${vehicle.year}) - ${vehicle.owner}</p>
                            ${
                              vehicle.accident
                                ? `
                                <p class="accident-info">
                                    Accidente: ${new Date(vehicle.accident.date).toLocaleDateString()} - 
                                    ${vehicle.accident.location}
                                </p>
                            `
                                : ""
                            }
                        </div>
                        <button type="button" class="button button-sm select-vehicle-btn">Seleccionar</button>
                    </div>
                `
      })

      searchResults.innerHTML = resultsHTML

      // Configurar evento para seleccionar vehículo
      const selectButtons = searchResults.querySelectorAll(".select-vehicle-btn")
      selectButtons.forEach((button) => {
        button.addEventListener("click", function () {
          const item = this.closest(".search-result-item")
          selectVehicleForNotification(
            item.dataset.id,
            item.dataset.plate,
            item.dataset.owner,
            item.dataset.accidentDate,
            item.dataset.accidentLocation,
          )
        })
      })
    } else {
      searchResults.innerHTML = `
                <p>No se encontraron vehículos con accidentes para esa patente.</p>
            `
    }
  } catch (error) {
    console.error("Error al buscar vehículo:", error)
    showToast("Error", "Ocurrió un error al buscar el vehículo", "error")
  } finally {
    // Restaurar el botón
    searchButton.disabled = false
    searchButton.textContent = originalText
  }
}

function selectVehicleForNotification(id, licensePlate, owner, accidentDate, accidentLocation) {
  const vehicleIdInput = document.getElementById("vehicleId")
  const licensePlateInput = document.getElementById("licensePlate")
  const recipientInput = document.getElementById("recipient")
  const subjectInput = document.getElementById("subject")
  const messageInput = document.getElementById("message")
  const selectedVehicle = document.getElementById("selectedVehicle")
  const selectedLicensePlate = document.getElementById("selectedLicensePlate")
  const submitButton = document.getElementById("submitNotificationBtn")
  const searchResults = document.getElementById("searchResults")

  // Establecer valores
  vehicleIdInput.value = id
  licensePlateInput.value = licensePlate
  recipientInput.value = owner
  selectedLicensePlate.textContent = licensePlate

  // Establecer asunto y mensaje predeterminados
  subjectInput.value = `Notificación de accidente - Patente ${licensePlate}`
  messageInput.value = `Estimado/a ${owner},\n\nLe informamos que se ha registrado un accidente con el vehículo de patente ${licensePlate} ocurrido el ${accidentDate} en ${accidentLocation}.\n\nPor favor, póngase en contacto con nosotros para más información.\n\nAtentamente,\nSistema de Registro de Patentes`

  // Mostrar vehículo seleccionado y ocultar resultados
  selectedVehicle.classList.remove("hidden")
  searchResults.classList.add("hidden")

  // Habilitar botón de envío
  submitButton.disabled = false
}

async function handleNotificationSubmit(e) {
  e.preventDefault()

  const submitButton = document.getElementById("submitNotificationBtn")

  // Cambiar estado del botón
  const originalText = submitButton.textContent
  submitButton.disabled = true
  submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...'

  try {
    // Recopilar datos del formulario
    const formData = {
      vehicleId: document.getElementById("vehicleId").value,
      licensePlate: document.getElementById("licensePlate").value,
      recipient: document.getElementById("recipient").value,
      contactInfo: document.getElementById("contactInfo").value,
      method: document.getElementById("method").value,
      subject: document.getElementById("subject").value,
      message: document.getElementById("message").value,
      attachReport: document.getElementById("attachReport").checked,
    }

    // Enviar notificación
    const result = await sendNotification(formData)

    if (result.success) {
      showToast("Notificación enviada", "La notificación ha sido enviada exitosamente")

      // Redirigir al dashboard después de un breve retraso
      setTimeout(() => {
        window.location.href = "dashboard.html"
      }, 1500)
    }
  } catch (error) {
    console.error("Error al enviar notificación:", error)
    showToast("Error", "Ocurrió un error al enviar la notificación", "error")
  } finally {
    // Restaurar el botón
    submitButton.disabled = false
    submitButton.textContent = originalText
  }
}
