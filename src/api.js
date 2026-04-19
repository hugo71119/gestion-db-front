import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

export const login = (data) => api.post('/auth/login', data);
export const logout = () => api.post('/auth/logout');

export const getClientes = () => api.get('/clientes/');
export const getCliente = (id) => api.get(`/clientes/${id}`);
export const crearCliente = (data) => api.post('/clientes/', data);
export const actualizarCliente = (id, data) => api.put(`/clientes/${id}`, data);
export const eliminarCliente = (id) => api.delete(`/clientes/${id}`);

export const getPedidos = (estado) => api.get('/pedidos/', { params: { estado } });
export const getPedido = (id) => api.get(`/pedidos/${id}`);
export const crearPedido = (data) => api.post('/pedidos/', data);
export const actualizarEstado = (id, est) => api.put(`/pedidos/${id}/estado`, { estado: est });
export const asignarRepartidor = (id, repartidor_id, vehiculo_id) => api.post(`/pedidos/${id}/asignar`, { repartidor_id, vehiculo_id });
export const pedidosCliente = (id) => api.get(`/pedidos/cliente/${id}`);

export const getEntregas = () => api.get('/entregas/');
export const getEntrega = (id) => api.get(`/entregas/${id}`);
export const entregasRepartidor = (id) => api.get(`/entregas/repartidor/${id}`);
export const actualizarEstadoEntrega = (id, est, evidencia) => api.put(`/entregas/${id}/estado`, { estado: est, evidencia });

export const getRepartidores = () => api.get('/repartidores/');
export const getRepartidoresDisp = () => api.get('/repartidores/disponibles');
export const crearRepartidor = (data) => api.post('/repartidores/', data);
export const cambiarEstadoRep = (id, est) => api.put(`/repartidores/${id}/estado`, { estado: est });

export const getVehiculos = () => api.get('/vehiculos/');
export const getVehiculosDisp = () => api.get('/vehiculos/disponibles');
export const crearVehiculo = (data) => api.post('/vehiculos/', data);
export const actualizarVehiculo = (id, d) => api.put(`/vehiculos/${id}`, d);

export const getPagos = () => api.get('/pagos/');
export const registrarPago = (data) => api.post('/pagos/', data);

export const getProductos = (params) => api.get('/productos/', { params });
export const getCategorias = () => api.get('/productos/categorias');
export const crearProducto = (data) => api.post('/productos/', data);
export const actualizarProducto = (id, data) => api.put(`/productos/${id}`, data);

export const getResumen = () => api.get('/reportes/resumen');
export const getResumenRepartidor = (id) => api.get(`/reportes/resumen-repartidor/${id}`);
export const getResumenCliente = (id) => api.get(`/reportes/resumen-cliente/${id}`);
export const getClasificacion = () => api.get('/reportes/clasificacion-clientes');
export const getRankingRepartidores = () => api.get('/reportes/ranking-repartidores');
export const getOperaciones = () => api.get('/reportes/operaciones');
export const getEntregasZona = () => api.get('/reportes/entregas-zona');
export const getPivotEntregas = () => api.get('/reportes/pivot-entregas-mes');
export const getAuditoriaPedidos = () => api.get('/reportes/auditoria-pedidos');
export const getLogErrores = () => api.get('/reportes/log-errores');

export default api;
