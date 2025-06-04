document.addEventListener("DOMContentLoaded", () => {
  const phoneInput = document.getElementById("phoneNumber");

  phoneInput.addEventListener("input", (e) => {
    let digits = e.target.value.replace(/\D/g, "");
    if (digits.startsWith("380")) {
      digits = digits.slice(3);
    } else if (digits.startsWith("0")) {
      digits = digits.slice(1);
    }

    digits = digits.substring(0, 9);

    let formatted = "+380";
    if (digits.length > 0) formatted += " " + digits.slice(0, 2);
    if (digits.length > 2) formatted += " " + digits.slice(2, 5);
    if (digits.length > 5) formatted += " " + digits.slice(5, 7);
    if (digits.length > 7) formatted += " " + digits.slice(7, 9);

    phoneInput.value = formatted;
  });

  const form = document.getElementById("details-form");
  const errorMsg = document.getElementById("error-message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const phoneRaw = phoneInput.value.replace(/\D/g, "");

    if (!/^380\d{9}$/.test(phoneRaw)) {
      errorMsg.textContent = "Невірний номер. Формат: +380XXXXXXXXX";
      return;
    }

    const formattedPhone = "0" + phoneRaw.slice(3);

    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("tmpUsername");
    const password = localStorage.getItem("tmpPassword");
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const patronymic = document.getElementById("patronymic").value.trim();
    const fullName = `${lastName} ${firstName} ${patronymic}`.trim();
    const email = document.getElementById("email").value.trim();
    const dateOfBirth = document.getElementById("dateOfBirth").value;

    const userDetails = {
      userId,
      fullName,
      phoneNumber: formattedPhone,
      email,
      dateOfBirth,
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
