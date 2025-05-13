document.addEventListener("DOMContentLoaded", async () => {
  const username = localStorage.getItem("username");
  if (!username) {
    window.location.href = "login.html";
    return;
  }

  try {
    const userId = localStorage.getItem("userId");
    await loadProfile(userId);
    await loadSubscriptions(userId);
    await setupProgress(userId);
    await drawWeightChart(userId);
    // await drawAttendanceChart(userId);
    await loadAttendanceCalendar(userId);
  } catch (err) {
    console.error("Помилка ініціалізації:", err);
  }
});
