// src/app/api/route.ts
import { NextRequest, NextResponse } from "next/server"; // Ensure NextRequest is imported
import { MongoClient, ObjectId, FindOptions, Document } from "mongodb";
// import { POST as loginPOST } from "./auth/login/route"; // Still potentially problematic here
// import AppointmentModel from "@/models/appointmentSchema"; // Unused

// MongoDB URI
const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://alihassan:87654321@cluster0.okm6n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// --- !!! IMPORTANT FIX: DEFINE dbName HERE !!! ---
const dbName = process.env.MONGODB_DB_NAME || "YOUR_ACTUAL_DATABASE_NAME"; // <<<<< REPLACE THIS WITH YOUR DB NAME if not using env var

if (!uri) {
  throw new Error(
    "MongoDB URI is not defined in environment variables or code."
  );
}

if (dbName === "YOUR_ACTUAL_DATABASE_NAME" && !process.env.MONGODB_DB_NAME) {
  console.warn(
    "WARNING: MONGODB_DB_NAME is not set in environment variables. " +
      "Using a placeholder. PLEASE REPLACE 'YOUR_ACTUAL_DATABASE_NAME' in src/app/api/route.ts " +
      "with your actual database name or set the MONGODB_DB_NAME environment variable."
  );
}

// POST handler for appointment creation
export async function POST(req: NextRequest) {
  // Use NextRequest
  const url = new URL(req.url);

  // Check if request is for login or appointment
  // This routing logic is unusual for a single /api/route.ts file.
  // Typically, /api/auth/login would have its own route.ts file.
  // For now, I'll keep it as you had it, but it's a point for refactoring.
  if (url.pathname === "/api/auth/login") {
    // Assuming loginPOST is correctly imported and works
    // Make sure loginPOST is also adapted to use NextRequest if needed
    // return loginPOST(req as any); // Might need casting if loginPOST expects vanilla Request
    console.warn(
      "Login route accessed via general /api POST. Consider separate routing."
    );
    // Fall through to appointment creation if loginPOST is not defined or not intended here.
    // If loginPOST is defined and expected, you'd return its result.
    // For now, let's assume this POST is primarily for appointments if not login.
  }

  const client = new MongoClient(uri);
  try {
    const body = await req.json();
    await client.connect();
    const database = client.db(dbName); // dbName is now defined
    const collection = database.collection("appointments");

    // Add default fields for new appointments
    const newAppointmentData = {
      ...body,
      isCompleted: false,
      createdAt: new Date(),
    };

    const result = await collection.insertOne(newAppointmentData);

    const createdAppointment = {
      ...newAppointmentData,
      _id: result.insertedId.toString(), // Ensure _id is string
    };

    return NextResponse.json(
      { message: "Appointment created", appointment: createdAppointment },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating appointment:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error during POST";
    return NextResponse.json(
      { message: "Error creating appointment", error: errorMessage },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function GET(request: NextRequest) {
  // Use NextRequest
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db(dbName); // dbName is now defined
    const collection = database.collection("appointments");

    const { searchParams } = request.nextUrl; // Correct way to get searchParams from NextRequest
    const date = searchParams.get("date");

    let query: Document = {};
    if (date) {
      query = { date: date };
    }

    const appointmentsFromDB = await collection.find(query).toArray();
    const appointments = appointmentsFromDB.map((app) => ({
      ...app,
      _id: app._id.toString(), // Ensure _id is string
    }));

    return NextResponse.json(appointments, { status: 200 });
  } catch (error) {
    console.error("Error fetching appointments (GET):", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error during GET";
    return NextResponse.json(
      { message: "Error fetching appointments", error: errorMessage },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function PATCH(req: NextRequest) {
  // Use NextRequest
  const client = new MongoClient(uri);

  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { message: "Appointment ID is required" },
        { status: 400 }
      );
    }
    if (typeof id !== "string" || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid Appointment ID format" },
        { status: 400 }
      );
    }

    await client.connect();
    const database = client.db(dbName); // dbName is now defined
    const collection = database.collection("appointments");

    const objectId = new ObjectId(id);

    const result = await collection.updateOne(
      { _id: objectId },
      { $set: { isCompleted: true, updatedAt: new Date() } } // Added updatedAt
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "Appointment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Appointment marked as completed successfully",
        modifiedCount: result.modifiedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating appointment (PATCH):", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error during PATCH";
    return NextResponse.json(
      { message: "Error updating appointment", error: errorMessage },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
