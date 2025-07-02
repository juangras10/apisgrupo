document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const accidentId = urlParams.get("id");

  if (!accidentId) {
    alert("ID de accidente no especificado");
    return;
  }

  // Cargar datos del accidente
  try {
    const response = await fetch(`/accidentes/${accidentId}`);
    const accident = await response.json();

    // Rellenar el formulario
    document.getElementById("accidentId").value = accident._id;
    document.getElementById("licensePlate").value = accident.licensePlate;
    document.getElementById("date").value = accident.date.split("T")[0];
    document.getElementById("time").value = accident.date.split("T")[1].slice(0, 5);
    document.getElementById("location").value = accident.location;
    document.getElementById("description").value = accident.description;
    document.getElementById("severity").value = accident.severity;
  } catch (error) {
    console.error("Error al cargar accidente:", error);
    alert("Error al cargar accidente");
  }

  // Manejar envío del formulario
  const form = document.getElementById("editAccidentForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const updatedAccident = {
      date: document.getElementById("date").value,
      time: document.getElementById("time").value,
      location: document.getElementById("location").value,
      description: document.getElementById("description").value,
      severity: document.getElementById("severity").value,
    };

    try {
      const response = await fetch(`/accidentes/${accidentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedAccident),
      });

      if (response.ok) {
        alert("Accidente actualizado correctamente");
        window.location.href = "dashboard.html";
      } else {
        alert("Error al actualizar");
      }
    } catch (error) {
      console.error("Error actualizando:", error);
      alert("Error inesperado");
    }
  });
});
