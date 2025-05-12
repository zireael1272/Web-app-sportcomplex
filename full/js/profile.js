async function getUserId(username) {
  const res = await fetch("/get_user_id", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });
  const data = await res.json();
  if (!data.userId) throw new Error("Не знайдено userId");
  return data.userId;
}

async function loadProfile(userId) {
  const res = await fetch("/profile_data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  const profile = await res.json();
  document.getElementById("full-name").textContent = profile.full_name || "";
  document.getElementById("phone").textContent = profile.phone || "";
  document.getElementById("email").textContent = profile.email || "";

  if (profile.birth_date) {
    const birthDate = new Date(profile.birth_date);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    document.getElementById("birth-date").textContent = `${age} років`;
  }
}
