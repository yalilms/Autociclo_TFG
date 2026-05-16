import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface LineaCarrito {
  piezaId: number
  cantidad: number
  nombre: string
  precio: number
}

interface CarritoState {
  lineas: LineaCarrito[]
  notas: string
  ofertaCliente: string
  setLineas: (lineas: LineaCarrito[]) => void
  setNotas: (notas: string) => void
  setOferta: (oferta: string) => void
  vaciar: () => void
}

export const useCarritoStore = create<CarritoState>()(
  persist(
    (set) => ({
      lineas: [],
      notas: '',
      ofertaCliente: '',
      setLineas:  (lineas)  => set({ lineas }),
      setNotas:   (notas)   => set({ notas }),
      setOferta:  (oferta)  => set({ ofertaCliente: oferta }),
      vaciar: () => set({ lineas: [], notas: '', ofertaCliente: '' }),
    }),
    { name: 'autociclo-carrito' }
  )
)
