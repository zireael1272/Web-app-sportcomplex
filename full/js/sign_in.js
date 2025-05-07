document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('register-form');
    const errorMsg = document.getElementById('error-message');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        try {
            const regResponse = await fetch('http://localhost:8080/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const regData = await regResponse.json();

            if (regResponse.ok) {
                localStorage.setItem("tmpUsername", username);
                localStorage.setItem("tmpPassword", password);
                window.location.href = "userdetails.html";
            } else {
                errorMsg.textContent = regData.message || "Помилка реєстрації.";
            }
        } catch (err) {
            console.error(err);
            errorMsg.textContent = "Помилка з’єднання з сервером.";
        }
    });
});
