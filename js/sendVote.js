async function submitVote(event, pollId) {
    event.preventDefault();
    const user = JSON.parse(localStorage.getItem('userSession'));
    
    const formData = new FormData(event.target);
    const selectedOptions = Array.from(formData.values()); 

    for (let optionId of selectedOptions) {
        await fetch('/api/vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                optionId: optionId
            })
        });
    }

    alert("Ваш голос записан");
    location.reload();
}
