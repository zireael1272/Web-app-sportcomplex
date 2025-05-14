document.addEventListener("DOMContentLoaded", async () => {
  const calendarEl = document.getElementById("calendar");
  const recordInfo = document.getElementById("record-info");
  const userId = localStorage.getItem("userId");

  if (!userId) {
    recordInfo.textContent = "Помилка: не знайдено ID користувача";
    return;
  }

  let recordsMap = {};

  try {
    const response = await fetch("/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) throw new Error("Сервер повернув помилку");

    const records = await response.json();

    records.forEach((rec) => {
      const date = rec.records_date.split("T")[0];
      recordsMap[date] = {
        time: rec.records_time,
        activity: rec.activity_type,
      };
    });
  } catch (err) {
    console.error("Помилка при отриманні записів:", err);
    recordInfo.textContent = "Не вдалося завантажити записи";
    return;
  }

  // Побудова календаря
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDay = firstDay.getDay();

  const monthNames = [
    "Січень",
    "Лютий",
    "Березень",
    "Квітень",
    "Травень",
    "Червень",
    "Липень",
    "Серпень",
    "Вересень",
    "Жовтень",
    "Листопад",
    "Грудень",
  ];
  const monthYear = `${monthNames[month]} ${year}`;
  document.getElementById("month-year").textContent = monthYear;

  calendarEl.innerHTML = "";

  const daysOfWeek = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  daysOfWeek.forEach((day) => {
    const dayEl = document.createElement("div");
    dayEl.classList.add("calendar-day-name");
    dayEl.textContent = day;
    calendarEl.appendChild(dayEl);
  });

  for (let i = 0; i < (startDay === 0 ? 6 : startDay - 1); i++) {
    const emptyCell = document.createElement("div");
    calendarEl.appendChild(emptyCell);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    const isoDate = date.toISOString().split("T")[0];

    const dayEl = document.createElement("div");
    dayEl.classList.add("calendar-day");
    dayEl.textContent = i;

    if (recordsMap[isoDate]) {
      dayEl.style.backgroundColor = "#c3073f";
    }

    dayEl.addEventListener("click", () => {
      recordInfo.innerHTML = "";

      if (recordsMap[isoDate]) {
        const { time, activity } = recordsMap[isoDate];

        const infoText = document.createElement("div");
        infoText.textContent = `${i}.${
          month + 1
        }.${year}: ${time} – ${activity}`;

        recordInfo.appendChild(infoText);
      } else {
        recordInfo.textContent = `${i}.${month + 1}.${year}: Немає записів`;
      }
    });

    calendarEl.appendChild(dayEl);
  }
});
