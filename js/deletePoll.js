let isPollsLoaded = false;

async function loadAdminPolls() {
    if (isPollsLoaded) return;
    isPollsLoaded = true;

    const grid = document.querySelector('.admin-polls-view');
    if (!grid) return;
        await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        grid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Загрузка опросов...</p>';

        const response = await fetch('/api/polls');
        const polls = await response.json();

        if (!polls || polls.length === 0) {
            grid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">В базе данных пока нет созданных опросов.</p>';
            return;
        }

        grid.innerHTML = '';

        polls.forEach(poll => {
            let questionsHTML = '';
            
            poll.questions.forEach(q => {
                let optionsHTML = '';
                
                q.options.forEach(opt => {
                    const count = opt.votesCount || 0;
                    const percent = opt.percent || 0;

                    optionsHTML += `
                        <div class="stat-row" style="margin-bottom: 12px;">
                            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
                                <span>${opt.TextOption}</span>
                                <strong>${count} чел. (${percent}%)</strong>
                            </div>
                            <div class="progress-bar-bg" style="background: #e0e0e0; height: 10px; border-radius: 5px; overflow: hidden;">
                                <div class="progress-fill" style="background: #3498db; width: ${percent}%; height: 100%; transition: width 0.5s ease-in-out;"></div>
                            </div>
                        </div>`;
                });

                questionsHTML += `
                    <div class="question-admin-block" style="margin-top: 20px; padding: 10px; background: #f9f9f9; border-radius: 5px;">
                        <p style="margin-bottom: 10px;"><strong>Вопрос:</strong> ${q.TextQuestion}</p>
                        <div class="options-stats">
                            ${optionsHTML}
                        </div>
                    </div>`;
            });

            const pollCard = `
                <article class="poll-card" style="border: 1px solid #ddd; padding: 20px; position: relative;">
                    <div style="display: flex; justify-content: space-between;">
                        <h3 style="color: #2c3e50;">${poll.Title}</h3>
                        <span style="color: #95a5a6; font-size: 0.8rem;">ID: ${poll.IdPoll}</span>
                    </div>
                    <p style="color: #7f8c8d; font-style: italic; margin-bottom: 10px;">${poll.Description || 'Без описания'}</p>
                    
                    <div class="admin-poll-details">
                        ${questionsHTML}
                    </div>

                    <button class="btn-delete" 
                            style="background: #e74c3c; color: white; border: none; padding: 10px; width: 100%; border-radius: 4px; cursor: pointer; margin-top: 20px; font-weight: bold;" 
                            onclick="confirmDeletePoll(${poll.IdPoll})">
                        Удалить весь опрос
                    </button>
                </article>`;
            
            grid.innerHTML += pollCard;
        });
    } catch (err) {
        console.error("Ошибка выгрузки статистики в админку:", err);
        grid.innerHTML = '<p style="color: red; text-align: center;">Ошибка при загрузке данных из базы.</p>';
    }
}

async function confirmDeletePoll(id) {
    if (confirm(`Вы уверены? Это действие навсегда удалит опрос №${id}, все связанные вопросы, варианты и накопленные голоса.`)) {
        try {
            const response = await fetch(`/api/polls/${id}`, { method: 'DELETE' });
            if (response.ok) {
                alert("Опрос успешно удален из базы данных.");
                loadAdminPolls();
            } else {
                alert("Не удалось удалить опрос.");
            }
        } catch (error) {
            alert("Ошибка связи с сервером.");
        }
    }
}

