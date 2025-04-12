import mongoose, { Schema, Document } from "mongoose";

// Interface to define the shape of the data
export interface Appointment extends Document {
  name: string;
  email: string;
  phone: string;
  vehicleMake: string;
  vehicleModel: string;
  date: string;
  slot: string;  // Added Slot Field
  comment: string;
  selectedVehicle: string | null;
  selectedPlan: string | null;
  extraFeatures: string[];
  status: string;
  isCompleted: boolean; // Added Completed Status
}

// Mongoose Schema for the Appointment model
const appointmentSchema = new Schema<Appointment>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  vehicleMake: {
    type: String,
    required: true,
  },
  vehicleModel: {
    type: String,
    required: true,
  },
  date: {
    type: String, // Store as a string or use Date type if preferred
    required: true,
  },
  slot: {
    type: String,
    enum: [
      "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
      "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
      "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM"
    ], // Slot Timings
    required: true,
  },
  comment: {
    type: String,
    required: false,
  },
  selectedVehicle: {
    type: String,
    enum: ["Sedan Car", "Minivan Car", "Microbus", "SUV Car"],
    required: true,
  },
  selectedPlan: {
    type: String,
    enum: ["500", "1000", "2000"],
    required: true,
  },
  extraFeatures: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    default: null,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
});

// Create the Mongoose model from the schema
const AppointmentModel = mongoose.model<Appointment>("Appointment", appointmentSchema);

export default AppointmentModel;
