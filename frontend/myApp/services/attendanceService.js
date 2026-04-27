const BASE_URL = "http://10.205.140.42:5000/api/attendance";

const handle = async (res) => {
  const data = await res.json();
  if (!res.ok) return { success: false, error: data.error };
  return { success: true, ...data };
};

export const getStudentsByCourse = async (courseId) => {
  try {
    const res = await fetch(
      `${BASE_URL}/students/course?courseId=${encodeURIComponent(courseId)}`
    );
    return handle(res);
  } catch {
    return { success: false, error: "Network error" };
  }
};

export const markAttendance = async (payload) => {
  try {
    const res = await fetch(`${BASE_URL}/mark`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    return handle(res);
  } catch {
    return { success: false, error: "Network error" };
  }
};

export const getStudentAttendance = async (studentId, courseId) => {
  try {
    const res = await fetch(
      `${BASE_URL}/student?studentId=${studentId}&courseId=${courseId}`
    );
    return handle(res);
  } catch {
    return { success: false, error: "Network error" };
  }
};

export const getCourseById = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/course/${id}`);
    return handle(res);
  } catch {
    return { success: false, error: "Network error" };
  }
};