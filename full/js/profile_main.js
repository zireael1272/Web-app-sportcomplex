document.addEventListener("DOMContentLoaded", async () => {
  const username = localStorage.getItem("username");
  if (!username) {
    window.location.href = "login.html";
    return;
  }

  try {
    const userId = await getUserId(username);
    await loadProfile(userId);
    await loadSubscriptions(userId);
    await setupProgress(userId);
    await drawWeightChart(userId);
    await loadAttendanceCalendar(userId);
  } catch (err) {
    console.error("Помилка ініціалізації:", err);
  }
});
