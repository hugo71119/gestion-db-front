import React, { useEffect, useState } from 'react';
import { getVehiculos, crearVehiculo, actualizarVehiculo } from '../api';
import { Plus, X, Car } from 'lucide-react';

const EST_BADGE = {
  Disponible:    'bg-emerald-100 text-emerald-700',
  'En uso':      'bg-blue-100 text-blue-700',
  Mantenimiento: 'bg-amber-100 text-amber-700',
};

const LBL = 'block text-sm font-medium text-slate-700 mb-1.5';
const INP = 'w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all mb-4';
const SEL = `${INP} bg-white cursor-pointer`;

const empty = { tipo:'Moto', placa:'', capacidad:'', estado:'Disponible' };

export default function Vehiculos() {
  const [data,   setData]   = useState([]);
  const [modal,  setModal]  = useState(false);
  const [form,   setForm]   = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = () => getVehiculos().then(r => setData(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await crearVehiculo(form); setModal(false); setForm(empty); load(); }
    catch(err) { alert(err.response?.data?.error || 'Error'); }
    finally { setSaving(false); }
  };

  const cambiarEstado = async (v, est) => {
    await actualizarVehiculo(v.vehiculo_id, { ...v, estado: est }).catch(() => {});
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-slate-900">Vehículos</h1>
        <button
          onClick={() => { setModal(true); setForm(empty); }}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm shadow-blue-500/20 cursor-pointer border-none"
        >
          <Plus size={16}/> Nuevo Vehículo
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {data.map(v => (
          <div key={v.vehiculo_id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
              <Car size={22} className="text-blue-600"/>
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">{v.tipo}</h3>
            <p className="text-sm text-slate-500 mb-0.5">
              Placa: <span className="font-mono font-semibold text-slate-700">{v.placa}</span>
            </p>
            <p className="text-sm text-slate-500 mb-4">Capacidad: {v.capacidad} kg</p>
            <div className="flex items-center justify-between gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${EST_BADGE[v.estado] ?? 'bg-slate-100 text-slate-600'}`}>
                {v.estado}
              </span>
              <select
                className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 cursor-pointer outline-none focus:ring-1 focus:ring-blue-500"
                value={v.estado}
                onChange={e => cambiarEstado(v, e.target.value)}
              >
                <option>Disponible</option>
                <option>En uso</option>
                <option>Mantenimiento</option>
              </select>
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <p className="col-span-full text-center text-sm text-slate-400 py-10">Sin vehículos registrados</p>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-7 w-[400px] shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Nuevo Vehículo</h2>
              <button onClick={() => setModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer">
                <X size={20}/>
              </button>
            </div>
            <form onSubmit={handleSave}>
              <label className={LBL}>Tipo</label>
              <select className={SEL} value={form.tipo}
                      onChange={e => setForm({...form, tipo: e.target.value})}>
                <option>Moto</option>
                <option>Camioneta</option>
                <option>Furgoneta</option>
              </select>
              <label className={LBL}>Placa</label>
              <input className={INP} value={form.placa}
                     onChange={e => setForm({...form, placa: e.target.value})} required placeholder="ABC-123" />
              <label className={LBL}>Capacidad (kg)</label>
              <input className={INP} type="number" value={form.capacidad}
                     onChange={e => setForm({...form, capacidad: e.target.value})} min={0} />
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
