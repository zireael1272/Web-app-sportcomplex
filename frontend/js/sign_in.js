document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('register-form');
    const errorMsg = document.getElementById('error-message');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        try {
            // 1. Реєстрація
            const regResponse = await fetch('http://localhost:8080/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const regData = await regResponse.json();

            if (regResponse.ok) {
                // 2. Автоматичний логін
                const loginResponse = await fetch('http://localhost:8080/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const loginData = await loginResponse.json();

                if (loginResponse.ok) {
                    localStorage.setItem("username", username);
                    window.location.href = "main.html";
                } else {
                    errorMsg.textContent = loginData.message || "Помилка входу після реєстрації.";
                }
            } else {
                errorMsg.textContent = regData.message || "Помилка реєстрації.";
            }
        } catch (err) {
            console.error(err);
            errorMsg.textContent = "Помилка з’єднання з сервером.";
        }
    });
});
