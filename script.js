// Estado global de la aplicación
let currentUser = null;
let currentAdmin = null;
let appointments = [];
let allUsers = [];
let selectedService = null;

// Tipos de problemas por servicio
const problemTypes = {
    agua: [
        'Fuga de agua en tubería',
        'Goteo en grifo',
        'Destapado de lavamanos',
        'Destapado de inodoro',
        'Destapado de ducha',
        'Instalación de sanitario',
        'Instalación de lavamanos',
        'Reparación de cisterna',
        'Cambio de llaves',
        'Problema con calentador'
    ],
    luz: [
        'Cortocircuito',
        'Instalación de tomas',
        'Instalación de interruptores',
        'Reparación de tablero eléctrico',
        'Instalación de luminarias',
        'Cableado eléctrico',
        'Problemas con breakers',
        'Instalación de ventiladores',
        'Reparación de enchufes',
        'Problema eléctrico general'
    ],
    gas: [
        'Fuga de gas',
        'Instalación de estufa',
        'Conexión de cilindro',
        'Reparación de calentador',
        'Instalación de calentador',
        'Revisión de instalación',
        'Cambio de mangueras',
        'Mantenimiento preventivo'
    ],
    carpinteria: [
        'Instalación de cortinas',
        'Montaje de estantes',
        'Reparación de puertas',
        'Instalación de closets',
        'Montaje de muebles',
        'Reparación de ventanas',
        'Instalación de repisas',
        'Trabajo en madera personalizado'
    ],
    pintura: [
        'Pintura de paredes',
        'Pintura de techos',
        'Pintura exterior',
        'Reparación de grietas',
        'Acabados decorativos',
        'Pintura de puertas',
        'Retoque de pintura',
        'Preparación de superficies'
    ],
    aire: [
        'Instalación de aire acondicionado',
        'Mantenimiento de A/C',
        'Reparación de A/C',
        'Limpieza de filtros',
        'Recarga de gas',
        'Reparación de control remoto',
        'Revisión técnica'
    ],
    cerrajeria: [
        'Cambio de cerradura',
        'Apertura de puerta',
        'Duplicado de llaves',
        'Instalación de chapas',
        'Reparación de cerradura',
        'Instalación de sistemas de seguridad'
    ],
    electrodomesticos: [
        'Reparación de nevera',
        'Reparación de lavadora',
        'Reparación de microondas',
        'Reparación de estufa',
        'Mantenimiento de electrodomésticos',
        'Instalación de electrodomésticos'
    ],
    jardineria: [
        'Poda de árboles',
        'Diseño de jardín',
        'Mantenimiento de césped',
        'Plantación',
        'Riego automático',
        'Limpieza de jardín'
    ],
    limpieza: [
        'Limpieza profunda',
        'Desinfección',
        'Limpieza de alfombras',
        'Limpieza de vidrios',
        'Limpieza post-construcción',
        'Mantenimiento regular'
    ]
};

// Gradientes de servicios
const serviceGradients = {
    agua: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    luz: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    gas: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    carpinteria: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    pintura: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
    aire: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    cerrajeria: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
    electrodomesticos: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    jardineria: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    limpieza: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
};

