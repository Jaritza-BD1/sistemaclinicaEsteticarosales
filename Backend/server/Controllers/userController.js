// backend/server/Controllers/userController.js
const { User } = require('../Models'); // Asume que tu modelo User está exportado así
const { handleError } = require('../helpers/errorHelper'); // Si tienes un helper para errores
const bcrypt = require('bcryptjs'); // Solo si permites cambiar contraseña aquí, pero el modal no lo incluye

// Función para actualizar el perfil del usuario
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id; // El ID del usuario debería venir del token decodificado por el middleware
        const { username, email } = req.body; // Campos que se esperan del frontend

        // Puedes añadir validaciones aquí
        if (!username || !email) {
            return res.status(400).json({ message: 'Nombre de usuario y correo electrónico son requeridos.' });
        }

        // Buscar el usuario en la base de datos
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // Actualizar los campos del usuario
        user.username = username;
        user.email = email;
        // user.nombre = nombre; // Si tienes más campos, actualízalos aquí
        // user.apellido = apellido;

        await user.save(); // Guarda los cambios en la base de datos

        // Excluir información sensible antes de enviar la respuesta
        const userResponse = {
            id: user.id,
            username: user.username,
            email: user.email,
            // Añade otros campos que quieras enviar de vuelta
        };

        res.status(200).json({ message: 'Perfil actualizado con éxito.', user: userResponse });

    } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        // Si tienes un errorHelper, úsalo:
        // handleError(res, error, 'Error al actualizar el perfil');
        res.status(500).json({ message: 'Error interno del servidor al actualizar el perfil.' });
    }
};

module.exports = {
    updateProfile,
    // ... otros métodos del controlador
};