import { NextResponse } from "next/server";

// Logout - Borra las cookies de sesión
export async function POST() {
  console.log("[Auth] Cerrando sesión");
  
  const response = NextResponse.json({ 
    success: true, 
    message: "Logged out successfully" 
  });
  
  // Borrar todas las cookies de sesión
  response.cookies.set("ntm_session", "", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 0,
    path: "/"
  });
  
  response.cookies.set("ntm_user_email", "", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 0,
    path: "/"
  });
  
  response.cookies.set("ntm_logged_in", "", {
    httpOnly: false,
    secure: true,
    sameSite: "none",
    maxAge: 0,
    path: "/"
  });
  
  console.log("[Auth] Cookies de sesión borradas");
  
  return response;
}
