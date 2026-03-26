import React, { useEffect, useState } from 'react';
import {
  getClasificacion, getRankingRepartidores,
  getEntregasZona, getAuditoriaPedidos, getLogErrores, getPivotEntregas
} from '../api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import { BarChart2, Users, Truck, MapPin, Shield, AlertTriangle } from 'lucide-react';

const COLORS = ['#3b82f6','#6366f1','#10b981','#f59e0b','#ef4444'];

const CLASIF_BADGE = {
  VIP:      'bg-amber-100 text-amber-700',
  Frecuente:'bg-blue-100 text-blue-700',
  Regular:  'bg-slate-100 text-slate-600',
  Nuevo:    'bg-emerald-100 text-emerald-700',
};

const ACCION_BADGE = {
  insercion:  'bg-emerald-100 text-emerald-700',
  eliminacion:'bg-red-100 text-red-700',
  actualizacion:'bg-blue-100 text-blue-700',
};

const TH = 'px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200';
const TD = 'px-4 py-3.5 text-sm text-slate-700 border-b border-slate-100';

const TABS = [
  { key:'clasificacion', label:'Clasificación Clientes', icon:<Users size={14}/>      },
  { key:'ranking',       label:'Ranking Repartidores',   icon:<Truck size={14}/>      },
  { key:'zona',          label:'Entregas por Zona',      icon:<MapPin size={14}/>     },
  { key:'pivot',         label:'PIVOT Mensual',          icon:<BarChart2 size={14}/>  },
  { key:'auditoria',     label:'Auditoría Pedidos',      icon:<Shield size={14}/>     },
  { key:'errores',       label:'Log Errores',            icon:<AlertTriangle size={14}/> },
];

