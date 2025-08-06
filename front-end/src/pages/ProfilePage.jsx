// frontend/src/components/profile/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Avatar, IconButton } from '@mui/material';
import EditProfileModal from '../Components/profile/EditProfileModal'; // Asegúrate de la ruta correcta
import { useAuth } from '../Components/context/AuthContext'; // Para obtener los datos del usuario logueado
import api from '../services/api'; // Para hacer las solicitudes HTTP al backend
import PhotoCamera from '@mui/icons-material/PhotoCamera';

const ProfilePage = () => {
  const { user, updateUser } = useAuth(); // 'user' es el usuario actual, 'login' para actualizar el contexto si el perfil cambia
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileData, setProfileData] = useState(null); // Estado para mostrar la información del perfil
  const [profileImage, setProfileImage] = useState(null); // Imagen de perfil local

  useEffect(() => {
    // Cuando el usuario del AuthContext cambie, actualiza los datos del perfil local
    if (user) {
      setProfileData({
        username: user.atr_usuario,
        name: user.atr_nombre_usuario,
        email: user.atr_correo_electronico,
      });
      // Si en el futuro tienes un campo user.avatar, puedes usarlo aquí
      setProfileImage(user.avatar || null);
    }
  }, [user]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveProfileChanges = async (updatedFields) => {
    try {
      // Llama a la API usando el servicio api.js
      const response = await api.put('/profile', updatedFields);
      if (response && response.user) {
        setProfileData({
          username: response.user.atr_usuario,
          name: response.user.atr_nombre_usuario,
          email: response.user.atr_correo_electronico,
        });
        updateUser(response.user); // Actualiza el usuario en el contexto
        handleCloseModal();
      }
    } catch (error) {
      // Manejar diferentes tipos de error
      let errorMessage = 'Error desconocido';
      
      if (error && typeof error === 'object') {
        if (error.message) {
          errorMessage = error.message;
        } else if (error.error) {
          errorMessage = error.error;
        } else if (error.toString) {
          errorMessage = error.toString();
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      console.error('Error al actualizar el perfil:', errorMessage);
      // Aquí puedes mostrar un mensaje de error al usuario
    }
  };

  // Manejar cambio de imagen de perfil (solo frontend)
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!profileData) {
    return <Typography>Cargando datos del perfil...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Mi Perfil
      </Typography>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={profileImage}
            alt={profileData.username}
            sx={{ width: 100, height: 100, mb: 1 }}
          />
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="profile-image-upload"
            type="file"
            onChange={handleProfileImageChange}
          />
          <label htmlFor="profile-image-upload">
            <IconButton color="primary" aria-label="subir foto" component="span">
              <PhotoCamera />
            </IconButton>
            <Typography variant="caption" display="block">Cambiar foto</Typography>
          </label>
        </Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Información del Usuario
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          <strong>Nombre de Usuario:</strong> {profileData.username}
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          <strong>Nombre Completo:</strong> {profileData.name}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          <strong>Correo Electrónico:</strong> {profileData.email}
        </Typography>
        {/* Puedes añadir más campos de información aquí */}

        <Button
          variant="contained"
          onClick={handleOpenModal}
          sx={{
            bgcolor: '#BA6E8F', // Color secundario para el botón
            color: 'white',
            '&:hover': { bgcolor: '#a75a7a' },
            mt: 3
          }}
        >
          Editar Perfil
        </Button>
      </Paper>

      <EditProfileModal
        open={isModalOpen}
        handleClose={handleCloseModal}
        userData={profileData} // Pasa los datos actuales al modal
        onSave={handleSaveProfileChanges} // Pasa la función para guardar
      />
    </Box>
  );
};

export default ProfilePage;