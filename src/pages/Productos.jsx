import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { getProductos, getCategorias, crearProducto } from '../api';
import { Package, Plus, X } from 'lucide-react';
import Toast from '../components/Toast';

const LBL = 'block text-sm font-medium text-slate-700 mb-1.5';
const INP = 'w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all mb-4';

const CAT_COLORS = {
  'Embalaje':     'bg-blue-100 text-blue-700',
  'Electrónica':  'bg-purple-100 text-purple-700',
  'Herramienta':  'bg-orange-100 text-orange-700',
  'Documento':    'bg-yellow-100 text-yellow-700',
  'Perecedero':   'bg-rose-100 text-rose-700',
  'General':      'bg-slate-100 text-slate-600',
};

const emptyForm = { nombre: '', descripcion: '', precio: '', categoria: 'General', disponible: true };

export default function Productos() {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'admin';

  const [productos,  setProductos]  = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [catFiltro,  setCatFiltro]  = useState('Todos');
  const [modal,      setModal]      = useState(false);
  const [form,       setForm]       = useState(emptyForm);
  const [saving,     setSaving]     = useState(false);
  const [toast,      setToast]      = useState(false);

  const load = () => {
    getProductos(isAdmin ? { todos: 1 } : {}).then(r => setProductos(r.data)).catch(() => {});
    getCategorias().then(r => setCategorias(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const filtered = catFiltro === 'Todos' ? productos : productos.filter(p => p.categoria === catFiltro);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await crearProducto({ ...form, precio: parseFloat(form.precio) });
      setModal(false);
      setForm(emptyForm);
      setToast(true);
      load();
    } catch (err) { alert(err.response?.data?.error || 'Error al guardar'); }
    finally { setSaving(false); }
  };

  const catBadge = (cat) => CAT_COLORS[cat] ?? 'bg-slate-100 text-slate-600';


  if (isAdmin) {
    return (
      <div>
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold text-slate-900">Productos</h1>
          <button
            onClick={() => setModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm shadow-blue-500/20 cursor-pointer border-none"
          >
            <Plus size={16}/> Agregar Producto
          </button>
        </div>

        <div className="flex gap-1.5 mb-5 bg-white border border-slate-200 p-1 rounded-xl w-fit shadow-sm">
          {['Todos', ...categorias].map(c => (
            <button
              key={c}
              onClick={() => setCatFiltro(c)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border-none
                ${catFiltro === c ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 bg-transparent'}`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Nombre</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Descripción</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Categoría</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Precio</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.producto_id} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-4 font-semibold text-slate-900">{p.nombre}</td>
                  <td className="px-5 py-4 text-slate-500 max-w-xs truncate hidden md:table-cell">{p.descripcion || '—'}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${catBadge(p.categoria)}`}>
                      {p.categoria}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-indigo-600">
                    ${Number(p.precio).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${p.disponible ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                      {p.disponible ? 'Disponible' : 'No disponible'}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400">
                    <Package size={36} className="mx-auto mb-3 text-slate-300"/>
                    <p className="text-sm">No hay productos</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {modal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-7 w-[480px] shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900">Nuevo Producto</h2>
                <button onClick={() => setModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer">
                  <X size={20}/>
                </button>
              </div>
              <form onSubmit={handleSave}>
                <label className={LBL}>Nombre</label>
                <input className={INP} required placeholder="Ej: Caja Mediana"
                  value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />

                <label className={LBL}>Descripción</label>
                <input className={INP} placeholder="Descripción breve del producto"
                  value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={LBL}>Precio ($)</label>
                    <input className={INP} type="number" min="0" step="0.01" required placeholder="0.00"
                      value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} />
                  </div>
                  <div>
                    <label className={LBL}>Categoría</label>
                    <input className={INP} placeholder="Ej: Embalaje"
                      value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} />
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <input type="checkbox" id="disponible" checked={form.disponible}
                    onChange={e => setForm({ ...form, disponible: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 cursor-pointer" />
                  <label htmlFor="disponible" className="text-sm font-medium text-slate-700 cursor-pointer">
                    Producto disponible
                  </label>
                </div>

                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setModal(false)}
                    className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50 cursor-pointer bg-white">
                    Cancelar
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-60 cursor-pointer border-none">
                    {saving ? 'Guardando...' : <><Plus size={15}/> Agregar</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <Toast message="¡Producto agregado exitosamente!" show={toast} onClose={() => setToast(false)} />
      </div>
    );
  }

   return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Catálogo de Productos</h1>
        <p className="text-sm text-slate-500 mt-1">Productos disponibles para incluir en tu pedido</p>
      </div>

      <div className="flex gap-1.5 mb-5 bg-white border border-emerald-100 p-1 rounded-xl w-fit shadow-sm flex-wrap">
        {['Todos', ...categorias].map(c => (
          <button
            key={c}
            onClick={() => setCatFiltro(c)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border-none
              ${catFiltro === c ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-emerald-50 bg-transparent'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-slate-400">
          <Package size={40} className="mb-3 text-slate-300"/>
          <p className="text-sm">No hay productos en esta categoría</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div key={p.producto_id} className="bg-white rounded-xl border border-emerald-100 shadow-sm p-5 hover:shadow-md transition-shadow flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Package size={20} className="text-emerald-600"/>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${catBadge(p.categoria)}`}>
                  {p.categoria}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 mb-1">{p.nombre}</h3>
              {p.descripcion && (
                <p className="text-xs text-slate-500 leading-relaxed flex-1">{p.descripcion}</p>
              )}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                <span className="text-xl font-bold text-emerald-700">
                  ${Number(p.precio).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-full">
                  Disponible
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
