import React, { useEffect, useState } from 'react';
import { getRepartidores, crearRepartidor, cambiarEstadoRep } from '../api';
import { Plus, X } from 'lucide-react';

const LBL = 'block text-sm font-medium text-slate-700 mb-1.5';
const INP = 'w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all mb-4';

const emptyForm = { nombre_completo:'', licencia_conducir:'', telefono:'', usuario:'', contrasena:'' };

export default function Repartidores() {
  const [data,   setData]   = useState([]);
  const [modal,  setModal]  = useState(false);
  const [form,   setForm]   = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => getRepartidores().then(r => setData(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await crearRepartidor(form); setModal(false); setForm(emptyForm); load(); }
    catch(err) { alert(err.response?.data?.error || 'Error'); }
    finally { setSaving(false); }
  };

  const toggleEstado = async (r) => {
    const nuevo = r.estado === 'Activo' ? 'Inactivo' : 'Activo';
    await cambiarEstadoRep(r.repartidor_id, nuevo).catch(() => {});
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-slate-900">Repartidores</h1>
        <button
          onClick={() => { setModal(true); setForm(emptyForm); }}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm shadow-blue-500/20 cursor-pointer border-none"
        >
          <Plus size={16}/> Nuevo Repartidor
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {data.map(r => (
          <div key={r.repartidor_id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg mb-3 shadow-sm">
              {r.nombre_completo?.[0]}
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">{r.nombre_completo}</h3>
            <p className="text-sm text-slate-500 mb-0.5">{r.telefono}</p>
            <p className="text-xs text-slate-400 mb-4">@{r.usuario}</p>
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${r.estado === 'Activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {r.estado}
              </span>
              <button
                onClick={() => toggleEstado(r)}
                className="px-3 py-1.5 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-medium text-slate-600 cursor-pointer transition-colors"
              >
                {r.estado === 'Activo' ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <p className="col-span-full text-center text-sm text-slate-400 py-10">Sin repartidores registrados</p>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-7 w-[460px] shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Nuevo Repartidor</h2>
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
                  <label className={LBL}>Teléfono</label>
                  <input className={INP} value={form.telefono}
                         onChange={e => setForm({...form, telefono: e.target.value})} />
                </div>
                <div>
                  <label className={LBL}>Licencia</label>
                  <input className={INP} value={form.licencia_conducir}
                         onChange={e => setForm({...form, licencia_conducir: e.target.value})}
                         placeholder="Se cifrará" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LBL}>Usuario</label>
                  <input className={INP} value={form.usuario}
                         onChange={e => setForm({...form, usuario: e.target.value})} required />
                </div>
                <div>
                  <label className={LBL}>Contraseña</label>
                  <input className={INP} type="password" value={form.contrasena}
                         onChange={e => setForm({...form, contrasena: e.target.value})} required
                         placeholder="Se cifrará AES-256" />
                </div>
              </div>

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
