const ctx = document.getElementById("weightChart").getContext("2d");

new Chart(ctx, {
  type: "line",
  data: {
    labels: ["01.2025", "02.2025", "03.2025", "04.2025", "05.2025"],
    datasets: [
      {
        label: "Вага (кг)",
        data: [75, 73.5, 73.2, 72.8, 72.5],
        borderColor: "#00bcd4",
        backgroundColor: "rgba(0, 188, 212, 0.1)",
        pointBackgroundColor: "#00bcd4",
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 10,
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          color: "#ffffff", // або чорний, якщо світла тема
          boxWidth: 20,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Місяць",
          color: "#888",
        },
        ticks: {
          color: "#aaa",
        },
      },
      y: {
        title: {
          display: true,
          text: "Кілограми",
          color: "#888",
        },
        ticks: {
          color: "#aaa",
        },
        beginAtZero: false,
      },
    },
  },
});
