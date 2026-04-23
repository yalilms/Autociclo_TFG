export interface Usuario {
  id: number
  nombre: string
  email: string
  rol: string
}

export interface AuthState {
  token: string | null
  usuario: Usuario | null
  login: (token: string, usuario: Usuario) => void
  logout: () => void
}

export interface Pieza {
  id: number
  codigoPieza: string
  nombre: string
  descripcion: string
  categoria: string
  precio: number
  stockMinimo: number
  ubicacion: string
  foto?: string
}

export interface InventarioPieza {
  id: { idVehiculo: number; idPieza: number }
  cantidad: number
  estadoPieza: string
  precioUnitario: number
  pieza?: Pieza
  vehiculo?: Vehiculo
}

export interface Vehiculo {
  id: number
  matricula: string
  marca: string
  modelo: string
  anio: number
  estado: string
  precio: number
  ubicacion: string
}

export interface SolicitudPresupuesto {
  id: number
  clienteId: number
  fechaSolicitud: string
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA'
  notas: string
  referenciaOdoo?: string
  precioTotal?: number
  detalles: DetalleSolicitud[]
}

export interface DetalleSolicitud {
  piezaId: number
  cantidad: number
  pieza?: Pieza
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}
