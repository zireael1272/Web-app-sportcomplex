document
  .getElementById("register-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;

    console.log("Дані реєстрації:", { username, password, confirmPassword });

    if (password !== confirmPassword) {
      return (document.getElementById("error-message").textContent =
        "Паролі не співпадають");
    }

    try {
      const res = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const result = await res.json();

      if (res.ok) {
        localStorage.setItem("userId", result.userId);
        localStorage.setItem("tmpUsername", username);
        localStorage.setItem("tmpPassword", password);
        window.location.href = "/userdetails.html";
      } else {
        document.getElementById("error-message").textContent =
          result.message || "Помилка реєстрації";
      }
    } catch (error) {
      document.getElementById("error-message").textContent =
        "Помилка з’єднання з сервером.";
    }
  });
