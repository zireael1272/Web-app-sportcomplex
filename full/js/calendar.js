let currentDate = new Date();
const today = new Date();
let shownDate = new Date(today.getFullYear(), today.getMonth(), 1);

function generateCalendar(date) {
  const daysContainer = document.getElementById("calendar-days");
  daysContainer.innerHTML = "";

  const year = date.getFullYear();
  const month = date.getMonth();

  const monthName = date.toLocaleString("uk-UA", { month: "long" });
  document.getElementById("calendar-month").textContent =
    monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const bookedFitness = [2, 4, 8, 11, 13, 15, 18, 24, 27, 29, 31];
  const bookedBoxing = [1, 3, 6, 19, 21, 23, 26, 28, 30];

  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  for (let i = 0; i < startOffset; i++) {
    const emptyDiv = document.createElement("div");
    emptyDiv.classList.add("day");
    emptyDiv.style.visibility = "hidden";
    daysContainer.appendChild(emptyDiv);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const fullDate = new Date(year, month, day);
    const localDate = new Date(
      fullDate.getTime() - fullDate.getTimezoneOffset() * 60000
    );
    const dateStr = localDate.toISOString().split("T")[0];

    const div = document.createElement("div");
    div.classList.add("day");
    div.textContent = day;

    const isPastDate =
      fullDate < today &&
      year === today.getFullYear() &&
      month === today.getMonth();

    if (isPastDate) {
      div.classList.add("disabled-day");
    } else {
      let type = "";
      if (bookedFitness.includes(day)) {
        div.classList.add("fitness");
        type = "fitness";
      } else if (bookedBoxing.includes(day)) {
        const isSunday = fullDate.getDay() === 0;
        if (!isSunday) {
          div.classList.add("boxing");
          type = "boxing";
        }
      }

      if (type) {
        div.addEventListener("click", () => {
          const username = localStorage.getItem("username");
          if (username) {
            let type = "";
            if (
              div.classList.contains("fitness") &&
              div.classList.contains("boxing")
            ) {
              type = "both";
            } else if (div.classList.contains("fitness")) {
              type = "fitness";
            } else if (div.classList.contains("boxing")) {
              type = "boxing";
            }
            window.location.href = `booking.html?date=${dateStr}&type=${type}`;
          } else {
            alert("Спочатку увійдіть або зареєструйтесь");
            window.location.href = "login.html";
          }
        });
      }
    }

    daysContainer.appendChild(div);
  }

  const prevBtn = document.getElementById("prev-month");
  const nextBtn = document.getElementById("next-month");

  prevBtn.disabled = isSameMonth(shownDate, today);
  nextBtn.disabled = monthDiff(today, shownDate) >= 2;
}

function isSameMonth(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth()
  );
}

function monthDiff(d1, d2) {
  return (
    (d2.getFullYear() - d1.getFullYear()) * 12 + d2.getMonth() - d1.getMonth()
  );
}

document.addEventListener("DOMContentLoaded", () => {
  generateCalendar(shownDate);

  document.getElementById("prev-month").addEventListener("click", () => {
    if (monthDiff(today, shownDate) > 0) {
      shownDate.setMonth(shownDate.getMonth() - 1);
      generateCalendar(shownDate);
    }
  });

  document.getElementById("next-month").addEventListener("click", () => {
    if (monthDiff(today, shownDate) < 2) {
      shownDate.setMonth(shownDate.getMonth() + 1);
      generateCalendar(shownDate);
    }
  });

  document.getElementById("go-today").addEventListener("click", () => {
    shownDate = new Date(today.getFullYear(), today.getMonth(), 1);
    generateCalendar(shownDate);
  });
});
