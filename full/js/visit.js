async function loadAttendanceCalendar(userId) {
  const container = document.getElementById("attendance-calendar");
  container.innerHTML = "";

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Відмічені дні з БД
  const response = await fetch(`/visits-get`);
  const attendanceData = await response.json();

  const attendedDates = attendanceData.attended || [];
  const futureFitness = attendanceData.fitness || [];
  const futureBox = attendanceData.box || [];

  for (let i = 0; i < firstDay; i++) {
    container.innerHTML += `<div></div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;

    const div = document.createElement("div");
    div.classList.add("attendance-day");
    div.textContent = day;

    if (attendedDates.includes(dateStr)) {
      div.classList.add("visited");
    } else if (futureFitness.includes(dateStr) || futureBox.includes(dateStr)) {
      if (new Date(dateStr) <= today) {
        div.classList.add("visited");
      } else {
        div.classList.add("future-class");
      }
    }

    div.addEventListener("click", async () => {
      if (!attendedDates.includes(dateStr)) {
        await fetch("/visits-add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, date: dateStr }),
        });
        loadAttendanceCalendar(userId);
      }
    });

    container.appendChild(div);
  }
}
