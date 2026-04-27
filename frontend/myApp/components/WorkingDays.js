export const getDayName = (day) => {
  const days = {
    "Monday": "Mon",
    "Tuesday": "Tue", 
    "Wednesday": "Wed",
    "Thursday": "Thu",
    "Friday": "Fri",
    "Saturday": "Sat",
    "Sunday": "Sun"
  };
  return days[day] || day;
};

export const formatDate = (timestamp) => {
  if (!timestamp) return "Recent";
  if (timestamp.toDate && typeof timestamp.toDate === "function") {
    return timestamp.toDate().toLocaleDateString();
  }
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  }
  if (typeof timestamp === 'string') {
    return timestamp.split('T')[0];
  }
  return "Recent";
};

export const getTodayDate = () => {
  return new Date().toISOString().split("T")[0];
};

export const formatTime = (time) => {
  if (!time) return "N/A";
  return time;
};