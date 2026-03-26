import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { login } from '../api';
import { Package, Eye, EyeOff, Truck, Shield, User } from 'lucide-react';

const ROLES = [
  { key:'admin',      label:'Administrador', icon:<Shield size={15}/>,
    active:'border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/30' },
  { key:'repartidor', label:'Repartidor',    icon:<Truck size={15}/>,
    active:'border-amber-500 bg-amber-50 text-amber-700 ring-2 ring-amber-500/30' },
  { key:'cliente',    label:'Cliente',       icon:<User size={15}/>,
    active:'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/30' },
];

export default function Login() {
  const { setUser } = useAuth();
  const navigate    = useNavigate();
  const [rol,     setRol]     = useState('admin');
  const [usuario, setUsuario] = useState('');
  const [pass,    setPass]    = useState('');
  const [show,    setShow]    = useState(false);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login({ tipo: rol, usuario, contrasena: pass });
      setUser(res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen font-sans">

      <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-slate-900 px-12 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/30">
            <Package size={38} color="#fff" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">LogisticaDB</h1>
          <p className="text-slate-400 text-[15px] max-w-xs leading-relaxed">
            Sistema Integral para la Gestión de<br />Logística y Entregas
          </p>

          <div className="flex gap-6 mt-12">
            {[{abbr:'SQL',label:'SQL Server'},{abbr:'API',label:'Flask'},{abbr:'JSX',label:'React'}].map(s => (
              <div key={s.label} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-blue-400 text-[11px] font-bold border border-slate-700/60 shadow-inner">
                  {s.abbr}
                </div>
                <span className="text-slate-500 text-xs">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center bg-white w-full lg:w-[480px] px-10 py-12">
        <div className="w-full max-w-sm">

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Iniciar Sesión</h2>
            <p className="text-slate-500 text-sm">Selecciona tu rol para continuar</p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 mb-7">
            {ROLES.map(r => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRol(r.key)}
                className={`flex flex-col items-center gap-2 py-3 px-2 rounded-xl border-2 text-xs font-semibold transition-all cursor-pointer
                  ${rol === r.key ? r.active : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}
              >
                {r.icon}
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {rol === 'cliente' ? 'Email' : 'Usuario'}
              </label>
              <input
                className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={usuario}
                onChange={e => setUsuario(e.target.value)}
                placeholder={rol === 'cliente' ? 'correo@email.com' : 'nombre_usuario'}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Contraseña</label>
              <div className="relative">
                <input
                  className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 pr-11 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  type={show ? 'text' : 'password'}
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {show ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-600 text-sm text-center bg-red-50 border border-red-100 py-2 px-3 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl text-sm transition-all disabled:opacity-60 shadow-md shadow-blue-500/20 cursor-pointer mt-1"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="text-slate-400 text-xs text-center mt-6">
            Demo admin: <span className="font-mono text-slate-500">admin</span> / <span className="font-mono text-slate-500">Admin2024!</span>
          </p>
        </div>
      </div>
    </div>
  );
}
