import React, { useEffect, useState } from 'react';
import { Table, Button, Spinner, InputGroup, FormControl, Row, Col, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import './doctor-list.css';
import { BsEye, BsPencilSquare, BsTrash } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctors as fetchDoctorsThunk, deleteDoctor as deleteDoctorThunk } from '../../redux/doctors/doctorsSlice';
import { useNotifications } from '../../context/NotificationsContext';
import ConfirmDialog from '../common/ConfirmDialog';

export default function DoctorList({ onEdit, onViewDetails, onRegisterNew, refresh }) {
  const dispatch = useDispatch();
  const { notify } = useNotifications();
  const doctors = useSelector(state => state.doctors.items || []);
  const status = useSelector(state => state.doctors.status);
  const error = useSelector(state => state.doctors.error);
  const total = useSelector(state => state.doctors.total ?? 0);
  const [confirmShow, setConfirmShow] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce search input to avoid excessive requests
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    // Fetch server-side with current filters/sort/pagination
    const params = {
      page,
      pageSize,
      q: debouncedSearch,
      sortField,
      sortDir
    };
    dispatch(fetchDoctorsThunk(params));
  }, [dispatch, refresh, page, pageSize, debouncedSearch, sortField, sortDir]);

  const handleDeleteClick = (id) => {
    if (!id) return;
    setTargetDeleteId(id);
    setConfirmShow(true);
  };

  const handleConfirmDelete = async () => {
    if (!targetDeleteId) return;
    setDeleting(true);
    try {
      await dispatch(deleteDoctorThunk(targetDeleteId)).unwrap();
      notify({ message: 'Médico eliminado correctamente', severity: 'success' });
      setConfirmShow(false);
      setTargetDeleteId(null);
      // Re-fetch current page from server to ensure consistent data
      dispatch(fetchDoctorsThunk({ page, pageSize, q: debouncedSearch, sortField, sortDir }));
    } catch (err) {
      notify({ message: err?.message || 'Error al eliminar médico', severity: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setConfirmShow(false);
    setTargetDeleteId(null);
  };

  // Reset page when pageSize or sort changes
  useEffect(() => {
    setPage(1);
  }, [pageSize, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize));

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const loading = status === 'loading';

  return (
    <div>
      <Row className="mb-2 align-items-center">
        <Col md={6} className="mb-2 mb-md-0">
          <InputGroup>
            <InputGroup.Text>Buscar</InputGroup.Text>
            <FormControl placeholder="Nombre, apellido, identidad o especialidad" value={search} onChange={e => setSearch(e.target.value)} />
          </InputGroup>
        </Col>
        <Col md={3} className="text-md-end">
          <Form.Select value={pageSize} onChange={e => setPageSize(parseInt(e.target.value, 10))}>
            <option value={5}>5 por página</option>
            <option value={10}>10 por página</option>
            <option value={25}>25 por página</option>
            <option value={50}>50 por página</option>
          </Form.Select>
        </Col>
        <Col md={3} className="text-md-end">
          <Button variant="success" onClick={() => onRegisterNew && onRegisterNew()}>+ Nuevo Médico</Button>
        </Col>
      </Row>

      {loading ? (
        <div className="d-flex justify-content-center my-4">
          <Spinner animation="border" role="status" />
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th style={{cursor: 'pointer'}} onClick={() => toggleSort('atr_id_medico')}># {sortField === 'atr_id_medico' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th style={{cursor: 'pointer'}} onClick={() => toggleSort('atr_nombre')}>Nombre {sortField === 'atr_nombre' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th style={{cursor: 'pointer'}} onClick={() => toggleSort('atr_apellido')}>Apellido {sortField === 'atr_apellido' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th style={{cursor: 'pointer'}} onClick={() => toggleSort('atr_identidad')}>Identidad {sortField === 'atr_identidad' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th style={{cursor: 'pointer'}} onClick={() => toggleSort('atr_numero_colegiado')}>N° Colegiado {sortField === 'atr_numero_colegiado' ? (sortDir === 'asc' ? '▲' : '▼') : ''}</th>
                <th>Especialidades</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {doctors.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center">No hay médicos registrados</td>
                </tr>
              )}
              {doctors.map((d, idx) => (
                <tr key={d.atr_id_medico ?? d.id ?? idx}>
                  <td>{d.atr_id_medico ?? d.id ?? ((page - 1) * pageSize + idx + 1)}</td>
                  <td>{d.atr_nombre ?? d.nombre ?? ''}</td>
                  <td>{d.atr_apellido ?? d.apellido ?? ''}</td>
                  <td>{d.atr_identidad ?? d.identidad ?? ''}</td>
                  <td>{d.atr_numero_colegiado ?? d.numero_colegiado ?? ''}</td>
                  <td>{(d.Especialidades || d.especialidades || []).map(e => e.atr_especialidad || e.nombre || e.atr_nombre).filter(Boolean).join(', ')}</td>
                  <td>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip id={`tooltip-view-${d.atr_id_medico ?? d.id ?? idx}`}>Ver</Tooltip>}>
                        <span>
                          <Button variant="primary" size="sm" className="me-2" onClick={() => onViewDetails && onViewDetails(d)} aria-label={`ver-${d.atr_id_medico ?? d.id ?? idx}`}>
                            <BsEye />
                          </Button>
                        </span>
                      </OverlayTrigger>

                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip id={`tooltip-edit-${d.atr_id_medico ?? d.id ?? idx}`}>Editar</Tooltip>}>
                        <span>
                          <Button variant="warning" size="sm" className="me-2" onClick={() => onEdit && onEdit(d)} aria-label={`editar-${d.atr_id_medico ?? d.id ?? idx}`}>
                            <BsPencilSquare />
                          </Button>
                        </span>
                      </OverlayTrigger>

                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip id={`tooltip-delete-${d.atr_id_medico ?? d.id ?? idx}`}>Eliminar</Tooltip>}>
                        <span>
                          <Button variant="danger" size="sm" onClick={() => handleDeleteClick(d.atr_id_medico ?? d.id)} aria-label={`eliminar-${d.atr_id_medico ?? d.id ?? idx}`}>
                            <BsTrash />
                          </Button>
                        </span>
                      </OverlayTrigger>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="d-flex justify-content-between align-items-center">
            <div>Mostrando {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, total)} de {total}</div>
            <div>
              <Button variant="light" size="sm" className="me-1" disabled={page <= 1} onClick={() => setPage(1)}>« Primero</Button>
              <Button variant="light" size="sm" className="me-1" disabled={page <= 1} onClick={() => setPage(prev => Math.max(1, prev - 1))}>‹ Prev</Button>
              <span className="mx-2">Página {page} / {totalPages}</span>
              <Button variant="light" size="sm" className="ms-1" disabled={page >= totalPages} onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}>Next ›</Button>
              <Button variant="light" size="sm" className="ms-1" disabled={page >= totalPages} onClick={() => setPage(totalPages)}>Último »</Button>
            </div>
          </div>
        </>
      )}
      <ConfirmDialog
        show={confirmShow}
        title="Confirmar eliminación"
        message="¿Desea eliminar este médico? Esta acción no se puede deshacer."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleting}
      />
    </div>
  );
}
