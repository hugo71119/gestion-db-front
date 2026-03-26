import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { logout } from '../api';
import {
  LayoutDashboard, Users, ShoppingCart, Truck,
  UserCheck, Car, CreditCard, BarChart2,
  LogOut, Menu, X, Package
} from 'lucide-react';

const ALL_LINKS = [
  { to:'/dashboard',    icon:<LayoutDashboard size={18}/>, label:'Dashboard',    roles:['admin','repartidor','cliente'] },
  { to:'/clientes',     icon:<Users size={18}/>,           label:'Clientes',     roles:['admin'] },
  { to:'/pedidos',      icon:<ShoppingCart size={18}/>,    label:'Pedidos',      roles:['admin','cliente'] },
  { to:'/entregas',     icon:<Truck size={18}/>,           label:'Entregas',     roles:['admin','repartidor'] },
  { to:'/repartidores', icon:<UserCheck size={18}/>,       label:'Repartidores', roles:['admin'] },
  { to:'/vehiculos',    icon:<Car size={18}/>,             label:'Vehículos',    roles:['admin'] },
  { to:'/pagos',        icon:<CreditCard size={18}/>,      label:'Pagos',        roles:['admin'] },
  { to:'/reportes',     icon:<BarChart2 size={18}/>,       label:'Reportes',     roles:['admin'] },
];

const ROL_BADGE = {
  admin:      'bg-indigo-100 text-indigo-700',
  repartidor: 'bg-amber-100 text-amber-700',
  cliente:    'bg-emerald-100 text-emerald-700',
};

export default function Layout() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const links = ALL_LINKS.filter(l => l.roles.includes(user?.rol));

  const handleLogout = async () => {
    await logout().catch(() => {});
    setUser(null);
    navigate('/login');
  };

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
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors whitespace-nowrap overflow-hidden"
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
            className="text-slate-500 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
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
