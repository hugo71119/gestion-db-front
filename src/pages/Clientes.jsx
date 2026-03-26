import React, { useEffect, useState } from 'react';
import { getClientes, crearCliente, eliminarCliente } from '../api';
import { Plus, Search, Trash2, X } from 'lucide-react';

const CLASIF_BADGE = {
  VIP:      'bg-amber-100 text-amber-700',
  Frecuente:'bg-blue-100 text-blue-700',
  Regular:  'bg-slate-100 text-slate-600',
  Nuevo:    'bg-emerald-100 text-emerald-700',
};

const TH  = 'px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200';
const TD  = 'px-4 py-3.5 text-sm text-slate-700 border-b border-slate-100';
const LBL = 'block text-sm font-medium text-slate-700 mb-1.5';
const INP = 'w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all mb-4';
const SEL = `${INP} bg-white cursor-pointer`;

const empty = { nombre_completo:'', email:'', telefono:'', direccion:'', tipo_documento:'INE', numero_documento:'' };

const clasif = (total) => {
  if (total >= 10) return 'VIP';
  if (total >= 5)  return 'Frecuente';
  if (total >= 1)  return 'Regular';
  return 'Nuevo';
};

export default function Clientes() {
  const [data,   setData]   = useState([]);
  const [search, setSearch] = useState('');
  const [modal,  setModal]  = useState(false);
  const [form,   setForm]   = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const load = () => getClientes().then(r => setData(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const filtered = data.filter(c =>
    c.nombre_completo?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await crearCliente(form);
      setModal(false); setForm(empty); load();
    } catch(err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar cliente?')) return;
    await eliminarCliente(id).catch(() => {});
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
        <button
          onClick={() => { setModal(true); setForm(empty); }}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm shadow-blue-500/20 cursor-pointer border-none"
        >
          <Plus size={16}/> Nuevo Cliente
        </button>
      </div>

      <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 mb-4 w-80 shadow-sm">
        <Search size={15} className="text-slate-400 flex-shrink-0" />
        <input
          className="border-none outline-none text-sm text-slate-700 flex-1 bg-transparent placeholder:text-slate-400"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr>{['ID','Nombre','Email','Teléfono','Tipo Doc','Clasificación','Registro','Acciones'].map(h => (
              <th key={h} className={TH}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const cl = clasif(c.total_pedidos ?? 0);
              return (
                <tr key={c.cliente_id} className="hover:bg-slate-50/70 transition-colors">
                  <td className={`${TD} text-slate-500`}>#{c.cliente_id}</td>
                  <td className={`${TD} font-medium text-slate-900`}>{c.nombre_completo}</td>
                  <td className={TD}>{c.email}</td>
                  <td className={TD}>{c.telefono}</td>
                  <td className={TD}>{c.tipo_documento}</td>
                  <td className={TD}>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${CLASIF_BADGE[cl]}`}>{cl}</span>
                  </td>
                  <td className={`${TD} text-slate-500`}>{c.fecha_registro?.split('T')[0] ?? '-'}</td>
                  <td className={TD}>
                    <button
                      onClick={() => handleDelete(c.cliente_id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer border-none bg-transparent"
                    >
                      <Trash2 size={15}/>
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-400">Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-7 w-[500px] max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Registrar Cliente</h2>
              <button onClick={() => setModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer">
                <X size={20}/>
              </button>
            </div>
            <form onSubmit={handleSave}>
              <label className={LBL}>Nombre Completo</label>
              <input className={INP} value={form.nombre_completo}
                     onChange={e => setForm({...form, nombre_completo: e.target.value})} required />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LBL}>Email</label>
                  <input className={INP} type="email" value={form.email}
                         onChange={e => setForm({...form, email: e.target.value})} required />
                </div>
                <div>
                  <label className={LBL}>Teléfono</label>
                  <input className={INP} value={form.telefono}
                         onChange={e => setForm({...form, telefono: e.target.value})} />
                </div>
              </div>

              <label className={LBL}>Dirección</label>
              <input className={INP} value={form.direccion}
                     onChange={e => setForm({...form, direccion: e.target.value})} />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LBL}>Tipo Documento</label>
                  <select className={SEL} value={form.tipo_documento}
                          onChange={e => setForm({...form, tipo_documento: e.target.value})}>
                    <option>INE</option>
                    <option>pasaporte</option>
                  </select>
                </div>
                <div>
                  <label className={LBL}>Número Documento</label>
                  <input className={INP} value={form.numero_documento}
                         onChange={e => setForm({...form, numero_documento: e.target.value})}
                         placeholder="Se cifrará AES-256" />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm mb-4 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

              <div className="flex gap-3 justify-end mt-2">
                <button type="button" onClick={() => setModal(false)}
                        className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50 cursor-pointer bg-white">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-60 cursor-pointer border-none">
                  {saving ? 'Guardando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
