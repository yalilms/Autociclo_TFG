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
  descripcion?: string
  categoria: string
  precio: number
  stockDisponible?: number
  stockMinimo?: number
  ubicacion?: string
  compatibleMarcas?: string
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
  color?: string
  estado: string
  precioCompra?: number
  kilometraje?: number
  ubicacionGps?: string
  observaciones?: string
  fechaEntrada?: string
}

export interface UsuarioAdmin {
  idUsuario: number
  nombre: string
  email: string
  rol: string
  activo: boolean
  fechaAlta?: string
}

export interface SolicitudPresupuesto {
  id: number
  clienteId: number
  fechaSolicitud: string
  estado: 'pendiente' | 'en_revision' | 'aprobada' | 'rechazada'
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
