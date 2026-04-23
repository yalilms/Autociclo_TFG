/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, type ReactNode } from 'react';
import { 
  ShoppingCart, 
  Settings, 
  Car, 
  Zap, 
   RefreshCw, 
  CheckCircle, 
  Search, 
  Bell, 
  UserCircle, 
  ChevronRight,
  TrendingUp,
  MoreVertical,
  Minus,
  Plus,
  Trash2,
  Lock,
  ArrowRight,
  History,
  LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type View = 'catalog' | 'detail' | 'cart' | 'orders';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, type ReactNode } from 'react';
import { 
  ShoppingCart, 
  Settings, 
  Car, 
  Zap, 
   RefreshCw, 
  CheckCircle, 
  Search, 
  Bell, 
  UserCircle, 
  ChevronRight,
  TrendingUp,
  MoreVertical,
  Minus,
  Plus,
  Trash2,
  Lock,
  ArrowRight,
  History,
  LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type View = 'catalog' | 'detail' | 'cart' | 'orders';

interface Part {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  compatibility: string;
  condition: string;
}

interface CartItem extends Part {
  quantity: number;
}

interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'Entregado' | 'En Tránsito' | 'Pendiente';
}

const CATALOG_DATA: Part[] = [
  {
    id: "ENG-2938-TX",
    title: "Motor Completo V6 3.5L",
    price: 1450,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCIYxq6k1pBzsnuscBjnIGfy5TOV5IEhPjZrBDxcAA-uxSio0benXAMOmGNxiTWh6bHiayqUztlhGbULgMlIXtBqOJ9iq-5gRp210d3f3mdaIonArsnnE0eGJL7TeOjP0ina9TV3SeDzEycqQfKatCMozdzRSFpw3TsSFxrqzN7w_P5NG6TUssP3PNwR27IGui-7dJpE-t2NNgrkIILHpm6as9y2gmdp6ZYhYIK2i2ivMd076T2I0g_QAWPlGSlrmgpunUUn6Hgs_We",
    category: "Motores",
    compatibility: "Ford F-150, Explorer (2015-2020)",
    condition: "Usado (Grado A)"
  },
  {
    id: "ALT-9921-X",
    title: "Alternador de Alta Potencia 130 Amp",
    price: 125.50,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDibQX0UQA6Zfm6wpoa-MvuM-0N3Rvjy4awXWy66NQN7SpFtP_qxSP8c7aMh-SptfuW6OFL9_g_SEJ108_uyGkw849b37sl2maymi-yOBOvWhVVlMwwHtUrRfsgerCDfL0QmtRg42z3P8ajZV4WHvMvewAvCi1EAq6b3j2nfiBKFNCqPWnLX_GIgtCR-eFn494sjUMZwRwooN74ryHzhG0El8aUSTK1iRIFSc9-b2VWRLbAsQBaQc_54yMjtIkqbQCj_2oX0XwV4dlS",
    category: "Electrónica",
    compatibility: "Civic 1.5T (2018-2022)",
    condition: "Reacondicionado"
  },
  {
    id: "BOS-120-X",
    title: "Alternador Bosch 120A",
    price: 145,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAWGkpyVt3sHJeoZJT9SU2KcsamBOaUIWjCh4zw-e6OUDDNsrjhtlDCEJGIY7nq0aQGbnMOS4w-I7Q42RlYpWQmD_uHAcKTufBq8ZiWHgRm3t0xymGgNgAoJUezATvNJxE1FK--K0n9jPjRLDyKjxo0q7h0i_i7g_87D8kfSpXxyjHb2Q8UNcPwNryN9OcdQbpIdaNEmvmPPj0jcXthbZ75hp22NrHX2bLtUjn8V9qowZ9lYC4Pv5f15kK9NiBPpTkKc4EnOXKkZDgq",
    category: "Electrónica",
    compatibility: "Honda Accord (2018-2022)",
    condition: "Usado (Grado A)"
  },
  {
    id: "BRE-PAD-99",
    title: "Pastillas de Freno Cerámicas Brembo",
    price: 178,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBI1RN0GJJE_2Yt0NsY2SM47rucMrNss0_2Lw1cswwxRiSSKnBmBHYZey81uHfaWJqImezNMFNYCMRPj14O5N3eoQlLyP9gojIVBKR8y9pHqo2daCdUFFpCrqlWM9QqHPtHWJEZwsmp3FICqTIFepOzRDi0_fZOe2AlULqL9Jksl7U05bYujKCncNjdy0soA8uNNUBKpoSsyMq9YbB2BLkKWWKN7dfMBS9xW2qHsMF4zCuOwR2feq8mR_Q2NjYUyLL4tiRwFo94Xmoo",
    category: "Frenos",
    compatibility: "Universal / Varios modelos",
    condition: "Nuevo en Caja"
  }
];

