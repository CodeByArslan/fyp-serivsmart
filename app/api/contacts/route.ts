import { NextResponse } from "next/server";
import mongoose from "mongoose";
import ContactModel from "@/models/contactSchema"; // Import Contact model

// MongoDB Connection String
const MONGODB_URI =
  "mongodb+srv://alihassan:87654321@cluster0.okm6n.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0";

// MongoDB Connection Function
const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
  }
};

// POST handler for saving contact messages
export async function POST(req) {
  await connectDB(); // Ensure DB is connected

  try {
    const { name, email, phone, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { message: "Name, Email, and Message are required" },
        { status: 400 }
      );
    }

    // Create a new contact entry
    const newContact = new ContactModel({
      name,
      email,
      phone,
      subject,
      message,
    });

    await newContact.save();

    return NextResponse.json(
      { message: "Message sent successfully", id: newContact._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact Form Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// GET handler for retrieving contact messages
export async function GET() {
  await connectDB(); // Ensure DB is connected

  try {
    const contacts = await ContactModel.find().sort({ createdAt: -1 }); // Fetch all contacts
    return NextResponse.json(contacts, { status: 200 });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}


// DELETE handler for deleting a contact message by ID
export async function DELETE(req) {
  await connectDB(); // Ensure DB is connected

  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { message: "Contact ID is required" },
        { status: 400 }
      );
    }

    const deletedContact = await ContactModel.findByIdAndDelete(id);

    if (!deletedContact) {
      return NextResponse.json(
        { message: "Contact not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Contact deleted successfully", id: deletedContact._id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting contact:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
