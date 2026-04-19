import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { getEntregas, entregasRepartidor, actualizarEstadoEntrega } from '../api';
import { Truck, CheckCircle, Clock, AlertCircle, X, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Toast from '../components/Toast';

const EST_BADGE = {
  'En transito': 'bg-blue-100 text-blue-700',
  Entregado:     'bg-emerald-100 text-emerald-700',
  Fallido:       'bg-red-100 text-red-700',
};

const EST_ICON = {
  'En transito': <Clock size={13}/>,
  Entregado: <CheckCircle size={13}/>,
  Fallido: <AlertCircle size={13}/>,
};

const TH = 'px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200';
const TD = 'px-4 py-3.5 text-sm text-slate-700 border-b border-slate-100';

export default function Entregas() {
  const { user } = useAuth();
  const [entregas,   setEntregas]   = useState([]);
  const [evidModal,  setEvidModal]  = useState(null);
  const [evidencia,  setEvidencia]  = useState('');
  const [saving,     setSaving]     = useState(false);
  const [successId,  setSuccessId]  = useState(null);
  const [toast,      setToast]      = useState(false);

  const load = () => {
    const fn = user?.rol === 'repartidor'
      ? () => entregasRepartidor(user.repartidor_id)
      : getEntregas;
    fn().then(r => setEntregas(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const abrirConfirmar = (id) => {
    setEvidencia('');
    setEvidModal(id);
  };

  const marcarEntregado = async () => {
    if (!evidencia.trim()) return;
    setSaving(true);
    try {
      await actualizarEstadoEntrega(evidModal, 'Entregado', evidencia);
      const id = evidModal;
      setEvidModal(null);
      setSuccessId(id);
      setToast(true);
      load();
    } catch(e) { alert(e.response?.data?.error || 'Error'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-5">Entregas</h1>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr>{['ID','Pedido','Repartidor','Vehículo','Placa','Salida','Entrega','Estado','Acción'].map(h => (
              <th key={h} className={TH}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {entregas.map(e => {
              const badge = EST_BADGE[e.estado] ?? 'bg-slate-100 text-slate-600';
              const icon  = EST_ICON[e.estado];
              return (
                <tr key={e.entrega_id} className="hover:bg-slate-50/70 transition-colors">
                  <td className={`${TD} text-slate-500`}>#{e.entrega_id}</td>
                  <td className={`${TD} font-medium text-indigo-600`}>#{e.pedido_id}</td>
                  <td className={`${TD} font-medium`}>{e.repartidor}</td>
                  <td className={TD}>{e.vehiculo}</td>
                  <td className={`${TD} font-mono text-xs`}>{e.placa}</td>
                  <td className={`${TD} text-slate-500`}>{e.fecha_salida ? new Date(e.fecha_salida).toLocaleDateString('es-MX', {day:'2-digit', month:'short', year:'numeric'}) : '-'}</td>
                  <td className={`${TD} text-slate-500`}>{e.fecha_entrega ? new Date(e.fecha_entrega).toLocaleDateString('es-MX', {day:'2-digit', month:'short', year:'numeric'}) : '-'}</td>
                  <td className={TD}>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${badge}`}>
                      {icon} {e.estado}
                    </span>
                  </td>
                  <td className={TD}>
                    {e.estado === 'En transito' && (
                      <button
                        onClick={() => abrirConfirmar(e.entrega_id)}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors cursor-pointer"
                      >
                        Confirmar
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {entregas.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-400">
                <Truck size={32} className="mx-auto mb-2 text-slate-300"/>
                Sin entregas registradas
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
      {evidModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-7 w-[440px] shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-500"/>
                <h2 className="text-lg font-bold text-slate-900">Confirmar Entrega</h2>
              </div>
              <button onClick={() => setEvidModal(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer">
                <X size={20}/>
              </button>
            </div>

            <p className="text-sm text-slate-500 mb-4">
              Escribe la evidencia de entrega para la entrega <span className="font-semibold text-slate-800">#{evidModal}</span>. Este texto se cifrará con <span className="font-medium text-indigo-600">AES-256</span>.
            </p>

            <textarea
              className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none mb-5"
              rows={3}
              placeholder="Ej: Entregado en puerta principal, recibió María López a las 14:30"
              value={evidencia}
              onChange={e => setEvidencia(e.target.value)}
            />

            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setEvidModal(null)}
                      className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50 cursor-pointer bg-white">
                Cancelar
              </button>
              <button
                onClick={marcarEntregado}
                disabled={!evidencia.trim() || saving}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 cursor-pointer border-none"
              >
                <CheckCircle size={15}/> {saving ? 'Guardando...' : 'Confirmar Entrega'}
              </button>
            </div>
          </div>
        </div>
      )}
      {successId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-[400px] shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-emerald-600"/>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">¡Entrega confirmada!</h2>
            <p className="text-slate-500 text-sm mb-1">La evidencia fue cifrada con AES-256 y guardada.</p>
            <p className="text-indigo-600 font-bold text-lg mb-6">Entrega #{successId}</p>
            <button
              onClick={() => setSuccessId(null)}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer border-none"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      <Toast message="¡Entrega confirmada y evidencia cifrada!" show={toast} onClose={() => setToast(false)} />
    </div>
  );
}
