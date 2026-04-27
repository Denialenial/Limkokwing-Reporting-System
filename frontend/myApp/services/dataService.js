const BASE_URL = "http://10.205.140.42:5000/api/data";
const LECTURE_URL = "http://10.205.140.42:5000/api/lectures";
const REPORT_URL = "http://10.205.140.42:5000/api/reports";

const safeJson = async (res) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

const handleResponse = async (res) => {
  const data = await safeJson(res);
  if (!res.ok) return { success: false, error: data?.error || "Request failed" };
  return { success: true, ...data };
};

export const getFaculties = async () => {
  try {
    const res = await fetch(`${BASE_URL}/faculties`);
    return await handleResponse(res);
  } catch {
    return { success: false, error: "Network error" };
  }
};

export const getPrograms = async (faculty) => {
  try {
    const res = await fetch(`${BASE_URL}/programs?faculty=${encodeURIComponent(faculty)}`);
    return await handleResponse(res);
  } catch {
    return { success: false, error: "Network error" };
  }
};

export const getCourses = async (faculty) => {
  try {
    const res = await fetch(`${BASE_URL}/courses?faculty=${encodeURIComponent(faculty)}`);
    return await handleResponse(res);
  } catch {
    return { success: false, error: "Network error" };
  }
};

export const addCourse = async (courseData) => {
  try {
    const res = await fetch(`${BASE_URL}/courses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(courseData),
    });
    return await handleResponse(res);
  } catch {
    return { success: false, error: "Network error" };
  }
};

export const getLecturers = async (faculty) => {
  try {
    const res = await fetch(`${LECTURE_URL}/lecturers?faculty=${encodeURIComponent(faculty)}`);
    return await handleResponse(res);
  } catch {
    return { success: false, error: "Network error" };
  }
};

export const assignLecture = async (dataBody) => {
  try {
    const res = await fetch(`${LECTURE_URL}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataBody)
    });

    return await handleResponse(res);
  } catch {
    return { success: false, error: "Network error" };
  }
};

export const getLectures = async (faculty) => {
  try {
    const res = await fetch(`${LECTURE_URL}?faculty=${encodeURIComponent(faculty)}`);
    return await handleResponse(res);
  } catch {
    return { success: false, error: "Network error" };
  }
};

export const getLecturesByLecturer = async (lecturerId) => {
  try {
    const res = await fetch(`${LECTURE_URL}?lecturerId=${encodeURIComponent(lecturerId)}`);
    return await handleResponse(res);
  } catch {
    return { success: false, error: "Network error" };
  }
};

export const createReport = async (reportData) => {
  try {
    const res = await fetch(`${REPORT_URL}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reportData),
    });
    return await handleResponse(res);
  } catch {
    return { success: false, error: "Network error" };
  }
};

export const getReports = async (faculty) => {
  try {
    const url = faculty
      ? `${REPORT_URL}?faculty=${faculty}`
      : `${REPORT_URL}`;

    const res = await fetch(url);
    return await handleResponse(res);
  } catch {
    return { success: false, error: "Network error" };
  }
};

export const addPRLFeedback = async (feedbackData) => {
  try {
    const res = await fetch(`${REPORT_URL}/review`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(feedbackData),
    });
    return await handleResponse(res);
  } catch {
    return { success: false, error: "Network error" };
  }
};

export const updateCourse = async (courseId, courseData) => {
  try {
    const res = await fetch(`${BASE_URL}/courses/${courseId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(courseData),
    });
    return await handleResponse(res);
  } catch {
    return { success: false, error: "Network error" };
  }
};

export const deleteCourse = async (courseId) => {
  try {
    const res = await fetch(`${BASE_URL}/courses/${courseId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    return await handleResponse(res);
  } catch {
    return { success: false, error: "Network error" };
  }
};
