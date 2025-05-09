document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const dateParam = urlParams.get("date");
  const typeParam = urlParams.get("type");
  const userId = localStorage.getItem("userId");
  const dateInput = document.getElementById("appointment-date");
  const typeSelect = document.getElementById("activity-type");
  const timeSelect = document.getElementById("appointment-time");

  const availableTimes = {
    fitness: ["10:00", "12:00", "14:00"],
    boxing: ["11:00", "13:00", "15:00"],
  };

  if (dateParam) {
    dateInput.value = dateParam;
  }

  if (typeParam === "fitness" || typeParam === "boxing") {
    const displayName = typeParam === "fitness" ? "Фітнес" : "Бокс";
    typeSelect.value = displayName;
    typeSelect.disabled = true;

    populateTimeOptions(typeParam);
  }

  if (typeParam === "both") {
    typeSelect.disabled = false;
    timeSelect.innerHTML = '<option value="">Оберіть час</option>';
    timeSelect.disabled = true;

    typeSelect.addEventListener("change", () => {
      const selected = typeSelect.value === "Фітнес" ? "fitness" : "boxing";
      populateTimeOptions(selected);
      timeSelect.disabled = false;
    });
  }

  function populateTimeOptions(type) {
    const times = availableTimes[type];
    timeSelect.innerHTML = '<option value="">Оберіть час</option>';
    times.forEach((time) => {
      const option = document.createElement("option");
      option.value = time;
      option.textContent = time;
      timeSelect.appendChild(option);
    });
  }

  document
    .getElementById("booking-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const date = dateInput.value;

      const time = timeSelect.value;
      const activity = typeSelect.value;
      const messageEl = document.getElementById("booking-message");
      if (!userId || !date || !time || !activity) {
        messageEl.textContent = "Заповніть усі поля.";
        messageEl.style.color = "red";
      }

      try {
        const response = await fetch("/booking", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            date,
            time,
            activity,
          }),
        });
        const result = await response.json();

        if (response.ok) {
          messageEl.textContent = "Успішний запис!";
          messageEl.style.color = "green";
          window.location.href = "main.html";
        } else {
          messageEl.textContent = result.message || "Помилка при записі";
          messageEl.style.color = "red";
        }
      } catch (err) {
        console.error("Помилка:", err);
        messageEl.textContent = "Серверна помилка";
        messageEl.style.color = "red";
      }
    });
});
