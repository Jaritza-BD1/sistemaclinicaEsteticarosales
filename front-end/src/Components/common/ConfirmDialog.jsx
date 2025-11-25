import React from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';

export default function ConfirmDialog({ show, title = 'Confirmar', message = '', onConfirm, onCancel, confirmText = 'Aceptar', cancelText = 'Cancelar', loading = false }) {
  return (
    <Modal show={show} onHide={onCancel} centered>
      {title && (
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
      )}
      <Modal.Body>
        <div>{message}</div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          {cancelText}
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={loading}>
          {loading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/> Procesando...</> : confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

