document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".nav-btn");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const username = localStorage.getItem("username");

      if (!username) {
        alert("Спочатку увійдіть або зареєструйтесь");
        window.location.href = "login.html";
        return;
      }

      const type = btn.dataset.type;
      const duration = btn.dataset.duration;
      const price = btn.dataset.price;

      const params = new URLSearchParams({ type, duration, price });

      window.location.href = `payment.html?${params.toString()}`;
    });
  });
});
