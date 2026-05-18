import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import {
  ShieldCheck, CreditCard, AlertCircle, CheckCircle,
  Download, ArrowLeft, MapPin, Package, Lock,
} from 'lucide-react'
import { formatPrice } from '../lib/utils'
import { motion } from 'motion/react'
import client from '../api/client'
import { useAuthStore } from '../store/authStore'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { SolicitudPresupuesto } from '../types'

// Carga Stripe una sola vez con la clave pública del .env
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

// Apariencia oscura para los elementos de Stripe
const stripeAppearance = {
  theme: 'night' as const,
  variables: {
    colorPrimary:     '#3b82f6',
    colorBackground:  '#0f172a',
    colorText:        '#f1f5f9',
    colorDanger:      '#ef4444',
    fontFamily:       'ui-sans-serif, system-ui, sans-serif',
    borderRadius:     '12px',
    spacingUnit:      '5px',
  },
  rules: {
    '.Input': {
      border:          '1px solid rgba(255,255,255,0.1)',
      backgroundColor: '#1e293b',
      padding:         '12px 14px',
    },
    '.Input:focus': {
      border:     '1px solid #3b82f6',
      boxShadow:  '0 0 0 1px #3b82f6',
    },
    '.Label': {
      color:      '#94a3b8',
      fontSize:   '11px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
    },
  },
}

interface DireccionEnvio {
  nombre: string
  direccion: string
  ciudad: string
  codigoPostal: string
  provincia: string
}

