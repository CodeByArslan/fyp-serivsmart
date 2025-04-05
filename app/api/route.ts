import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://rajputarslan693:fypappointmentdata@appointmentscluster.yyhmq.mongodb.net/";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  if (!date) {
    return NextResponse.json(
      { message: 'Date parameter is required' },
      { status: 400 }
    );
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db();
    const collection = database.collection("appointment");

    const appointments = await collection.find({ date }).toArray();
    const bookedSlots = appointments.map(app => app.timeSlot);

    return NextResponse.json({ 
      success: true,
      date,
      bookedSlots
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: 'Error fetching appointments' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function POST(request: Request) {
  const client = new MongoClient(uri);
  const body = await request.json();

  try {
    await client.connect();
    const database = client.db();
    const collection = database.collection("appointment");

    // Check if slot is already booked
    const existing = await collection.findOne({
      date: body.date,
      timeSlot: body.timeSlot
    });

    if (existing) {
      return NextResponse.json(
        { 
          success: false,
          message: 'This time slot is already booked',
          suggestedSlots: await getSuggestedSlots(body.date, body.timeSlot)
        },
        { status: 409 }
      );
    }

    const result = await collection.insertOne(body);
    return NextResponse.json(
      { success: true, insertedId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: 'Error creating appointment' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

async function getSuggestedSlots(date: string, bookedSlot: string) {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db();
    const collection = database.collection("appointment");

    const bookedSlots = (await collection.find({ date }).toArray())
      .map(app => app.timeSlot);

    const allSlots = [];
    for (let hour = 8; hour <= 20; hour++) {
      const period = hour < 12 ? 'AM' : 'PM';
      const displayHour = hour > 12 ? hour - 12 : hour;
      allSlots.push(`${displayHour}:00 ${period}`, `${displayHour}:30 ${period}`);
    }

    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));
    const bookedIndex = allSlots.indexOf(bookedSlot);
    const suggestions = [];

    for (let i = bookedIndex + 1; i < allSlots.length && suggestions.length < 3; i++) {
      if (availableSlots.includes(allSlots[i])) {
        suggestions.push(allSlots[i]);
      }
    }
    for (let i = bookedIndex - 1; i >= 0 && suggestions.length < 3; i--) {
      if (availableSlots.includes(allSlots[i])) {
        suggestions.unshift(allSlots[i]);
      }
    }

    return suggestions;
  } finally {
    await client.close();
  }
}