import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { logout } from '../api';
import {
  LayoutDashboard, Users, ShoppingCart, Truck,
  UserCheck, Car, CreditCard, BarChart2,
  LogOut, Menu, X, Package
} from 'lucide-react';

const ALL_LINKS = [
  { to:'/app/dashboard',    icon:<LayoutDashboard size={18}/>, label:'Dashboard',    roles:['admin','repartidor','cliente'] },
  { to:'/app/clientes',     icon:<Users size={18}/>,           label:'Clientes',     roles:['admin'] },
  { to:'/app/productos',    icon:<Package size={18}/>,         label:'Productos',    roles:['admin'] },
  { to:'/app/pedidos',      icon:<ShoppingCart size={18}/>,    label:'Pedidos',      roles:['admin','cliente'] },
  { to:'/app/productos',    icon:<Package size={18}/>,         label:'Catálogo',     roles:['cliente'] },
  { to:'/app/entregas',     icon:<Truck size={18}/>,           label:'Entregas',     roles:['admin','repartidor'] },
  { to:'/app/repartidores', icon:<UserCheck size={18}/>,       label:'Repartidores', roles:['admin'] },
  { to:'/app/vehiculos',    icon:<Car size={18}/>,             label:'Vehículos',    roles:['admin'] },
  { to:'/app/pagos',        icon:<CreditCard size={18}/>,      label:'Pagos',        roles:['admin'] },
  { to:'/app/reportes',     icon:<BarChart2 size={18}/>,       label:'Reportes',     roles:['admin'] },
];

const ROL_BADGE = {
  admin:      'bg-indigo-100 text-indigo-700',
  repartidor: 'bg-amber-100 text-amber-700',
  cliente:    'bg-emerald-100 text-emerald-700',
};

// ─── Layout para CLIENTES — barra superior ───────────────────────────────────
function ClienteLayout({ user, onLogout, widgetRef }) {
  const links = ALL_LINKS.filter(l => l.roles.includes('cliente'));
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-emerald-50/40 font-sans">

      {/* Barra superior */}
      <header className="bg-white border-b border-emerald-100 shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Package size={18} color="#fff" />
            </div>
            <span className="font-bold text-slate-800 text-[15px] hidden sm:block">LogisticaDB</span>
          </div>

          {/* Nav links — desktop */}
          <nav className="hidden sm:flex items-center gap-1">
            {links.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                   ${isActive
                     ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/30'
                     : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'}`
                }
              >
                <span className="flex-shrink-0">{l.icon}</span>
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Usuario + logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow">
                {user?.nombre?.[0]?.toUpperCase() ?? 'C'}
              </div>
              <div className="text-right leading-tight">
                <p className="text-sm font-semibold text-slate-800">{user?.nombre}</p>
                <p className="text-xs text-emerald-600 font-medium">Cliente</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:bg-red-50 hover:text-red-500 border border-slate-200 hover:border-red-200 transition-colors bg-white cursor-pointer"
            >
              <LogOut size={14}/> <span className="hidden sm:inline">Salir</span>
            </button>

            {/* Hamburger — mobile */}
            <button
              className="sm:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 border-none bg-transparent cursor-pointer"
              onClick={() => setMenuOpen(o => !o)}
            >
              {menuOpen ? <X size={20}/> : <Menu size={20}/>}
            </button>
          </div>
        </div>

        {/* Nav mobile */}
        {menuOpen && (
          <div className="sm:hidden border-t border-emerald-100 px-4 py-3 flex flex-col gap-1 bg-white">
            {links.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                   ${isActive ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-emerald-50'}`
                }
              >
                {l.icon} {l.label}
              </NavLink>
            ))}
          </div>
        )}
      </header>

      {/* Contenido */}
      <main className="flex-1 overflow-y-auto p-6 max-w-7xl w-full mx-auto">
        <Outlet />
      </main>

      {/* Widget ElevenLabs */}
      <elevenlabs-convai
        ref={widgetRef}
        agent-id="agent_0501knwr28cme2yb1ydevw4w648q"
      />
    </div>
  );
}

