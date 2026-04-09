let isPollsLoaded = false;

async function loadPolls() {
    if (isPollsLoaded) return;

    const grid = document.querySelector('.grid');
    if (!grid) return;

    isPollsLoaded = true;

    try {
        const user = JSON.parse(localStorage.getItem('userSession'));
        
        const pollResp = await fetch('/api/polls');
        const polls = await pollResp.json();

        let myVotes = [];
        if (user && user.id) {
            const voteResp = await fetch(`/api/my-votes/${user.id}`);
            if (voteResp.ok) {
                myVotes = await voteResp.json();
            }
        }

        grid.innerHTML = ''; 

        polls.forEach(poll => {
            let questionsHTML = '';
            
            poll.questions.forEach(q => {
                let optionsHTML = '';
                q.options.forEach(opt => {
                    const isChecked = myVotes.includes(opt.IdOption) ? 'checked' : '';
                    
                    optionsHTML += `
                        <label class="option-item">
                            <input type="radio" name="q_${q.IdQuestion}" value="${opt.IdOption}" 
                                   ${!user ? 'disabled' : ''} ${isChecked} required>
                            <span>${opt.TextOption}</span>
                        </label>`;
                });

                questionsHTML += `
                    <div class="question-block">
                        <p class="question-text"><strong>Вопрос:</strong> ${q.TextQuestion}</p>
                        <div class="options-group">${optionsHTML}</div>
                    </div>`;
            });

            const pollCard = `
                <article class="poll-card">
                    <h3>${poll.Title}</h3>
                    <p>${poll.Description || ''}</p>
                    <form class="poll-form" onsubmit="submitVote(event, ${poll.IdPoll})">
                        ${questionsHTML}
                        <button type="submit" class="btn" ${!user ? 'disabled style="background: #ccc;"' : ''}>
                            ${user ? 'Проголосовать' : 'Войдите, чтобы голосовать'}
                        </button>
                    </form>
                </article>`;
            
            grid.innerHTML += pollCard;
        });
    } catch (err) {
        console.error("Ошибка отрисовки:", err);
        isPollsLoaded = false;
    }
}
