document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("details-form");
  const errorMsg = document.getElementById("error-message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem("userId");
    if (!userId) {
      errorMsg.textContent = "Помилка: не знайдено ID користувача.";
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
      dateOfBirth: document.getElementById("dateOfBirth").value
    };

    try {
      const response = await fetch("/userdetails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userDetails),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.removeItem("userId");
        window.location.href = "main.html";
      } else {
        errorMsg.textContent = result.message || "Помилка збереження.";
      }
    } catch (err) {
      console.error(err);
      errorMsg.textContent = "Помилка з'єднання з сервером.";
    }
  });
});
