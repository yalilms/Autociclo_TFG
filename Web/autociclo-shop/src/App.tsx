import { type ReactNode } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'
import AdminLayout from './components/AdminLayout'
import Home from './pages/Home'
import Catalogo from './pages/Catalogo'
import DetallePieza from './pages/DetallePieza'
import Login from './pages/Login'
import Registro from './pages/Registro'
import SolicitarPresupuesto from './pages/SolicitarPresupuesto'
import MisSolicitudes from './pages/MisSolicitudes'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminSolicitudes from './pages/admin/AdminSolicitudes'
import AdminPiezas from './pages/admin/AdminPiezas'
import AdminVehiculos from './pages/admin/AdminVehiculos'
import AdminUsuarios from './pages/admin/AdminUsuarios'

function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}

function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
      <div className="glass-card p-16 max-w-md w-full">
        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-3">Error 404</p>
        <h2 className="text-3xl font-black text-white mb-4">Página no encontrada</h2>
        <a href="/" className="text-blue-500 hover:text-blue-400 font-bold transition-colors">← Volver al inicio</a>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Tienda pública */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/catalogo" element={<Layout><Catalogo /></Layout>} />
        <Route path="/catalogo/:id" element={<Layout><DetallePieza /></Layout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/solicitar" element={<PrivateRoute><Layout><SolicitarPresupuesto /></Layout></PrivateRoute>} />
        <Route path="/mis-solicitudes" element={<PrivateRoute><Layout><MisSolicitudes /></Layout></PrivateRoute>} />

        {/* Panel Admin */}
        <Route path="/admin" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
        <Route path="/admin/solicitudes" element={<AdminRoute><AdminLayout><AdminSolicitudes /></AdminLayout></AdminRoute>} />
        <Route path="/admin/piezas" element={<AdminRoute><AdminLayout><AdminPiezas /></AdminLayout></AdminRoute>} />
        <Route path="/admin/vehiculos" element={<AdminRoute><AdminLayout><AdminVehiculos /></AdminLayout></AdminRoute>} />
        <Route path="/admin/usuarios" element={<AdminRoute><AdminLayout><AdminUsuarios /></AdminLayout></AdminRoute>} />

        <Route path="*" element={<Layout><NotFound /></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}
