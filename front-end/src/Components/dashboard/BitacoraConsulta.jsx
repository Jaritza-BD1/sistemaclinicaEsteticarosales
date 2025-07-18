import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api'; // Usar el servicio centralizado
import './bitacora-consulta.css'; // Asume que crearemos este archivo CSS para estilos
// import { format } from 'date-fns'; // Si necesitas un formato de fecha más específico en el frontend
// Importa tu contexto de autenticación si necesitas el ID del usuario para algo más allá de los filtros
// import { useAuth } from '../../context/AuthContext'; 

// Asume que tu backend se ejecuta en http://localhost:3000 o la URL que corresponda

const BitacoraConsulta = () => {
    // Estados para los filtros
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [idUsuarioFiltro, setIdUsuarioFiltro] = useState(''); // Cambiado a ID para coincidir con el backend
    const [accionFiltro, setAccionFiltro] = useState('');
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Estados para paginación
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Coincide con el límite que se enviará al backend

    // useEffect para cargar la bitácora al montar el componente o cuando cambie la página
    const cargarBitacora = useCallback(async (page = 1) => {
        setLoading(true);
        setError(null);

        // Validaciones generales (punto 7: Campos no nulos para filtros de fecha, punto 4: Fechas válidas) [cite: 19]
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

        const queryParams = {
            page: page,
            limit: itemsPerPage,
        };

        if (fechaInicio) queryParams.fechaInicio = fechaInicio;
        if (fechaFin) queryParams.fechaFin = fechaFin;
        if (idUsuarioFiltro) queryParams.atr_id_usuario = idUsuarioFiltro;
        if (accionFiltro) queryParams.atr_accion = accionFiltro;

        try {
            const response = await api.get('/bitacora/consultar', { params: queryParams });
            if (response.data.success) {
                setEventos(response.data.data);
            } else {
                setError(response.data.message || 'Error al cargar la bitácora.');
            }
        } catch (err) {
            console.error('Error al cargar bitácora:', err);
            setError('No se pudo conectar con el servidor o hubo un error inesperado.');
        } finally {
            setLoading(false);
        }
    }, [fechaInicio, fechaFin, idUsuarioFiltro, accionFiltro, itemsPerPage]);

    useEffect(() => {
        cargarBitacora(currentPage);
    }, [currentPage, cargarBitacora]);

    const handleConsultarClick = () => {
        setCurrentPage(1); // Siempre volver a la primera página al aplicar nuevos filtros
        cargarBitacora(1);
    };

    const handleNextPage = () => {
        setCurrentPage(prev => prev + 1);
    };

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(1, prev - 1));
    };

    const handleExportarClick = () => {
        alert('Funcionalidad de exportación aún no implementada.');
        // Aquí iría la lógica para llamar a una API de exportación o generar un archivo CSV/Excel en el frontend
    };

    return (
        <div className="bitacora-container">
            <h1>Consulta de Bitácora del Sistema</h1>

            <div className="filter-section">
                <label htmlFor="fechaInicio">Fecha Inicial:</label>
                <input
                    type="date"
                    id="fechaInicio"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                />

                <label htmlFor="fechaFin" className="ml-20">Fecha Final:</label>
                <input
                    type="date"
                    id="fechaFin"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                />

                <label htmlFor="idUsuarioFiltro" className="ml-20">ID Usuario:</label>
                <input
                    type="number" // Cambiado a number para ID
                    id="idUsuarioFiltro"
                    placeholder="ID de Usuario"
                    value={idUsuarioFiltro}
                    onChange={(e) => setIdUsuarioFiltro(e.target.value)}
                />

                <label htmlFor="accionFiltro" className="ml-20">Acción:</label>
                <select
                    id="accionFiltro"
                    value={accionFiltro}
                    onChange={(e) => setAccionFiltro(e.target.value)}
                >
                    <option value="">Todas</option>
                    <option value="Ingreso">Ingreso</option>
                    <option value="Nuevo">Nuevo</option>
                    <option value="Update">Update</option>
                    <option value="Delete">Delete</option>
                    <option value="Consulta">Consulta</option>
                </select>

                <button onClick={handleConsultarClick}>Consultar</button>
                <button className="export-button" onClick={handleExportarClick}>Exportar</button>
            </div>

            {loading && <p>Cargando eventos...</p>}
            {error && <p className="error-message">{error}</p>}

            {!loading && !error && (
                <>
                    <table className="bitacora-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Usuario</th>
                                <th>Acción</th>
                                <th>Observaciones</th>
                                <th>Detalle</th>
                            </tr>
                        </thead>
                        <tbody>
                            {eventos.length === 0 ? (
                                <tr>
                                    <td colSpan="5">No se encontraron eventos de bitácora.</td>
                                </tr>
                            ) : (
                                eventos.map((evento) => (
                                    <tr key={evento.atr_id_bitacora}>
                                        <td>{evento.atr_fecha}</td>
                                        <td>{evento.atr_id_usuario}</td> {/* Puedes necesitar una lógica para mostrar el nombre del usuario */}
                                        <td>{evento.atr_accion}</td>
                                        <td>{evento.atr_descripcion && evento.atr_descripcion.substring(0, 50) + (evento.atr_descripcion.length > 50 ? '...' : '')}</td>
                                        <td>
                                            <button
                                                className="detail-button"
                                                title="Ver Detalle"
                                                onClick={() => alert('Descripción completa:\n' + evento.atr_descripcion)}
                                            >
                                                🔍
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    <div className="pagination">
                        <button onClick={handlePrevPage} disabled={currentPage === 1}>Anterior</button>
                        <span>Página {currentPage}</span>
                        {/* El botón de siguiente se deshabilitará si la última consulta trajo menos de itemsPerPage */}
                        <button onClick={handleNextPage} disabled={eventos.length < itemsPerPage}>Siguiente</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default BitacoraConsulta;