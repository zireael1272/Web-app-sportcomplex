document.addEventListener("DOMContentLoaded", async () => {
  const calendarEl = document.getElementById("calendar");
  const recordInfo = document.getElementById("record-info");

  // Отримуємо userId з localStorage (або з іншого джерела)
  const userId = localStorage.getItem("userId");

  // Перевірка наявності userId
  if (!userId) {
    alert("Ви не авторизовані. Будь ласка, увійдіть.");
    return;
  }

  try {
    // Отримуємо записи користувача з бекенду
    const response = await fetch(`/user/${userId}/appointments`);
    const records = await response.json();

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // 0-11
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay(); // 0-6, неділя = 0

    calendarEl.innerHTML = "";

    // Заповнення порожніх комірок перед першим днем
    for (let i = 0; i < (startDay === 0 ? 6 : startDay - 1); i++) {
      const emptyCell = document.createElement("div");
      calendarEl.appendChild(emptyCell);
    }

    // Дні місяця
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isoDate = date.toISOString().split("T")[0]; // Формат YYYY-MM-DD

      const dayEl = document.createElement("div");
      dayEl.classList.add("calendar-day");
      dayEl.textContent = i;

      // Перевірка, чи є записи на цей день
      const record = records.find((r) => r.date === isoDate);

      if (record) {
        dayEl.style.backgroundColor = "#c3073f"; // Позначення днів із записами
      }

      // Клік по дню календаря
      dayEl.addEventListener("click", () => {
        if (record) {
          recordInfo.textContent = `${i}.${month + 1}.${year}: ${
            record.time
          } – ${record.activity}`;
        } else {
          recordInfo.textContent = `${i}.${month + 1}.${year}: Немає записів`;
        }
      });

      calendarEl.appendChild(dayEl);
    }
  } catch (err) {
    console.error("Помилка при завантаженні записів:", err);
    alert("Не вдалося завантажити записи");
  }
});