export default function App() {
  const [currentView, setCurrentView] = useState<View>('catalog');
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "#ORD-9982-A",
      date: "24 Oct, 2023",
      items: [],
      total: 1250,
      status: 'Entregado'
    },
    {
      id: "#ORD-9975-B",
      date: "20 Oct, 2023",
      items: [],
      total: 185.50,
      status: 'En Tránsito'
    }
  ]);

  const addToCart = (part: Part) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === part.id);
      if (existing) {
        return prev.map(item => item.id === part.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...part, quantity: 1 }];
    });
    setCurrentView('cart');
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const checkout = () => {
    if (cart.length === 0) return;
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0) + 24.50; // Shipping
    const newOrder: Order = {
      id: `#ORD-${Math.floor(1000 + Math.random() * 9000)}-Z`,
      date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
      items: [...cart],
      total,
      status: 'Pendiente'
    };
    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    setCurrentView('orders');
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const renderView = () => {
    switch (currentView) {
      case 'catalog': 
        return <CatalogView onDetail={(part) => { setSelectedPart(part); setCurrentView('detail'); }} />;
      case 'detail': 
        return selectedPart ? <DetailView part={selectedPart} onAddToCart={() => addToCart(selectedPart)} /> : null;
      case 'cart': 
        return <CartView cart={cart} onUpdateQty={updateQuantity} onRemove={removeFromCart} onCheckout={checkout} />;
      case 'orders': 
        return <OrdersView orders={orders} />;
    }
  };

  return (
    <div className="h-screen flex bg-background overflow-hidden text-on-background">
      {/* Sidebar - Far Left */}
      <aside className="w-16 bg-[#1A1C1E] flex flex-col items-center py-6 gap-6 shrink-0 z-50">
        <SidebarIcon active={currentView === 'catalog'} onClick={() => setCurrentView('catalog')} icon={<LayoutGrid className="w-5 h-5" />} />
        <SidebarIcon active={currentView === 'orders'} onClick={() => setCurrentView('orders')} icon={<History className="w-5 h-5" />} />
        <div className="mt-auto">
          <SidebarIcon icon={<Settings className="w-5 h-5" />} />
        </div>
      </aside>

      {/* Sub-nav - Category List */}
      <nav className="w-64 bg-surface border-r border-outline-variant flex flex-col py-6 shrink-0 hidden lg:flex">
        <div className="px-5 mb-6">
          <span className="text-[11px] font-bold text-primary tracking-widest uppercase mb-1 block">SCRAP-PRO</span>
          <span className="text-[10px] text-on-surface-variant font-mono">v4.8.2-Estable</span>
        </div>
        
        <div className="px-2 space-y-1">
          <NavItem active={currentView === 'catalog'} label="Resumen General" badge="12" onClick={() => setCurrentView('catalog')} />
          <NavItem label="Evaluación de Riesgo" />
          <NavItem label="Fluidez de Mercado" badge="Nuevo" />
          <NavItem label="Registros de Cumplimiento" />
          <NavItem label="Salud del Sistema" />
        </div>

        <div className="mt-8 px-5 mb-4">
          <span className="text-[10px] font-bold text-on-surface-variant/50 tracking-widest uppercase">FILTROS DE CATÁLOGO</span>
        </div>
        <div className="px-2 space-y-1 overflow-y-auto flex-1">
          <NavItem label="Motores" active={currentView === 'catalog'} />
          <NavItem label="Carrocería" />
          <NavItem label="Electrónica" />
          <NavItem label="Transmisión" />
          <NavItem label="Ruedas y Llantas" />
        </div>
      </nav>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 bg-surface border-b border-outline-variant flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-body-md font-bold text-on-surface uppercase tracking-wider">FEED DE {currentView === 'catalog' ? 'CATÁLOGO' : currentView === 'detail' ? 'DETALLE' : currentView === 'cart' ? 'CARRITO' : 'PEDIDOS'}</h1>
            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">ACTUALIZACIÓN EN VIVO</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-3.5 h-3.5" />
              <input 
                type="text" 
                placeholder="Búsqueda global (⌘+K)"
                className="bg-surface-dim border-none rounded py-1.5 pl-9 pr-4 text-[11px] w-64 focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/50"
              />
            </div>
            <div className="flex items-center gap-4 text-on-surface-variant">
              <button onClick={() => setCurrentView('cart')} className="relative transition-colors hover:text-primary">
                <ShoppingCart className="w-4.5 h-4.5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold">{cartCount}</span>
                )}
              </button>
              <Bell className="w-4.5 h-4.5 cursor-pointer hover:text-primary transition-colors" />
              <div className="w-8 h-8 rounded-full bg-surface-dim border border-outline-variant cursor-pointer hover:border-primary transition-colors"></div>
            </div>
          </div>
        </header>

        {/* Core Content */}
        <main className="flex-1 overflow-y-auto p-5 bg-background">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1A1C1E]/90 backdrop-blur-md rounded-full px-6 py-3 flex items-center gap-8 shadow-xl z-50 border border-white/10">
        <button onClick={() => setCurrentView('catalog')} className={currentView === 'catalog' ? 'text-primary' : 'text-white/50'}><LayoutGrid className="w-5 h-5" /></button>
        <button onClick={() => setCurrentView('orders')} className={currentView === 'orders' ? 'text-primary' : 'text-white/50'}><History className="w-5 h-5" /></button>
        <button onClick={() => setCurrentView('cart')} className={currentView === 'cart' ? 'text-primary' : 'text-white/50'}><ShoppingCart className="w-5 h-5" /></button>
      </nav>
    </div>
  );
}

