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
  idPieza: number
  codigoPieza: string
  nombre: string
  descripcion?: string
  categoria: string
  precioVenta: number
  stockDisponible?: number
  stockMinimo?: number
  ubicacionAlmacen?: string
  compatibleMarcas?: string
  imagen?: string
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
  idVehiculo: number
  matricula: string
  marca: string
  modelo: string
  anio: number
  color?: string
  estado: 'completo' | 'desguazando' | 'desguazado'
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

export interface NegociacionRonda {
  id: number
  ronda: number
  autor: 'cliente' | 'admin'
  precio: number
  mensaje?: string
  fecha: string
}

export interface SolicitudCliente {
  idCliente: number
  usuario?: { idUsuario: number; nombre: string; email: string }
  telefono?: string
  direccion?: string
  nif?: string
}

export interface SolicitudPresupuesto {
  idSolicitud: number
  fechaSolicitud: string
  estado: 'pendiente' | 'en_negociacion' | 'aprobada' | 'rechazada' | 'pagada' | 'enviado'
  respuestaAdmin?: string
  referenciaOdoo?: string
  precioTotal?: number
  precioOfertaCliente?: number
  precioContraoferta?: number
  turno?: 'cliente' | 'admin'
  cliente?: SolicitudCliente
  detalles: DetalleSolicitud[]
  historial?: NegociacionRonda[]
}

export interface DetalleSolicitud {
  id?: { idSolicitud: number; idPieza: number }
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