// ─────────────────────────────────────────────────────────
// Formulario de pago con Stripe real
// ─────────────────────────────────────────────────────────
function StripeCheckoutForm({
  solicitud,
  shippingAddress,
  onSuccess,
}: {
  solicitud: SolicitudPresupuesto
  shippingAddress: DireccionEnvio
  onSuccess: (paymentId: string) => Promise<void>
}) {
  const stripe   = useStripe()
  const elements = useElements()
  const [paying, setPaying] = useState(false)
  const [error, setError]   = useState('')

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    const { nombre, direccion, ciudad, codigoPostal, provincia } = shippingAddress
    if (!nombre || !direccion || !ciudad || !codigoPostal || !provincia) {
      setError('Por favor completa todos los campos de dirección de envío.')
      return
    }

    setError('')
    setPaying(true)

    // Valida los campos de la tarjeta antes de confirmar
    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message ?? 'Error al validar la tarjeta.')
      setPaying(false)
      return
    }

    // Confirma el pago — sin redirección para tarjetas normales
    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required',
    })

    if (stripeError) {
      setError(stripeError.message ?? 'El pago fue rechazado. Comprueba los datos.')
      setPaying(false)
      return
    }

    if (paymentIntent?.status === 'succeeded') {
      await onSuccess(paymentIntent.id)
    } else {
      setError('El pago no pudo completarse. Inténtalo de nuevo.')
      setPaying(false)
    }
  }

  return (
    <form onSubmit={handlePay} className="space-y-5">
      {/* Stripe Payment Element — campos reales de tarjeta */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
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

      <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
        <Lock className="w-3 h-3" />
        Pago seguro procesado por Stripe. Tus datos nunca pasan por nuestros servidores.
      </p>
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
  paymentId: string,
  envio: DireccionEnvio
) {
  const doc = new jsPDF()
  const logoB64 = await cargarLogoBase64()
  const fecha = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
  const numFactura = `FAC-${String(solicitud.idSolicitud).padStart(5, '0')}`

  doc.setFillColor(10, 18, 36)
  doc.rect(0, 0, 210, 52, 'F')
  doc.setFillColor(37, 99, 235)
  doc.rect(0, 0, 6, 52, 'F')
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(10, 7, 38, 38, 6, 6, 'F')
  doc.addImage(logoB64, 'PNG', 10, 7, 38, 38)

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

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('FACTURA', 196, 22, { align: 'right' })
  doc.setFontSize(14)
  doc.setTextColor(99, 179, 237)
  doc.text(numFactura, 196, 32, { align: 'right' })

  doc.setDrawColor(37, 99, 235)
  doc.setLineWidth(0.8)
  doc.line(14, 56, 196, 56)

  doc.setTextColor(100, 116, 139)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.text('FECHA DE EMISIÓN', 14, 66)
  doc.text('MÉTODO DE PAGO', 14, 80)
  doc.text('DIRECCIÓN DE ENVÍO', 14, 96)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(30, 41, 59)
  doc.setFontSize(9.5)
  doc.text(fecha, 14, 72)
  doc.text('Tarjeta de crédito / débito (Stripe)', 14, 86)
  doc.setFontSize(8.5)
  doc.text(envio.nombre, 14, 103)
  doc.text(envio.direccion, 14, 109)
  doc.text(`${envio.ciudad}, ${envio.codigoPostal}`, 14, 115)
  doc.setTextColor(100, 116, 139)
  doc.text(envio.provincia, 14, 121)

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

  const totalConIva   = +(Number(solicitud.precioTotal ?? 0)).toFixed(2)
  const baseImponible = +(totalConIva / 1.21).toFixed(2)
  const iva           = +(totalConIva - baseImponible).toFixed(2)
  const totalCatalogo = (solicitud.detalles ?? []).reduce(
    (sum, d) => sum + Number(d.pieza?.precioVenta ?? 0) * d.cantidad, 0
  )
  const factor = totalCatalogo > 0 ? baseImponible / totalCatalogo : 1

  const filas = (solicitud.detalles ?? []).map(d => {
    const precioUnit = +(Number(d.pieza?.precioVenta ?? 0) * factor).toFixed(2)
    const subtotal   = +(precioUnit * d.cantidad).toFixed(2)
    return [
      d.pieza?.nombre ?? `Pieza #${d.id?.idPieza}`,
      String(d.cantidad),
      formatPrice(precioUnit),
      formatPrice(subtotal),
    ]
  })

  autoTable(doc, {
    startY: 134,
    head: [['Descripción de la pieza', 'Cant.', 'Precio unit.', 'Subtotal']],
    body: filas,
    headStyles:          { fillColor: [10, 18, 36], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9, cellPadding: 6 },
    bodyStyles:          { fontSize: 9.5, cellPadding: 5.5, textColor: [30, 41, 59] },
    alternateRowStyles:  { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 88 },
      1: { halign: 'center', cellWidth: 18 },
      2: { halign: 'right',  cellWidth: 38 },
      3: { halign: 'right',  cellWidth: 38, fontStyle: 'bold' },
    },
    tableLineColor: [226, 232, 240],
    tableLineWidth: 0.3,
  })

  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY

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
  doc.text(formatPrice(iva),           192, finalY + 24, { align: 'right' })

  doc.setDrawColor(203, 213, 225)
  doc.line(124, finalY + 28, 192, finalY + 28)

  doc.setFillColor(37, 99, 235)
  doc.roundedRect(118, finalY + 30, 78, 16, 3, 3, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('TOTAL PAGADO', 124, finalY + 39)
  doc.setFontSize(12)
  doc.text(formatPrice(totalConIva), 192, finalY + 40, { align: 'right' })

  doc.setDrawColor(16, 185, 129)
  doc.setLineWidth(1.5)
  doc.roundedRect(14, finalY + 10, 42, 14, 3, 3, 'S')
  doc.setTextColor(16, 185, 129)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('PAGADO', 35, finalY + 20, { align: 'center' })

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
  doc.text(`Documento generado el ${fecha} · Stripe ID: ${paymentId.slice(0, 28)}…`, 105, 294, { align: 'center' })

  doc.save(`AutoCiclo_Factura_${numFactura}.pdf`)
}

// ─────────────────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────────────────
export default function Pago() {
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()
  const { usuario }    = useAuthStore()

  const solicitudId = Number(searchParams.get('id'))
  const [solicitud,     setSolicitud]     = useState<SolicitudPresupuesto | null>(null)
  const [clientSecret,  setClientSecret]  = useState('')
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState('')
  const [paymentId,     setPaymentId]     = useState('')
  const [pagoError,     setPagoError]     = useState('')

  const [shippingAddress, setShippingAddress] = useState<DireccionEnvio>({
    nombre:      usuario?.nombre ?? '',
    direccion:   '',
    ciudad:      '',
    codigoPostal:'',
    provincia:   '',
  })

  const setField = (field: keyof DireccionEnvio) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setShippingAddress(prev => ({ ...prev, [field]: e.target.value }))

  // Carga la solicitud y crea el PaymentIntent en Stripe en paralelo
  useEffect(() => {
    if (!solicitudId) { setError('ID de solicitud no válido.'); setLoading(false); return }

    Promise.all([
      client.get<SolicitudPresupuesto>(`/solicitudes/${solicitudId}`),
      client.post<{ clientSecret: string }>('/pagos/intento', { solicitudId }),
    ])
      .then(([solRes, intentRes]) => {
        setSolicitud(solRes.data)
        setClientSecret(intentRes.data.clientSecret)
      })
      .catch(err => {
        const msg = err?.response?.data?.error ?? 'No se pudo inicializar el pago. Inténtalo de nuevo.'
        setError(msg)
      })
      .finally(() => setLoading(false))
  }, [solicitudId])

  const handleSuccess = async (pid: string) => {
    try {
      await client.put(`/solicitudes/${solicitudId}/pagar`, { paymentIntentId: pid })
      setPaymentId(pid)
    } catch (err: any) {
      const status  = err?.response?.status
      const detalle = err?.response?.data?.message ?? err?.response?.data ?? err?.message ?? ''
      console.error(`[Pago] PUT /pagar → ${status}`, detalle)
      setPagoError(
        `Pago procesado en Stripe (ID: ${pid}) pero no se pudo confirmar en el servidor.` +
        ` Muestra este ID en AutoCiclo: ${pid}`
      )
    }
  }

  // ── Error registrando el pago en servidor (Stripe OK pero PUT /pagar falló) ──
  if (pagoError) return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="glass-card p-12">
        <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-3">Pago procesado, pendiente de confirmar</h2>
        <p className="text-slate-400 text-sm mb-6">{pagoError}</p>
        <button
          onClick={async () => {
            setPagoError('')
            try {
              await client.put(`/solicitudes/${solicitudId}/pagar`)
              setPaymentId(`pi_retry_${Date.now()}`)
            } catch (err: any) {
              const status  = err?.response?.status
              const detalle = err?.response?.data?.message ?? err?.message ?? ''
              setPagoError(`Reintento fallido (HTTP ${status ?? 'sin respuesta'}): ${detalle}`)
            }
          }}
          className="btn-primary mb-3 w-full"
        >
          Reintentar confirmación
        </button>
        <button onClick={() => navigate('/mis-solicitudes')} className="btn-secondary w-full">
          Volver a mis solicitudes
        </button>
      </div>
    </div>
  )

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
        <button onClick={() => navigate('/mis-solicitudes')} className="btn-primary">
          Volver a mis solicitudes
        </button>
      </div>
    </div>
  )

  // ── Pago completado ──
  if (paymentId) return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-900/40"
      >
        <CheckCircle className="w-12 h-12 text-white" />
      </motion.div>
      <h2 className="text-4xl font-black text-white mb-3">¡Pago completado!</h2>
      <p className="text-slate-400 mb-2">Tu pedido está confirmado y en preparación.</p>
      {solicitud?.referenciaOdoo && (
        <p className="text-blue-400 text-sm font-mono mb-8">Ref. Odoo: {solicitud.referenciaOdoo}</p>
      )}
      <div className="space-y-3 max-w-xs mx-auto">
        <button
          onClick={() => solicitud && usuario && generarFacturaPDF(
            solicitud,
            { nombre: usuario.nombre, email: usuario.email },
            paymentId,
            shippingAddress
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

  // ── Formulario de pago ──
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

        {/* Dirección de envío */}
        <div className="mb-6 border-t border-white/10 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-blue-400" />
            </div>
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Dirección de envío</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1 block">Nombre completo</label>
              <input type="text" value={shippingAddress.nombre} onChange={setField('nombre')}
                placeholder="Nombre Apellidos"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1 block">Dirección</label>
              <input type="text" value={shippingAddress.direccion} onChange={setField('direccion')}
                placeholder="Calle, número, piso…"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1 block">Ciudad</label>
                <input type="text" value={shippingAddress.ciudad} onChange={setField('ciudad')}
                  placeholder="Granada"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1 block">Código postal</label>
                <input type="text" value={shippingAddress.codigoPostal} onChange={setField('codigoPostal')}
                  placeholder="18010"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1 block">Provincia</label>
              <input type="text" value={shippingAddress.provincia} onChange={setField('provincia')}
                placeholder="Granada"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm" />
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-emerald-400 text-xs">Envío gratuito · Estimado 3–5 días hábiles</span>
            </div>
          </div>
        </div>

        {/* Stripe Elements — solo se renderiza cuando hay clientSecret */}
        {solicitud && clientSecret && (
          <Elements
            stripe={stripePromise}
            options={{ clientSecret, appearance: stripeAppearance, locale: 'es' }}
          >
            <StripeCheckoutForm
              solicitud={solicitud}
              shippingAddress={shippingAddress}
              onSuccess={handleSuccess}
            />
          </Elements>
        )}

        {/* Spinner mientras se crea el PaymentIntent */}
        {!clientSecret && !error && (
          <div className="flex items-center justify-center py-8 gap-3">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-400 text-sm">Preparando pasarela de pago…</span>
          </div>
        )}
      </div>
    </div>
  )
}
