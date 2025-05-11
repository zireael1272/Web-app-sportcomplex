document.addEventListener("DOMContentLoaded", async () => {
  const username = localStorage.getItem("username");

  if (!username) {
    window.location.href = "login.html"; // якщо не залогінений
    return;
  }

  try {
    // 1️⃣ Отримуємо user_id по username
    const userResponse = await fetch("/get_user_id", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    });

    const userData = await userResponse.json();
    const userId = userData.userId;

    if (!userId) {
      throw new Error("Не знайдено userId");
    }

    // 2️⃣ Отримуємо деталі профілю з БД
    const profileResponse = await fetch("/profile_data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    const profile = await profileResponse.json();

    // 3️⃣ Вставляємо у DOM
    document.getElementById("full-name").textContent = profile.full_name || "";
    document.getElementById("phone").textContent = profile.phone || "";
    document.getElementById("email").textContent = profile.email || "";
    const birthDateRaw = profile.birth_date;
    if (birthDateRaw) {
      const birthDate = new Date(birthDateRaw);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
      }
      document.getElementById("birth-date").textContent = `${age} років`;
    }

    // 4️⃣ Отримуємо абонементи користувача
    try {
      const subsResponse = await fetch("/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!subsResponse.ok) {
        throw new Error("Помилка при отриманні абонементів");
      }

      const subscriptions = await subsResponse.json();
      console.log("Отримані абонементи:", subscriptions);

      const subscriptionBlock = document.querySelector(".subscription-block");
      subscriptionBlock.innerHTML = "<h3>Абонемент</h3>";

      if (subscriptions.length === 0) {
        subscriptionBlock.innerHTML +=
          "<p>У вас немає активних абонементів.</p>";
      } else {
        subscriptions.forEach((sub) => {
          const purchaseDate = new Date(sub.purchase_date);
          const endDate = new Date(purchaseDate);
          endDate.setMonth(endDate.getMonth() + sub.duration);
          const formattedEnd = endDate.toISOString().split("T")[0];

          subscriptionBlock.innerHTML += `
            <p>${sub.type} — дійсний до ${formattedEnd} (${sub.price} грн)</p>
          `;
        });
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
});
