const BASE_URL = "http://10.205.140.42:5000/api/ratings";

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