// Sistema de Toast
function showToast(message, description = '', type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️';
    
    toast.innerHTML = `
        <div class="toast-header">
            <span>${icon}</span>
            <span>${message}</span>
        </div>
        ${description ? `<div class="toast-description">${description}</div>` : ''}
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

// Inicialización de la aplicación
function initApp() {
    // Verificar sesión existente
    checkExistingSession();
    
    // Event listeners para formularios
    setupEventListeners();
    
    // Configurar fecha mínima para el formulario
    const dateInput = document.getElementById('appointment-date');
    if (dateInput) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.min = tomorrow.toISOString().split('T')[0];
    }
    
    // Inicializar iconos de Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Verificar sesión existente
function checkExistingSession() {
    // Verificar sesión de administrador primero
    const savedAdmin = localStorage.getItem('serviya_admin_session');
    if (savedAdmin) {
        try {
            currentAdmin = JSON.parse(savedAdmin);
            loadAdminData();
            showAdminPanel();
            return;
        } catch (error) {
            localStorage.removeItem('serviya_admin_session');
        }
    }
    
    // Verificar sesión de usuario regular
    const savedUser = localStorage.getItem('serviya_current_user');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            loadUserAppointments();
            showMainApp();
        } catch (error) {
            localStorage.removeItem('serviya_current_user');
            showLandingPage();
        }
    } else {
        showLandingPage();
    }
}

// Cargar citas del usuario
function loadUserAppointments() {
    const savedAppointments = localStorage.getItem('serviya_appointments');
    if (savedAppointments && currentUser) {
        try {
            appointments = JSON.parse(savedAppointments).map(apt => ({
                ...apt,
                date: new Date(apt.date),
                createdAt: new Date(apt.createdAt)
            }));
            updateAppointmentsUI();
        } catch (error) {
            localStorage.removeItem('serviya_appointments');
            appointments = [];
        }
    }
}

// Guardar citas en localStorage
function saveAppointments() {
    if (currentUser && appointments.length > 0) {
        localStorage.setItem('serviya_appointments', JSON.stringify(appointments));
    }
}

// Event Listeners
function setupEventListeners() {
    // Formulario de login
    const loginForm = document.getElementById('login-form-element');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Formulario de registro
    const registerForm = document.getElementById('register-form-element');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Formulario de admin
    const adminForm = document.getElementById('admin-form-element');
    if (adminForm) {
        adminForm.addEventListener('submit', handleAdminLogin);
    }
    
    // Formulario de citas
    const appointmentForm = document.getElementById('appointment-form');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', handleAppointmentSubmit);
    }
    
    // Selección de servicios
    const serviceOptions = document.querySelectorAll('.service-option');
    serviceOptions.forEach(option => {
        option.addEventListener('click', () => selectService(option.dataset.service));
    });
    
    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideLoginForm();
        }
    });
    
    // Clic fuera del modal
    const loginOverlay = document.getElementById('login-form');
    if (loginOverlay) {
        loginOverlay.addEventListener('click', (e) => {
            if (e.target === loginOverlay) {
                hideLoginForm();
            }
        });
    }
}

// Autenticación
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        showToast('Error', 'Por favor complete todos los campos', 'error');
        return;
    }
    
    // Verificar credenciales
    const users = JSON.parse(localStorage.getItem('serviya_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('serviya_current_user', JSON.stringify(user));
        loadUserAppointments();
        showMainApp();
        hideLoginForm();
        showToast('¡Bienvenido!', `Bienvenido de nuevo, ${user.name}!`);
    } else {
        showToast('Error', 'Credenciales incorrectas', 'error');
    }
}

function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    if (!name || !email || !password || !confirmPassword) {
        showToast('Error', 'Por favor complete todos los campos', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showToast('Error', 'Las contraseñas no coinciden', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('Error', 'La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    // Verificar si el email ya existe
    const users = JSON.parse(localStorage.getItem('serviya_users') || '[]');
    const existingUser = users.find(u => u.email === email);
    
    if (existingUser) {
        showToast('Error', 'Este email ya está registrado', 'error');
        return;
    }
    
    // Crear nuevo usuario
    const newUser = {
        id: Date.now().toString(),
        name: name,
        email: email,
        password: password,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('serviya_users', JSON.stringify(users));
    
    currentUser = newUser;
    localStorage.setItem('serviya_current_user', JSON.stringify(newUser));
    
    showMainApp();
    hideLoginForm();
    showToast('¡Cuenta creada!', `¡Cuenta creada exitosamente! Bienvenido, ${newUser.name}!`);
}

function googleLogin() {
    // Simulación de login con Google
    const googleUser = {
        id: 'google_' + Date.now(),
        name: 'Usuario de Google',
        email: 'usuario@gmail.com',
        createdAt: new Date().toISOString()
    };
    
    currentUser = googleUser;
    localStorage.setItem('serviya_current_user', JSON.stringify(googleUser));
    
    showMainApp();
    hideLoginForm();
    showToast('¡Bienvenido!', `¡Bienvenido, ${googleUser.name}!`);
}

function logout() {
    localStorage.removeItem('serviya_current_user');
    localStorage.removeItem('serviya_appointments');
    currentUser = null;
    appointments = [];
    showLandingPage();
    showToast('Sesión cerrada', 'Sesión cerrada exitosamente');
}

// Admin Authentication
function handleAdminLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    
    if (!email || !password) {
        showToast('Error', 'Por favor complete todos los campos', 'error');
        return;
    }
    
    // Verificar credenciales de administrador
    if (email === 'admin@serviya.com' && password === 'admin123') {
        currentAdmin = {
            id: 'admin',
            name: 'Administrador SERVIYA',
            email: email,
            role: 'admin'
        };
        
        localStorage.setItem('serviya_admin_session', JSON.stringify(currentAdmin));
        loadAdminData();
        showAdminPanel();
        hideLoginForm();
        showToast('¡Bienvenido Administrador!', 'Acceso al panel de administración concedido');
    } else {
        showToast('Error', 'Credenciales de administrador incorrectas', 'error');
    }
}

function adminLogout() {
    localStorage.removeItem('serviya_admin_session');
    currentAdmin = null;
    allUsers = [];
    appointments = [];
    showLandingPage();
    showToast('Sesión cerrada', 'Sesión de administrador cerrada exitosamente');
}

function loadAdminData() {
    // Cargar todos los usuarios
    allUsers = JSON.parse(localStorage.getItem('serviya_users') || '[]');
    
    // Cargar todas las citas
    appointments = JSON.parse(localStorage.getItem('serviya_appointments') || '[]').map(apt => ({
        ...apt,
        date: new Date(apt.date),
        createdAt: new Date(apt.createdAt)
    }));
    
    updateAdminDashboard();
}

// UI Navigation
function showLandingPage() {
    document.getElementById('landing-page').style.display = 'block';
    document.getElementById('main-app').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'none';
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function showMainApp() {
    document.getElementById('landing-page').style.display = 'none';
    document.getElementById('main-app').style.display = 'flex';
    document.getElementById('admin-panel').style.display = 'none';
    
    // Actualizar nombre de usuario
    const userNameElement = document.getElementById('user-name');
    if (userNameElement && currentUser) {
        userNameElement.textContent = currentUser.name;
    }
    
    updateAppointmentsUI();
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function showAdminPanel() {
    document.getElementById('landing-page').style.display = 'none';
    document.getElementById('main-app').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'flex';
    
    // Actualizar nombre de admin
    const adminNameElement = document.getElementById('admin-name');
    if (adminNameElement && currentAdmin) {
        adminNameElement.textContent = currentAdmin.name;
    }
    
    updateAdminDashboard();
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function showLoginForm() {
    document.getElementById('login-form').style.display = 'flex';
    // Limpiar formularios
    document.getElementById('login-form-element').reset();
    document.getElementById('register-form-element').reset();
    // Mostrar tab de login por defecto
    switchTab('login');
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function hideLoginForm() {
    document.getElementById('login-form').style.display = 'none';
}

// Tab Navigation
function switchTab(tabName) {
    // Login tabs
    const loginTabs = document.querySelectorAll('.login-tabs .tab-btn');
    const loginContents = document.querySelectorAll('.login-card .tab-content');
    
    loginTabs.forEach(tab => tab.classList.remove('active'));
    loginContents.forEach(content => content.classList.remove('active'));
    
    const tabIndex = tabName === 'login' ? 1 : tabName === 'register' ? 2 : 3;
    document.querySelector(`.login-tabs .tab-btn:nth-child(${tabIndex})`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function switchMainTab(tabName) {
    // Main app tabs
    const mainTabs = document.querySelectorAll('.tabs-nav .tab-btn');
    const mainContents = document.querySelectorAll('.tab-contents .tab-content');
    
    mainTabs.forEach(tab => tab.classList.remove('active'));
    mainContents.forEach(content => content.classList.remove('active'));
    
    const tabIndex = tabName === 'info' ? 0 : tabName === 'schedule' ? 1 : 2;
    mainTabs[tabIndex].classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Password Toggle
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.parentNode.querySelector('.password-toggle i');
    
    if (input.type === 'password') {
        input.type = 'text';
        button.setAttribute('data-lucide', 'eye-off');
    } else {
        input.type = 'password';
        button.setAttribute('data-lucide', 'eye');
    }
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Service Selection
function selectService(serviceId) {
    selectedService = serviceId;
    
    // Actualizar UI
    const serviceOptions = document.querySelectorAll('.service-option');
    serviceOptions.forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.service === serviceId) {
            option.classList.add('selected');
        }
    });
    
    // Mostrar problemas específicos
    const problemSection = document.getElementById('problem-section');
    const problemSelect = document.getElementById('problem-type');
    
    if (problemTypes[serviceId]) {
        problemSection.style.display = 'block';
        problemSelect.innerHTML = '<option value="">Seleccione el tipo de problema</option>';
        
        problemTypes[serviceId].forEach(problem => {
            const option = document.createElement('option');
            option.value = problem;
            option.textContent = problem;
            problemSelect.appendChild(option);
        });
    } else {
        problemSection.style.display = 'none';
    }
}

// Appointment Management
function handleAppointmentSubmit(e) {
    e.preventDefault();
    
    if (!selectedService) {
        showToast('Error', 'Por favor seleccione un tipo de servicio', 'error');
        return;
    }
    
    // Recopilar datos del formulario
    const formData = {
        name: document.getElementById('client-name').value,
        phone: document.getElementById('client-phone').value,
        email: document.getElementById('client-email').value,
        address: document.getElementById('client-address').value,
        serviceType: selectedService,
        problemType: document.getElementById('problem-type').value,
        description: document.getElementById('problem-description').value,
        date: document.getElementById('appointment-date').value,
        time: document.getElementById('appointment-time').value
    };
    
    // Validar campos requeridos
    if (!formData.name || !formData.phone || !formData.address || !formData.date || !formData.time) {
        showToast('Error', 'Por favor complete todos los campos requeridos', 'error');
        return;
    }
    
    // Crear cita
    const appointment = {
        id: Date.now().toString(),
        ...formData,
        date: new Date(formData.date),
        status: 'programada',
        createdAt: new Date(),
        userId: currentUser.id
    };
    
    appointments.push(appointment);
    saveAppointments();
    updateAppointmentsUI();
    
    // Limpiar formulario
    document.getElementById('appointment-form').reset();
    selectedService = null;
    document.querySelectorAll('.service-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.getElementById('problem-section').style.display = 'none';
    
    // Cambiar a tab de citas
    switchMainTab('appointments');
    
    showToast('¡Cita agendada!', `Su cita está programada para el ${appointment.date.toLocaleDateString('es-ES')} a las ${appointment.time}`);
}

function scheduleEmergency() {
    if (!selectedService) {
        showToast('Error', 'Por favor seleccione un tipo de servicio', 'error');
        return;
    }
    
    // Recopilar datos básicos
    const formData = {
        name: document.getElementById('client-name').value,
        phone: document.getElementById('client-phone').value,
        email: document.getElementById('client-email').value,
        address: document.getElementById('client-address').value,
        serviceType: selectedService,
        problemType: document.getElementById('problem-type').value,
        description: document.getElementById('problem-description').value
    };
    
    // Validar campos básicos
    if (!formData.name || !formData.phone || !formData.address) {
        showToast('Error', 'Para emergencias necesitamos: nombre, teléfono y dirección', 'error');
        return;
    }
    
    // Crear cita de emergencia
    const appointment = {
        id: Date.now().toString(),
        ...formData,
        date: new Date(),
        time: 'ASAP',
        status: 'urgente',
        createdAt: new Date(),
        userId: currentUser.id
    };
    
    appointments.push(appointment);
    saveAppointments();
    updateAppointmentsUI();
    
    // Limpiar formulario
    document.getElementById('appointment-form').reset();
    selectedService = null;
    document.querySelectorAll('.service-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.getElementById('problem-section').style.display = 'none';
    
    // Cambiar a tab de citas
    switchMainTab('appointments');
    
    showToast('🚨 Emergencia registrada', 'Un técnico se comunicará con usted en los próximos 30 minutos.', 'warning');
}

function updateAppointmentStatus(appointmentId, newStatus) {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (appointment) {
        appointment.status = newStatus;
        saveAppointments();
        updateAppointmentsUI();
        
        const statusMessages = {
            completada: '✅ Cita marcada como completada',
            cancelada: '❌ Cita cancelada',
            programada: '📅 Cita reprogramada',
            urgente: '🚨 Cita marcada como emergencia'
        };
        
        showToast('Estado actualizado', statusMessages[newStatus]);
    }
}

function deleteAppointment(appointmentId) {
    appointments = appointments.filter(apt => apt.id !== appointmentId);
    saveAppointments();
    updateAppointmentsUI();
    showToast('Cita eliminada', '🗑️ Cita eliminada exitosamente');
}

// UI Updates
function updateAppointmentsUI() {
    const urgentCount = appointments.filter(a => a.status === 'urgente').length;
    const scheduledCount = appointments.filter(a => a.status === 'programada').length;
    const totalCount = appointments.length;
    
    // Actualizar badge en tab
    const appointmentsBadge = document.getElementById('appointments-badge');
    if (appointmentsBadge) {
        if (urgentCount + scheduledCount > 0) {
            appointmentsBadge.style.display = 'inline';
            appointmentsBadge.textContent = urgentCount + scheduledCount;
        } else {
            appointmentsBadge.style.display = 'none';
        }
    }
    
    // Actualizar cards de resumen
    const summaryCards = document.getElementById('summary-cards');
    if (summaryCards) {
        if (totalCount > 0) {
            summaryCards.style.display = 'grid';
            document.getElementById('scheduled-count').textContent = scheduledCount;
            document.getElementById('urgent-count').textContent = urgentCount;
            document.getElementById('total-count').textContent = totalCount;
        } else {
            summaryCards.style.display = 'none';
        }
    }
    
    // Actualizar lista de citas
    const appointmentsContainer = document.getElementById('appointments-container');
    const noAppointments = document.getElementById('no-appointments');
    
    if (appointments.length === 0) {
        if (noAppointments) noAppointments.style.display = 'block';
        if (appointmentsContainer) appointmentsContainer.innerHTML = '';
    } else {
        if (noAppointments) noAppointments.style.display = 'none';
        if (appointmentsContainer) {
            appointmentsContainer.innerHTML = '';
            
            // Ordenar citas (urgentes primero, luego por fecha)
            const sortedAppointments = [...appointments].sort((a, b) => {
                if (a.status === 'urgente' && b.status !== 'urgente') return -1;
                if (a.status !== 'urgente' && b.status === 'urgente') return 1;
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            
            sortedAppointments.forEach(appointment => {
                const appointmentCard = createAppointmentCard(appointment);
                appointmentsContainer.appendChild(appointmentCard);
            });
        }
    }
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function createAppointmentCard(appointment) {
    const card = document.createElement('div');
    card.className = `appointment-card ${appointment.status}`;
    
    const serviceNames = {
        agua: 'Plomería y Agua',
        luz: 'Electricidad',
        gas: 'Gas',
        carpinteria: 'Carpintería',
        pintura: 'Pintura',
        aire: 'Aire Acondicionado',
        cerrajeria: 'Cerrajería',
        electrodomesticos: 'Electrodomésticos',
        jardineria: 'Jardinería',
        limpieza: 'Limpieza'
    };
    
    const statusNames = {
        programada: 'Programada',
        urgente: 'Emergencia',
        completada: 'Completada',
        cancelada: 'Cancelada'
    };
    
    const serviceColor = appointment.serviceType ? serviceGradients[appointment.serviceType] : '#6b7280';
    
    card.innerHTML = `
        <div class="appointment-header">
            <div class="appointment-info">
                <h4>${appointment.name}</h4>
                <div class="appointment-meta">
                    <span><i data-lucide="phone"></i> ${appointment.phone}</span>
                    ${appointment.email ? `<span><i data-lucide="mail"></i> ${appointment.email}</span>` : ''}
                    <span><i data-lucide="map-pin"></i> ${appointment.address}</span>
                    ${appointment.status !== 'urgente' ? `<span><i data-lucide="calendar"></i> ${appointment.date.toLocaleDateString('es-ES')}</span>` : ''}
                    ${appointment.time !== 'ASAP' ? `<span><i data-lucide="clock"></i> ${appointment.time}</span>` : ''}
                </div>
            </div>
            <div class="status-badge ${appointment.status}">
                ${statusNames[appointment.status]}
            </div>
        </div>
        
        <div class="appointment-service">
            <div class="service-badge" style="background: ${serviceColor}">
                ${serviceNames[appointment.serviceType] || appointment.serviceType}
            </div>
            ${appointment.problemType ? `<span class="problem-type">${appointment.problemType}</span>` : ''}
        </div>
        
        ${appointment.description ? `
            <div class="appointment-description">
                ${appointment.description}
            </div>
        ` : ''}
        
        <div class="appointment-actions">
            ${appointment.status === 'programada' ? `
                <button class="btn btn-small btn-success" onclick="updateAppointmentStatus('${appointment.id}', 'completada')">
                    <i data-lucide="check"></i>
                    Completar
                </button>
                <button class="btn btn-small btn-emergency" onclick="updateAppointmentStatus('${appointment.id}', 'urgente')">
                    <i data-lucide="alert-triangle"></i>
                    Marcar Urgente
                </button>
                <button class="btn btn-small btn-outline" onclick="updateAppointmentStatus('${appointment.id}', 'cancelada')">
                    <i data-lucide="x"></i>
                    Cancelar
                </button>
            ` : ''}
            ${appointment.status === 'urgente' ? `
                <button class="btn btn-small btn-success" onclick="updateAppointmentStatus('${appointment.id}', 'completada')">
                    <i data-lucide="check"></i>
                    Completar
                </button>
                <button class="btn btn-small btn-primary" onclick="updateAppointmentStatus('${appointment.id}', 'programada')">
                    <i data-lucide="calendar"></i>
                    Programar
                </button>
            ` : ''}
            ${appointment.status === 'completada' || appointment.status === 'cancelada' ? `
                <button class="btn btn-small btn-primary" onclick="updateAppointmentStatus('${appointment.id}', 'programada')">
                    <i data-lucide="calendar"></i>
                    Reprogramar
                </button>
            ` : ''}
            <button class="btn btn-small btn-outline" onclick="deleteAppointment('${appointment.id}')" style="color: #ef4444; border-color: #ef4444;">
                <i data-lucide="trash-2"></i>
                Eliminar
            </button>
        </div>
    `;
    
    return card;
}

// Utility Functions
function formatDate(date) {
    return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatTime(time) {
    return time.replace(':', ':');
}

// Admin Tab Navigation
function switchAdminTab(tabName) {
    // Admin tabs
    const adminTabs = document.querySelectorAll('.admin-tabs-nav .admin-tab-btn');
    const adminContents = document.querySelectorAll('.admin-tab-contents .admin-tab-content');
    
    adminTabs.forEach(tab => tab.classList.remove('active'));
    adminContents.forEach(content => content.classList.remove('active'));
    
    const targetTab = document.querySelector(`[onclick="switchAdminTab('${tabName}')"]`);
    const targetContent = document.getElementById(`admin-${tabName}-tab`);
    
    if (targetTab && targetContent) {
        targetTab.classList.add('active');
        targetContent.classList.add('active');
    }
    
    // Actualizar datos según la pestaña
    if (tabName === 'dashboard') {
        updateAdminDashboard();
    } else if (tabName === 'users') {
        updateUsersTable();
    } else if (tabName === 'appointments') {
        updateAdminAppointmentsList();
    } else if (tabName === 'services') {
        updateServicesStats();
    } else if (tabName === 'reports') {
        updateReports();
    }
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Admin Dashboard Functions
function updateAdminDashboard() {
    const totalUsers = allUsers.length;
    const totalAppointments = appointments.length;
    const urgentAppointments = appointments.filter(a => a.status === 'urgente').length;
    const completedAppointments = appointments.filter(a => a.status === 'completada').length;
    
    // Actualizar estadísticas principales
    document.getElementById('total-users').textContent = totalUsers;
    document.getElementById('total-appointments').textContent = totalAppointments;
    document.getElementById('urgent-appointments').textContent = urgentAppointments;
    document.getElementById('completed-appointments').textContent = completedAppointments;
    
    // Actualizar badges de navegación
    document.getElementById('users-count-badge').textContent = totalUsers;
    document.getElementById('appointments-count-badge').textContent = totalAppointments;
    
    // Actualizar estadísticas de servicios
    updateServicesStatsGrid();
    
    // Actualizar actividad reciente
    updateRecentActivity();
}

function updateServicesStatsGrid() {
    const servicesStats = {};
    const serviceNames = {
        agua: 'Plomería',
        luz: 'Electricidad', 
        gas: 'Gas',
        carpinteria: 'Carpintería',
        pintura: 'Pintura',
        aire: 'Aire A/C',
        cerrajeria: 'Cerrajería',
        electrodomesticos: 'Electrodomésticos',
        jardineria: 'Jardinería',
        limpieza: 'Limpieza'
    };
    
    // Contar citas por servicio
    appointments.forEach(apt => {
        if (servicesStats[apt.serviceType]) {
            servicesStats[apt.serviceType]++;
        } else {
            servicesStats[apt.serviceType] = 1;
        }
    });
    
    const servicesStatsGrid = document.getElementById('services-stats-grid');
    if (servicesStatsGrid) {
        servicesStatsGrid.innerHTML = '';
        
        Object.entries(servicesStats)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 6)
            .forEach(([service, count]) => {
                const serviceItem = document.createElement('div');
                serviceItem.className = 'service-stat-item';
                serviceItem.innerHTML = `
                    <div class="service-icon service-${service}-bg">
                        <i data-lucide="${getServiceIcon(service)}"></i>
                    </div>
                    <div class="service-stat-info">
                        <h4>${serviceNames[service] || service}</h4>
                        <p>${count} citas</p>
                    </div>
                `;
                servicesStatsGrid.appendChild(serviceItem);
            });
    }
}

function getServiceIcon(service) {
    const icons = {
        agua: 'droplets',
        luz: 'zap',
        gas: 'flame',
        carpinteria: 'hammer',
        pintura: 'paintbrush',
        aire: 'wind',
        cerrajeria: 'key',
        electrodomesticos: 'refrigerator',
        jardineria: 'tree-pine',
        limpieza: 'sparkles'
    };
    return icons[service] || 'wrench';
}

function updateRecentActivity() {
    const recentActivityList = document.getElementById('recent-activity-list');
    if (!recentActivityList) return;
    
    recentActivityList.innerHTML = '';
    
    // Actividad de nuevos usuarios (últimos 5)
    const recentUsers = allUsers
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);
    
    recentUsers.forEach(user => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item new-user';
        activityItem.innerHTML = `
            <div class="activity-icon">
                <i data-lucide="user-plus"></i>
            </div>
            <div class="activity-info">
                <h4>Nuevo usuario registrado</h4>
                <p>${user.name} se registró hace ${getTimeAgo(user.createdAt)}</p>
            </div>
        `;
        recentActivityList.appendChild(activityItem);
    });
    
    // Actividad de citas recientes (últimas 5)
    const recentAppointments = appointments
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
    
    recentAppointments.forEach(apt => {
        const activityItem = document.createElement('div');
        activityItem.className = `activity-item ${apt.status === 'urgente' ? 'urgent' : 'new-appointment'}`;
        const serviceNames = {
            agua: 'Plomería',
            luz: 'Electricidad',
            gas: 'Gas',
            carpinteria: 'Carpintería',
            pintura: 'Pintura',
            aire: 'Aire A/C'
        };
        
        activityItem.innerHTML = `
            <div class="activity-icon">
                <i data-lucide="${apt.status === 'urgente' ? 'alert-triangle' : 'calendar-plus'}"></i>
            </div>
            <div class="activity-info">
                <h4>${apt.status === 'urgente' ? 'Emergencia' : 'Nueva cita'} - ${serviceNames[apt.serviceType] || apt.serviceType}</h4>
                <p>${apt.name} - ${getTimeAgo(apt.createdAt)}</p>
            </div>
        `;
        recentActivityList.appendChild(activityItem);
    });
}

function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'hace un momento';
    if (diffInMinutes < 60) return `hace ${diffInMinutes} minutos`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `hace ${diffInHours} horas`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `hace ${diffInDays} días`;
}

// Users Management
function updateUsersTable() {
    const usersTableBody = document.getElementById('users-table-body');
    if (!usersTableBody) return;
    
    usersTableBody.innerHTML = '';
    
    allUsers.forEach(user => {
        const userAppointments = appointments.filter(apt => apt.userId === user.id);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${user.id.substring(0, 8)}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div class="user-avatar">${user.name.charAt(0).toUpperCase()}</div>
                    ${user.name}
                </div>
            </td>
            <td>${user.email}</td>
            <td>${new Date(user.createdAt).toLocaleDateString('es-ES')}</td>
            <td>${userAppointments.length}</td>
            <td><span class="status-active">Activo</span></td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-small btn-outline" onclick="viewUserDetails('${user.id}')">
                        <i data-lucide="eye"></i>
                        Ver
                    </button>
                    <button class="btn btn-small btn-outline" onclick="editUser('${user.id}')">
                        <i data-lucide="edit"></i>
                        Editar
                    </button>
                </div>
            </td>
        `;
        usersTableBody.appendChild(row);
    });
}

