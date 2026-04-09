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
    } catch (err) { console.error("Ошибка таблицы пользователей:", err); }
}

// УДАЛЕНИЕ
async function deleteUser(event, id) {
    if (event) event.preventDefault();
    if (!confirm(`Удалить пользователя №${id}?`)) return;

    try {
        const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
        if (response.ok) {
            alert("Пользователь удален");
            loadUsersTable(); 
        }
    } catch (err) { alert("Ошибка связи с сервером"); }
}

// РЕДАКТИРОВАНИЕ (МОДАЛКА)
function openEditModal(id, username, role) {
    document.getElementById('editUserId').value = id;
    document.getElementById('editUsername').value = username;
    document.getElementById('editRole').value = role;
    openModal('editUserModal');
}

// ОТПРАВКА ФОРМЫ РЕДАКТИРОВАНИЯ
const editForm = document.getElementById('editUserForm');
if (editForm) {
    editForm.onsubmit = async function(e) {
        e.preventDefault();
        const id = document.getElementById('editUserId').value;
        const username = document.getElementById('editUsername').value;
        const role = document.getElementById('editRole').value;

        try {
            const response = await fetch(`/api/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, role })
            });
            if (response.ok) {
                alert("Данные обновлены!");
                closeModal('editUserModal');
                loadUsersTable();
            }
        } catch (err) { alert("Ошибка сохранения"); }
    };
}