function SidebarIcon({ icon, active, onClick }: { icon: ReactNode, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-8 h-8 rounded-md flex items-center justify-center cursor-pointer transition-all ${
        active ? 'bg-primary text-white shadow-lg' : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
      }`}
    >
      {icon}
    </button>
  );
}

function NavItem({ label, active, badge, onClick }: { label: string, active?: boolean, badge?: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-sm transition-all cursor-pointer ${
        active ? 'bg-surface-dim text-on-surface' : 'text-on-surface-variant hover:bg-surface-dim/50'
      }`}
    >
      <span className="text-[12px] font-medium">{label}</span>
      {badge && <span className="bg-outline-variant/50 text-on-surface-variant text-[10px] px-1.5 py-0.5 rounded-sm font-bold">{badge}</span>}
    </button>
  );
}

function CatalogView({ onDetail }: { onDetail: (part: Part) => void }) {
  return (
    <div className="space-y-5 h-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 auto-rows-fr">
        {CATALOG_DATA.map(part => (
          <PartCard 
            key={part.id}
            image={part.image}
            partId={part.id}
            title={part.title}
            price={part.price}
            onClick={() => onDetail(part)}
          />
        ))}
        <div className="card col-span-1 md:col-span-2 flex flex-col overflow-hidden">
          <div className="card-header">
            <span className="card-title">Estado del Sistema</span>
            <span className="text-[10px] text-on-surface-variant font-mono">NODO-04 SINCRONIZADO</span>
          </div>
          <div className="flex-1 p-4 bg-on-surface text-[#4AE183] font-mono text-[11px] space-y-1 overflow-y-auto">
            <div>[14:22:01] Manifiesto de inventario sincronizado (4,821 unidades)</div>
            <div>[14:22:05] Socket establecido - parts_cluster_01</div>
            <div>[14:22:12] Actualización de pedido: #ORD-9982-A (Entregado)</div>
            <div>[14:23:45] Transacción segura verificada: AES-256</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PartCard({ image, partId, title, price, onClick }: any) {
  return (
    <div className="card group cursor-pointer hover:border-primary transition-all overflow-hidden flex flex-col" onClick={onClick}>
      <div className="h-40 overflow-hidden relative">
        <img src={image} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300" />
        <div className="absolute top-2 right-2 bg-surface/90 px-2 py-0.5 rounded-sm border border-outline-variant text-[10px] font-bold font-mono">
          #{partId}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-[13px] font-bold text-on-surface mb-2 line-clamp-1">{title}</h3>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-data-tabular font-bold text-primary">${price.toFixed(2)}</span>
          <button className="text-[11px] font-bold text-primary hover:underline uppercase">Ver Datos</button>
        </div>
      </div>
    </div>
  );
}

function DetailView({ part, onAddToCart }: { part: Part, onAddToCart: () => void }) {
  return (
    <div className="h-full flex flex-col gap-5">
      <div className="grid grid-cols-12 gap-5 flex-1 overflow-hidden">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-5 overflow-hidden">
          <div className="card flex-1 relative overflow-hidden">
            <img src={part.image} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
              <div>
                <span className="text-label-caps text-white/70 mb-2 block">{part.category}</span>
                <h2 className="text-2xl font-bold text-white m-0 uppercase tracking-tight">{part.title}</h2>
              </div>
            </div>
          </div>
          <div className="card h-48 overflow-hidden">
             <div className="card-header"><span className="card-title">Matriz Técnica</span></div>
             <table className="w-full text-left text-[12px] font-mono">
               <thead>
                 <tr className="bg-surface-dim uppercase text-[10px] font-bold text-on-surface-variant">
                   <th className="px-4 py-2">Parámetro</th>
                   <th className="px-4 py-2">Valor</th>
                 </tr>
               </thead>
               <tbody>
                 <tr><td className="px-4 py-2 border-b border-surface-dim">ESTADO</td><td className="px-4 py-2 border-b border-surface-dim">{part.condition.toUpperCase()}</td></tr>
                 <tr><td className="px-4 py-2 border-b border-surface-dim">COMPATIBILIDAD</td><td className="px-4 py-2 border-b border-surface-dim">{part.compatibility}</td></tr>
                 <tr><td className="px-4 py-2 border-b border-surface-dim">ORIGEN</td><td className="px-4 py-2 border-b border-surface-dim">CERTIFICADO OEM</td></tr>
               </tbody>
             </table>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
          <div className="card p-6 flex flex-col justify-center gap-6">
            <div>
              <span className="text-label-caps text-on-surface-variant mb-1 block">PRECIO COTIZADO</span>
              <span className="text-4xl font-mono font-bold text-primary">${part.price.toFixed(2)}</span>
            </div>
            <div className="space-y-4">
              <button 
                onClick={onAddToCart}
                className="w-full bg-primary text-white font-bold py-3 rounded-md hover:bg-blue-600 transition-colors uppercase tracking-widest text-[12px]"
              >
                Iniciat Compra
              </button>
              <button className="w-full border border-primary text-primary font-bold py-3 rounded-md hover:bg-primary-container transition-colors uppercase tracking-widest text-[12px]">Solicitar Inspección</button>
            </div>
          </div>
          <div className="card flex-1 p-6">
            <span className="card-title mb-4 block">Matriz de Riesgo</span>
            <div className="grid grid-cols-4 gap-1 h-32">
              <div className="bg-red-500/20 border border-red-500"></div><div className="bg-red-500/10"></div><div className="bg-orange-500/10"></div><div className="bg-green-500/10"></div>
              <div className="bg-red-500/10"></div><div className="bg-orange-500/10 border border-orange-500 flex items-center justify-center">
                <div className="w-2 h-2 bg-on-surface rounded-full"></div>
              </div><div className="bg-green-500/10"></div><div className="bg-green-500/20"></div>
            </div>
            <div className="mt-4 text-[11px] text-on-surface-variant font-mono">CONFIANZA_AJUSTE: 92%</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrdersView({ orders }: { orders: Order[] }) {
  const totalInvoiced = orders.reduce((acc, o) => acc + o.total, 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="card p-5"><span className="card-title text-on-surface-variant">Valor Total de Activos</span><div className="text-2xl font-mono font-bold mt-2">${totalInvoiced.toLocaleString()}</div><div className="text-[11px] text-green-600 font-bold mt-1">+12.4% MENSUAL</div></div>
        <div className="card p-5"><span className="card-title text-on-surface-variant">Activos en Curso</span><div className="text-2xl font-mono font-bold mt-2">{orders.filter(o => o.status !== 'Entregado').length.toString().padStart(2, '0')}</div><div className="text-[11px] text-on-surface-variant mt-1 italic tracking-wider uppercase">ENVÍO_SEGURO</div></div>
        <div className="card p-5"><span className="card-title text-on-surface-variant">Cumplimiento</span><div className="text-2xl font-mono font-bold mt-2">100%</div><div className="text-[11px] text-on-surface-variant mt-1 uppercase">TRANSACCIONES_VERIFICADAS</div></div>
      </div>

      <div className="card overflow-hidden">
        <div className="card-header"><span className="card-title">Libro de Pedidos</span><button className="text-[10px] bg-surface-dim px-2 py-1 rounded font-bold uppercase">Exportar JSON</button></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[12px]">
            <thead>
              <tr className="bg-surface-dim uppercase text-[10px] font-bold text-on-surface-variant">
                <th className="px-6 py-3 whitespace-nowrap">ID_PEDIDO</th>
                <th className="px-6 py-3">FECHA</th>
                <th className="px-6 py-3 text-right">VALORACIÓN</th>
                <th className="px-6 py-3 text-center">ESTADO</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-surface-dim/30 transition-colors">
                  <td className="px-6 py-4 border-b border-surface-dim font-bold text-primary">{order.id}</td>
                  <td className="px-6 py-4 border-b border-surface-dim text-on-surface-variant">{order.date}</td>
                  <td className="px-6 py-4 border-b border-surface-dim text-right font-bold">${order.total.toFixed(2)}</td>
                  <td className="px-6 py-4 border-b border-surface-dim text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      order.status === 'Entregado' ? 'bg-green-100 text-green-700' : 
                      order.status === 'En Tránsito' ? 'bg-blue-100 text-blue-700' : 
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {order.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CartView({ cart, onUpdateQty, onRemove, onCheckout }: { cart: CartItem[], onUpdateQty: (id: string, d: number) => void, onRemove: (id: string) => void, onCheckout: () => void }) {
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = cart.length > 0 ? 24.50 : 0;
  const total = subtotal + shipping;

  return (
    <div className="grid grid-cols-12 gap-5 h-full">
      <div className="col-span-12 xl:col-span-8 flex flex-col gap-5 overflow-hidden">
        <div className="card flex-1 overflow-y-auto">
          <div className="card-header"><span className="card-title">Adquisiciones Pendientes</span></div>
          {cart.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-on-surface-variant text-sm italic font-mono uppercase tracking-widest">Carrito Vacío - Sistema en Espera</div>
          ) : (
            <div className="divide-y divide-surface-dim">
              {cart.map(item => (
                <CartItemRow 
                  key={item.id}
                  title={item.title} 
                  price={item.price} 
                  qty={item.quantity} 
                  part={item.id} 
                  onUpdate={(d: number) => onUpdateQty(item.id, d)}
                  onRemove={() => onRemove(item.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="col-span-12 xl:col-span-4 self-start space-y-5">
        <div className="card p-6 space-y-6">
          <span className="card-title block">Resumen de Valoración</span>
          <div className="space-y-2 font-mono text-[13px]">
            <div className="flex justify-between"><span>SUBTOTAL</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>ENVÍO_EST</span><span>${shipping.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-primary text-lg pt-4 border-t border-surface-dim"><span>TOTAL_VAL</span><span>${total.toFixed(2)}</span></div>
          </div>
          <button 
            onClick={onCheckout}
            disabled={cart.length === 0}
            className="w-full bg-primary text-white font-bold py-4 rounded hover:bg-blue-600 transition-all uppercase tracking-widest text-[12px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Ejecutar Checkout
          </button>
        </div>
        <div className="card p-4 border-dashed border-primary/30 flex items-center gap-3">
          <Lock className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">Protocolo de Pago Seguro Activado</span>
        </div>
      </div>
    </div>
  );
}

function CartItemRow({ title, price, qty, part, onUpdate, onRemove }: any) {
  return (
    <div className="px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-surface-dim/30 transition-colors gap-4">
      <div className="flex flex-col">
        <span className="text-[13px] font-bold font-mono text-on-surface uppercase">{title}</span>
        <span className="text-[11px] text-on-surface-variant font-mono">UID: {part}</span>
      </div>
      <div className="flex items-center gap-4 sm:gap-8 w-full sm:w-auto justify-between sm:justify-end">
        <button onClick={onRemove} className="text-on-surface-variant hover:text-red-600 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
        <div className="flex items-center font-mono text-[13px] bg-surface-dim rounded px-3 py-1 gap-4">
          <button onClick={() => onUpdate(-1)} className="text-on-surface-variant cursor-pointer p-1">-</button>
          <span className="font-bold min-w-[20px] text-center">{qty}</span>
          <button onClick={() => onUpdate(1)} className="text-on-surface-variant cursor-pointer p-1">+</button>
        </div>
        <span className="text-data-tabular font-bold text-primary min-w-[80px] text-right">${(price * qty).toFixed(2)}</span>
      </div>
    </div>
  );
}


