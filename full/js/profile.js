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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    const userData = await userResponse.json();
    const userId = userData.userId;

    if (!userId) throw new Error("Не знайдено userId");

    // 2️⃣ Отримуємо деталі профілю
    const profileResponse = await fetch("/profile_data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    const profile = await profileResponse.json();
    document.getElementById("full-name").textContent = profile.full_name || "";
    document.getElementById("phone").textContent = profile.phone || "";
    document.getElementById("email").textContent = profile.email || "";

    if (profile.birth_date) {
      const birthDate = new Date(profile.birth_date);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      document.getElementById("birth-date").textContent = `${age} років`;
    }

    // 3️⃣ Отримуємо абонементи
    try {
      const subsResponse = await fetch("/user-subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!subsResponse.ok) throw new Error("Помилка при отриманні абонементів");

      const subscriptions = await subsResponse.json();
      const subscriptionBlock = document.querySelector(".subscription-block");

      if (subscriptions.length === 0) {
        subscriptionBlock.innerHTML += "<p>У вас немає активних абонементів.</p>";
      } else {
        subscriptions.forEach((sub) => {
          const purchaseDate = new Date(sub.purchase_date);
          const endDate = new Date(purchaseDate);
          let subscriptionType = sub.type;
          let displayText = "";

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
              displayText = "Невідомий тип абонемента";
          }

          subscriptionBlock.innerHTML += `<p>${subscriptionType} — ${displayText}</p>`;
        });
      }

      // 4️⃣ Отримуємо прогрес
      await loadProgress(userId);

      // 5️⃣ Обробка форми додавання прогресу
      document.getElementById("add-progress-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const weight = document.getElementById("weight").value;

        const res = await fetch("/progress-add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, weight }),
        });

        if (res.ok) {
          e.target.reset();
          loadProgress(userId);
        } else {
          alert("Не вдалося додати вагу");
        }
      });

    } catch (err) {
      console.error("Fetch subscriptions error:", err);
    }
  } catch (err) {
    console.error("Fetch profile error:", err);
  }
});

// 📊 Функція для завантаження прогресу
async function loadProgress(userId) {
  const res = await fetch("/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId })
  });

  const data = await res.json();
  const container = document.getElementById("progress-list");
  container.innerHTML = "";

  data.forEach(entry => {
    const div = document.createElement("div");
    div.classList.add("progress-entry");
    div.innerHTML = `
      <p><strong>${new Date(entry.record_date).toLocaleDateString()}</strong></p>
      <p>Вага: ${entry.weight} кг</p>
      <p>Відвідування: ${entry.visits}</p>
    `;
    container.appendChild(div);
  });
}
let chartInstance = null; // глобальна змінна для знищення попереднього графіка

async function loadProgress(userId) {
  const res = await fetch("/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId })
  });

  const data = await res.json();
  const container = document.getElementById("progress-list");
  container.innerHTML = "";

  const labels = [];
  const weightData = [];
  const visitsData = [];

  data.forEach(entry => {
    const date = new Date(entry.record_date).toLocaleDateString();
    labels.push(date);
    weightData.push(entry.weight);
    visitsData.push(entry.visits);

    const div = document.createElement("div");
    div.classList.add("progress-entry");
    div.innerHTML = `
      <p><strong>${date}</strong></p>
      <p>Вага: ${entry.weight} кг</p>
      <p>Відвідування: ${entry.visits}</p>
    `;
    container.appendChild(div);
  });

  // Побудова графіка
  const ctx = document.getElementById("progressChart").getContext("2d");
  if (chartInstance) {
    chartInstance.destroy(); // видаляємо попередній графік, якщо є
  }

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Вага (кг)",
          data: weightData,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.3
        },
        {
          label: "Відвідування",
          data: visitsData,
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}