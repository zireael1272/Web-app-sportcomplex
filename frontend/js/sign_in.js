document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('register-form');
    const errorMsg = document.getElementById('error-message');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const username = form.username.value;
        const password = form.password.value;
        const confirmPassword = form.confirmPassword.value;

        if (password !== confirmPassword) {
            errorMsg.textContent = 'Паролі не співпадають';
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                alert('✅ Реєстрація успішна!');
                window.location.href = '/main.html'; // Повернення на головну
            } else {
                errorMsg.textContent = data.message || 'Сталася помилка';
            }

        } catch (err) {
            console.error(err);
            errorMsg.textContent = 'Помилка з’єднання з сервером';
        }
    });
});
