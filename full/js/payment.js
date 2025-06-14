document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get("type");
  const duration = urlParams.get("duration");
  const price = urlParams.get("price");

  if (type == "gym") {
    document.getElementById("subscription-type").textContent =
      "Тренажерний зал";
    document.getElementById(
      "subscription-duration"
    ).textContent = `${duration} днів`;
  } else if (type == "fitness") {
    document.getElementById("subscription-type").textContent = "Фітнес";
    document.getElementById(
      "subscription-duration"
    ).textContent = `${duration} тренувань`;
  } else if (type == "boxing") {
    document.getElementById("subscription-type").textContent = "Бокс";
    document.getElementById(
      "subscription-duration"
    ).textContent = `${duration} тренувань`;
  }

  document.getElementById("subscription-price").textContent = price;

  const cardNumberInput = document.getElementById("card-number");
  cardNumberInput.addEventListener("input", formatCardNumber);

  const expiryDateInput = document.getElementById("expiry-date");
  expiryDateInput.addEventListener("input", formatExpiryDate);

  const cvcInput = document.getElementById("cvc");
  cvcInput.addEventListener("input", formatCVC);

  function formatCardNumber(event) {
    let value = event.target.value.replace(/\D/g, "");
    if (value.length > 16) {
      value = value.slice(0, 16);
    }
    value = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    event.target.value = value;
  }

  function formatExpiryDate(event) {
    let value = event.target.value.replace(/\D/g, "");
    if (value.length > 2) {
      value = value.substring(0, 2) + "/" + value.substring(2, 4);
    }
    event.target.value = value;
  }

  function formatCVC(event) {
    let value = event.target.value.replace(/\D/g, "");
    if (value.length > 3) {
      value = value.substring(0, 3);
    }
    event.target.value = value;
  }

  const paymentForm = document.getElementById("payment-form");
  paymentForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const cardNumber = cardNumberInput.value.trim();
    const expiryDate = expiryDateInput.value.trim();
    const cvc = cvcInput.value.trim();

    if (cardNumber === "" || expiryDate === "" || cvc === "") {
      alert("Будь ласка, заповніть усі поля.");
      return;
    }

    const user_id = localStorage.getItem("userId");

    if (!user_id) {
      alert("Будь ласка, увійдіть в систему.");
      window.location.href = "login.html";
      return;
    }

    fetch("/purchase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user_id,
        type: type,
        duration: duration,
        price: price,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Абонемент успішно активовано.") {
          alert(data.message);
          window.location.href = "profile.html";
        } else {
          alert(data.error || "Щось пішло не так при активації абонемента.");
        }
      })
      .catch((error) => {
        alert("Сталася помилка при обробці платежу.");
        console.error(error);
      });
  });
});
