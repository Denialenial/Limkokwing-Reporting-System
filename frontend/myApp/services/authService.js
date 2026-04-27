const BASE_URL = "http://10.205.140.42:5000/api/auth";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";

export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || "Registration failed" };
    }

    return { success: true, user: data.user };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const uid = userCredential.user.uid;

    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uid }),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      return { success: false, error: "Invalid server response" };
    }

    if (!response.ok) {
      return { success: false, error: data.error || "Login failed" };
    }

    return { success: true, user: data.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};