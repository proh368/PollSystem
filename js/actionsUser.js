async function deleteUser(event, id) {
    if (event) event.preventDefault();
    if (!confirm(`Удалить пользователя №${id}?`)) return;

    try {
        const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
        if (response.ok) {
            alert("Пользователь удален");
            loadUsersTable();
        }
    } catch (err) {
        alert("Ошибка связи с сервером");
    }
}

function openEditModal(id, username, role) {
    document.getElementById('editUserId').value = id;
    document.getElementById('editUsername').value = username;
    document.getElementById('editRole').value = role;
    openModal('editUserModal');
}

document.getElementById('editUserForm').onsubmit = async function(e) {
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
            alert("Данные обновлены успешно!");
            closeModal('editUserModal');
            loadUsersTable();
        }
    } catch (err) {
        alert("Ошибка при сохранении");
    }
};