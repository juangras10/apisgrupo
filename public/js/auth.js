// Verificar si el usuario está autenticado
function checkAuth() {
  const user = localStorage.getItem("user")

  // Si estamos en la página de login y el usuario está autenticado, redirigir al dashboard
  if (window.location.pathname === "/" || window.location.pathname === "/index.html") {
    if (user) {
      window.location.href = "dashboard.html"
    }
  }
  // Si no estamos en la página de login y el usuario no está autenticado, redirigir al login
  else {
    if (!user) {
      window.location.href = "index.html"
    } else {
      // Actualizar la información del usuario en el header
      updateUserInfo(JSON.parse(user))
    }
  }
}

// Actualizar la información del usuario en el header
function updateUserInfo(user) {
  const userNameElement = document.getElementById("userName")
  const userEmailElement = document.getElementById("userEmail")

  if (userNameElement && user.name) {
    userNameElement.textContent = user.name
  }

  if (userEmailElement && user.email) {
    userEmailElement.textContent = user.email
  }
}

// Mostrar un toast (notificación)
function showToast(title, message, type = "success", duration = 3000) {
  const toast = document.getElementById("toast")
  const toastTitle = document.getElementById("toastTitle")
  const toastMessage = document.getElementById("toastMessage")

  toastTitle.textContent = title
  toastMessage.textContent = message

  // Aplicar estilo según el tipo
  toast.className = "toast show"

  if (type === "error") {
    toastTitle.style.color = "var(--danger-color)"
  } else if (type === "warning") {
    toastTitle.style.color = "var(--warning-color)"
  } else {
    toastTitle.style.color = "var(--success-color)"
  }

  // Ocultar el toast después de la duración especificada
  setTimeout(() => {
    toast.className = "toast"
  }, duration)
}

// Configurar el evento de cierre de sesión
function setupLogout() {
  const logoutButton = document.getElementById("logoutButton")

  if (logoutButton) {
    logoutButton.addEventListener("click", (e) => {
      e.preventDefault()

      // Eliminar la información del usuario del localStorage
      localStorage.removeItem("user")

      // Redirigir al login
      window.location.href = "index.html"
    })
  }
}

// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  checkAuth()
  setupLogout()
})