function viewUserDetails(userId) {
    const user = allUsers.find(u => u.id === userId);
    const userAppointments = appointments.filter(apt => apt.userId === userId);
    
    if (user) {
        const appointmentsList = userAppointments.map(apt => 
            `• ${apt.serviceType} - ${apt.status} (${apt.date.toLocaleDateString('es-ES')})`
        ).join('\n');
        
        alert(`Detalles del Usuario:
        
Nombre: ${user.name}
Email: ${user.email}
Fecha de registro: ${new Date(user.createdAt).toLocaleDateString('es-ES')}
Total de citas: ${userAppointments.length}

Citas:
${appointmentsList || 'No tiene citas'}`);
    }
}

function editUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
        const newName = prompt('Nuevo nombre:', user.name);
        if (newName && newName !== user.name) {
            user.name = newName;
            localStorage.setItem('serviya_users', JSON.stringify(allUsers));
            updateUsersTable();
            showToast('Usuario actualizado', `Nombre actualizado a: ${newName}`);
        }
    }
}

// Appointments Management
function updateAdminAppointmentsList() {
    const appointmentsList = document.getElementById('admin-appointments-list');
    if (!appointmentsList) return;
    
    appointmentsList.innerHTML = '';
    
    if (appointments.length === 0) {
        appointmentsList.innerHTML = `
            <div class="no-appointments">
                <div class="no-appointments-icon">
                    <i data-lucide="calendar-x"></i>
                </div>
                <h3>No hay citas en el sistema</h3>
                <p>Cuando los usuarios agenden citas, aparecerán aquí</p>
            </div>
        `;
        return;
    }
    
    // Ordenar citas (urgentes primero, luego por fecha)
    const sortedAppointments = [...appointments].sort((a, b) => {
        if (a.status === 'urgente' && b.status !== 'urgente') return -1;
        if (a.status !== 'urgente' && b.status === 'urgente') return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    sortedAppointments.forEach(appointment => {
        const user = allUsers.find(u => u.id === appointment.userId);
        const appointmentCard = createAdminAppointmentCard(appointment, user);
        appointmentsList.appendChild(appointmentCard);
    });
}

function createAdminAppointmentCard(appointment, user) {
    const card = document.createElement('div');
    card.className = `appointment-card ${appointment.status}`;
    
    const serviceNames = {
        agua: 'Plomería y Agua',
        luz: 'Electricidad',
        gas: 'Gas',
        carpinteria: 'Carpintería',
        pintura: 'Pintura',
        aire: 'Aire Acondicionado',
        cerrajeria: 'Cerrajería',
        electrodomesticos: 'Electrodomésticos',
        jardineria: 'Jardinería',
        limpieza: 'Limpieza'
    };
    
    const statusNames = {
        programada: 'Programada',
        urgente: 'Emergencia',
        completada: 'Completada',
        cancelada: 'Cancelada'
    };
    
    const serviceColor = appointment.serviceType ? serviceGradients[appointment.serviceType] : '#6b7280';
    
    card.innerHTML = `
        <div class="appointment-header">
            <div class="appointment-info">
                <h4>${appointment.name} ${user ? `(Usuario: ${user.name})` : ''}</h4>
                <div class="appointment-meta">
                    <span><i data-lucide="phone"></i> ${appointment.phone}</span>
                    ${appointment.email ? `<span><i data-lucide="mail"></i> ${appointment.email}</span>` : ''}
                    <span><i data-lucide="map-pin"></i> ${appointment.address}</span>
                    ${appointment.status !== 'urgente' ? `<span><i data-lucide="calendar"></i> ${appointment.date.toLocaleDateString('es-ES')}</span>` : ''}
                    ${appointment.time !== 'ASAP' ? `<span><i data-lucide="clock"></i> ${appointment.time}</span>` : ''}
                    <span><i data-lucide="user"></i> ID Usuario: ${appointment.userId}</span>
                </div>
            </div>
            <div class="status-badge ${appointment.status}">
                ${statusNames[appointment.status]}
            </div>
        </div>
        
        <div class="appointment-service">
            <div class="service-badge" style="background: ${serviceColor}">
                ${serviceNames[appointment.serviceType] || appointment.serviceType}
            </div>
            ${appointment.problemType ? `<span class="problem-type">${appointment.problemType}</span>` : ''}
        </div>
        
        ${appointment.description ? `
            <div class="appointment-description">
                ${appointment.description}
            </div>
        ` : ''}
        
        <div class="appointment-actions">
            ${appointment.status === 'programada' ? `
                <button class="btn btn-small btn-success" onclick="adminUpdateAppointmentStatus('${appointment.id}', 'completada')">
                    <i data-lucide="check"></i>
                    Completar
                </button>
                <button class="btn btn-small btn-emergency" onclick="adminUpdateAppointmentStatus('${appointment.id}', 'urgente')">
                    <i data-lucide="alert-triangle"></i>
                    Marcar Urgente
                </button>
                <button class="btn btn-small btn-outline" onclick="adminUpdateAppointmentStatus('${appointment.id}', 'cancelada')">
                    <i data-lucide="x"></i>
                    Cancelar
                </button>
            ` : ''}
            ${appointment.status === 'urgente' ? `
                <button class="btn btn-small btn-success" onclick="adminUpdateAppointmentStatus('${appointment.id}', 'completada')">
                    <i data-lucide="check"></i>
                    Completar
                </button>
                <button class="btn btn-small btn-primary" onclick="adminUpdateAppointmentStatus('${appointment.id}', 'programada')">
                    <i data-lucide="calendar"></i>
                    Programar
                </button>
            ` : ''}
            ${appointment.status === 'completada' || appointment.status === 'cancelada' ? `
                <button class="btn btn-small btn-primary" onclick="adminUpdateAppointmentStatus('${appointment.id}', 'programada')">
                    <i data-lucide="calendar"></i>
                    Reprogramar
                </button>
            ` : ''}
            <button class="btn btn-small btn-outline" onclick="adminDeleteAppointment('${appointment.id}')" style="color: #ef4444; border-color: #ef4444;">
                <i data-lucide="trash-2"></i>
                Eliminar
            </button>
        </div>
    `;
    
    return card;
}

function adminUpdateAppointmentStatus(appointmentId, newStatus) {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (appointment) {
        appointment.status = newStatus;
        localStorage.setItem('serviya_appointments', JSON.stringify(appointments));
        updateAdminAppointmentsList();
        updateAdminDashboard();
        
        const statusMessages = {
            completada: '✅ Cita marcada como completada',
            cancelada: '❌ Cita cancelada',
            programada: '📅 Cita reprogramada',
            urgente: '🚨 Cita marcada como emergencia'
        };
        
        showToast('Estado actualizado', statusMessages[newStatus]);
    }
}

function adminDeleteAppointment(appointmentId) {
    if (confirm('¿Está seguro de que desea eliminar esta cita?')) {
        appointments = appointments.filter(apt => apt.id !== appointmentId);
        localStorage.setItem('serviya_appointments', JSON.stringify(appointments));
        updateAdminAppointmentsList();
        updateAdminDashboard();
        showToast('Cita eliminada', '🗑️ Cita eliminada exitosamente');
    }
}

function filterAppointments() {
    const statusFilter = document.getElementById('status-filter').value;
    const serviceFilter = document.getElementById('service-filter').value;
    
    // Esta función se puede expandir para filtrar las citas mostradas
    updateAdminAppointmentsList();
}

// Services Management
function updateServicesStats() {
    const serviceCounts = {};
    appointments.forEach(apt => {
        serviceCounts[apt.serviceType] = (serviceCounts[apt.serviceType] || 0) + 1;
    });
    
    // Actualizar contadores de servicios
    Object.keys(serviceCounts).forEach(service => {
        const countElement = document.getElementById(`${service}-count`);
        if (countElement) {
            countElement.textContent = serviceCounts[service] || 0;
        }
    });
}

// Reports
function updateReports() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Usuarios del mes actual
    const monthlyUsers = allUsers.filter(user => {
        const userDate = new Date(user.createdAt);
        return userDate.getMonth() === currentMonth && userDate.getFullYear() === currentYear;
    }).length;
    
    // Citas completadas del mes
    const monthlyCompleted = appointments.filter(apt => {
        const aptDate = new Date(apt.createdAt);
        return apt.status === 'completada' && 
               aptDate.getMonth() === currentMonth && 
               aptDate.getFullYear() === currentYear;
    }).length;
    
    // Emergencias del mes
    const monthlyEmergencies = appointments.filter(apt => {
        const aptDate = new Date(apt.createdAt);
        return apt.status === 'urgente' && 
               aptDate.getMonth() === currentMonth && 
               aptDate.getFullYear() === currentYear;
    }).length;
    
    document.getElementById('monthly-users').textContent = monthlyUsers;
    document.getElementById('monthly-completed').textContent = monthlyCompleted;
    document.getElementById('monthly-emergencies').textContent = monthlyEmergencies;
    
    // Servicios populares
    updatePopularServices();
}

function updatePopularServices() {
    const serviceCounts = {};
    const serviceNames = {
        agua: 'Plomería',
        luz: 'Electricidad',
        gas: 'Gas',
        carpinteria: 'Carpintería',
        pintura: 'Pintura',
        aire: 'Aire A/C',
        cerrajeria: 'Cerrajería',
        electrodomesticos: 'Electrodomésticos',
        jardineria: 'Jardinería',
        limpieza: 'Limpieza'
    };
    
    appointments.forEach(apt => {
        serviceCounts[apt.serviceType] = (serviceCounts[apt.serviceType] || 0) + 1;
    });
    
    const popularServicesList = document.getElementById('popular-services-list');
    if (popularServicesList) {
        popularServicesList.innerHTML = '';
        
        Object.entries(serviceCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .forEach(([service, count]) => {
                const serviceItem = document.createElement('div');
                serviceItem.className = 'popular-service-item';
                serviceItem.innerHTML = `
                    <span class="service-name">${serviceNames[service] || service}</span>
                    <span class="service-count">${count}</span>
                `;
                popularServicesList.appendChild(serviceItem);
            });
    }
}

// Export Functions
function exportUsers() {
    const csvContent = "data:text/csv;charset=utf-8," 
        + "ID,Nombre,Email,Fecha Registro,Total Citas\n"
        + allUsers.map(user => {
            const userAppointments = appointments.filter(apt => apt.userId === user.id).length;
            return `${user.id},"${user.name}","${user.email}","${new Date(user.createdAt).toLocaleDateString('es-ES')}",${userAppointments}`;
        }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "usuarios_serviya.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Exportación completada', 'Archivo de usuarios descargado');
}

function exportAppointments() {
    const csvContent = "data:text/csv;charset=utf-8," 
        + "ID,Cliente,Teléfono,Email,Dirección,Servicio,Problema,Fecha,Hora,Estado,Usuario ID\n"
        + appointments.map(apt => {
            return `${apt.id},"${apt.name}","${apt.phone}","${apt.email || ''}","${apt.address}","${apt.serviceType}","${apt.problemType || ''}","${apt.date.toLocaleDateString('es-ES')}","${apt.time}","${apt.status}","${apt.userId}"`;
        }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "citas_serviya.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Exportación completada', 'Archivo de citas descargado');
}

function generateReport() {
    const reportData = {
        totalUsers: allUsers.length,
        totalAppointments: appointments.length,
        urgentAppointments: appointments.filter(a => a.status === 'urgente').length,
        completedAppointments: appointments.filter(a => a.status === 'completada').length,
        cancelledAppointments: appointments.filter(a => a.status === 'cancelada').length,
        servicesStats: {}
    };
    
    appointments.forEach(apt => {
        reportData.servicesStats[apt.serviceType] = (reportData.servicesStats[apt.serviceType] || 0) + 1;
    });
    
    const reportContent = `REPORTE SERVIYA - ${new Date().toLocaleDateString('es-ES')}

ESTADÍSTICAS GENERALES:
- Total de usuarios: ${reportData.totalUsers}
- Total de citas: ${reportData.totalAppointments}
- Emergencias activas: ${reportData.urgentAppointments}
- Citas completadas: ${reportData.completedAppointments}
- Citas canceladas: ${reportData.cancelledAppointments}

SERVICIOS MÁS SOLICITADOS:
${Object.entries(reportData.servicesStats)
    .sort(([,a], [,b]) => b - a)
    .map(([service, count]) => `- ${service}: ${count} citas`)
    .join('\n')}

Reporte generado el ${new Date().toLocaleString('es-ES')}`;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte_serviya_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    showToast('Reporte generado', 'Reporte descargado exitosamente');
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

// Funciones globales para el HTML
window.showLoginForm = showLoginForm;
window.hideLoginForm = hideLoginForm;
window.switchTab = switchTab;
window.switchMainTab = switchMainTab;
window.switchAdminTab = switchAdminTab;
window.togglePassword = togglePassword;
window.selectService = selectService;
window.scheduleEmergency = scheduleEmergency;
window.updateAppointmentStatus = updateAppointmentStatus;
window.deleteAppointment = deleteAppointment;
window.googleLogin = googleLogin;
window.logout = logout;
window.adminLogout = adminLogout;
window.viewUserDetails = viewUserDetails;
window.editUser = editUser;
window.adminUpdateAppointmentStatus = adminUpdateAppointmentStatus;
window.adminDeleteAppointment = adminDeleteAppointment;
window.filterAppointments = filterAppointments;
window.exportUsers = exportUsers;
window.exportAppointments = exportAppointments;
window.generateReport = generateReport;