// Функции открытия/закрытия модалок
function openModal(id) { document.getElementById(id).style.display = "block"; }
function closeModal(id) { document.getElementById(id).style.display = "none"; }

// Проверка сессии при загрузке
window.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('userSession'));
    const nameDisplay = document.getElementById('userNameDisplay');
    const authBtn = document.getElementById('authBtn');
    const adminBtn = document.getElementById('adminBtn');

    if (user) {
        nameDisplay.innerText = "Привет, " + user.name + "!";
        authBtn.innerText = "Выйти";
        if (user.role === 'Admin') adminBtn.style.display = "inline-block";
    } else {
        nameDisplay.innerText = "Привет, Гость!";
        authBtn.innerText = "Войти";
        adminBtn.style.display = "none";
    }
});

// Обработка кнопки Войти/Выйти
function handleAuthClick() {
    if (localStorage.getItem('userSession')) {
        if (confirm('Выйти из аккаунта?')) {
            localStorage.removeItem('userSession');
            location.reload();
        }
    } else {
        openModal('loginModal');
    }
}

// Имитация Входа
document.getElementById('loginForm').onsubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('loginUser').value;
    const pass = document.getElementById('loginPass').value;
    
    // В будущем тут будет запрос к Flask API
    const userData = { name: name, password: pass, role: 'Admin' }; 
    localStorage.setItem('userSession', JSON.stringify(userData));
    location.reload();
};

// Имитация Регистрации
document.getElementById('regForm').onsubmit = function(e) {
    e.preventDefault();
    alert("Регистрация успешна! Теперь войдите.");
    closeModal('regModal');
    openModal('loginModal');
};



async function loadUsersToAdminTable() {
    const tableBody = document.querySelector('.user-list-table tbody');
    if (!tableBody) return; // Если мы не на странице админа, выходим

    const response = await fetch('/api/users');
    const users = await response.json();

    // Очищаем таблицу от старых данных
    tableBody.innerHTML = '';

    // Вставляем новые строки из базы
    users.forEach(user => {
        const row = `
            <tr>
                <td>${user.Id}</td>
                <td>${user.Username}</td>
                <td><span class="role-badge ${user.Role.toLowerCase()}">${user.Role}</span></td>
                <td style="text-align: right;">
                    <a href="#" class="btn-edit">Ред.</a>
                    <a href="#" class="btn-delete" onclick="deleteUser(${user.Id})">Удалить</a>
                </td>
            </tr>`;
        tableBody.innerHTML += row;
    });
}

// Запускаем загрузку, если мы в админке
if (window.location.pathname.includes('admin.html')) {
    loadUsersToAdminTable();
}

