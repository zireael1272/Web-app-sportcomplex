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

    const rawPhoneInput = document.getElementById("phoneNumber").value.trim();
    const rawPhone = rawPhoneInput.replace(/\D/g, "");

    if (!rawPhone.startsWith("38") || rawPhone.length !== 12) {
      errorMsg.textContent =
        "Номер телефону має бути у форматі +38 і містити 10 цифр після коду країни.";
      return;
    }

    const formattedPhone = rawPhone.slice(2);

    const userDetails = {
      userId,
      fullName,
      phoneNumber: formattedPhone,
      email: document.getElementById("email").value.trim(),
      dateOfBirth: document.getElementById("dateOfBirth").value,
    };

    try {
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

      const loginRes = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const loginResult = await loginRes.json();

      if (loginRes.ok) {
        localStorage.setItem("userId", loginResult.userId);
        localStorage.setItem("username", loginResult.username);
        localStorage.removeItem("tmpUsername");
        localStorage.removeItem("tmpPassword");

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

const phoneInput = document.getElementById("phoneNumber");

phoneInput.addEventListener("input", (e) => {
  let value = e.target.value.replace(/\D/g, "");
  if (value.startsWith("38")) value = value.slice(2);

  if (value.length > 10) {
    value = value.slice(0, 10);
  }

  let formatted = "+38";
  if (value.length > 0) formatted += " (" + value.slice(0, 3);
  if (value.length >= 3) formatted += ") " + value.slice(3, 6);
  if (value.length >= 6) formatted += " " + value.slice(6, 8);
  if (value.length >= 8) formatted += " " + value.slice(8, 10);

  e.target.value = formatted;
});
