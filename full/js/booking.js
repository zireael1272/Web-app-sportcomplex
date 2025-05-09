document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const date = urlParams.get('date');
    const type = urlParams.get('type');
  
    document.getElementById('date').textContent = date;
    document.getElementById('type').textContent = type === 'fitness' ? 'Фітнес' : 'Бокс';
  
    // Дані про доступні години (реально доступні лише на певні дні)
    const availableTimes = {
      fitness: {
        '2025-05-06': ['10:00', '12:00'],
        '2025-05-11': ['12:00'],
        '2025-05-15': ['10:00', '13:00'],
        '2025-05-20': ['09:00', '12:00', '15:00'],
        '2025-05-24': ['11:00']
      },
      boxing: {
        '2025-05-10': ['10:00'],
        '2025-05-12': ['12:00', '14:00'],
        '2025-05-19': ['11:00'],
        '2025-05-22': ['09:00', '13:00'],
        '2025-05-28': ['12:00']
      }
    };
  
    const timeContainer = document.getElementById('time-container');
    const times = availableTimes[type]?.[date];
  
    if (times && times.length > 0) {
      times.forEach(time => {
        const div = document.createElement('div');
        div.classList.add('time-slot');
        div.textContent = time;
        div.addEventListener('click', () => {
          alert(`Ви записані на ${type === 'fitness' ? 'фітнес' : 'бокс'} ${date} о ${time}`);
          // Тут можна додати логіку збереження у базу
        });
        timeContainer.appendChild(div);
      });
    } else {
      const noSlots = document.createElement('p');
      noSlots.classList.add('no-slots');
      noSlots.textContent = 'Немає доступних записів на цей день.';
      timeContainer.appendChild(noSlots);
    }
  });
  