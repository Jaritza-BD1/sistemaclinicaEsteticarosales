import React, { useState, useEffect, useCallback } from 'react';
import { fetchBitacoraStats } from '../../services/bitacoraService';
import { useNavigate } from 'react-router-dom';
import './bitacora-consulta.css';

const BitacoraEstadisticas = ({ showNavigation = true }) => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalRegistros: 0,
        registrosPorAccion: {},
        registrosPorUsuario: {},
        registrosPorFecha: {}
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');

    const cargarEstadisticas = useCallback(async () => {
        setLoading(true);
        setError(null);

        // Validaciones de fechas
        if (fechaInicio && !fechaFin) {
            setError('Si ingresa una Fecha Inicial, debe ingresar también una Fecha Final.');
            setLoading(false);
            return;
        }
        if (!fechaInicio && fechaFin) {
            setError('Si ingresa una Fecha Final, debe ingresar también una Fecha Inicial.');
            setLoading(false);
            return;
        }
        if (fechaInicio && fechaFin && new Date(fechaInicio) > new Date(fechaFin)) {
            setError('La Fecha Inicial no puede ser posterior a la Fecha Final.');
            setLoading(false);
            return;
        }

        const queryParams = {};
        if (fechaInicio) queryParams.fechaInicio = fechaInicio;
        if (fechaFin) queryParams.fechaFin = fechaFin;

        try {
            const response = await fetchBitacoraStats(queryParams);
            if (response.success) {
                setStats(response.data || {
                    totalRegistros: 0,
                    registrosPorAccion: {},
                    registrosPorUsuario: {},
                    registrosPorFecha: {}
                });
            } else {
                setError(response.message || 'Error al cargar las estadísticas.');
            }
        } catch (err) {
            console.error('Error al cargar estadísticas:', err);
            setError(err.message || 'No se pudo conectar con el servidor o hubo un error inesperado.');
        } finally {
            setLoading(false);
        }
    }, [fechaInicio, fechaFin]);

    useEffect(() => {
        cargarEstadisticas();
    }, [cargarEstadisticas]);

    const handleConsultarClick = () => {
        cargarEstadisticas();
    };

    const exportarEstadisticas = () => {
        const data = [
            ['Estadísticas de Bitácora'],
            [''],
            ['Total de Registros', stats.totalRegistros],
            [''],
            ['Registros por Acción'],
            ['Acción', 'Cantidad']
        ];

        // Agregar datos de registros por acción
        Object.entries(stats.registrosPorAccion).forEach(([accion, cantidad]) => {
            data.push([accion, cantidad]);
        });

        data.push(['', '']);
        data.push(['Registros por Usuario']);
        data.push(['Usuario', 'Cantidad']);

        // Agregar datos de registros por usuario
        Object.entries(stats.registrosPorUsuario).forEach(([usuario, cantidad]) => {
            data.push([usuario, cantidad]);
        });

        // Crear CSV
        const csvContent = data.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'estadisticas_bitacora.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="bitacora-container">
            {showNavigation && (
                <div className="bitacora-nav">
                    <button onClick={() => navigate('/bitacora')}>Consulta</button>
                    <button className="active">Estadísticas</button>
                </div>
            )}
            {showNavigation && <h1>Estadísticas de Bitácora del Sistema</h1>}

            <div className="filter-section">
                <label htmlFor="fechaInicio">Fecha Inicial:</label>
                <input 
                    type="date" 
                    id="fechaInicio" 
                    value={fechaInicio} 
                    onChange={e => setFechaInicio(e.target.value)} 
                />
                <label htmlFor="fechaFin">Fecha Final:</label>
                <input 
                    type="date" 
                    id="fechaFin" 
                    value={fechaFin} 
                    onChange={e => setFechaFin(e.target.value)} 
                />
                <button onClick={handleConsultarClick}>Consultar</button>
                <button className="export-button" onClick={exportarEstadisticas}>Exportar</button>
            </div>

            {loading && <p>Cargando estadísticas...</p>}
            {error && <p className="error-message">{typeof error === 'string' ? error : 'Error desconocido'}</p>}

            {!loading && !error && (
                <div className="stats-container">
                    {/* Resumen General */}
                    <div className="stats-card">
                        <h3>Resumen General</h3>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <span className="stat-number">{stats.totalRegistros}</span>
                                <span className="stat-label">Total de Registros</span>
                            </div>
                        </div>
                    </div>

                    {/* Registros por Acción */}
                    <div className="stats-card">
                        <h3>Registros por Acción</h3>
                        <div className="stats-list">
                            {Object.entries(stats.registrosPorAccion).length > 0 ? (
                                Object.entries(stats.registrosPorAccion).map(([accion, cantidad]) => (
                                    <div key={accion} className="stat-row">
                                        <span className="stat-label">{accion}</span>
                                        <span className="stat-value">{cantidad}</span>
                                    </div>
                                ))
                            ) : (
                                <p>No hay datos disponibles</p>
                            )}
                        </div>
                    </div>

                    {/* Registros por Usuario */}
                    <div className="stats-card">
                        <h3>Registros por Usuario</h3>
                        <div className="stats-list">
                            {Object.entries(stats.registrosPorUsuario).length > 0 ? (
                                Object.entries(stats.registrosPorUsuario).map(([usuario, cantidad]) => (
                                    <div key={usuario} className="stat-row">
                                        <span className="stat-label">{usuario}</span>
                                        <span className="stat-value">{cantidad}</span>
                                    </div>
                                ))
                            ) : (
                                <p>No hay datos disponibles</p>
                            )}
                        </div>
                    </div>

                    {/* Registros por Fecha */}
                    <div className="stats-card">
                        <h3>Registros por Fecha</h3>
                        <div className="stats-list">
                            {Object.entries(stats.registrosPorFecha).length > 0 ? (
                                Object.entries(stats.registrosPorFecha).map(([fecha, cantidad]) => (
                                    <div key={fecha} className="stat-row">
                                        <span className="stat-label">{fecha}</span>
                                        <span className="stat-value">{cantidad}</span>
                                    </div>
                                ))
                            ) : (
                                <p>No hay datos disponibles</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BitacoraEstadisticas; 