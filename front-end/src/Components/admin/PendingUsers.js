import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const PendingUsers = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        const response = await api.get('/admin/pending-users');
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar usuarios pendientes');
        setLoading(false);
      }
    };
    
    fetchPendingUsers();
  }, []);

  const handleApprove = async (userId) => {
    try {
      await api.put(`/admin/approve-user/${userId}`);
      setUsers(users.filter(user => user.atr_id_usuario !== userId));
    } catch (err) {
      setError('Error al aprobar usuario');
    }
  };

  const handleReject = async (userId) => {
    try {
      await api.put(`/admin/reject-user/${userId}`);
      setUsers(users.filter(user => user.atr_id_usuario !== userId));
    } catch (err) {
      setError('Error al rechazar usuario');
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="container mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6">Usuarios Pendientes de Aprobación</h2>
      
      {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
      
      {users.length === 0 ? (
        <p>No hay usuarios pendientes de aprobación</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Usuario</th>
                <th className="py-2 px-4 border-b">Nombre</th>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Fecha Registro</th>
                <th className="py-2 px-4 border-b">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.atr_id_usuario}>
                  <td className="py-2 px-4 border-b">{user.atr_usuario}</td>
                  <td className="py-2 px-4 border-b">{user.atr_nombre_usuario}</td>
                  <td className="py-2 px-4 border-b">{user.atr_correo_electronico}</td>
                  <td className="py-2 px-4 border-b">
                    {new Date(user.atr_fecha_creacion).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleApprove(user.atr_id_usuario)}
                      className="mr-2 bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600"
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleReject(user.atr_id_usuario)}
                      className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
                    >
                      Rechazar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PendingUsers;