// app/api/user-history/route.ts
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://alihassan:87654321@cluster0.okm6n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  
  if (!email) {
    return NextResponse.json(
      { success: false, message: 'Email parameter is required' },
      { status: 400 }
    );
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db();
    const collection = database.collection("appointment");

    // Find all appointments for this user, sorted by date (newest first)
    const appointments = await collection.find({ email })
      .sort({ date: -1 }) // -1 for descending (newest first)
      .limit(5) // Limit to last 5 appointments
      .toArray();

    // Format the response data
    const previousAppointments = appointments.map(app => ({
      vehicleType: app.vehicleType,
      selectedPlan: app.selectedPlan,
      extraFeatures: Array.isArray(app.extraFeatures) 
        ? app.extraFeatures 
        : JSON.parse(app.extraFeatures || '[]'),
      date: app.date,
      vehicleDetails: {
        make: app.vehicleMake,
        model: app.vehicleModel
      },
      services: app.services ? 
        (Array.isArray(app.services) 
          ? app.services 
          : JSON.parse(app.services || '[]')) 
        : []
    }));

    return NextResponse.json({ 
      success: true,
      email,
      previousAppointments
    });
  } catch (error) {
    console.error('Error fetching user history:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Error fetching user history',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

// Type definitions for TypeScript
interface AppointmentHistory {
  vehicleType: string;
  selectedPlan: string;
  extraFeatures: string[];
  date: string;
  vehicleDetails: {
    make: string;
    model: string;
  };
  services: string[];
}

interface UserHistoryResponse {
  success: boolean;
  email: string;
  previousAppointments: AppointmentHistory[];
  message?: string;
  error?: string;
}