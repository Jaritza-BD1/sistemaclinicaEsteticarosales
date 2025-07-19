import React, { useState } from 'react';
import { fetchBitacoraStats } from '../../services/bitacoraService';
import './bitacora-consulta.css';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const BitacoraEstadisticas = () => {
    const navigate = useNavigate();
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleConsultar = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {};
            if (fechaInicio) params.fechaInicio = fechaInicio;
            if (fechaFin) params.fechaFin = fechaFin;
            const response = await fetchBitacoraStats(params);
            if (response.data.success) {
                setStats(response.data.data);
            } else {
                setError(response.data.message || 'Error al consultar estadísticas.');
            }
        } catch (err) {
            setError('No se pudo conectar con el servidor o hubo un error inesperado.');
        } finally {
            setLoading(false);
        }
    };

    // Preparar datos para gráfica de pastel (suma de cada tipo de acción)
    const pieData = [
        { name: 'Ingresos', value: stats.reduce((acc, s) => acc + (parseInt(s.ingresos) || 0), 0) },
        { name: 'Actualizaciones', value: stats.reduce((acc, s) => acc + (parseInt(s.actualizaciones) || 0), 0) },
        { name: 'Eliminaciones', value: stats.reduce((acc, s) => acc + (parseInt(s.eliminaciones) || 0), 0) },
    ];

    return (
        <div className="bitacora-container">
            <div className="bitacora-nav">
                <button onClick={() => navigate('/admin/bitacora/consulta')}>Consulta</button>
                <button onClick={() => navigate('/admin/bitacora/estadisticas')}>Estadísticas</button>
            </div>
            <h1>Estadísticas de Bitácora</h1>
            <div className="filter-section">
                <label htmlFor="fechaInicio">Fecha Inicial:</label>
                <input
                    type="date"
                    id="fechaInicio"
                    value={fechaInicio}
                    onChange={e => setFechaInicio(e.target.value)}
                />
                <label htmlFor="fechaFin" className="ml-20">Fecha Final:</label>
                <input
                    type="date"
                    id="fechaFin"
                    value={fechaFin}
                    onChange={e => setFechaFin(e.target.value)}
                />
                <button onClick={handleConsultar}>Consultar</button>
            </div>
            {loading && <p>Cargando estadísticas...</p>}
            {error && <p className="error-message">{error}</p>}
            {!loading && !error && stats.length > 0 && (
                <>
                    <h2>Eventos por Usuario</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <XAxis dataKey="atr_id_usuario" label={{ value: 'ID Usuario', position: 'insideBottom', offset: -5 }} />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="total_eventos" fill="#0088FE" name="Total Eventos" />
                            <Bar dataKey="ingresos" fill="#00C49F" name="Ingresos" />
                            <Bar dataKey="actualizaciones" fill="#FFBB28" name="Actualizaciones" />
                            <Bar dataKey="eliminaciones" fill="#FF8042" name="Eliminaciones" />
                        </BarChart>
                    </ResponsiveContainer>
                    <h2>Distribución de Tipos de Acción</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                {pieData.map((entry, idx) => (
                                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </>
            )}
            {!loading && !error && stats.length === 0 && (
                <p>No hay estadísticas para los filtros seleccionados.</p>
            )}
        </div>
    );
};

export default BitacoraEstadisticas; 