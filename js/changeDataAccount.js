document.getElementById('userNameDisplay').addEventListener('click', () => {
    const user = JSON.parse(localStorage.getItem('userSession'));
    if (user) {
        document.getElementById('profileUser').value = user.name;
        document.getElementById('profilePass').value = ""; 
        openModal('profileModal');
    }
});

document.getElementById('profileForm').onsubmit = async function(e) {
    e.preventDefault();
    const newName = document.getElementById('profileUser').value;
    const newPass = document.getElementById('profilePass').value;
    
    let user = JSON.parse(localStorage.getItem('userSession'));
    
    if (user) {
        const response = await fetch('/api/update_profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                oldUsername: user.name, 
                newUsername: newName, 
                newPassword: newPass
            })
        });

        if (response.ok) {
            user.name = newName;
            localStorage.setItem('userSession', JSON.stringify(user));
            alert("Данные успешно изменены!");
            location.reload();
        } else {
            alert("Ошибка при сохранении в базу данных");
        }
    }
};
