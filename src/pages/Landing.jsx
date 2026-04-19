import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, Truck, ShoppingCart, BarChart2,
  Shield, Zap, MapPin, CheckCircle, ArrowRight,
  Users, UserCheck, User
} from 'lucide-react';

const FEATURES = [
  {
    icon: <ShoppingCart size={22}/>,
    color: 'bg-blue-50 text-blue-600',
    title: 'Gestión de Pedidos',
    desc: 'Crea, rastrea y administra pedidos en tiempo real desde cualquier dispositivo.',
  },
  {
    icon: <Truck size={22}/>,
    color: 'bg-amber-50 text-amber-600',
    title: 'Control de Entregas',
    desc: 'Asigna repartidores y vehículos, monitorea el estado de cada entrega.',
  },
  {
    icon: <MapPin size={22}/>,
    color: 'bg-emerald-50 text-emerald-600',
    title: 'Rastreo en Tiempo Real',
    desc: 'Los clientes saben exactamente dónde está su pedido en todo momento.',
  },
  {
    icon: <BarChart2 size={22}/>,
    color: 'bg-indigo-50 text-indigo-600',
    title: 'Reportes y Analítica',
    desc: 'Dashboards con métricas de rendimiento, ranking de repartidores y más.',
  },
  {
    icon: <Shield size={22}/>,
    color: 'bg-rose-50 text-rose-600',
    title: 'Seguridad Avanzada',
    desc: 'Datos cifrados con AES-256, autenticación JWT y auditoría completa.',
  },
  {
    icon: <Zap size={22}/>,
    color: 'bg-violet-50 text-violet-600',
    title: 'Agente de Voz con IA',
    desc: 'Asistente inteligente que atiende a los clientes sin intervención humana.',
  },
];

const ROLES = [
  {
    icon: <Shield size={20}/>,
    gradient: 'from-blue-500 to-indigo-600',
    ring: 'ring-indigo-200',
    label: 'Administrador',
    badge: 'bg-indigo-100 text-indigo-700',
    perks: ['Panel de control completo', 'Asignación de repartidores', 'Reportes y estadísticas', 'Gestión de flota'],
  },
  {
    icon: <UserCheck size={20}/>,
    gradient: 'from-amber-400 to-orange-500',
    ring: 'ring-amber-200',
    label: 'Repartidor',
    badge: 'bg-amber-100 text-amber-700',
    perks: ['Vista de mis entregas', 'Confirmación con evidencia', 'Historial de rutas', 'Estado en tiempo real'],
  },
  {
    icon: <User size={20}/>,
    gradient: 'from-emerald-500 to-teal-600',
    ring: 'ring-emerald-200',
    label: 'Cliente',
    badge: 'bg-emerald-100 text-emerald-700',
    perks: ['Crear y cancelar pedidos', 'Rastrear entregas', 'Agente de voz 24/7', 'Historial de compras'],
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
              <Package size={18} color="#fff" />
            </div>
            <span className="font-bold text-slate-800 text-[16px]">LogisticaDB</span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-500/20 cursor-pointer border-none"
          >
            Iniciar Sesión <ArrowRight size={15}/>
          </button>
        </div>
      </nav>


      <section className="relative overflow-hidden bg-slate-900 pt-24 pb-28 px-6">
        

        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-blue-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-white/10">
            <Zap size={12}/> Sistema Integral de Logística y Entregas
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
            Gestiona tu logística<br/>
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              de forma inteligente
            </span>
          </h1>

          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Plataforma completa para administrar pedidos, entregas y repartidores.
            Con agente de voz con IA para atender a tus clientes las 24 horas.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3.5 rounded-xl text-base font-semibold transition-all shadow-xl shadow-blue-500/30 cursor-pointer border-none w-full sm:w-auto"
            >
              Entrar al sistema <ArrowRight size={16}/>
            </button>
          </div>

          
          <div className="flex flex-wrap justify-center gap-8 mt-14">
            {[
              { value: '3 roles', label: 'de usuario' },
              { value: 'JWT', label: 'autenticación segura' },
              { value: 'AES-256', label: 'cifrado de datos' },
              { value: 'IA 24/7', label: 'agente de voz' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-white font-bold text-xl">{s.value}</p>
                <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Todo lo que necesitas</h2>
            <p className="text-slate-500 text-base max-w-xl mx-auto">
              Una sola plataforma para gestionar cada etapa de tu operación logística.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Una interfaz para cada rol</h2>
            <p className="text-slate-500 text-base max-w-xl mx-auto">
              Cada usuario ve exactamente lo que necesita, con una experiencia diseñada para su función.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ROLES.map(r => (
              <div key={r.label} className={`rounded-2xl border-2 p-6 ring-4 ${r.ring} border-transparent`}>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${r.gradient} flex items-center justify-center text-white shadow-md mb-4`}>
                  {r.icon}
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${r.badge}`}>{r.label}</span>
                <ul className="mt-4 space-y-2">
                  {r.perks.map(p => (
                    <li key={p} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle size={14} className="text-emerald-500 flex-shrink-0"/>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className="py-20 px-6 bg-slate-900">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">¿Listo para comenzar?</h2>
          <p className="text-slate-400 mb-8">Accede al sistema con tu cuenta y empieza a gestionar tu operación.</p>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 mx-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3.5 rounded-xl text-base font-semibold transition-all shadow-xl shadow-blue-500/30 cursor-pointer border-none"
          >
            Iniciar Sesión <ArrowRight size={16}/>
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-950 py-6 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Package size={12} color="#fff" />
            </div>
            <span className="text-slate-400 text-sm font-medium">LogisticaDB</span>
          </div>
          <p className="text-slate-600 text-xs">Sistema Integral de Logística y Entregas © 2026</p>
        </div>
      </footer>

    </div>
  );
}
