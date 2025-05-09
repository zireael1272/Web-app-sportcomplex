document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const dateParam = urlParams.get("date");
    const typeParam = urlParams.get("type");

    const dateInput = document.getElementById("appointment-date");
    const typeSelect = document.getElementById("activity-type");
    const timeSelect = document.getElementById("appointment-time");

    const availableTimes = {
        fitness: ["10:00", "12:00", "14:00"],
        boxing: ["11:00", "13:00", "15:00"],
    };

    // Підставити дату, якщо є в URL
    if (dateParam) {
        dateInput.value = dateParam;
    }

    // Підставити тип заняття, якщо є в URL
    if (typeParam) {
        const value = typeParam.toLowerCase();
        typeSelect.value = value === "fitness" ? "Фітнес" : "Бокс";
        typeSelect.disabled = false;

        // Створити варіанти часу
        const times = value === "fitness" ? availableTimes.fitness : availableTimes.boxing;

        timeSelect.innerHTML = '<option value="">Оберіть час</option>';
        times.forEach(time => {
            const option = document.createElement("option");
            option.value = time;
            option.textContent = time;
            timeSelect.appendChild(option);
        });

        timeSelect.disabled = false;
    } else {
        typeSelect.disabled = true;
        timeSelect.disabled = true;
    }
});
