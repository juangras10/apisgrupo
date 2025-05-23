document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm")

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin)
  }
})

async function handleLogin(e) {
  e.preventDefault()

  const emailInput = document.getElementById("email")
  const passwordInput = document.getElementById("password")
  const loginButton = document.getElementById("loginButton")

  // Validar campos
  if (!emailInput.value || !passwordInput.value) {
    showToast("Error", "Por favor complete todos los campos", "error")
    return
  }

  // Deshabilitar el botón y mostrar estado de carga
  loginButton.disabled = true
  loginButton.textContent = "Iniciando sesión..."

  try {
    // Simular una petición al servidor
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // En un entorno real, aquí se haría la petición al servidor
    // Para este ejemplo, aceptamos cualquier combinación de email/contraseña

    // Guardar la información del usuario en localStorage
    const user = {
      id: "1",
      name: "Administrador",
      email: emailInput.value,
      role: "admin",
    }

    localStorage.setItem("user", JSON.stringify(user))

    // Mostrar mensaje de éxito
    showToast("Inicio de sesión exitoso", "Redirigiendo al panel de control...")

    // Redirigir al dashboard después de un breve retraso
    setTimeout(() => {
      window.location.href = "dashboard.html"
    }, 500)
  } catch (error) {
    showToast("Error", "Ocurrió un error al iniciar sesión", "error")
  } finally {
    // Restaurar el botón
    loginButton.disabled = false
    loginButton.textContent = "Iniciar Sesión"
  }
}

function showToast(title, message, type = "success") {
  // This is a placeholder for the showToast function.
  // In a real application, this function would display a toast notification.
  console.log(`Toast: ${title} - ${message} - ${type}`)
}
