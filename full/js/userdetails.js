document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("details-form");
  const errorMsg = document.getElementById("error-message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("tmpUsername");
    const password = localStorage.getItem("tmpPassword");

    if (!userId || !username || !password) {
      errorMsg.textContent = "Помилка: не знайдено даних користувача.";
      return;
    }

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const patronymic = document.getElementById("patronymic").value.trim();
    const fullName = `${lastName} ${firstName} ${patronymic}`.trim();

    const userDetails = {
      userId,
      fullName,
      phoneNumber: document.getElementById("phoneNumber").value.trim(),
      email: document.getElementById("email").value.trim(),
      dateOfBirth: document.getElementById("dateOfBirth").value,
    };

    try {
      // крок 1: зберігаємо особисті дані
      const response = await fetch("/userdetails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userDetails),
      });

      const result = await response.json();

      if (!response.ok) {
        errorMsg.textContent = result.message || "Помилка збереження.";
        return;
      }

      // крок 2: автологін
      const loginRes = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const loginResult = await loginRes.json();

      if (loginRes.ok) {
        // зберігаємо інфо про залогіненого користувача
        localStorage.setItem("userId", loginResult.userId);
        localStorage.setItem("username", loginResult.username);
        localStorage.removeItem("tmpUsername");
        localStorage.removeItem("tmpPassword");

        // крок 3: перехід на головну
        window.location.href = "main.html";
      } else {
        errorMsg.textContent = loginResult.message || "Не вдалося увійти.";
      }
    } catch (err) {
      console.error(err);
      errorMsg.textContent = "Помилка з'єднання з сервером.";
    }
  });
});