export default function Reportes() {
  const [tab,       setTab]       = useState('clasificacion');
  const [clasif,    setClasif]    = useState([]);
  const [ranking,   setRanking]   = useState([]);
  const [zona,      setZona]      = useState([]);
  const [pivot,     setPivot]     = useState([]);
  const [auditoria, setAuditoria] = useState([]);
  const [errores,   setErrores]   = useState([]);

  useEffect(() => {
    getClasificacion().then(r => setClasif(r.data)).catch(() => {});
    getRankingRepartidores().then(r => setRanking(r.data)).catch(() => {});
    getEntregasZona().then(r => setZona(r.data)).catch(() => {});
    getPivotEntregas().then(r => setPivot(r.data)).catch(() => {});
    getAuditoriaPedidos().then(r => setAuditoria(r.data)).catch(() => {});
    getLogErrores().then(r => setErrores(r.data)).catch(() => {});
  }, []);

  const rankChartData = ranking.slice(0,8).map(r => ({
    name: r.nombre_completo?.split(' ')[0],
    entregas: r.total_entregas
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-5">Reportes y Análisis</h1>

      <div className="flex gap-2 flex-wrap mb-6">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border-none
              ${tab === t.key
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'clasificacion' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Clasificación de Clientes (CASE)</h3>
          </div>
          <table className="w-full border-collapse">
            <thead><tr>
              {['ID','Nombre','Email','Total Pedidos','Total Gastado','Clasificación'].map(h => (
                <th key={h} className={TH}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {clasif.map(c => (
                <tr key={c.cliente_id} className="hover:bg-slate-50/70 transition-colors">
                  <td className={`${TD} text-slate-500`}>#{c.cliente_id}</td>
                  <td className={`${TD} font-medium text-slate-900`}>{c.nombre_completo}</td>
                  <td className={TD}>{c.email}</td>
                  <td className={TD}>{c.total_pedidos}</td>
                  <td className={`${TD} font-semibold text-indigo-600`}>${Number(c.total_gastado ?? 0).toLocaleString()}</td>
                  <td className={TD}>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${CLASIF_BADGE[c.clasificacion] ?? 'bg-slate-100 text-slate-600'}`}>
                      {c.clasificacion}
                    </span>
                  </td>
                </tr>
              ))}
              {clasif.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">Sin datos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'ranking' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Ranking de Repartidores (RANK())</h3>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={rankChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                <XAxis dataKey="name" tick={{ fontSize:12 }}/>
                <YAxis tick={{ fontSize:12 }}/>
                <Tooltip contentStyle={{ borderRadius:8, border:'1px solid #e2e8f0', fontSize:12 }}/>
                <Bar dataKey="entregas" radius={[4,4,0,0]}>
                  {rankChartData.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <table className="w-full border-collapse">
            <thead><tr>
              {['#','Repartidor','Entregas','Exitosas','Estado'].map(h => (
                <th key={h} className={TH}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {ranking.map(r => (
                <tr key={r.repartidor_id} className="hover:bg-slate-50/70 transition-colors">
                  <td className={`${TD} font-bold text-indigo-600`}>#{r.ranking}</td>
                  <td className={`${TD} font-medium`}>{r.nombre_completo}</td>
                  <td className={TD}>{r.total_entregas}</td>
                  <td className={TD}>{r.entregas_exitosas}</td>
                  <td className={TD}>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${r.estado==='Activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {r.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'zona' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Entregas por Zona (SP Reporte)</h3>
          </div>
          {zona.length === 0
            ? <p className="px-5 py-10 text-center text-sm text-slate-400">Sin datos de entregas completadas</p>
            : <table className="w-full border-collapse">
                <thead><tr>
                  {['Zona','Total Entregas','Total Facturado','Tiempo Promedio (min)'].map(h => (
                    <th key={h} className={TH}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {zona.map((z,i) => (
                    <tr key={i} className="hover:bg-slate-50/70">
                      <td className={`${TD} font-medium`}>{z.zona}</td>
                      <td className={TD}>{z.total_entregas}</td>
                      <td className={`${TD} font-semibold text-indigo-600`}>${Number(z.total_facturado??0).toLocaleString()}</td>
                      <td className={TD}>{z.minutos_promedio ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>
      )}

      {tab === 'pivot' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Entregas por Mes (PIVOT)</h3>
          </div>
          {pivot.length === 0
            ? <p className="px-5 py-10 text-center text-sm text-slate-400">Sin datos suficientes para PIVOT</p>
            : <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead><tr>
                    {Object.keys(pivot[0]).map(k => <th key={k} className={TH}>{k}</th>)}
                  </tr></thead>
                  <tbody>
                    {pivot.map((row,i) => (
                      <tr key={i} className="hover:bg-slate-50/70">
                        {Object.values(row).map((v,j) => <td key={j} className={TD}>{v ?? '-'}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          }
        </div>
      )}

      {tab === 'auditoria' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Auditoría de Pedidos (Triggers)</h3>
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            <table className="w-full border-collapse">
              <thead><tr>
                {['ID','Pedido','Cliente','Estado','Acción','Fecha','Usuario'].map(h => (
                  <th key={h} className={TH}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {auditoria.map(a => (
                  <tr key={a.auditoria_id} className="hover:bg-slate-50/70">
                    <td className={`${TD} text-slate-500`}>{a.auditoria_id}</td>
                    <td className={`${TD} font-medium text-indigo-600`}>#{a.pedido_id}</td>
                    <td className={TD}>#{a.cliente_id}</td>
                    <td className={TD}>{a.estado}</td>
                    <td className={TD}>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${ACCION_BADGE[a.accion] ?? 'bg-slate-100 text-slate-600'}`}>
                        {a.accion}
                      </span>
                    </td>
                    <td className={`${TD} text-slate-500`}>{a.fecha?.replace('T',' ').substring(0,16)}</td>
                    <td className={TD}>{a.usuario}</td>
                  </tr>
                ))}
                {auditoria.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">Sin registros</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'errores' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Log de Errores (TRY/CATCH)</h3>
          </div>
          {errores.length === 0
            ? <p className="px-5 py-10 text-center text-sm text-emerald-600 font-medium">
                ✓ Sin errores registrados
              </p>
            : <table className="w-full border-collapse">
                <thead><tr>
                  {['ID','Mensaje','Número','Severidad','Procedimiento','Fecha'].map(h => (
                    <th key={h} className={TH}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {errores.map(e => (
                    <tr key={e.error_id} className="hover:bg-slate-50/70">
                      <td className={`${TD} text-slate-500`}>{e.error_id}</td>
                      <td className={`${TD} max-w-xs truncate`} title={e.mensaje}>{e.mensaje}</td>
                      <td className={TD}>{e.numero}</td>
                      <td className={TD}>{e.severidad}</td>
                      <td className={TD}>{e.procedimiento ?? '-'}</td>
                      <td className={`${TD} text-slate-500`}>{e.fecha?.replace('T',' ').substring(0,16)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </div>
      )}
    </div>
  );
}
