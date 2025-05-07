document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("details-form");
  const errorMsg = document.getElementById("error-message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = localStorage.getItem("tmpUsername");
    const password = localStorage.getItem("tmpPassword");

    if (!username || !password) {
      errorMsg.textContent = "Помилка: відсутні логін або пароль.";
      return;
    }

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const patronymic = document.getElementById("patronymic").value.trim();
    const fullName = `${lastName} ${firstName} ${patronymic}`.trim();

    const userDetails = {
      username,
      password,
      fullName,
      phoneNumber: document.getElementById("phoneNumber").value.trim(),
      email: document.getElementById("email").value.trim(),
      dateOfBirth: document.getElementById("dateOfBirth").value,
    };

    try {
      const response = await fetch("http://localhost:8080/register-full", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userDetails),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.removeItem("tmpUsername");
        localStorage.removeItem("tmpPassword");
        window.location.href = "cabinet.html";
      } else {
        errorMsg.textContent = result.message || "Помилка збереження.";
      }
    } catch (err) {
      console.error(err);
      errorMsg.textContent = "Помилка з'єднання з сервером.";
    }
  });
});
