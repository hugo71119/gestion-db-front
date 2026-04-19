import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { getPedidos, getPedido, crearPedido, actualizarEstado, asignarRepartidor, getClientes, getRepartidoresDisp, getVehiculosDisp, pedidosCliente, getProductos } from '../api';
import { Plus, UserPlus, Eye, X, Package, Trash2, Bike, Truck, CheckCircle2 } from 'lucide-react';
import Toast from '../components/Toast';

const ESTADO_BADGE = {
  Pendiente: 'bg-yellow-100 text-yellow-800',
  'En ruta': 'bg-blue-100 text-blue-800',
  Entregado: 'bg-emerald-100 text-emerald-800',
  Cancelado: 'bg-red-100 text-red-800',
};

const TABS = ['Todos','Pendiente','En ruta','Entregado','Cancelado'];

const LBL = 'block text-sm font-medium text-slate-700 mb-1.5';
const INP = 'w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all mb-4';
const SEL = `${INP} bg-white cursor-pointer`;

const emptyForm = { cliente_id:'', direccion_entrega:'', detalles:[
  { producto:'', cantidad:1, precio_unitario:0 }
]};

export default function Pedidos() {
  const { user } = useAuth();
  const [pedidos,  setPedidos]  = useState([]);
  const [tab,      setTab]      = useState('Todos');
  const [modal,    setModal]    = useState(false);
  const [form,     setForm]     = useState(emptyForm);
  const [clientes, setClientes] = useState([]);
  const [detalle,       setDetalle]       = useState(null);
  const [asignarModal,  setAsignarModal]  = useState(null);
  const [repsDisp,      setRepsDisp]      = useState([]);
  const [repElegido,    setRepElegido]    = useState('');
  const [vehsDisp,      setVehsDisp]      = useState([]);
  const [vehElegido,    setVehElegido]    = useState('');
  const [catalogo,         setCatalogo]         = useState([]);
  const [saving,           setSaving]           = useState(false);
  const [successPedido,    setSuccessPedido]    = useState(null);
  const [toast,            setToast]            = useState(false);
  const [successAsignacion, setSuccessAsignacion] = useState(null); // { repartidor, vehiculo, folio }
  const [toastAsignacion,   setToastAsignacion]   = useState(false);

  const load = () => {
    if (user?.rol === 'cliente') {
      pedidosCliente(user.cliente_id).then(r => {
        const all = r.data;
        setPedidos(tab === 'Todos' ? all : all.filter(p => p.estado === tab));
      }).catch(() => {});
    } else {
      const est = tab === 'Todos' ? undefined : tab;
      getPedidos(est).then(r => setPedidos(r.data)).catch(() => {});
    }
  };

  useEffect(() => { load(); }, [tab]);
  useEffect(() => {
    if (user?.rol === 'admin') getClientes().then(r => setClientes(r.data)).catch(() => {});
    getProductos().then(r => setCatalogo(r.data)).catch(() => {});
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      cliente_id: user?.rol === 'cliente' ? user.cliente_id : form.cliente_id,
      direccion_entrega: form.direccion_entrega,
      detalles: form.detalles.filter(d => d.producto)
    };
    try {
      const r = await crearPedido(payload);
      setModal(false);
      setForm(emptyForm);
      setSuccessPedido(r.data.pedido_id);
      setToast(true);
      load();
    } catch(e) { alert(e.response?.data?.error || 'Error'); }
    finally { setSaving(false); }
  };

  const handleCancelar = async (id) => {
    if (!window.confirm('¿Cancelar este pedido? Esta acción no se puede deshacer.')) return;
    try {
      await actualizarEstado(id, 'Cancelado');
      load();
    } catch(e) { alert(e.response?.data?.error || 'Error al cancelar'); }
  };

  const abrirAsignar = async (pedido_id) => {
    try {
      const [rRes, vRes] = await Promise.all([getRepartidoresDisp(), getVehiculosDisp()]);
      setRepsDisp(rRes.data);
      setVehsDisp(vRes.data);
      setRepElegido(rRes.data[0]?.repartidor_id ?? '');
      setVehElegido(vRes.data[0]?.vehiculo_id ?? '');
      setAsignarModal(pedido_id);
    } catch { alert('No se pudieron cargar los datos'); }
  };

  const confirmarAsignar = async () => {
    if (!repElegido || !vehElegido) return;
    try {
      const r = await asignarRepartidor(asignarModal, repElegido, vehElegido);
      setAsignarModal(null);
      setSuccessAsignacion({
        repartidor: r.data.repartidor_asignado,
        vehiculo: r.data.vehiculo_asignado,
        folio: r.data.folio_entrega,
      });
      setToastAsignacion(true);
      load();
    } catch(e) { alert(e.response?.data?.error || 'Error al asignar'); }
  };

  const abrirDetalle = async (p) => {
    try {
      const r = await getPedido(p.pedido_id);
      setDetalle(r.data);
    } catch { setDetalle(p); }
  };

  const updateDet = (i, k, v) => {
    const d = [...form.detalles];
    d[i] = { ...d[i], [k]: v };
    setForm({ ...form, detalles: d });
  };

  const removeDet = (i) => {
    setForm({ ...form, detalles: form.detalles.filter((_, idx) => idx !== i) });
  };

  const totalEstimado = form.detalles.reduce((s, d) => s + (d.cantidad * d.precio_unitario), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-slate-900">Pedidos</h1>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm shadow-blue-500/20 cursor-pointer border-none"
        >
          <Plus size={16}/> Nuevo Pedido
        </button>
      </div>

      <div className="flex gap-1.5 mb-5 bg-white border border-slate-200 p-1 rounded-xl w-fit shadow-sm">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border-none
              ${tab === t ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 bg-transparent'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Vista ADMIN: grid de tarjetas ── */}
      {user?.rol !== 'cliente' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {pedidos.map(p => (
            <div key={p.pedido_id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-slate-900">Pedido #{p.pedido_id}</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ESTADO_BADGE[p.estado] ?? 'bg-slate-100 text-slate-600'}`}>
                  {p.estado}
                </span>
              </div>
              <p className="text-sm text-slate-500 mb-1.5">
                <span className="font-medium text-slate-700">Cliente:</span> {p.cliente}
              </p>
              <p className="text-sm text-slate-500 mb-1.5">
                <span className="font-medium text-slate-700">Dirección:</span> {p.direccion_entrega}
              </p>
              <p className="text-sm text-slate-500 mb-4">
                <span className="font-semibold text-slate-900">${p.total}</span>
                <span className="mx-2 text-slate-300">·</span>
                {p.fecha_pedido?.split('T')[0]}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => abrirDetalle(p)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer bg-white transition-colors"
                >
                  <Eye size={13}/> Detalle
                </button>
                {user?.rol === 'admin' && p.estado === 'Pendiente' && (
                  <button
                    onClick={() => abrirAsignar(p.pedido_id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs font-medium text-blue-700 hover:bg-blue-100 cursor-pointer transition-colors"
                  >
                    <UserPlus size={13}/> Asignar
                  </button>
                )}
                {p.estado === 'Pendiente' && user?.rol === 'admin' && (
                  <button
                    onClick={() => handleCancelar(p.pedido_id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 border border-red-200 rounded-lg text-xs font-medium text-red-600 hover:bg-red-100 cursor-pointer transition-colors"
                  >
                    <X size={13}/> Cancelar
                  </button>
                )}
              </div>
            </div>
          ))}
          {pedidos.length === 0 && (
            <div className="col-span-full flex flex-col items-center py-16 text-slate-400">
              <Package size={40} className="mb-3 text-slate-300"/>
              <p className="text-sm">No hay pedidos</p>
            </div>
          )}
        </div>
      )}

      {/* ── Vista CLIENTE: lista ── */}
      {user?.rol === 'cliente' && (
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
          {pedidos.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-slate-400">
              <Package size={40} className="mb-3 text-slate-300"/>
              <p className="text-sm">No tienes pedidos en esta categoría</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {pedidos.map(p => (
                <li key={p.pedido_id} className="flex items-center gap-4 px-5 py-4 hover:bg-emerald-50/40 transition-colors">

                  {/* Ícono de estado */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    p.estado === 'Entregado' ? 'bg-emerald-100' :
                    p.estado === 'En ruta'   ? 'bg-blue-100'    :
                    p.estado === 'Cancelado' ? 'bg-red-100'     : 'bg-amber-100'
                  }`}>
                    <Package size={18} className={
                      p.estado === 'Entregado' ? 'text-emerald-600' :
                      p.estado === 'En ruta'   ? 'text-blue-600'    :
                      p.estado === 'Cancelado' ? 'text-red-500'     : 'text-amber-600'
                    }/>
                  </div>

                  {/* Info principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-slate-800 text-sm">Pedido #{p.pedido_id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ESTADO_BADGE[p.estado] ?? 'bg-slate-100 text-slate-600'}`}>
                        {p.estado}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{p.direccion_entrega}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{p.fecha_pedido?.split('T')[0]}</p>
                  </div>

                  {/* Total */}
                  <div className="text-right flex-shrink-0 hidden sm:block">
                    <p className="text-sm font-bold text-emerald-700">${Number(p.total).toLocaleString()}</p>
                    <p className="text-xs text-slate-400">total</p>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => abrirDetalle(p)}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer bg-white transition-colors"
                    >
                      <Eye size={13}/> Ver
                    </button>
                    {p.estado === 'Pendiente' && (
                      <button
                        onClick={() => handleCancelar(p.pedido_id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-xs font-medium text-red-600 hover:bg-red-100 cursor-pointer transition-colors"
                      >
                        <X size={13}/> Cancelar
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-7 w-[640px] max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Nuevo Pedido</h2>
              <button onClick={() => setModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer">
                <X size={20}/>
              </button>
            </div>
            <form onSubmit={handleSave}>
              {user?.rol === 'admin' && (
                <>
                  <label className={LBL}>Cliente</label>
                  <select className={SEL} value={form.cliente_id}
                          onChange={e => setForm({...form, cliente_id: e.target.value})} required>
                    <option value="">Seleccionar cliente...</option>
                    {clientes.map(c => (
                      <option key={c.cliente_id} value={c.cliente_id}>{c.nombre_completo}</option>
                    ))}
                  </select>
                </>
              )}

              <label className={LBL}>Dirección de Entrega</label>
              <input className={INP} value={form.direccion_entrega}
                     onChange={e => setForm({...form, direccion_entrega: e.target.value})} required
                     placeholder="Calle, número, colonia..." />

              <p className="text-sm font-semibold text-slate-700 mb-2">Productos a enviar</p>

              <div className="grid grid-cols-[1fr_80px_110px_80px_32px] gap-2 mb-1 px-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Descripción</span>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide text-center">Unidades</span>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide text-right">Precio c/u ($)</span>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide text-right">Subtotal</span>
                <span/>
              </div>

              <div className="space-y-2 mb-3">
                {form.detalles.map((d, i) => (
                  <div key={i} className="grid grid-cols-[1fr_80px_110px_80px_32px] gap-2 items-center">
                    <select
                      className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer"
                      value={d.producto}
                      onChange={e => {
                        const nombre = e.target.value;
                        const prod = catalogo.find(p => p.nombre === nombre);
                        const rows = [...form.detalles];
                        rows[i] = { ...rows[i], producto: nombre, ...(prod ? { precio_unitario: prod.precio } : {}) };
                        setForm({ ...form, detalles: rows });
                      }}
                    >
                      <option value="">Seleccionar producto...</option>
                      {catalogo.map(p => (
                        <option key={p.producto_id} value={p.nombre}>
                          {p.nombre} — ${Number(p.precio).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </option>
                      ))}
                    </select>
                    <input
                      className="border border-slate-200 rounded-lg px-2 py-2 text-sm text-slate-900 text-center outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      type="number" min={1} value={d.cantidad}
                      onChange={e => updateDet(i,'cantidad',+e.target.value)}
                    />
                    <input
                      className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 text-right outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      type="number" min={0} step="0.01" value={d.precio_unitario}
                      onChange={e => updateDet(i,'precio_unitario',+e.target.value)}
                    />
                    <span className="text-sm font-semibold text-indigo-600 text-right">
                      ${(d.cantidad * d.precio_unitario).toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeDet(i)}
                      disabled={form.detalles.length === 1}
                      className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer border-none bg-transparent disabled:opacity-0 disabled:pointer-events-none"
                    >
                      <Trash2 size={14}/>
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mb-5">
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-slate-300 rounded-lg text-xs text-slate-500 hover:bg-slate-50 hover:border-blue-400 hover:text-blue-600 cursor-pointer bg-transparent transition-colors"
                  onClick={() => setForm({...form, detalles:[...form.detalles,{producto:'',cantidad:1,precio_unitario:0}]})}
                >
                  <Plus size={13}/> Agregar producto
                </button>
                <div className="text-right">
                  <p className="text-xs text-slate-400 mb-0.5">Total estimado</p>
                  <p className="text-xl font-bold text-indigo-600">${totalEstimado.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setModal(false)}
                        className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50 cursor-pointer bg-white">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-60 cursor-pointer border-none">
                  {saving ? 'Guardando...' : 'Crear Pedido'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detalle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-7 w-[540px] shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Pedido #{detalle.pedido_id}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${ESTADO_BADGE[detalle.estado] ?? 'bg-slate-100 text-slate-600'}`}>
                  {detalle.estado}
                </span>
              </div>
              <button onClick={() => setDetalle(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer">
                <X size={20}/>
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 mb-4 space-y-2">
              <p className="text-sm text-slate-600"><span className="font-semibold text-slate-800">Cliente:</span> {detalle.cliente}</p>
              <p className="text-sm text-slate-600"><span className="font-semibold text-slate-800">Dirección de entrega:</span> {detalle.direccion_entrega}</p>
              <p className="text-sm text-slate-600"><span className="font-semibold text-slate-800">Fecha:</span> {detalle.fecha_pedido?.replace('T',' ').substring(0,16) ?? '-'}</p>
            </div>

            {detalle.entrega ? (
              <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {detalle.entrega.repartidor_nombre?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{detalle.entrega.repartidor_nombre}</p>
                  <p className="text-xs text-slate-500">{detalle.entrega.repartidor_telefono} · Placa: <span className="font-medium">{detalle.entrega.vehiculo_placa}</span></p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                  detalle.entrega.estado_entrega === 'Entregado'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {detalle.entrega.estado_entrega}
                </span>
              </div>
            ) : detalle.estado !== 'Pendiente' && detalle.estado !== 'Cancelado' ? null : (
              <div className="flex items-center gap-2 bg-slate-50 border border-dashed border-slate-200 rounded-xl p-3 mb-4 text-slate-400 text-xs">
                <Bike size={14}/> Sin repartidor asignado
              </div>
            )}

            {detalle.detalles?.length > 0 ? (
              <>
                <p className="text-sm font-semibold text-slate-700 mb-2">Productos del pedido</p>
                <div className="rounded-xl border border-slate-200 overflow-hidden mb-4">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase">Producto</th>
                        <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase">Unidades</th>
                        <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase">Precio c/u</th>
                        <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalle.detalles.map(d => (
                        <tr key={d.detalle_id} className="border-b border-slate-100 hover:bg-slate-50/70">
                          <td className="px-4 py-3 text-slate-800 font-medium">{d.producto}</td>
                          <td className="px-4 py-3 text-slate-500 text-center">{d.cantidad}</td>
                          <td className="px-4 py-3 text-slate-500 text-right">${Number(d.precio_unitario).toLocaleString()}</td>
                          <td className="px-4 py-3 font-semibold text-indigo-600 text-right">${Number(d.subtotal).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 pt-3">
                  <span className="text-sm font-medium text-slate-500">{detalle.detalles.length} producto{detalle.detalles.length !== 1 ? 's' : ''}</span>
                  <span className="text-xl font-bold text-indigo-600">Total: ${Number(detalle.total).toLocaleString()}</span>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">Sin productos registrados</p>
            )}
          </div>
        </div>
      )}

      {successPedido && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-[400px] shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">¡Pedido creado!</h2>
            <p className="text-slate-500 text-sm mb-1">Tu pedido fue registrado exitosamente.</p>
            <p className="text-indigo-600 font-bold text-lg mb-6">Pedido #{successPedido}</p>
            <button
              onClick={() => setSuccessPedido(null)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer border-none"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      {asignarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-7 w-[420px] shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900">Asignar Repartidor</h2>
              <button onClick={() => setAsignarModal(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer">
                <X size={20}/>
              </button>
            </div>

            {repsDisp.length === 0 || vehsDisp.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6 bg-slate-50 rounded-xl">
                {repsDisp.length === 0 ? 'No hay repartidores disponibles' : 'No hay vehículos disponibles'}
              </p>
            ) : (
              <>
                <p className="text-sm text-slate-500 mb-4">Pedido <span className="font-semibold text-slate-800">#{asignarModal}</span></p>

                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <UserPlus size={12}/> Repartidor
                </p>
                <div className="space-y-2 mb-5">
                  {repsDisp.map(r => (
                    <label
                      key={r.repartidor_id}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                        ${repElegido == r.repartidor_id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                    >
                      <input type="radio" name="repartidor" value={r.repartidor_id}
                        checked={repElegido == r.repartidor_id} onChange={() => setRepElegido(r.repartidor_id)}
                        className="accent-blue-600" />
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {r.nombre_completo?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{r.nombre_completo}</p>
                        <p className="text-xs text-slate-400">@{r.usuario} · {r.telefono}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Truck size={12}/> Vehículo
                </p>
                <div className="space-y-2 mb-6">
                  {vehsDisp.map(v => (
                    <label
                      key={v.vehiculo_id}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                        ${vehElegido == v.vehiculo_id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                    >
                      <input type="radio" name="vehiculo" value={v.vehiculo_id}
                        checked={vehElegido == v.vehiculo_id} onChange={() => setVehElegido(v.vehiculo_id)}
                        className="accent-indigo-600" />
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white flex-shrink-0">
                        <Truck size={14}/>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{v.placa}</p>
                        <p className="text-xs text-slate-400">{v.tipo} · Cap. {v.capacidad} kg</p>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setAsignarModal(null)}
                          className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50 cursor-pointer bg-white">
                    Cancelar
                  </button>
                  <button
                    onClick={confirmarAsignar}
                    disabled={!repElegido || !vehElegido}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 cursor-pointer border-none"
                  >
                    <UserPlus size={15}/> Confirmar asignación
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {successAsignacion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-[420px] shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">¡Asignación exitosa!</h2>
            <p className="text-slate-500 text-sm mb-4">El repartidor fue asignado al pedido correctamente.</p>
            <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2 mb-6">
              <p className="text-sm text-slate-600"><span className="font-semibold text-slate-800">Repartidor:</span> {successAsignacion.repartidor}</p>
              <p className="text-sm text-slate-600"><span className="font-semibold text-slate-800">Vehículo:</span> {successAsignacion.vehiculo}</p>
              <p className="text-sm text-slate-600"><span className="font-semibold text-slate-800">Folio de entrega:</span> <span className="text-indigo-600 font-bold">{successAsignacion.folio}</span></p>
            </div>
            <button
              onClick={() => setSuccessAsignacion(null)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer border-none"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      <Toast message="¡Pedido creado exitosamente!" show={toast} onClose={() => setToast(false)} />
      <Toast message="¡Repartidor asignado exitosamente!" show={toastAsignacion} onClose={() => setToastAsignacion(false)} />
    </div>
  );
}
