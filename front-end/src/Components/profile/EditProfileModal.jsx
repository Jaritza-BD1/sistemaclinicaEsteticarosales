// frontend/src/components/profile/EditProfileModal.jsx
import React, { useState, useEffect } from 'react';
import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
    FormControl,
} from '@mui/material';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
};

const primaryColor = '#D391B0';
const secondaryColor = '#BA6E8F';

const EditProfileModal = ({ open, handleClose, userData, onSave }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (userData) {
            setUsername(userData.username || '');
            setEmail(userData.email || '');
        }
    }, [userData]);

    const handleSave = () => {
        onSave({ username, email }); // Envía los datos actualizados al componente padre
        handleClose();
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={{ ...style, backgroundColor: primaryColor, color: 'white' }}>
                <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ mb: 2, textAlign: 'center' }}>
                    Editar Perfil
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <TextField
                        label="Nombre de Usuario"
                        variant="outlined"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        sx={{ bgcolor: 'white', borderRadius: 1 }}
                        InputLabelProps={{ style: { color: 'black' } }}
                        InputProps={{ style: { color: 'black' } }}
                    />
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <TextField
                        label="Correo Electrónico"
                        variant="outlined"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        sx={{ bgcolor: 'white', borderRadius: 1 }}
                        InputLabelProps={{ style: { color: 'black' } }}
                        InputProps={{ style: { color: 'black' } }}
                    />
                </FormControl>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button onClick={handleClose} sx={{ mr: 2, color: 'white', borderColor: 'white' }} variant="outlined">
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} sx={{ bgcolor: secondaryColor, color: 'white', '&:hover': { bgcolor: '#a75a7a' } }} variant="contained">
                        Guardar
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default EditProfileModal;