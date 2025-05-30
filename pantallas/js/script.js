document.addEventListener('DOMContentLoaded', function() {
    const userManager = new UserManagement();
    const userForm = document.getElementById('userForm');
    const generatePasswordBtn = document.getElementById('generatePassword');
    const resetFormBtn = document.getElementById('resetForm');
    const usersTable = document.getElementById('usersTable').getElementsByTagName('tbody')[0];

    // Cargar lista de usuarios al iniciar
    loadUsersTable();

    // Generar contraseña aleatoria
    generatePasswordBtn.addEventListener('click', function() {
        const passwordField = document.getElementById('password');
        passwordField.value = userManager.generateRandomPassword();
    });

    // Limpiar formulario
    resetFormBtn.addEventListener('click', function() {
        userForm.reset();
    });

    // Enviar formulario
    userForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const userData = {
            username: document.getElementById('username').value,
            fullName: document.getElementById('fullName').value,
            role: document.getElementById('role').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            status: document.getElementById('status').value
        };

        if (userManager.createUser(userData)) {
            alert('Usuario creado exitosamente');
            userForm.reset();
            loadUsersTable();
        }
    });

    // Cargar tabla de usuarios
    function loadUsersTable() {
        usersTable.innerHTML = '';
        const users = userManager.getAllUsers();
        
        users.forEach(user => {
            const row = usersTable.insertRow();
            
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.fullName}</td>
                <td>${ROLES[user.role.toUpperCase()]?.name || user.role}</td>
                <td>${user.email}</td>
                <td class="status-${user.status}">${USER_STATUS_NAMES[user.status]}</td>
                <td>${new Date(user.creationDate).toLocaleDateString()}</td>
                <td>${new Date(user.expirationDate).toLocaleDateString()}</td>
                <td class="actions">
                    <button class="edit-btn">Editar</button>
                    <button class="reset-btn">Resetear</button>
                </td>
            `;
        });
    }
});