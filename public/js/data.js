// Datos de ejemplo para simular la base de datos
const mockVehicles = [
  {
    id: "1",
    licensePlate: "ABC123",
    make: "Toyota",
    model: "Corolla",
    year: 2020,
    color: "Blanco",
    owner: "Juan Pérez",
    identificationNumber: "12345678-9",
    contactEmail: "juan@ejemplo.com",
    contactPhone: "+56 9 1234 5678",
    registeredAt: "2023-01-15T10:30:00Z",
  },
  {
    id: "2",
    licensePlate: "XYZ789",
    make: "Nissan",
    model: "Versa",
    year: 2019,
    color: "Gris",
    owner: "María González",
    identificationNumber: "98765432-1",
    contactEmail: "maria@ejemplo.com",
    contactPhone: "+56 9 8765 4321",
    registeredAt: "2023-02-20T14:45:00Z",
    accident: {
      id: "acc1",
      date: "2023-05-10T08:30:00Z",
      location: "Av. Principal 123",
      description: "Colisión lateral con otro vehículo",
      severity: "medium",
      notified: true,
    },
  },
  {
    id: "3",
    licensePlate: "DEF456",
    make: "Hyundai",
    model: "Accent",
    year: 2021,
    color: "Rojo",
    owner: "Carlos Rodríguez",
    identificationNumber: "11223344-5",
    contactEmail: "carlos@ejemplo.com",
    contactPhone: "+56 9 2233 4455",
    registeredAt: "2023-03-05T09:15:00Z",
    accident: {
      id: "acc2",
      date: "2023-06-15T17:20:00Z",
      location: "Calle Secundaria 456",
      description: "Choque por alcance",
      severity: "low",
      notified: false,
    },
  },
]

const mockNotifications = [
  {
    id: "1",
    vehicle: {
      id: "2",
      licensePlate: "XYZ789",
    },
    recipient: "María González",
    contactInfo: "maria@ejemplo.com",
    method: "email",
    subject: "Notificación de accidente - Patente XYZ789",
    message: "Estimada María González, le informamos que se ha registrado un accidente con su vehículo...",
    sentAt: "2023-05-10T10:15:00Z",
    status: "delivered",
  },
  {
    id: "2",
    vehicle: {
      id: "3",
      licensePlate: "DEF456",
    },
    recipient: "Carlos Rodríguez",
    contactInfo: "+56 9 2233 4455",
    method: "sms",
    subject: "Notificación de accidente",
    message: "Sr. Carlos Rodríguez, se ha registrado un accidente con su vehículo patente DEF456...",
    sentAt: "2023-06-15T18:30:00Z",
    status: "pending",
  },
]

// Función para obtener todos los vehículos
async function getAllVehicles() {
  // Simular retraso de base de datos
  await new Promise((resolve) => setTimeout(resolve, 500))
  return mockVehicles
}

// Función para obtener vehículos con accidentes
async function getAccidentVehicles() {
  // Simular retraso de base de datos
  await new Promise((resolve) => setTimeout(resolve, 500))
  return mockVehicles.filter((vehicle) => vehicle.accident)
}

// Función para obtener notificaciones
async function getNotifications() {
  // Simular retraso de base de datos
  await new Promise((resolve) => setTimeout(resolve, 500))
  return mockNotifications
}

// Función para buscar un vehículo por patente
async function getVehicleByLicensePlate(licensePlate) {
  // Simular retraso de base de datos
  await new Promise((resolve) => setTimeout(resolve, 500))
  return mockVehicles.find((vehicle) => vehicle.licensePlate.toLowerCase() === licensePlate.toLowerCase()) || null
}

// Función para buscar vehículos con accidentes por patente
async function searchAccidentVehicles(licensePlate) {
  // Simular retraso de base de datos
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const results = mockVehicles.filter(
    (vehicle) => vehicle.licensePlate.toLowerCase().includes(licensePlate.toLowerCase()) && vehicle.accident,
  )

  return results
}

// Función para registrar un nuevo vehículo
async function registerVehicle(data) {
  // Simular retraso de base de datos
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // En un entorno real, aquí insertaríamos en la base de datos
  console.log("Registrando vehículo:", data)

  // Agregar el vehículo a los datos de ejemplo
  const newVehicle = {
    id: (mockVehicles.length + 1).toString(),
    ...data,
    registeredAt: new Date().toISOString(),
  }

  mockVehicles.push(newVehicle)

  return { success: true }
}

// Función para registrar un accidente
async function registerAccident(data) {
  // Simular retraso de base de datos
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // En un entorno real, aquí insertaríamos en la base de datos
  console.log("Registrando accidente:", data)

  // Buscar el vehículo y agregar el accidente
  const vehicle = mockVehicles.find((v) => v.id === data.vehicleId)

  if (vehicle) {
    vehicle.accident = {
      id: "acc" + (Math.floor(Math.random() * 1000) + 1),
      date: `${data.date}T${data.time}:00Z`,
      location: data.location,
      description: data.description,
      severity: data.severity,
      notified: false,
    }
  }

  return { success: true }
}

// Función para enviar una notificación
async function sendNotification(data) {
  // Simular retraso de envío
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // En un entorno real, aquí enviaríamos la notificación y registraríamos en la base de datos
  console.log("Enviando notificación:", data)

  // Agregar la notificación a los datos de ejemplo
  const newNotification = {
    id: (mockNotifications.length + 1).toString(),
    vehicle: {
      id: data.vehicleId,
      licensePlate: data.licensePlate,
    },
    recipient: data.recipient,
    contactInfo: data.contactInfo,
    method: data.method,
    subject: data.subject,
    message: data.message,
    sentAt: new Date().toISOString(),
    status: "delivered",
  }

  mockNotifications.push(newNotification)

  // Marcar el accidente como notificado
  const vehicle = mockVehicles.find((v) => v.id === data.vehicleId)
  if (vehicle && vehicle.accident) {
    vehicle.accident.notified = true
  }

  return { success: true }
}

// Función para buscar vehículos en API externa
async function searchExternalVehicle(licensePlate) {
  // Simular retraso de API externa
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // En un entorno real, aquí consultaríamos una API externa
  // Para este ejemplo, devolvemos datos ficticios
  const mockData = {
    licensePlate,
    make: "Toyota",
    model: "Corolla",
    year: 2020,
    color: "Blanco",
  }

  return { success: true, data: mockData }
}
