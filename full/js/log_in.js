document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("login-form");
  const errorMsg = document.getElementById("error-message");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("username", data.username);
        localStorage.setItem("userId", data.userId);
        window.location.href = "main.html";
      } else {
        errorMsg.textContent = data.message || "Невірний логін або пароль";
      }
    } catch (err) {
      console.error(err);
      errorMsg.textContent = "Помилка з’єднання з сервером";
    }
  });
});
