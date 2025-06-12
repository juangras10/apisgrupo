function showToast(title, message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.style.position = "fixed";
  toast.style.top = "20px";
  toast.style.right = "20px";
  toast.style.zIndex = "9999";
  toast.style.backgroundColor = type === "error" ? "#f44336" : (type === "warning" ? "#ff9800" : "#4caf50");
  toast.style.color = "white";
  toast.style.padding = "16px";
  toast.style.borderRadius = "5px";
  toast.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
  toast.innerHTML = `<strong>${title}</strong><div>${message}</div>`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}


document.addEventListener("DOMContentLoaded", async () => {
  // 🔐 Verificación de login
  const status = await fetch("/api/auth/status").then(res => res.status);
  if (status !== 200) {
    window.location.href = "/index.html";
    return;
  }

  // 🎯 El resto de tu código original sigue igual
  const accidentForm = document.getElementById("accidentForm");
  const searchVehicleBtn = document.getElementById("searchVehicleBtn");
  const policeReportCheckbox = document.getElementById("policeReport");

  if (accidentForm) {
    accidentForm.addEventListener("submit", handleAccidentRegistration);
  }

  if (searchVehicleBtn) {
    searchVehicleBtn.addEventListener("click", searchVehicle);
  }

  if (policeReportCheckbox) {
    policeReportCheckbox.addEventListener("change", toggleReportNumber);
  }
});


function toggleReportNumber() {
  const policeReportCheckbox = document.getElementById("policeReport")
  const reportNumberContainer = document.getElementById("reportNumberContainer")

  if (policeReportCheckbox.checked) {
    reportNumberContainer.classList.remove("hidden")
  } else {
    reportNumberContainer.classList.add("hidden")
  }
}

async function getVehicleByLicensePlate(patente) {
  const response = await fetch(`/vehiculos/${patente}`);
  return await response.json();
}


async function searchVehicle() {
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
    // Buscar vehículo en la base de datos
    const vehicle = await getVehicleByLicensePlate(searchInput.value)

    // Mostrar resultados
    searchResults.classList.remove("hidden")

    if (vehicle) {
      searchResults.innerHTML = `
                <p>Resultados:</p>
                <div class="search-result-item" data-id="${vehicle._id}" data-plate="${vehicle.licensePlate}">
                    <div class="search-result-info">
                        <p class="license-plate">${vehicle.licensePlate}</p>
                        <p class="vehicle-details">${vehicle.make} ${vehicle.model} (${vehicle.year}) - ${vehicle.owner}</p>
                    </div>
                    <button type="button" class="button button-sm select-vehicle-btn">Seleccionar</button>
                </div>
            `

      // Configurar evento para seleccionar vehículo
      const selectButtons = searchResults.querySelectorAll(".select-vehicle-btn")
      selectButtons.forEach((button) => {
        button.addEventListener("click", function () {
          const item = this.closest(".search-result-item")
          selectVehicle(item.dataset.id, item.dataset.plate)
        })
      })
    } else {
      searchResults.innerHTML = `
                <p>No se encontraron vehículos con esa patente.</p>
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

function selectVehicle(id, licensePlate) {
  const vehicleIdInput = document.getElementById("vehicleId")
  const licensePlateInput = document.getElementById("licensePlate")
  const selectedVehicle = document.getElementById("selectedVehicle")
  const selectedLicensePlate = document.getElementById("selectedLicensePlate")
  const submitButton = document.getElementById("submitAccidentBtn")
  const searchResults = document.getElementById("searchResults")

  // Establecer valores
  vehicleIdInput.value = id
  licensePlateInput.value = licensePlate
  selectedLicensePlate.textContent = licensePlate

  // Mostrar vehículo seleccionado y ocultar resultados
  selectedVehicle.classList.remove("hidden")
  searchResults.classList.add("hidden")

  // Habilitar botón de envío
  submitButton.disabled = false
}
async function getVehicleByLicensePlate(licensePlate) {
  try {
    const response = await fetch(`/vehiculos/${licensePlate}`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    // ⚠️ Si no está autenticado, el backend devuelve JSON con error
    if (!response.ok) {
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        if (json.error === 'No autenticado') {
          throw new Error('No autenticado');
        }
      } catch {
        throw new Error('Respuesta no válida del servidor');
      }
    }

    return await response.json();
  } catch (error) {
    console.error("Error en getVehicleByLicensePlate:", error);
    showToast("Error", error.message || "Error desconocido", "error");
    return null;
  }
}


async function handleAccidentRegistration(e) {
  e.preventDefault()

  const submitButton = document.getElementById("submitAccidentBtn")

  // Cambiar estado del botón
  const originalText = submitButton.textContent
  submitButton.disabled = true
  submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...'

  try {
    // Recopilar datos del formulario
    const formData = {
      vehicleId: document.getElementById("vehicleId").value,
      licensePlate: document.getElementById("licensePlate").value,
      date: document.getElementById("date").value,
      time: document.getElementById("time").value,
      location: document.getElementById("location").value,
      description: document.getElementById("description").value,
      severity: document.getElementById("severity").value,
      involvedParties: document.getElementById("involvedParties").value,
      policeReport: document.getElementById("policeReport").checked,
      reportNumber: document.getElementById("reportNumber").value,
    }

    // Registrar accidente
    const result = await registerAccident(formData)

    if (result.success) {
      showToast("Accidente registrado", "El accidente ha sido registrado exitosamente")

      // Redirigir al dashboard después de un breve retraso
      setTimeout(() => {
        window.location.href = "dashboard.html"
      }, 1500)
    }
  } catch (error) {
    console.error("Error al registrar accidente:", error)
    showToast("Error", "Ocurrió un error al registrar el accidente", "error")
  } finally {
    // Restaurar el botón
    submitButton.disabled = false
    submitButton.textContent = originalText
  }
}
