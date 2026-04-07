function openModal(id) { document.getElementById(id).style.display = "block"; }
function closeModal(id) { document.getElementById(id).style.display = "none"; }

window.onclick = function(event) {
    if (event.target.className === 'modal') {
        event.target.style.display = "none";
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('userSession'));
    const nameDisplay = document.getElementById('userNameDisplay');
    const authBtn = document.getElementById('authBtn');
    const adminBtn = document.getElementById('adminBtn');

    if (user) {
        nameDisplay.innerText = "Привет, " + user.name + "!";
        authBtn.innerText = "Выйти";
        if (user.role === 'Admin' && adminBtn) adminBtn.style.display = "inline-block";
    } else {
        nameDisplay.innerText = "Привет, Гость!";
        authBtn.innerText = "Войти";
        if (adminBtn) adminBtn.style.display = "none";
    }
});

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

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.onsubmit = async function(e) {
        e.preventDefault();
        const username = document.getElementById('loginUser').value;
        const password = document.getElementById('loginPass').value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('userSession', JSON.stringify({ id: data.id, name: data.name, role: data.role }));
                location.reload();
            } else {
                alert("Ошибка: " + data.error);
            }
        } catch (err) {
            alert("Сервер не отвечает");
        }
    };
}

const regForm = document.getElementById('regForm');
if (regForm) {
    regForm.onsubmit = async function(e) {
        e.preventDefault();
        const username = document.getElementById('regUser').value;
        const password = document.getElementById('regPass').value;

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();

            if (response.ok) {
                alert("Регистрация успешна! Теперь войдите.");
                closeModal('regModal');
                openModal('loginModal');
            } else {
                alert("Ошибка: " + data.error);
            }
        } catch (err) {
            alert("Ошибка при регистрации");
        }
    };
}

async function loadUsersToAdminTable() {
    const tableBody = document.querySelector('.user-list-table tbody');
    if (!tableBody) return;

    try {
        const response = await fetch('/api/users');
        const users = await response.json();
        tableBody.innerHTML = '';
        users.forEach(user => {
            tableBody.innerHTML += `
                <tr>
                    <td>${user.Id}</td>
                    <td>${user.Username}</td>
                    <td><span class="role-badge ${user.Role.toLowerCase()}">${user.Role}</span></td>
                    <td style="text-align: right;">
                        <a href="#" class="btn-delete" onclick="alert('Удаление ID: ${user.Id}')">Удалить</a>
                    </td>
                </tr>`;
        });
    } catch (e) { console.log("Ошибка загрузки таблицы"); }
}

if (window.location.pathname.includes('admin.html')) {
    loadUsersToAdminTable();
}
