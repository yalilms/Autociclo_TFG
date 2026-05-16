import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { ShieldCheck, CreditCard, AlertCircle, CheckCircle, Download, ArrowLeft } from 'lucide-react'
import { formatPrice } from '../lib/utils'
import { motion } from 'motion/react'
import client from '../api/client'
import { useAuthStore } from '../store/authStore'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { SolicitudPresupuesto } from '../types'

// ── Stripe publishable key (sustituir por pk_test_... de tu dashboard) ──
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? 'pk_test_REEMPLAZA_CON_TU_CLAVE'
)

const CARD_STYLE = {
  style: {
    base: {
      color: '#fff',
      fontFamily: '"Inter", sans-serif',
      fontSize: '15px',
      '::placeholder': { color: '#64748b' },
    },
    invalid: { color: '#f87171' },
  },
}

// ─────────────────────────────────────────────────────────
// Formulario de pago (dentro del contexto Elements)
// ─────────────────────────────────────────────────────────
function CheckoutForm({
  clientSecret,
  solicitud,
  usuario,
  onSuccess,
}: {
  clientSecret: string
  solicitud: SolicitudPresupuesto
  usuario: { nombre: string; email: string }
  onSuccess: (paymentId: string) => Promise<void>
}) {
  const stripe   = useStripe()
  const elements = useElements()
  const [paying, setPaying]   = useState(false)
  const [cardError, setCardError] = useState('')

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setCardError('')
    setPaying(true)

    const cardEl = elements.getElement(CardNumberElement)
    if (!cardEl) { setPaying(false); return }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardEl,
        billing_details: { name: usuario.nombre, email: usuario.email },
      },
    })

    if (error) {
      setCardError(error.message ?? 'Error al procesar el pago.')
      setPaying(false)
    } else if (paymentIntent?.status === 'succeeded') {
      await onSuccess(paymentIntent.id)
    }
  }

  return (
    <form onSubmit={handlePay} className="space-y-5">
      {/* Número */}
      <div>
        <label className="text-xs text-slate-400 uppercase font-black tracking-widest mb-2 block">
          Número de tarjeta
        </label>
        <div className="bg-slate-900 border border-white/10 rounded-xl px-4 py-3.5 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
          <CardNumberElement options={CARD_STYLE} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-400 uppercase font-black tracking-widest mb-2 block">Caducidad</label>
          <div className="bg-slate-900 border border-white/10 rounded-xl px-4 py-3.5 focus-within:ring-1 focus-within:ring-blue-500">
            <CardExpiryElement options={CARD_STYLE} />
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-400 uppercase font-black tracking-widest mb-2 block">CVC</label>
          <div className="bg-slate-900 border border-white/10 rounded-xl px-4 py-3.5 focus-within:ring-1 focus-within:ring-blue-500">
            <CardCvcElement options={CARD_STYLE} />
          </div>
        </div>
      </div>

      {cardError && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {cardError}
        </div>
      )}

      <button
        type="submit"
        disabled={paying || !stripe}
        className="btn-primary w-full h-14 flex items-center justify-center gap-3 text-lg font-bold disabled:opacity-50"
      >
        {paying
          ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <ShieldCheck className="w-5 h-5" />}
        {paying ? 'Procesando…' : `Pagar ${formatPrice(solicitud.precioTotal ?? 0)}`}
      </button>
    </form>
  )
}

// ─────────────────────────────────────────────────────────
// Generador de factura PDF
// ─────────────────────────────────────────────────────────
async function cargarLogoBase64(): Promise<string> {
  const res = await fetch('/logo.png')
  const blob = await res.blob()
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.readAsDataURL(blob)
  })
}

