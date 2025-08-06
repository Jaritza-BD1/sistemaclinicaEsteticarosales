import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { fetchAppointments } from '../../services/appointmentService';
import AppointmentForm from './AppointmentForm';
import ModalForm from '../common/ModalForm';

const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'title', headerName: 'Motivo', width: 130 },
  { field: 'status', headerName: 'Estado', width: 120 },
  { field: 'start', headerName: 'Fecha', width: 120, valueGetter: (params) => new Date(params.row.start).toLocaleDateString() },
  {
    field: 'actions',
    headerName: 'Acciones',
    width: 180,
    renderCell: (params) => params.row.renderActions(params.row)
  }
];

export default function AppointmentDataGrid() {
  const [rows, setRows] = React.useState([]);
  const [search, setSearch] = React.useState('');
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);

  React.useEffect(() => {
    fetchAppointments().then(res => setRows(res.data));
  }, []);

  const handleEdit = (row) => {
    setEditing(row);
    setModalOpen(true);
  };
  const handleAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const handleClose = () => setModalOpen(false);
  const handleDelete = async (row) => {
    if (window.confirm('¿Eliminar cita?')) {
      await import('../../services/appointmentService').then(({ deleteAppointment }) => deleteAppointment(row.id));
      setRows(rows => rows.filter(r => r.id !== row.id));
    }
  };
  const handleSuccess = () => {
    setModalOpen(false);
    fetchAppointments().then(res => setRows(res.data));
  };

  const filteredRows = rows.filter(r =>
    r.title?.toLowerCase().includes(search.toLowerCase()) ||
    r.status?.toLowerCase().includes(search.toLowerCase())
  ).map(row => ({
    ...row,
    renderActions: (row) => (
      <>
        <button onClick={() => handleEdit(row)}>Editar</button>
        <button onClick={() => handleDelete(row)}>Eliminar</button>
      </>
    )
  }));

  return (
    <div style={{ height: 500, width: '100%' }}>
      <h2>Citas</h2>
      <input
        type="text"
        placeholder="Buscar por motivo o estado"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 16, width: 300 }}
      />
      <button onClick={handleAdd} style={{ marginBottom: 16 }}>Agregar nueva cita</button>
      <ModalForm open={modalOpen} onClose={handleClose} title={editing ? "Editar Cita" : "Registrar Cita"}>
        <AppointmentForm initialData={editing || {}} onSuccess={handleSuccess} />
      </ModalForm>
      <DataGrid
        rows={filteredRows}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5, 10, 20]}
        getRowId={row => row.id}
        autoHeight
      />
    </div>
  );
} 