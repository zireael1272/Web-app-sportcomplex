let isEditing = false;

document.getElementById("edit-button").addEventListener("click", async () => {
    const fullNameEl = document.getElementById("full-name");
    const phoneEl = document.getElementById("phone");
    const emailEl = document.getElementById("email");
    const button = document.getElementById("edit-button");

    const userId = localStorage.getItem("userId");

    if (!userId) {
        alert("Не вдалося отримати ID користувача");
        return;
    }

    if (!isEditing) {
        fullNameEl.innerHTML = `<input type="text" id="input-full-name" value="${fullNameEl.innerText}">`;
        phoneEl.innerHTML = `<input type="text" id="input-phone" value="${phoneEl.innerText}">`;
        emailEl.innerHTML = `<input type="email" id="input-email" value="${emailEl.innerText}">`;

        button.textContent = "Зберегти";
        isEditing = true;
    } else {
        const fullName = document.getElementById("input-full-name").value;
        const phone = document.getElementById("input-phone").value;
        const email = document.getElementById("input-email").value;

        const response = await fetch("/update_profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId,
                fullName,
                phoneNumber: phone,
                email,
            }),
        });

        if (response.ok) {
            fullNameEl.textContent = fullName;
            phoneEl.textContent = phone;
            emailEl.textContent = email;

            alert("Дані збережено");
        } else {
            const data = await response.json();
            alert("Помилка: " + data.message);
        }

        button.textContent = "Редагувати профіль";
        isEditing = false;
    }
});