async function generarFacturaPDF(
  solicitud: SolicitudPresupuesto,
  usuario: { nombre: string; email: string },
  paymentId: string
) {
  const doc = new jsPDF()
  const logoB64 = await cargarLogoBase64()
  const fecha = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
  const numFactura = `FAC-${String(solicitud.idSolicitud).padStart(5, '0')}`

  // ── Franja superior azul oscuro ──
  doc.setFillColor(10, 18, 36)
  doc.rect(0, 0, 210, 52, 'F')

  // Acento azul lateral izquierdo
  doc.setFillColor(37, 99, 235)
  doc.rect(0, 0, 6, 52, 'F')

  // Fondo redondeado blanco para el logo
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(10, 7, 38, 38, 6, 6, 'F')
  doc.addImage(logoB64, 'PNG', 10, 7, 38, 38)

  // Nombre empresa
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('AutoCiclo', 56, 22)

  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(148, 163, 184)
  doc.text('Gestión Profesional de Desguace', 56, 30)
  doc.text('Polígono Industrial, Nave 12 · 18010 Granada', 56, 37)
  doc.text('info@autociclo.es  ·  +34 958 123 456', 56, 44)

  // Número de factura alineado a la derecha
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('FACTURA', 196, 22, { align: 'right' })
  doc.setFontSize(14)
  doc.setTextColor(99, 179, 237)
  doc.text(numFactura, 196, 32, { align: 'right' })

  // ── Línea separadora azul ──
  doc.setDrawColor(37, 99, 235)
  doc.setLineWidth(0.8)
  doc.line(14, 56, 196, 56)

  // ── Bloque de datos factura (izquierda) ──
  doc.setTextColor(100, 116, 139)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.text('FECHA DE EMISIÓN', 14, 66)
  doc.text('MÉTODO DE PAGO', 14, 80)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(30, 41, 59)
  doc.setFontSize(9.5)
  doc.text(fecha, 14, 72)
  doc.text('Tarjeta de crédito / débito (Stripe)', 14, 86)

  // ── Bloque cliente (derecha, tarjeta redondeada) ──
  doc.setFillColor(241, 245, 249)
  doc.roundedRect(118, 58, 78, 36, 4, 4, 'F')
  doc.setFillColor(37, 99, 235)
  doc.roundedRect(118, 58, 78, 10, 4, 4, 'F')
  doc.rect(118, 64, 78, 4, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.text('DATOS DEL CLIENTE', 125, 64.5)

  doc.setTextColor(30, 41, 59)
  doc.setFontSize(9.5)
  doc.setFont('helvetica', 'bold')
  doc.text(usuario.nombre, 125, 76)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(71, 85, 105)
  doc.text(usuario.email, 125, 83)

  // ── Tabla de piezas ──
  const filas = (solicitud.detalles ?? []).map(d => [
    d.pieza?.nombre ?? `Pieza #${d.id?.idPieza}`,
    String(d.cantidad),
    formatPrice(Number(d.pieza?.precioVenta ?? 0)),
    formatPrice(Number(d.pieza?.precioVenta ?? 0) * d.cantidad),
  ])

  autoTable(doc, {
    startY: 102,
    head: [['Descripción de la pieza', 'Cant.', 'Precio unit.', 'Subtotal']],
    body: filas,
    headStyles: {
      fillColor: [10, 18, 36],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: 6,
    },
    bodyStyles: { fontSize: 9.5, cellPadding: 5.5, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 88 },
      1: { halign: 'center', cellWidth: 18 },
      2: { halign: 'right', cellWidth: 38 },
      3: { halign: 'right', cellWidth: 38, fontStyle: 'bold' },
    },
    tableLineColor: [226, 232, 240],
    tableLineWidth: 0.3,
  })

  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY

  // ── Subtotal / IVA / Total ──
  const base = solicitud.precioTotal ?? 0
  const iva = +(base * 0.21).toFixed(2)
  const baseImponible = +(base - iva).toFixed(2)

  // Caja de totales
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(118, finalY + 6, 78, 40, 4, 4, 'F')
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.3)
  doc.roundedRect(118, finalY + 6, 78, 40, 4, 4, 'S')

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text('Base imponible', 124, finalY + 16)
  doc.text('IVA (21%)', 124, finalY + 24)

  doc.setTextColor(30, 41, 59)
  doc.text(formatPrice(baseImponible), 192, finalY + 16, { align: 'right' })
  doc.text(formatPrice(iva), 192, finalY + 24, { align: 'right' })

  // Línea separadora en la caja
  doc.setDrawColor(203, 213, 225)
  doc.line(124, finalY + 28, 192, finalY + 28)

  // Total
  doc.setFillColor(37, 99, 235)
  doc.roundedRect(118, finalY + 30, 78, 16, 3, 3, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('TOTAL PAGADO', 124, finalY + 39)
  doc.setFontSize(12)
  doc.text(formatPrice(base), 192, finalY + 40, { align: 'right' })

  // ── Sello PAGADO ──
  doc.setDrawColor(16, 185, 129)
  doc.setLineWidth(1.5)
  doc.roundedRect(14, finalY + 10, 42, 14, 3, 3, 'S')
  doc.setTextColor(16, 185, 129)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('PAGADO', 35, finalY + 20, { align: 'center' })

  // ── Pie de página ──
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.5)
  doc.line(14, 272, 196, 272)

  doc.setFillColor(10, 18, 36)
  doc.rect(0, 274, 210, 23, 'F')

  doc.setTextColor(148, 163, 184)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.text('Gracias por confiar en AutoCiclo. Este documento es válido como justificante de pago.', 105, 281, { align: 'center' })
  doc.text('AutoCiclo · Polígono Industrial, Nave 12, 18010 Granada · info@autociclo.es', 105, 288, { align: 'center' })
  doc.setTextColor(71, 85, 105)
  doc.setFontSize(7)
  doc.text(`Documento generado el ${fecha} · Ref. pago: ${paymentId.slice(0, 24)}…`, 105, 294, { align: 'center' })

  doc.save(`AutoCiclo_Factura_${numFactura}.pdf`)
}

