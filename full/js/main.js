document.addEventListener('DOMContentLoaded', () => {
  const guestDiv = document.querySelector('.guest');
  const userDiv = document.querySelector('.user');
  const usernameSpan = document.querySelector('.username');
  const logoutBtn = document.getElementById('logout-btn');

  const username = localStorage.getItem('username');

  if (username) {
    guestDiv.style.display = 'none';
    userDiv.style.display = 'block';
    usernameSpan.textContent = username;
  }

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('username');
    location.reload();
  });
});
