// Открытие модалки профиля при клике на имя
document.getElementById('userNameDisplay').addEventListener('click', () => {
    const user = JSON.parse(localStorage.getItem('userSession'));
    if (user) {
        document.getElementById('profileUser').value = user.name;
        document.getElementById('profilePass').value = user.password; // Показываем текущий пароль
        openModal('profileModal');
    }
});

// Сохранение изменений
document.getElementById('profileForm').onsubmit = function(e) {
    e.preventDefault();
    const newName = document.getElementById('profileUser').value;
    const newPass = document.getElementById('profilePass').value;

    let user = JSON.parse(localStorage.getItem('userSession'));
    
    if (user) {
        user.name = newName;
        user.password = newPass;
        
        localStorage.setItem('userSession', JSON.stringify(user));
        alert("Данные успешно изменены!");
        location.reload();
    }
};
