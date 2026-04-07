function addOptionField() {
    const container = document.getElementById('optionsContainer');
    const row = document.createElement('div');
    row.className = 'option-row';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'option-input';
    input.placeholder = `Вариант ${container.querySelectorAll('.option-input').length + 1}`;
    input.required = true;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn-remove';
    removeBtn.innerHTML = '&times;';
    removeBtn.onclick = function() { removeOptionField(this); };

    row.appendChild(input);
    row.appendChild(removeBtn);
    container.appendChild(row);
}

function removeOptionField(button) {
    const row = button.parentNode;
    const container = document.getElementById('optionsContainer');
    if (container.querySelectorAll('.option-row').length > 1) {
        row.remove();
        updatePlaceholders();
    } else {
        alert("Минимум один вариант!");
    }
}

function updatePlaceholders() {
    document.querySelectorAll('.option-input').forEach((input, index) => {
        input.placeholder = `Вариант ${index + 1}`;
    });
}

async function fillPollSuggestions() {
    const datalist = document.getElementById('existingPolls');
    if (!datalist) return;
    try {
        const response = await fetch('/api/polls-titles');
        const titles = await response.json();
        datalist.innerHTML = '';
        titles.forEach(item => {
            const option = document.createElement('option');
            option.value = item.Title;
            datalist.appendChild(option);
        });
    } catch (err) { console.error("Ошибка подсказок:", err); }
}

const complexPollForm = document.getElementById('complexPollForm');
if (complexPollForm) {
    complexPollForm.onsubmit = async function(e) {
        e.preventDefault();

        const user = JSON.parse(localStorage.getItem('userSession'));
        if (!user || !user.id) return alert("Войдите в систему!");

        const optionsArray = Array.from(document.querySelectorAll('.option-input')).map(input => input.value);

        const pollData = {
            title: document.getElementById('pollTitle').value,
            description: document.getElementById('pollDescription').value,
            question: document.getElementById('questionText').value,
            options: optionsArray,
            authorId: user.id
        };

        try {
            const response = await fetch('/api/full-poll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pollData)
            });

            const result = await response.json();

            if (response.ok) {
                alert("Опрос создан!");
                location.reload();
            } else {
                alert("Ошибка: " + result.error);
            }
        } catch (err) {
            alert("Нет связи с сервером");
        }
    };
}

document.addEventListener('DOMContentLoaded', fillPollSuggestions);
