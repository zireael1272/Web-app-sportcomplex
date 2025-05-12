document.addEventListener("DOMContentLoaded", async () => {
  const username = localStorage.getItem("username");

  if (!username) {
    window.location.href = "login.html";
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
      const subsResponse = await fetch("/user-subscriptions", {
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
      const subscriptionBlock = document.querySelector(".subscription-block");

      if (subscriptions.length === 0) {
        subscriptionBlock.innerHTML += "<p>У вас немає активних абонементів.</p>";
      } else {
        subscriptions.forEach((sub) => {
          const purchaseDate = new Date(sub.purchase_date);
          const endDate = new Date(purchaseDate);

          let displayText = "";

          // Переводимо тип абонемента на українську
          let subscriptionType;
          switch (sub.type) {
            case "gym":
              subscriptionType = "Тренажерний зал";
              endDate.setDate(endDate.getDate() + sub.duration);
              displayText = `Дійсний до ${endDate.toISOString().split("T")[0]}`;
              break;
            case "fitness":
              subscriptionType = "Фітнес";
              displayText = `${sub.duration} занять залишилося`;
              break;
            case "boxing":
              subscriptionType = "Бокс";
              displayText = `${sub.duration} занять залишилося`;
              break;
            default:
              subscriptionType = sub.type;
              displayText = "Неизвестный тип абонемента";
          }

          subscriptionBlock.innerHTML += `
        <p>${subscriptionType} — ${displayText}</p>
      `;
        });
      }

      const progressResponse = await fetch(`/user-progress/${userId}`);
      if (progressResponse.ok) {
        const progress = await progressResponse.json();
        document.getElementById("current-weight").textContent = progress.weight;
        document.getElementById("training-visits").textContent = progress.visits;
      } else {
        console.error("Ошибка при получении прогресса");
      }

      // Функция редактирования прогресса
      document.getElementById("edit-progress-btn").addEventListener("click", () => {
        document.getElementById("edit-progress-form").style.display = "block";
      });

      document.getElementById("save-progress-btn").addEventListener("click", async () => {
        const newWeight = parseFloat(document.getElementById("new-weight").value);

        if (isNaN(newWeight) || newWeight <= 0) {
          alert("Введите корректный вес");
          return;
        }

        const response = await fetch("/update-progress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            newWeight
          }),
        });

        const result = await response.json();
        if (response.ok) {
          alert(result.message);
          document.getElementById("current-weight").textContent = newWeight;
          document.getElementById("edit-progress-form").style.display = "none";
        } else {
          alert(result.message);
        }
      });

    } catch (err) {
      console.error("Fetch error:", err);
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
});
