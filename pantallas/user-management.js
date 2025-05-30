class UserManagement {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('medicalUsers')) || [];
        this.currentUser = null;
    }

    // Crear un nuevo usuario
    createUser(userData) {
        // Validaciones
        if (!this.validateUserData(userData)) {
            return false;
        }

        // Verificar si el usuario ya existe
        if (this.users.some(u => u.username === userData.username.toUpperCase())) {
            alert('El nombre de usuario ya existe');
            return false;
        }

        // Verificar si el correo ya existe
        if (this.users.some(u => u.email === userData.email)) {
            alert('El correo electrónico ya está registrado');
            return false;
        }

        // Formatear datos
        const newUser = {
            ...userData,
            username: userData.username.toUpperCase(),
            fullName: userData.fullName.toUpperCase(),
            creationDate: new Date().toISOString(),
            expirationDate: this.calculateExpirationDate(),
            password: this.hashPassword(userData.password),
            status: USER_STATUS.NEW
        };

        this.users.push(newUser);
        this.saveToLocalStorage();
        return true;
    }

    // Calcular fecha de vencimiento
    calculateExpirationDate() {
        const creationDate = new Date();
        const expirationDate = new Date(creationDate);
        expirationDate.setDate(creationDate.getDate() + SYSTEM_PARAMS.ADMIN_DAYS_VALIDITY);
        return expirationDate.toISOString();
    }

    // Validar datos del usuario
    validateUserData(userData) {
        // Validar nombre de usuario (solo letras y números)
        const usernameRegex = /^[A-Za-z0-9]+$/;
        if (!usernameRegex.test(userData.username)) {
            alert('El nombre de usuario solo puede contener letras y números');
            return false;
        }

        // Validar longitud del nombre de usuario
        if (userData.username.length > SYSTEM_PARAMS.USERNAME_MAX_LENGTH) {
            alert(`El nombre de usuario no puede exceder ${SYSTEM_PARAMS.USERNAME_MAX_LENGTH} caracteres`);
            return false;
        }

        // Validar nombre completo (letras y un espacio entre palabras)
        const fullNameRegex = /^[A-Za-z]+( [A-Za-z]+)*$/;
        if (!fullNameRegex.test(userData.fullName)) {
            alert('El nombre completo solo puede contener letras y un espacio entre palabras');
            return false;
        }

        // Validar longitud del nombre completo
        if (userData.fullName.length > SYSTEM_PARAMS.FULLNAME_MAX_LENGTH) {
            alert(`El nombre completo no puede exceder ${SYSTEM_PARAMS.FULLNAME_MAX_LENGTH} caracteres`);
            return false;
        }

        // Validar correo electrónico
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            alert('Por favor ingrese un correo electrónico válido');
            return false;
        }

        // Validar contraseña
        if (userData.password.length < SYSTEM_PARAMS.MIN_PASSWORD_LENGTH || 
            userData.password.length > SYSTEM_PARAMS.MAX_PASSWORD_LENGTH) {
            alert(`La contraseña debe tener entre ${SYSTEM_PARAMS.MIN_PASSWORD_LENGTH} y ${SYSTEM_PARAMS.MAX_PASSWORD_LENGTH} caracteres`);
            return false;
        }

        return true;
    }

    // Hash de contraseña (simulado)
    hashPassword(password) {
        // En un sistema real, usaría un algoritmo seguro como bcrypt
        return btoa(password); // Solo para demostración, no seguro
    }

    // Generar contraseña aleatoria
    generateRandomPassword() {
        const length = Math.floor(Math.random() * (SYSTEM_PARAMS.MAX_PASSWORD_LENGTH - SYSTEM_PARAMS.MIN_PASSWORD_LENGTH + 1)) + SYSTEM_PARAMS.MIN_PASSWORD_LENGTH;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
        let password = "";
        
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }
        
        return password;
    }

    // Guardar usuarios en localStorage
    saveToLocalStorage() {
        localStorage.setItem('medicalUsers', JSON.stringify(this.users));
    }

    // Obtener todos los usuarios
    getAllUsers() {
        return this.users.map(user => ({
            ...user,
            password: '********' // Ocultar contraseña
        }));
    }

    // Restablecer contraseña
    resetPassword(username, newPassword) {
        const user = this.users.find(u => u.username === username);
        if (!user) return false;

        if (newPassword.length < SYSTEM_PARAMS.MIN_PASSWORD_LENGTH || 
            newPassword.length > SYSTEM_PARAMS.MAX_PASSWORD_LENGTH) {
            return false;
        }

        user.password = this.hashPassword(newPassword);
        this.saveToLocalStorage();
        return true;
    }

    // Cambiar estado de usuario
    changeUserStatus(username, newStatus) {
        const user = this.users.find(u => u.username === username);
        if (!user) return false;

        user.status = newStatus;
        this.saveToLocalStorage();
        return true;
    }
}