// ─── Layout para REPARTIDOR — sidebar ámbar ──────────────────────────────────
function RepartidorLayout({ user, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const links = ALL_LINKS.filter(l => l.roles.includes('repartidor'));

  return (
    <div className="flex h-screen bg-amber-50/30 overflow-hidden font-sans">

      <aside className={`bg-stone-900 flex flex-col flex-shrink-0 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>

        {/* Franja superior ámbar */}
        <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-500 flex-shrink-0" />

        <div className="flex items-center gap-3 px-4 py-5 border-b border-stone-700/50">
          <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-900/30">
            <Truck size={18} color="#fff" />
          </div>
          {!collapsed && (
            <div>
              <span className="text-stone-100 font-bold text-[15px] whitespace-nowrap block">LogisticaDB</span>
              <span className="text-amber-400 text-[11px] font-medium">Repartidor</span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-0.5">
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap overflow-hidden
                 ${isActive
                   ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm shadow-amber-900/30'
                   : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'}`
              }
            >
              <span className="flex-shrink-0">{l.icon}</span>
              {!collapsed && l.label}
            </NavLink>
          ))}
        </nav>

        {/* Info usuario */}
        {!collapsed && (
          <div className="px-3 py-3 border-t border-stone-700/50 border-b border-stone-700/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {user?.nombre?.[0]?.toUpperCase() ?? 'R'}
              </div>
              <div className="min-w-0">
                <p className="text-stone-200 text-xs font-semibold truncate">{user?.nombre}</p>
                <p className="text-amber-400 text-[10px]">En servicio</p>
              </div>
            </div>
          </div>
        )}

        <div className="p-2">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-stone-400 hover:bg-stone-800 hover:text-red-400 transition-colors whitespace-nowrap overflow-hidden cursor-pointer border-none bg-transparent"
          >
            <LogOut size={16} className="flex-shrink-0" />
            {!collapsed && 'Cerrar Sesión'}
          </button>
        </div>
      </aside>

      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-white border-b-2 border-amber-400/30 h-14 flex items-center justify-between px-6 flex-shrink-0 shadow-sm">
          <button
            onClick={() => setCollapsed(c => !c)}
            className="text-stone-500 hover:text-stone-900 p-1.5 rounded-lg hover:bg-amber-50 transition-colors border-none bg-transparent cursor-pointer"
          >
            {collapsed ? <Menu size={20}/> : <X size={20}/>}
          </button>

          <div className="flex items-center gap-2 text-sm text-stone-500">
            <Truck size={15} className="text-amber-500"/>
            <span className="font-medium text-stone-700">{user?.nombre}</span>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">Repartidor</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// ─── Layout para ADMIN — sidebar slate+azul ───────────────────────────────────
function SidebarLayout({ user, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const links = ALL_LINKS.filter(l => l.roles.includes(user?.rol));

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <aside className={`bg-slate-900 flex flex-col flex-shrink-0 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700/50">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <Package size={18} color="#fff" />
          </div>
          {!collapsed && (
            <span className="text-slate-100 font-bold text-[15px] whitespace-nowrap">LogisticaDB</span>
          )}
        </div>

        <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-0.5">
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap overflow-hidden
                 ${isActive
                   ? 'bg-blue-600 text-white shadow-sm'
                   : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`
              }
            >
              <span className="flex-shrink-0">{l.icon}</span>
              {!collapsed && l.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-2 border-t border-slate-700/50">
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors whitespace-nowrap overflow-hidden cursor-pointer border-none bg-transparent"
          >
            <LogOut size={16} className="flex-shrink-0" />
            {!collapsed && 'Cerrar Sesión'}
          </button>
        </div>
      </aside>

      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-14 flex items-center justify-between px-6 flex-shrink-0 shadow-sm">
          <button
            onClick={() => setCollapsed(c => !c)}
            className="text-slate-500 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer"
          >
            {collapsed ? <Menu size={20}/> : <X size={20}/>}
          </button>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 hidden sm:block">{user?.nombre}</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              {user?.nombre?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${ROL_BADGE[user?.rol] ?? 'bg-slate-100 text-slate-600'}`}>
              {user?.rol}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// ─── Layout principal — decide cuál renderizar ────────────────────────────────
export default function Layout() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const widgetRef = useRef(null);

  useEffect(() => {
    if (user?.rol !== 'cliente' || !user?.access_token) return;
    const el = widgetRef.current;
    if (!el) return;
    el.setAttribute('dynamic-variables', JSON.stringify({
      token:      user.access_token,
      cliente_id: user.cliente_id,
      nombre:     user.nombre,
    }));
  }, [user]);

  const handleLogout = async () => {
    await logout().catch(() => {});
    setUser(null);
    navigate('/');
  };

  if (user?.rol === 'cliente')    return <ClienteLayout    user={user} onLogout={handleLogout} widgetRef={widgetRef} />;
  if (user?.rol === 'repartidor') return <RepartidorLayout user={user} onLogout={handleLogout} />;
  return <SidebarLayout user={user} onLogout={handleLogout} />;
}
