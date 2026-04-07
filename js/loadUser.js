async function loadUsersTable() {
    const tableBody = document.querySelector('.user-list-table tbody');
    if (!tableBody) return;

    try {
        const response = await fetch('/api/users');
        const users = await response.json();

        tableBody.innerHTML = '';

        users.forEach(user => {
            const roleClass = user.Role.toLowerCase();

            tableBody.innerHTML += `
                <tr>
                    <td>${user.IdUser}</td>
                    <td>${user.Username}</td>
                    <td><span class="role-badge ${roleClass}">${user.Role}</span></td>
                    <td style="text-align: right;">
                         <a href="#" class="btn-edit" onclick="openEditModal(${user.IdUser}, '${user.Username}', '${user.Role}')">Ред.</a>
                         <a href="#" class="btn-delete" onclick="deleteUser(event, ${user.IdUser})">Удалить</a>
                    </td>
                </tr>`;
        });
    } catch (err) {
        console.error("Ошибка отрисовки таблицы пользователей:", err);
    }
}

async function deleteUser(event, id) {
    if (event) event.preventDefault();

    if (confirm(`Вы уверены, что хотите удалить пользователя №${id}?`)) {
        const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
        if (response.ok) {
            alert("Пользователь удален");
            loadUsersTable();
        } else {
            alert("Ошибка при удалении");
        }
    }
}

function editUserPrompt(id) {
    alert("Функция быстрого редактирования ID " + id + " в разработке. Используйте форму профиля.");
}

document.addEventListener('DOMContentLoaded', loadUsersTable);
