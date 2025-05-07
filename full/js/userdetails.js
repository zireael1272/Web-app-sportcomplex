document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('userdetails-form');
    const errorMsg = document.getElementById('error-message');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const firstName = document.getElementById("firstName").value.trim();
        const lastName = document.getElementById("lastName").value.trim();
        const patronymic = document.getElementById("patronymic").value.trim();
        const phoneNumber = document.getElementById("phoneNumber").value.trim();
        const email = document.getElementById("email").value.trim();
        const dateOfBirth = document.getElementById("dateOfBirth").value;

        // Перевірка обов'язкових полів
        if (!firstName || !lastName || !patronymic || !dateOfBirth) {
            errorMsg.textContent = "Будь ласка, заповніть ім’я, прізвище та дату народження.";
            return;
        }

        const fullName = `${firstName} ${lastName} ${patronymic}`;

        try {
            const saveResponse = await fetch('http://localhost:8080/userdetails/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ fullName, phoneNumber, email, dateOfBirth })
            });

            const saveData = await saveResponse.json();

            if (saveResponse.ok) {
                // Успішно збережено
                console.log(saveData.message);
                window.location.href = "main.html"; // Перехід на іншу сторінку
            } else {
                errorMsg.textContent = saveData.message || "Не вдалося зберегти дані.";
            }
        } catch (err) {
            console.error(err);
            errorMsg.textContent = "Помилка з’єднання з сервером.";
        }
    });
});
