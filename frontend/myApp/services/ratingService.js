const BASE_URL = "https://limkokwing-reporting-system.onrender.com/api/ratings";

export const createRating = async (data) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return await res.json();
};

export const getRatings = async (lecturerId) => {
  const url = lecturerId
    ? `${BASE_URL}?lecturerId=${lecturerId}`
    : BASE_URL;

  const res = await fetch(url);
  return await res.json();
};