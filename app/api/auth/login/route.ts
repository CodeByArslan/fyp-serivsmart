import { NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/models/userSchema"; // Import User model
import bcrypt from "bcryptjs"; // For password hashing (if needed)

// MongoDB Connection Function (Call only once in the app)
const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect("mongodb+srv://alihassan:87654321@cluster0.okm6n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
  }
};

// POST handler for login
export async function POST(req: Request) {
  await connectDB(); // Ensure DB is connected

  try {
    const { email, password } = await req.json(); // Parse request body

    // Check if the user exists
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Compare the password (Assuming password is hashed in the DB)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // Check if the user is the Super Admin
    let role = user.role;
    if (email === "muhammadalialvi646@gmail.com") {
      role = "superadmin"; // Force role assignment for this email
    }

    // Return role-based redirection info
    return NextResponse.json(
      { message: "Login successful", user: { email: user.email, role } },
      { status: 200 }
    );

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
