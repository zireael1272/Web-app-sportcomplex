async function setupProgress(userId) {
  await loadCurrentWeight(userId);

  document
    .getElementById("add-progress-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const weight = document.getElementById("weight").value;
      if (!weight || weight <= 0) {
        alert("Будь ласка, введіть коректну вагу.");
        return;
      }

      const res = await fetch("/progress-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, weight }),
      });

      if (res.ok) {
        e.target.reset();
        await loadCurrentWeight(userId);
      } else {
        alert("Не вдалося додати вагу");
      }
    });
}

async function loadCurrentWeight(userId) {
  try {
    const res = await fetch("/progress-current", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    const weightDisplay = document.getElementById("current-weight");

    if (res.ok) {
      const data = await res.json();
      if (data && data.weight) {
        const date = new Date(data.record_date).toLocaleDateString();
        weightDisplay.innerText = `Поточна вага: ${data.weight} кг від ${date}`;
      } else {
        weightDisplay.innerText = "Поточна вага: немає даних";
      }
    } else {
      weightDisplay.innerText = "Поточна вага: немає даних";
    }
  } catch (err) {
    console.error("Помилка при завантаженні поточної ваги:", err);
    const weightDisplay = document.getElementById("current-weight");
    weightDisplay.innerText = "Поточна вага: помилка при завантаженні";
  }
}

async function drawWeightChart(userId) {
  try {
    const response = await fetch("/progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error("Помилка при завантаженні даних прогресу");
    }

    const progressData = await response.json();

    const labels = progressData.map((item) => {
      const date = new Date(item.record_date);
      return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
    });

    const weights = progressData.map((item) => item.weight);

    const ctx = document.getElementById("weightChart").getContext("2d");
    new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Вага (кг)",
            data: weights,
            borderColor: "#c3073f",
            backgroundColor: "#6f2232",
            fill: true,
            tension: 0.3,
            pointBackgroundColor: "#c3073f",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            labels: {
              color: "#333",
              font: {
                size: 14,
                weight: "bold",
              },
            },
          },
        },
        scales: {
          y: {
            title: {
              display: true,
              text: "Вага (кг)",
              font: {
                size: 14,
              },
            },
            beginAtZero: false,
          },
          x: {
            title: {
              display: true,
              text: "Дата",
              font: {
                size: 14,
              },
            },
          },
        },
      },
    });
  } catch (err) {
    console.error("Помилка при побудові графіка:", err);
  }
}