// ─────────────────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────────────────
export default function Pago() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { usuario } = useAuthStore()

  const solicitudId = Number(searchParams.get('id'))
  const [solicitud, setSolicitud]       = useState<SolicitudPresupuesto | null>(null)
  const [clientSecret, setClientSecret] = useState('')
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [paymentId, setPaymentId]       = useState('')

  useEffect(() => {
    if (!solicitudId) { setError('ID de solicitud no válido.'); setLoading(false); return }

    // Carga datos de la solicitud y crea el PaymentIntent
    client.get(`/solicitudes/${solicitudId}`)
      .then(r => {
        setSolicitud(r.data)
        return client.post('/pagos/intento', { solicitudId })
      })
      .then(r => setClientSecret(r.data.clientSecret))
      .catch(() => setError('No se pudo inicializar el pago. Inténtalo de nuevo.'))
      .finally(() => setLoading(false))
  }, [solicitudId])

  const handleSuccess = async (pid: string) => {
    try {
      await client.put(`/solicitudes/${solicitudId}/pagar`)
    } catch {
      // El pago ya se procesó en Stripe; no bloqueamos la UI si esto falla
    }
    setPaymentId(pid)
  }

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="glass-card p-12">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-4">{error}</h2>
        <button onClick={() => navigate('/mis-solicitudes')} className="btn-primary">Volver a mis solicitudes</button>
      </div>
    </div>
  )

  // ── Estado: pago completado ──
  if (paymentId) return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-900/40"
      >
        <CheckCircle className="w-12 h-12 text-white" />
      </motion.div>
      <h2 className="text-4xl font-black text-white mb-3">¡Pago completado!</h2>
      <p className="text-slate-400 mb-8">Tu pedido está confirmado.</p>
      <div className="space-y-3 max-w-xs mx-auto">
        <button
          onClick={() => solicitud && usuario && generarFacturaPDF(
            solicitud,
            { nombre: usuario.nombre, email: usuario.email },
            paymentId
          )}
          className="btn-primary w-full h-12 flex items-center justify-center gap-2 font-bold"
        >
          <Download className="w-5 h-5" />
          Descargar factura PDF
        </button>
        <button
          onClick={() => navigate('/mis-solicitudes')}
          className="btn-secondary w-full h-12 font-bold"
        >
          Volver a mis solicitudes
        </button>
      </div>
    </div>
  )

  // ── Estado: formulario de pago ──
  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <button
        onClick={() => navigate('/mis-solicitudes')}
        className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Volver a mis solicitudes
      </button>

      <div className="glass-card p-8 border-white/20">
        {/* Cabecera */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Completar pago</h1>
            <p className="text-slate-400 text-xs">Solicitud #{solicitudId} · AutoCiclo</p>
          </div>
        </div>

        {/* Resumen piezas */}
        {solicitud && (
          <div className="mb-6 space-y-2">
            {solicitud.detalles?.map((d, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-slate-400">{d.pieza?.nombre ?? `Pieza #${d.id?.idPieza}`} ×{d.cantidad}</span>
                <span className="text-white font-mono">{formatPrice(Number(d.pieza?.precioVenta ?? 0) * d.cantidad)}</span>
              </div>
            ))}
            <div className="border-t border-white/10 pt-3 flex justify-between items-end">
              <span className="text-slate-400 text-sm">Total acordado</span>
              <span className="text-2xl font-mono font-black text-emerald-400">{formatPrice(solicitud.precioTotal ?? 0)}</span>
            </div>
          </div>
        )}

        {/* Stripe Elements */}
        {clientSecret && solicitud && usuario && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm
              clientSecret={clientSecret}
              solicitud={solicitud}
              usuario={{ nombre: usuario.nombre, email: usuario.email }}
              onSuccess={handleSuccess}
            />
          </Elements>
        )}
      </div>
    </div>
  )
}
