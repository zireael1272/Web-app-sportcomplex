document.addEventListener("DOMContentLoaded", function () {
    // Не запускаємо на сторінці логіну
    if (window.location.pathname.includes("login.html")) return;

    const guestBlock = document.querySelector(".guest");
    const userBlock = document.querySelector(".user");
    const usernameSpan = document.querySelector(".username");
    const logoutBtn = document.getElementById("logout-btn");

    const username = localStorage.getItem("username");

    if (username) {
        guestBlock.style.display = "none";
        userBlock.style.display = "flex";
        usernameSpan.textContent = username;

        logoutBtn.addEventListener("click", function () {
            localStorage.removeItem("username");
            window.location.reload();
        });
    } else {
        guestBlock.style.display = "flex";
        userBlock.style.display = "none";
    }
});
