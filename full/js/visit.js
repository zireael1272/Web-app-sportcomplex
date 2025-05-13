let attendanceDate = new Date(); // глобальна змінна

function generateAttendanceCalendar() {
  const container = document.getElementById("attendance-calendar");
  const header = document.getElementById("attendance-month-year");
  container.innerHTML = "";

  const year = attendanceDate.getFullYear();
  const month = attendanceDate.getMonth(); // 0-11
  const storageKey = `attendance_${year}_${month + 1}`;
  const saved = JSON.parse(localStorage.getItem(storageKey)) || {};

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Нд, 1 = Пн ...

  const offset = (firstDayOfWeek + 6) % 7; // зсунення на Пн = 0

  // Назви днів тижня
  const dayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
  for (let name of dayNames) {
    const dayNameEl = document.createElement("div");
    dayNameEl.textContent = name;
    dayNameEl.classList.add("calendar-day-name");
    container.appendChild(dayNameEl);
  }

  // Пусті клітинки перед першим днем
  for (let i = 0; i < offset; i++) {
    const empty = document.createElement("div");
    container.appendChild(empty);
  }

  // Дні місяця
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${month + 1}-${day}`;
    const dayEl = document.createElement("div");
    dayEl.textContent = day;
    dayEl.classList.add("calendar-day");

    if (saved[dateKey]) {
      dayEl.classList.add("visited");
    }

    dayEl.addEventListener("click", () => {
      if (dayEl.classList.contains("visited")) {
        dayEl.classList.remove("visited");
        delete saved[dateKey];
      } else {
        dayEl.classList.add("visited");
        saved[dateKey] = true;
      }
      localStorage.setItem(storageKey, JSON.stringify(saved));
    });

    container.appendChild(dayEl);
  }

  // Підпис місяця
  const monthNames = [
    "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
    "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"
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
