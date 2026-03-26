import React, { useEffect, useState } from 'react';
import { getPagos, registrarPago, getPedidos } from '../api';
import { Plus, X, CreditCard } from 'lucide-react';

const TH  = 'px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200';
const TD  = 'px-4 py-3.5 text-sm text-slate-700 border-b border-slate-100';

const METODO_BADGE = {
  'Tarjeta':      'bg-blue-50 text-blue-700',
  'Efectivo':     'bg-emerald-50 text-emerald-700',
  'Transferencia':'bg-purple-50 text-purple-700',
};

const fmtFecha = (f) => f ? new Date(f).toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'numeric' }) : '-';
const LBL = 'block text-sm font-medium text-slate-700 mb-1.5';
const INP = 'w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all mb-4';
const SEL = `${INP} bg-white cursor-pointer`;

const emptyForm = { pedido_id:'', metodo_pago:'Tarjeta', referencia_pago:'', monto:'' };

export default function Pagos() {
  const [data,    setData]    = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState(emptyForm);
  const [saving,  setSaving]  = useState(false);

  const load = () => getPagos().then(r => setData(r.data)).catch(() => {});
  useEffect(() => {
    load();
    getPedidos().then(r => setPedidos(r.data)).catch(() => {});
  }, []);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await registrarPago(form); setModal(false); setForm(emptyForm); load(); }
    catch(err) { alert(err.response?.data?.error || 'Error'); }
    finally { setSaving(false); }
  };

  const total = data.reduce((s, p) => s + Number(p.monto ?? 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pagos</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Total facturado: <span className="font-bold text-indigo-600">${total.toLocaleString()}</span>
          </p>
        </div>
        <button
          onClick={() => { setModal(true); setForm(emptyForm); }}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm shadow-blue-500/20 cursor-pointer border-none"
        >
          <Plus size={16}/> Registrar Pago
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr>{['ID','Pedido','Cliente','Método','Monto','Fecha'].map(h => (
              <th key={h} className={TH}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {data.map(p => (
              <tr key={p.pago_id} className="hover:bg-slate-50/70 transition-colors">
                <td className={`${TD} text-slate-500`}>#{p.pago_id}</td>
                <td className={`${TD} font-medium text-indigo-600`}>#{p.pedido_id}</td>
                <td className={`${TD} font-medium`}>{p.cliente}</td>
                <td className={TD}>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${METODO_BADGE[p.metodo_pago] ?? 'bg-slate-100 text-slate-600'}`}>
                    <CreditCard size={11}/> {p.metodo_pago}
                  </span>
                </td>
                <td className={`${TD} font-bold text-indigo-600`}>${Number(p.monto).toLocaleString()}</td>
                <td className={`${TD} text-slate-500`}>{fmtFecha(p.fecha_pago)}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">Sin pagos registrados</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-7 w-[420px] shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Registrar Pago</h2>
              <button onClick={() => setModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer">
                <X size={20}/>
              </button>
            </div>
            <form onSubmit={handleSave}>
              <label className={LBL}>Pedido</label>
              <select className={SEL} value={form.pedido_id}
                      onChange={e => setForm({...form, pedido_id: e.target.value})} required>
                <option value="">Seleccionar pedido...</option>
                {pedidos.filter(p => p.estado !== 'Cancelado').map(p => (
                  <option key={p.pedido_id} value={p.pedido_id}>
                    #{p.pedido_id} - {p.cliente} (${p.total})
                  </option>
                ))}
              </select>
              <label className={LBL}>Método de Pago</label>
              <select className={SEL} value={form.metodo_pago}
                      onChange={e => setForm({...form, metodo_pago: e.target.value})}>
                <option>Tarjeta</option>
                <option>Efectivo</option>
                <option>Transferencia</option>
              </select>
              <label className={LBL}>Referencia (se cifrará AES-256)</label>
              <input className={INP} value={form.referencia_pago}
                     onChange={e => setForm({...form, referencia_pago: e.target.value})} placeholder="REF-XXXX" />
              <label className={LBL}>Monto</label>
              <input className={INP} type="number" value={form.monto}
                     onChange={e => setForm({...form, monto: e.target.value})} required min={0} step="0.01" />
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
