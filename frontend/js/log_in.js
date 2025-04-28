document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('login-form');
  const errorMsg = document.getElementById('error-message');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = form.username.value;
    const password = form.password.value;

    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('username', data.username); // Зберігаємо username
        window.location.href = 'main.html';
      } else {
        errorMsg.textContent = data.message || 'Сталася помилка';
      }
    } catch (err) {
      console.error(err);
      errorMsg.textContent = 'Помилка з’єднання з сервером';
    }
  });
});
