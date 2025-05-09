document.addEventListener("DOMContentLoaded", () => {
    const calendarEl = document.getElementById("calendar");
    const recordInfo = document.getElementById("record-info");
  
    // Імітація записів (в майбутньому з бекенду)
    const sampleRecords = {
      "2025-05-10": "14:00 – Йога",
      "2025-05-12": "18:30 – Тренажерний зал",
      "2025-05-15": "10:00 – Плавання"
    };
  
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
      const isoDate = date.toISOString().split("T")[0];
  
      const dayEl = document.createElement("div");
      dayEl.classList.add("calendar-day");
      dayEl.textContent = i;
  
      if (sampleRecords[isoDate]) {
        dayEl.style.backgroundColor = "#c3073f"; // Позначення днів із записами
      }
  
      dayEl.addEventListener("click", () => {
        if (sampleRecords[isoDate]) {
          recordInfo.textContent = `${i}.${month + 1}.${year}: ${sampleRecords[isoDate]}`;
        } else {
          recordInfo.textContent = `${i}.${month + 1}.${year}: Немає записів`;
        }
      });
  
      calendarEl.appendChild(dayEl);
    }
  });
  