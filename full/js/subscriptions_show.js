async function loadSubscriptions(userId) {
  const res = await fetch("/user-subscriptions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });

  if (!res.ok) throw new Error("Помилка при отриманні абонементів");

  const subscriptions = await res.json();
  const subscriptionBlock = document.querySelector(".subscription-block");

  // 🧼 Очистити перед новим виводом
  subscriptionBlock.innerHTML = "<h3>Абонемент</h3>";

  let gymEndDate = null;

  if (subscriptions.length === 0) {
    subscriptionBlock.innerHTML += "<p>У вас немає активних абонементів.</p>";
  } else {
    subscriptions.forEach((sub) => {
      const purchaseDate = new Date(sub.purchase_date);
      const endDate = new Date(purchaseDate);
      let subscriptionType = sub.type;
      let displayText = "";

      switch (sub.type) {
        case "gym":
          subscriptionType = "Тренажерний зал";
          endDate.setDate(endDate.getDate() + sub.duration);
          gymEndDate = endDate;
          displayText = `Дійсний до ${endDate.toISOString().split("T")[0]}`;
          break;
        case "fitness":
          subscriptionType = "Фітнес";
          displayText = `${sub.duration} занять залишилося`;
          break;
        case "boxing":
          subscriptionType = "Бокс";
          displayText = `${sub.duration} занять залишилося`;
          break;
        default:
          displayText = "Невідомий тип абонемента";
      }

      subscriptionBlock.innerHTML += `<p>${subscriptionType} — ${displayText}</p>`;
    });
  }

  return gymEndDate;
}
