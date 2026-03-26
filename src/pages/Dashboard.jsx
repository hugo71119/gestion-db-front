import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { getResumen, getResumenRepartidor, getResumenCliente, getRankingRepartidores } from '../api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { ShoppingCart, Truck, CheckCircle, DollarSign,
         UserCheck, TrendingUp, Clock, Package } from 'lucide-react';

const PIE_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'];
const PIE_LABELS = ['Pendientes', 'En Ruta', 'Entregados', 'Cancelados'];

function CustomTooltipPie({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value, payload: p } = payload[0];
  const total = p.total;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-2.5 text-sm">
      <p className="font-semibold text-slate-800">{name}</p>
      <p className="text-slate-500">{value} pedidos · <span className="font-medium text-indigo-600">{total > 0 ? ((value/total)*100).toFixed(1) : 0}%</span></p>
    </div>
  );
}


const ESTADO_BADGE = {
  Pendiente:     'bg-yellow-100 text-yellow-800',
  'En ruta':     'bg-blue-100 text-blue-800',
  'En transito': 'bg-blue-100 text-blue-800',
  Entregado:     'bg-emerald-100 text-emerald-800',
  Cancelado:     'bg-red-100 text-red-800',
};

function KpiCard({ label, value, icon, iconBg, iconColor }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${iconBg}`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <div className={`text-3xl font-bold mb-0.5 ${iconColor}`}>{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
}

const TH = 'px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200';
const TD = 'px-4 py-3.5 text-sm text-slate-700 border-b border-slate-100';

function DashboardAdmin() {
  const [kpi,  setKpi]  = useState(null);
  const [rank, setRank] = useState([]);

  useEffect(() => {
    getResumen().then(r => setKpi(r.data)).catch(() => {});
    getRankingRepartidores().then(r => setRank(r.data)).catch(() => {});
  }, []);

  const pieData = kpi ? [
    { name:'Pendientes', value: kpi.pedidos_pendientes },
    { name:'En Ruta',    value: kpi.pedidos_en_ruta    },
    { name:'Entregados', value: kpi.pedidos_entregados },
  ] : [];

  const rankChart = rank.slice(0,5).map(r => ({
    name: r.nombre_completo?.split(' ')[0],
    entregas: r.total_entregas
  }));

  return (
    <>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total Pedidos"   value={kpi?.total_pedidos ?? '—'}
                 icon={<ShoppingCart size={20}/>} iconBg="bg-blue-50"   iconColor="text-blue-600"/>
        <KpiCard label="En Ruta"         value={kpi?.pedidos_en_ruta ?? '—'}
                 icon={<Truck size={20}/>}        iconBg="bg-amber-50"  iconColor="text-amber-500"/>
        <KpiCard label="Entregados"      value={kpi?.pedidos_entregados ?? '—'}
                 icon={<CheckCircle size={20}/>}  iconBg="bg-emerald-50" iconColor="text-emerald-600"/>
        <KpiCard label="Total Facturado" value={kpi ? `$${Number(kpi.total_facturado).toLocaleString()}` : '—'}
                 icon={<DollarSign size={20}/>}   iconBg="bg-indigo-50" iconColor="text-indigo-600"/>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-500"/> Top Repartidores
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={rankChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
              <XAxis dataKey="name" tick={{ fontSize:12 }}/>
              <YAxis tick={{ fontSize:12 }}/>
              <Tooltip contentStyle={{ borderRadius:8, border:'1px solid #e2e8f0', fontSize:12 }}/>
              <Bar dataKey="entregas" fill="#3b82f6" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-2">Estado de Pedidos</h3>
          {(() => {
            const total = pieData.reduce((s, d) => s + (d.value ?? 0), 0);
            const dataWithTotal = pieData.map(d => ({ ...d, total }));
            return (
              <>
                <div className="relative">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={dataWithTotal}
                        cx="50%" cy="50%"
                        innerRadius={52} outerRadius={78}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {dataWithTotal.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltipPie />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-slate-800 leading-none">{total}</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">pedidos</span>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-1">
                  {dataWithTotal.map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i] }}/>
                      <span>{d.name}</span>
                      <span className="font-semibold text-slate-700">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {rank.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <UserCheck size={16} className="text-indigo-500"/>
            <h3 className="text-sm font-semibold text-slate-800">Ranking de Repartidores</h3>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr>{['Ranking','Repartidor','Entregas Totales','Exitosas','Estado'].map(h => (
                <th key={h} className={TH}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {rank.map(r => (
                <tr key={r.repartidor_id} className="hover:bg-slate-50/70 transition-colors">
                  <td className={`${TD} font-bold text-indigo-600`}>#{r.ranking}</td>
                  <td className={TD}>{r.nombre_completo}</td>
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
    </>
  );
}

function DashboardRepartidor({ user }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (user?.repartidor_id)
      getResumenRepartidor(user.repartidor_id).then(r => setData(r.data)).catch(() => {});
  }, [user]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KpiCard label="En Tránsito"        value={data?.en_transito ?? '—'}
                 icon={<Truck size={20}/>}          iconBg="bg-amber-50"  iconColor="text-amber-500"/>
        <KpiCard label="Entregas Completadas" value={data?.entregadas ?? '—'}
                 icon={<CheckCircle size={20}/>}    iconBg="bg-emerald-50" iconColor="text-emerald-600"/>
        <KpiCard label="Ranking Global"     value={data?.ranking ? `#${data.ranking}` : '—'}
                 icon={<TrendingUp size={20}/>}     iconBg="bg-indigo-50" iconColor="text-indigo-600"/>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Clock size={16} className="text-blue-500"/>
          <h3 className="text-sm font-semibold text-slate-800">Mis Entregas Recientes</h3>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>{['ID Entrega','Dirección','Estado','Fecha Salida'].map(h => (
              <th key={h} className={TH}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {(data?.recientes ?? []).map(e => (
              <tr key={e.entrega_id} className="hover:bg-slate-50/70 transition-colors">
                <td className={`${TD} font-medium text-indigo-600`}>#{e.entrega_id}</td>
                <td className={TD}>{e.direccion_entrega}</td>
                <td className={TD}>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ESTADO_BADGE[e.estado] ?? 'bg-slate-100 text-slate-600'}`}>
                    {e.estado}
                  </span>
                </td>
                <td className={`${TD} text-slate-500`}>{e.fecha_salida ? new Date(e.fecha_salida).toLocaleDateString('es-MX', {day:'2-digit', month:'short', year:'numeric'}) : '-'}</td>
              </tr>
            ))}
            {!data?.recientes?.length && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-400">Sin entregas registradas</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function DashboardCliente({ user }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (user?.cliente_id)
      getResumenCliente(user.cliente_id).then(r => setData(r.data)).catch(() => {});
  }, [user]);

  return (
    <>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Pendientes"    value={data?.pendientes ?? '—'}
                 icon={<Clock size={20}/>}        iconBg="bg-yellow-50"  iconColor="text-yellow-600"/>
        <KpiCard label="En Ruta"       value={data?.en_ruta ?? '—'}
                 icon={<Truck size={20}/>}        iconBg="bg-amber-50"   iconColor="text-amber-500"/>
        <KpiCard label="Entregados"    value={data?.entregados ?? '—'}
                 icon={<CheckCircle size={20}/>}  iconBg="bg-emerald-50" iconColor="text-emerald-600"/>
        <KpiCard label="Total Gastado" value={data ? `$${Number(data.total_gastado).toLocaleString()}` : '—'}
                 icon={<DollarSign size={20}/>}   iconBg="bg-indigo-50"  iconColor="text-indigo-600"/>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Package size={16} className="text-blue-500"/>
          <h3 className="text-sm font-semibold text-slate-800">Mis Pedidos Recientes</h3>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>{['Pedido','Dirección','Estado','Total','Fecha'].map(h => (
              <th key={h} className={TH}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {(data?.recientes ?? []).map(p => (
              <tr key={p.pedido_id} className="hover:bg-slate-50/70 transition-colors">
                <td className={`${TD} font-medium text-indigo-600`}>#{p.pedido_id}</td>
                <td className={TD}>{p.direccion_entrega}</td>
                <td className={TD}>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ESTADO_BADGE[p.estado] ?? 'bg-slate-100 text-slate-600'}`}>
                    {p.estado}
                  </span>
                </td>
                <td className={`${TD} font-semibold text-indigo-600`}>${p.total}</td>
                <td className={`${TD} text-slate-500`}>{p.fecha_pedido ? new Date(p.fecha_pedido).toLocaleDateString('es-MX', {day:'2-digit', month:'short', year:'numeric'}) : '-'}</td>
              </tr>
            ))}
            {!data?.recientes?.length && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">Sin pedidos registrados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Bienvenido, <span className="font-medium text-slate-700">{user?.nombre}</span> &middot;{' '}
          {new Date().toLocaleDateString('es-MX', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
        </p>
      </div>

      {user?.rol === 'admin'      && <DashboardAdmin />}
      {user?.rol === 'repartidor' && <DashboardRepartidor user={user} />}
      {user?.rol === 'cliente'    && <DashboardCliente    user={user} />}
    </div>
  );
}
