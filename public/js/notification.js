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
  setTimeout(() => toast.remove(), 3000);
}

document.addEventListener("DOMContentLoaded", () => {
  const notificationForm = document.getElementById("notificationForm");
  const searchVehicleBtn = document.getElementById("searchVehicleBtn");
  const methodSelect = document.getElementById("method");

  if (notificationForm) {
    notificationForm.addEventListener("submit", handleNotificationSubmit);
  }

  if (searchVehicleBtn) {
    searchVehicleBtn.addEventListener("click", searchAccidentVehicle);
  }

  if (methodSelect) {
    methodSelect.addEventListener("change", updateContactInfoLabel);
  }
});

function updateContactInfoLabel() {
  const methodSelect = document.getElementById("method");
  const contactInfoLabel = document.getElementById("contactInfoLabel");
  const contactInfoInput = document.getElementById("contactInfo");

  if (methodSelect.value === "email") {
    contactInfoLabel.textContent = "Correo Electrónico *";
    contactInfoInput.type = "email";
    contactInfoInput.placeholder = "correo@ejemplo.com";
  } else {
    contactInfoLabel.textContent = "Número de Teléfono *";
    contactInfoInput.type = "tel";
    contactInfoInput.placeholder = "+56 9 1234 5678";
  }
}

async function getAccidentByLicensePlate(patente) {
  try {
    const response = await fetch(`/api/accidentes/${patente}`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Error al buscar accidentes");
    }
    return await response.json();
  } catch (error) {
    console.error("Error al obtener accidentes:", error);
    showToast("Error", error.message || "Error desconocido", "error");
    return null;
  }
}

async function searchAccidentVehicle() {
  const searchInput = document.getElementById("searchVehicleInput");
  const searchButton = document.getElementById("searchVehicleBtn");
  const searchResults = document.getElementById("searchResults");

  const patente = searchInput.value.trim().toUpperCase();
  if (!patente) {
    showToast("Error", "Ingrese una patente para buscar", "error");
    return;
  }

  // Cambiar botón a "cargando"
  const originalText = searchButton.textContent;
  searchButton.disabled = true;
  searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando...';

  try {
    const vehicle = await getAccidentByLicensePlate(patente);

    searchResults.classList.remove("hidden");

    if (vehicle && vehicle.accident) {
      searchResults.innerHTML = `
        <div class="search-result-item" 
             data-id="${vehicle._id}" 
             data-plate="${vehicle.licensePlate}" 
             data-owner="${vehicle.owner}" 
             data-accident-date="${new Date(vehicle.accident.date).toLocaleDateString()}" 
             data-accident-location="${vehicle.accident.location}">
          <div class="search-result-info">
            <p class="license-plate">${vehicle.licensePlate}</p>
            <p class="vehicle-details">${vehicle.make} ${vehicle.model} (${vehicle.year}) - ${vehicle.owner}</p>
            <p class="accident-info">Accidente: ${new Date(vehicle.accident.date).toLocaleDateString()} - ${vehicle.accident.location}</p>
          </div>
          <button type="button" class="button button-sm select-vehicle-btn">Seleccionar</button>
        </div>
      `;

      const selectBtn = searchResults.querySelector(".select-vehicle-btn");
      selectBtn.addEventListener("click", () => {
        selectVehicleForNotification(
          vehicle._id,
          vehicle.licensePlate,
          vehicle.owner,
          new Date(vehicle.accident.date).toLocaleDateString(),
          vehicle.accident.location
        );
      });
    } else {
      searchResults.innerHTML = `<p>No se encontraron accidentes para esa patente.</p>`;
    }
  } catch (error) {
    console.error("Error al buscar accidente:", error);
    showToast("Error", "Ocurrió un error al buscar el vehículo", "error");
  } finally {
    searchButton.disabled = false;
    searchButton.textContent = originalText;
  }
}

function selectVehicleForNotification(id, licensePlate, owner, accidentDate, accidentLocation) {
  const vehicleIdInput = document.getElementById("vehicleId");
  const licensePlateInput = document.getElementById("licensePlate");
  const recipientInput = document.getElementById("recipient");
  const subjectInput = document.getElementById("subject");
  const messageInput = document.getElementById("message");
  const selectedVehicle = document.getElementById("selectedVehicle");
  const selectedLicensePlate = document.getElementById("selectedLicensePlate");
  const submitButton = document.getElementById("submitNotificationBtn");
  const searchResults = document.getElementById("searchResults");

  vehicleIdInput.value = id;
  licensePlateInput.value = licensePlate;
  recipientInput.value = owner;
  selectedLicensePlate.textContent = licensePlate;

  subjectInput.value = `Notificación de accidente - Patente ${licensePlate}`;
  messageInput.value = `Estimado/a ${owner},\n\nSe ha registrado un accidente con el vehículo de patente ${licensePlate} el día ${accidentDate} en ${accidentLocation}.\n\nPor favor, contáctese con nosotros para más información.\n\nAtentamente,\nSistema de Registro de Patentes`;

  selectedVehicle.classList.remove("hidden");
  searchResults.classList.add("hidden");
  submitButton.disabled = false;
}

async function sendNotification(data) {
  const response = await fetch("/notificaciones", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al enviar notificación");
  }

  return await response.json();
}

async function handleNotificationSubmit(e) {
  e.preventDefault();

  const submitButton = document.getElementById("submitNotificationBtn");
  const originalText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

  try {
    const data = {
      vehicleId: document.getElementById("vehicleId").value,
      licensePlate: document.getElementById("licensePlate").value,
      recipient: document.getElementById("recipient").value,
      contactInfo: document.getElementById("contactInfo").value,
      method: document.getElementById("method").value,
      subject: document.getElementById("subject").value,
      message: document.getElementById("message").value,
      attachReport: document.getElementById("attachReport").checked,
    };

    const result = await sendNotification(data);

    if (result.success) {
      showToast("Notificación enviada", "La notificación se envió exitosamente");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1500);
    }
  } catch (error) {
    console.error("Error al enviar notificación:", error);
    showToast("Error", "No se pudo enviar la notificación", "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
}
