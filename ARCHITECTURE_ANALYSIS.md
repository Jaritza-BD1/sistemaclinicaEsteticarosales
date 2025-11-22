# System Architecture Analysis

## Backend Architecture

### Overview
The backend is a Node.js application following an MVC (Model-View-Controller) pattern with additional architectural elements. It's organized into distinct layers that separate concerns effectively.

### Key Components

1. **Entry Point**
   - `server.js`: Main application entry point that initializes the server

2. **Configuration Layer**
   - `Config/`: Contains configuration files for database, CORS, environment variables
   - `env.example`: Example environment configuration file

3. **Data Layer (Models)**
   - `Models/`: Contains all database models representing entities:
     - User, Patient, Doctor, Appointment, Treatment, Exam, Product, etc.
     - Related entities like addresses, emails, phones for patients/doctors
     - System entities like Roles, Permissions, Logs (Bitacora), Backup codes

4. **Business Logic Layer (Services)**
   - `services/`: Contains business logic separated by domain:
     - Appointment, Authentication, Backup, Bitacora, Object, Permission, Product, Role, Scheduler, Two-Factor services
     - Each service handles specific business operations for its domain

5. **Presentation Layer (Controllers)**
   - `Controllers/`: REST API endpoints that handle HTTP requests:
     - Each controller corresponds to a specific domain (appointments, users, doctors, etc.)
     - Controllers interact with services to fulfill requests

6. **Routing Layer**
   - `Routers/`: Defines API routes and maps them to controllers:
     - Modular routing for different domains (appointments, users, doctors, etc.)

7. **Middleware Layer**
   - `Middlewares/`: Cross-cutting concerns like authentication, validation, error handling:
     - Auth, Admin, Appointment, Calendar middlewares
     - Validation and error handling middleware

8. **Utility Layer**
   - `utils/`: Helper functions for logging, mailing, password generation
   - `helpers/`: Additional helper functions for bitacora, error handling, token management

9. **Infrastructure**
   - `Migrations/`: Database schema migration scripts
   - `seeders/`: Data seeding scripts
   - `scripts/`: Utility scripts like migration runners
   - `uploads/`: File storage for avatars
   - `logs/`: Application logging
   - `backups/`: Database backup storage

### Architectural Patterns
- **Layered Architecture**: Clear separation between data, business logic, and presentation layers
- **MVC Pattern**: Models for data, Controllers for handling requests, Services for business logic
- **Modular Design**: Each domain (appointments, users, doctors) has its own modules
- **Middleware Pattern**: Cross-cutting concerns handled through middleware

## Frontend Architecture

### Overview
The frontend is a React application using modern development practices with Redux for state management. It follows a component-based architecture with clear separation of concerns.

### Key Components

1. **Entry Point**
   - `src/index.js`: Main application entry point
   - `src/App.js` or `src/App.jsx`: Root application component

2. **Component Layer**
   - `src/Components/`: UI components organized by feature:
     - Feature-specific components (appointments, doctors, patients, treatments, etc.)
     - Common components (forms, modals, layout components)
     - Authentication components
     - Admin components (backup, user management)
     - Two-factor authentication components

3. **State Management**
   - `src/redux/`: Redux store and slices for state management:
     - Feature-specific slices (appointments, doctors, patients, treatments, etc.)
     - Local storage integration
     - Selectors for data access

4. **Routing**
   - `src/routes/`: Route definitions organized by feature:
     - Bitacora, Citas (appointments), Doctor, Examen (exams), Paciente (patients), tratamiento (treatments)
   - Likely uses React Router for navigation

5. **Service Layer**
   - `src/services/`: API service layer:
     - Feature-specific services (appointment, auth, backup, bitacora, doctor, etc.)
     - Utility services (cache, validation schemas, security)
     - Centralized API communication

6. **Presentation Layer**
   - `src/pages/`: Page components that compose features
   - `src/layouts/`: Layout components (AppLayout, AuthLayout)
   - `src/hooks/`: Custom React hooks for reusable logic

7. **Assets and Styling**
   - `src/asset/`: Static assets (images, styles):
     - CSS styles organized by component and feature
     - Color system documentation
     - Component-specific styles

8. **Utility Layer**
   - `src/utils/`: Utility functions
   - `src/hooks/`: Custom React hooks
   - `src/context/`: React context providers

### Architectural Patterns
- **Component-Based Architecture**: Reusable UI components
- **Redux State Management**: Centralized state management with feature slices
- **Service Layer**: Separation of API calls from components
- **Modular Design**: Organization by features/domains
- **Layered Architecture**: Clear separation between presentation, state, and data layers

## Module Interactions

### Backend-Frontend Communication
1. **RESTful API**: Frontend communicates with backend through REST endpoints
2. **Authentication**: JWT-based authentication with token handling
3. **Data Flow**:
   - Frontend components dispatch Redux actions
   - Redux thunks or services make API calls to backend
   - Backend processes requests through controllers → services → models
   - Response data updates Redux store
   - Components re-render with updated data

### Feature Areas
1. **User Management**:
   - Backend: User model, auth controllers, user services
   - Frontend: UserManager components, auth services, user redux slice

2. **Appointment Scheduling**:
   - Backend: Appointment model, appointment controllers and services
   - Frontend: Appointment components, calendar components, appointment services and redux

3. **Patient Management**:
   - Backend: Patient model with related entities, patient controllers and services
   - Frontend: Patient components, patient services and redux

4. **Doctor Management**:
   - Backend: Doctor model with related entities, doctor controllers and services
   - Frontend: Doctor components, doctor services and redux

5. **Treatment Management**:
   - Backend: Treatment model, treatment controllers and services
   - Frontend: Treatment components, treatment services and redux

6. **Examination Management**:
   - Backend: Exam model, exam controllers and services
   - Frontend: Exam components, exam services and redux

7. **Pharmacy/Products**:
   - Backend: Product model, product controllers and services
   - Frontend: Pharmacy components, product services and redux

8. **Role & Permission Management**:
   - Backend: Role, Permission, Object models and related controllers/services
   - Frontend: Role & Permission components, permission services and redux

9. **Backup Management**:
   - Backend: Backup service, backup controllers
   - Frontend: Backup components, backup services

10. **Audit Logging (Bitacora)**:
    - Backend: Bitacora model, bitacora controllers and services
    - Frontend: Bitacora components, bitacora services and redux

### Security Features
1. **Two-Factor Authentication**:
   - Backend: Two-factor service and controller
   - Frontend: 2FA setup and verification components

2. **Password Security**:
   - Backend: Password history model, bcrypt for hashing
   - Frontend: Password change components

3. **Access Control**:
   - Backend: Admin middleware, auth middleware
   - Frontend: Protected routes, role-based rendering

## Summary

The system follows a well-structured, modular architecture with clear separation of concerns:

1. **Backend** implements a layered MVC architecture with distinct modules for each domain, making it maintainable and scalable.

2. **Frontend** uses a component-based architecture with Redux for state management, organized by features for better maintainability.

3. **Communication** between frontend and backend follows RESTful principles with proper error handling and authentication mechanisms.

4. **Security** is implemented at multiple levels including authentication, authorization, and data protection.

5. **Extensibility** is supported through the modular design where new features can be added with minimal impact on existing code.

This architecture provides a solid foundation for a medical clinic management system with room for future enhancements and scalability.