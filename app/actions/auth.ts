"use server";

import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

console.log("url", API_BASE_URL);

// export async function registerUser(userData: {
//   fullname: string;
//   email: string;
//   password: string;
//   confirmPassword: string;
// }) {
//   try {
//     const response = await fetch(`${API_BASE_URL}/users/register`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(userData),
//     });

//     const data = await response.json();
//     console.log("signup data", data);

//     if (!response.ok) {
//       return {
//         success: false,
//         message: data.message || "Registration failed",
//       };
//     }

//     return {
//       success: true,
//       data: data.data,
//     };
//   } catch (error) {
//     console.error("Registration error:", error);
//     return {
//       success: false,
//       message: "An error occurred during registration",
//     };
//   }
// }

export async function loginUser(credentials: {
  email: string;
  password: string;
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Login failed",
      };
    }

    // Store tokens in cookies
    const cookieStore = cookies();
    cookieStore.set("refreshToken", data.data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return {
      success: true,
      data: data.data,
      token: data.token,
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message: "An error occurred during login",
    };
  }
}

export async function logout() {
  const cookieStore = cookies();
  cookieStore.delete("refreshToken");
}
