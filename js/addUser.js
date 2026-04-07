const adminCreateForm = document.getElementById('adminCreateUserForm');
if (adminCreateForm) {
    adminCreateForm.onsubmit = async function(e) {
        e.preventDefault();

        const formData = new FormData(this);
        const userData = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: userData.username,
                    password: userData.password,
                    role: userData.role
                })
            });

            const result = await response.json();

            if (response.ok) {
                alert("Пользователь " + userData.username + " успешно создан!");
                this.reset();
                loadUsersTable();
            } else {
                alert("Ошибка: " + result.error);
            }
        } catch (err) {
            alert("Ошибка связи с сервером");
        }
    };
}
