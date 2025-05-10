document.addEventListener("DOMContentLoaded", async () => {
  const fullNameEl = document.getElementById("full-name");
  const ageEl = document.getElementById("age");
  const phoneEl = document.getElementById("phone");
  const emailEl = document.getElementById("email");

  const userId = localStorage.getItem("userId");

  if (!userId) {
    fullNameEl.textContent = "Помилка: не знайдено ID користувача";
    return;
  }

  try {
    const response = await fetch("/userdetails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: userId }),
    });

    if (!response.ok) throw new Error("Сервер повернув помилку");

    const userDetails = await response.json();

    // Заповнюємо елементи на сторінці даними користувача
    fullNameEl.textContent = `ФІО: ${userDetails.fullName}`;
    ageEl.textContent = `Вік: ${userDetails.age}`;
    phoneEl.textContent = `Телефон: ${userDetails.phone || "Не вказано"}`;
    emailEl.textContent = `Електронна пошта: ${
      userDetails.email || "Не вказано"
    }`;
  } catch (err) {
    console.error("Помилка при отриманні даних профілю:", err);
    fullNameEl.textContent = "Не вдалося завантажити дані профілю";
  }
});
