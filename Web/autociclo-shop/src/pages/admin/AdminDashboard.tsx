import { useState, useEffect } from 'react'
import { Wrench, Car, Users, Clock, CheckCircle, XCircle, TrendingUp, BadgeCheck } from 'lucide-react'
import { formatPrice } from '../../lib/utils'
import { motion } from 'motion/react'
import client from '../../api/client'

interface Stats {
  piezas: number
  vehiculos: number
  usuarios: number
  solicitudesPendientes: number
  solicitudesAprobadas: number
  solicitudesRechazadas: number
  solicitudesPagadas: number
  ingresosTotales: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      client.get('/piezas'),
      client.get('/vehiculos'),
      client.get('/usuarios'),
      client.get('/solicitudes'),
    ]).then(([piezas, vehiculos, usuarios, solicitudes]) => {
      const sols = solicitudes.data as { estado: string; precioTotal?: number }[]
      setStats({
        piezas: piezas.data.length,
        vehiculos: vehiculos.data.length,
        usuarios: usuarios.data.length,
        solicitudesPendientes: sols.filter(s => s.estado === 'pendiente').length,
        solicitudesAprobadas: sols.filter(s => s.estado === 'aprobada' || s.estado === 'pagada').length,
        solicitudesRechazadas: sols.filter(s => s.estado === 'rechazada').length,
        solicitudesPagadas: sols.filter(s => s.estado === 'pagada').length,
        ingresosTotales: sols
          .filter(s => s.estado === 'aprobada' || s.estado === 'pagada')
          .reduce((acc, s) => acc + (s.precioTotal ?? 0), 0),
      })
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const cards = stats ? [
    { label: 'Piezas en catálogo', value: stats.piezas,     Icon: Wrench,      color: 'blue' },
    { label: 'Vehículos en patio', value: stats.vehiculos,  Icon: Car,         color: 'violet' },
    { label: 'Usuarios registrados', value: stats.usuarios, Icon: Users,       color: 'emerald' },
    { label: 'Ingresos aprobados',  value: formatPrice(stats.ingresosTotales), Icon: TrendingUp, color: 'amber' },
  ] : []

  const solicStats = stats ? [
    { label: 'Pendientes',  value: stats.solicitudesPendientes,  Icon: Clock,         cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { label: 'Aprobadas',   value: stats.solicitudesAprobadas,   Icon: CheckCircle,   cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Pagadas',     value: stats.solicitudesPagadas,     Icon: BadgeCheck,    cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    { label: 'Rechazadas',  value: stats.solicitudesRechazadas,  Icon: XCircle,       cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
  ] : []

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-600/20 text-blue-400 border-blue-500/20',
    violet: 'bg-violet-600/20 text-violet-400 border-violet-500/20',
    emerald: 'bg-emerald-600/20 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-600/20 text-amber-400 border-amber-500/20',
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-1">Dashboard</h1>
        <p className="text-slate-400">Resumen general del sistema AutoCiclo</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="glass-card h-32 animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {cards.map(({ label, value, Icon, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="glass-card p-6"
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${colorMap[color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="text-slate-400 text-sm mt-1">{label}</p>
              </motion.div>
            ))}
          </div>

          {/* Solicitudes breakdown */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-violet-400" />
              Estado de Solicitudes
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {solicStats.map(({ label, value, Icon, cls }) => (
                <div key={label} className={`flex items-center gap-4 p-4 rounded-xl border ${cls}`}>
                  <Icon className="w-6 h-6 shrink-0" />
                  <div>
                    <p className="text-2xl font-black">{value}</p>
                    <p className="text-xs font-bold uppercase tracking-widest opacity-70">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
