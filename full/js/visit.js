let attendanceDate = new Date();

function generateAttendanceCalendar() {
  const container = document.getElementById("attendance-calendar");
  const header = document.getElementById("attendance-month-year");
  container.innerHTML = "";

  const year = attendanceDate.getFullYear();
  const month = attendanceDate.getMonth();
  const storageKey = `attendance_${year}_${month + 1}`;
  const saved = JSON.parse(localStorage.getItem(storageKey)) || {};

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const offset = (firstDayOfWeek + 6) % 7;

  const dayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
  for (let name of dayNames) {
    const dayNameEl = document.createElement("div");
    dayNameEl.textContent = name;
    dayNameEl.classList.add("calendar-day-name");
    container.appendChild(dayNameEl);
  }

  for (let i = 0; i < offset; i++) {
    const empty = document.createElement("div");
    container.appendChild(empty);
  }

  const userId = localStorage.getItem("userId");
  const monthStr = `${attendanceDate.getFullYear()}-${String(
    attendanceDate.getMonth() + 1
  ).padStart(2, "0")}`;
  fetch("/visits-get", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, month: monthStr }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Ошибка при загрузке посещений");
      }
      return response.json();
    })
    .then((visits) => {
      for (let day = 1; day <= daysInMonth; day++) {
        const localDate = new Date(year, month, day);
        const dateStr = localDate.toLocaleDateString("sv-SE");
        const dayEl = document.createElement("div");
        dayEl.textContent = day;
        dayEl.classList.add("calendar-day");
        const visitForDay = visits.find((visit) => visit.date === dateStr);
        if (visitForDay) {
          dayEl.classList.add("visited");
          dayEl.dataset.type = visitForDay.type;
        }
        const visittype = "gym"
        dayEl.addEventListener("click", () => {
          if (dayEl.classList.contains("visited")) {
            fetch("/visits-delete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId, date: dateStr, type: visittype}),
            })
              .then((response) => {
                if (!response.ok) {
                  throw new Error("Ошибка при удалении посещения");
                }
                dayEl.classList.remove("visited");
              })
              .catch((err) => {
                console.error("Ошибка при удалении посещения:", err);
                alert("Не удалось удалить посещение");
              });
          } else {
            fetch("/visits-add", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: userId,
                date: dateStr,
                type: "gym",
              }),
            })
              .then((response) => {
                if (!response.ok) {
                  throw new Error("Ошибка при добавлении посещения");
                }
                dayEl.classList.add("visited");
              })
              .catch((err) => {
                console.error("Ошибка при добавлении посещения:", err);
                alert("Не удалось сохранить посещение");
              });
          }
        });

        container.appendChild(dayEl);
      }
    })
    .catch((err) => {
      console.error("Ошибка при загрузке посещений:", err);
      alert("Ошибка при загрузке данных посещений");
    });

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
  header.textContent = `${monthNames[month]} ${year}`;
}

function changeAttendanceMonth(delta) {
  attendanceDate.setMonth(attendanceDate.getMonth() + delta);
  generateAttendanceCalendar();
}

function resetToCurrentMonth() {
  attendanceDate = new Date();
  generateAttendanceCalendar();
}

document.addEventListener("DOMContentLoaded", generateAttendanceCalendar);
