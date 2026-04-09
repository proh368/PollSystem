function openModal(id) { document.getElementById(id).style.display = "block"; }
function closeModal(id) { document.getElementById(id).style.display = "none"; }

window.onclick = function (event) {
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


if (window.location.pathname.includes('admin.html')) {
    const user = JSON.parse(localStorage.getItem('userSession'));

    if (!user || user.role !== 'Admin') {
        alert("Доступ запрещен! У вас нет прав администратора.");
        window.location.href = '/';
    }
}



function handleAuthClick() {
    if (localStorage.getItem('userSession')) {
        if (confirm('Выйти из аккаунта?')) {
            localStorage.removeItem('userSession');
            setTimeout(() => { location.reload(); }, 500);
        }
    } else {
        openModal('loginModal');
    }
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.onsubmit = async function (e) {
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
                setTimeout(() => {
                    location.reload();
                }, 500);
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
    regForm.onsubmit = async function (e) {
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
