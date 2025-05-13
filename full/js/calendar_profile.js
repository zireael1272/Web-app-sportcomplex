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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) throw new Error("Сервер повернув помилку");

    const records = await response.json();

    records.forEach((rec) => {
      const date = rec.records_date.split("T")[0];
      recordsMap[date] = `${rec.records_time} – ${rec.activity_type}`;
    });
  } catch (err) {
    console.error("Помилка при отриманні записів:", err);
    recordInfo.textContent = "Не вдалося завантажити записи";
    return;
  }

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
      recordInfo.innerHTML = ""; // очищення

      if (recordsMap[isoDate]) {
        const [time, activity] = recordsMap[isoDate].split(" – ");

        // Текст
        const infoText = document.createElement("div");
        infoText.textContent = `${i}.${month + 1}.${year}: ${time} – ${activity}`;

        // Кнопка скасування
        const cancelBtn = document.createElement("button");
        cancelBtn.textContent = "Скасувати запис";
        cancelBtn.style.marginTop = "10px";
        cancelBtn.style.padding = "6px 12px";
        cancelBtn.style.backgroundColor = "#c3073f";
        cancelBtn.style.color = "white";
        cancelBtn.style.border = "none";
        cancelBtn.style.cursor = "pointer";
        cancelBtn.style.borderRadius = "5px";

        cancelBtn.addEventListener("click", async () => {
          const confirmCancel = confirm(`Ви дійсно хочете скасувати запис на ${activity} о ${time}?`);

          if (!confirmCancel) return;

          try {
            const res = await fetch("/cancel_record", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId,
                date: isoDate,
                time,
                activity,
              }),
            });

            const result = await res.json();

            if (res.ok) {
              alert("Запис скасовано");
              location.reload();
            } else {
              alert(result.message || "Помилка при скасуванні");
            }
          } catch (err) {
            console.error("Помилка скасування:", err);
            alert("Серверна помилка");
          }
        });

        // Додаємо все
        recordInfo.appendChild(infoText);
        recordInfo.appendChild(cancelBtn);
      } else {
        recordInfo.textContent = `${i}.${month + 1}.${year}: Немає записів`;
      }
    });

    calendarEl.appendChild(dayEl);
  }
});
