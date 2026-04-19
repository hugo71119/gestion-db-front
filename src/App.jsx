import React, { createContext, useContext, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Landing      from './pages/Landing';
import Login        from './pages/Login';
import Dashboard    from './pages/Dashboard';
import Clientes     from './pages/Clientes';
import Pedidos      from './pages/Pedidos';
import Entregas     from './pages/Entregas';
import Repartidores from './pages/Repartidores';
import Vehiculos    from './pages/Vehiculos';
import Pagos        from './pages/Pagos';
import Reportes     from './pages/Reportes';
import Productos    from './pages/Productos';
import Layout       from './components/Layout';

export const AuthCtx = createContext(null);

export function useAuth() { return useContext(AuthCtx); }

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.rol)) return <Navigate to="/app/dashboard" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('logistica_user')); }
    catch { return null; }
  });

  const setUserPersist = (u) => {
    setUser(u);
    if (u) sessionStorage.setItem('logistica_user', JSON.stringify(u));
    else    sessionStorage.removeItem('logistica_user');
  };

  return (
    <AuthCtx.Provider value={{ user, setUser: setUserPersist }}>
      <BrowserRouter>
        <Routes>
          <Route path="/"      element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/app"   element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index                element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard"     element={<Dashboard />} />
            <Route path="clientes"      element={<ProtectedRoute roles={['admin']}><Clientes /></ProtectedRoute>} />
            <Route path="pedidos"       element={<Pedidos />} />
            <Route path="entregas"      element={<Entregas />} />
            <Route path="repartidores"  element={<ProtectedRoute roles={['admin']}><Repartidores /></ProtectedRoute>} />
            <Route path="vehiculos"     element={<ProtectedRoute roles={['admin']}><Vehiculos /></ProtectedRoute>} />
            <Route path="pagos"         element={<ProtectedRoute roles={['admin']}><Pagos /></ProtectedRoute>} />
            <Route path="reportes"      element={<ProtectedRoute roles={['admin']}><Reportes /></ProtectedRoute>} />
            <Route path="productos"     element={<Productos />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthCtx.Provider>
  );
}
