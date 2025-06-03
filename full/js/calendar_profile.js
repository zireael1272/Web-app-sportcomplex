document.addEventListener("DOMContentLoaded", async () => {
  const calendarEl = document.getElementById("calendar");
  const recordInfo = document.getElementById("record-info");
  const userId = localStorage.getItem("userId");

  if (!userId) {
    recordInfo.textContent = "Помилка: не знайдено ID користувача";
    return;
  }

  const recordsMap = {};

  try {
    const response = await fetch("/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) throw new Error("Сервер повернув помилку");

    const records = await response.json();
    records.forEach(({ records_date, records_time, activity_type }) => {
      const date = records_date.split("T")[0];
      recordsMap[date] = {
        time: records_time,
        activity: activity_type,
      };
    });
  } catch (error) {
    console.error("Помилка при отриманні записів:", error);
    recordInfo.textContent = "Не вдалося завантажити записи";
    return;
  }

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

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

  document.getElementById(
    "month-year"
  ).textContent = `${monthNames[month]} ${year}`;
  calendarEl.innerHTML = "";

  const daysOfWeek = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  daysOfWeek.forEach((day) => {
    const dayEl = document.createElement("div");
    dayEl.className = "calendar-day-name";
    dayEl.textContent = day;
    calendarEl.appendChild(dayEl);
  });

  const offset = startDay === 0 ? 6 : startDay - 1;
  for (let i = 0; i < offset; i++) {
    calendarEl.appendChild(document.createElement("div"));
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    const isoDate = date.toISOString().split("T")[0];
    const dayEl = document.createElement("div");
    dayEl.className = "calendar-day";
    dayEl.textContent = i;

    if (recordsMap[isoDate]) {
      dayEl.classList.add("booked");
      dayEl.style.backgroundColor = "#c3073f";
    }

    dayEl.addEventListener("click", () => {
      recordInfo.innerHTML = "";
      if (recordsMap[isoDate]) {
        const { time, activity } = recordsMap[isoDate];
        const currentDay = i;

        const infoText = document.createElement("div");
        const activityTranslations = {
          fitness: "Фітнес",
          boxing: "Бокс",
        };
        const translatedActivity = activityTranslations[activity] || activity;

        infoText.textContent = `${currentDay}.${
          month + 1
        }.${year}: ${time} – ${translatedActivity}`;
        recordInfo.appendChild(infoText);
      } else {
        recordInfo.textContent = `${i}.${month + 1}.${year}: Немає записів`;
      }
    });

    calendarEl.appendChild(dayEl);
  }
});
