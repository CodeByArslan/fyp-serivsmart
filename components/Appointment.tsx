"use client";

import React, { useState, useEffect } from "react";
import heroImage from "../public/images/appointment_hero.png"; 
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import { getFreshRecommendations } from "../services/recommendationService";


interface Recommendation {
  explanation: string;
  recommendedPlan: string;
  recommendedFeatures: string[];
}

interface AppointmentData {
  _id: string;
  name: string;
  phone: string;
  vehicleMake: string;
  vehicleName: string;
  vehicleModel: string;
  date: string; // "YYYY-MM-DD"
  timeSlot: string; // "HH:MM AM/PM"
  comment?: string;
  email: string;
  selectedVehicle: string; // Key for pricingOptions, e.g., "Sedan Car"
  selectedPlan: string; // Price as a string, e.g., "1000"
  extraFeatures: string[];
  isCompleted?: boolean; // Should be `false` for active appointments
  createdAt?: string; // ISO date string
}

const AppointmentPage = () => {
  const router = useRouter();
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null); // Price as string
  const [extraFeatures, setExtraFeatures] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    vehicleMake: "",
    vehicleName: "",
    vehicleModel: "",
    date: "", // YYYY-MM-DD
    timeSlot: "", // HH:MM AM/PM
    comment: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [appointmentsForSelectedDate, setAppointmentsForSelectedDate] =
    useState<AppointmentData[]>([]);
  const [bookedTimeSlots, setBookedTimeSlots] = useState<string[]>([]); // Only the time strings
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [waitingTimeMessage, setWaitingTimeMessage] = useState<string>("");

  const pricingOptions: Record<string, { prices: number[]; times: string[] }> =
    {
      "Sedan Car": {
        prices: [500, 1000, 2000],
        times: ["20 Minutes", "40 Minutes", "1h 20 Minutes"],
      },
      "Minivan Car": {
        prices: [700, 1200, 2500],
        times: ["30 Minutes", "50 Minutes", "1h 30 Minutes"],
      },
      Microbus: {
        prices: [1000, 1500, 2800],
        times: ["40 Minutes", "1h", "1h 40 Minutes"],
      },
      "SUV Car": {
        prices: [700, 1200, 2500],
        times: ["30 Minutes", "50 Minutes", "1h 30 Minutes"],
      },
      "Mid Size SUV": {
        prices: [800, 1300, 2400],
        times: ["40 Minutes", "1h", "1h 30 Minutes"],
      },
      "Full Size SUV": {
        prices: [1000, 1500, 2800],
        times: ["50 Minutes", "1h 20 Minutes", "2h"],
      },
    };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      const period = hour < 12 || hour === 24 ? "AM" : "PM";
      let displayHour = hour % 12;
      if (displayHour === 0) displayHour = 12;
      slots.push(`${displayHour}:00 ${period}`);
      if (hour < 20) {
        
        slots.push(`${displayHour}:30 ${period}`);
      }
    }
    return slots.filter((slot) => slot !== "8:30 PM");
  };
  const allTimeSlots = generateTimeSlots();


  const timeStringToMinutes = (timeStr: string): number => {
    if (!timeStr || !timeStr.includes(":") || !timeStr.includes(" ")) {
      console.warn("Invalid time string for timeStringToMinutes:", timeStr);
      return NaN; 
    }
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutesStr] = time.split(":");
    let H = parseInt(hours);
    let M = parseInt(minutesStr);

    if (isNaN(H) || isNaN(M)) return NaN;

    if (modifier && modifier.toUpperCase() === "PM" && H !== 12) H += 12;
    if (modifier && modifier.toUpperCase() === "AM" && H === 12) H = 0; // Midnight case

    return H * 60 + M;
  };

  const parseDurationToMinutes = (durationString: string): number => {
    if (!durationString) return 0;
    let totalMinutes = 0;
    const durationLower = durationString.toLowerCase();
    const hourMatch = durationLower.match(/(\d+)\s*h/);
    if (hourMatch) totalMinutes += parseInt(hourMatch[1]) * 60;
    const minMatch = durationLower.match(/(\d+)\s*(m|minute|minutes)/);
    if (minMatch) totalMinutes += parseInt(minMatch[1]);
    if (totalMinutes === 0 && /^\d+$/.test(durationString.trim())) {
      // e.g. "20"
      totalMinutes = parseInt(durationString.trim());
    }
    return totalMinutes;
  };


  // Fetch appointments for the selected date
  const fetchAppointmentsForDate = async (date: string) => {
    if (!date) {
      setAppointmentsForSelectedDate([]);
      setBookedTimeSlots([]);
      setWaitingTimeMessage("");
      return;
    }
    setIsLoadingSlots(true);
    setWaitingTimeMessage("");
    try {
      const response = await fetch(`/api?date=${date}`); 
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch appointments for the day"
        );
      }
      const dailyAppointments: AppointmentData[] = await response.json();
      setAppointmentsForSelectedDate(dailyAppointments);

      const activeBookedSlots = dailyAppointments
        .filter((app) => !app.isCompleted) // Only consider non-completed appointments
        .map((app) => app.timeSlot);
      setBookedTimeSlots(activeBookedSlots);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error fetching day's schedule"
      );
      console.error(error);
      setAppointmentsForSelectedDate([]);
      setBookedTimeSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (formData.date) {
      fetchAppointmentsForDate(formData.date);
    } else {
      // Clear states if date is removed
      setAppointmentsForSelectedDate([]);
      setBookedTimeSlots([]);
      setWaitingTimeMessage("");
    }
  }, [formData.date]);

  // Calculate and set waiting time message
  // In AppointmentPage.tsx

  const calculateAndSetWaitingTime = () => {
    if (!formData.date || !formData.timeSlot || isLoadingSlots) {
      setWaitingTimeMessage(isLoadingSlots ? "Loading..." : "");
      return;
    }

    if (bookedTimeSlots.includes(formData.timeSlot)) {
      setWaitingTimeMessage(
        "This slot is already booked. Please choose another."
      );
      return;
    }

    const selectedSlotInMinutes = timeStringToMinutes(formData.timeSlot);
    if (isNaN(selectedSlotInMinutes)) {
      setWaitingTimeMessage("Invalid time selected.");
      return;
    }

    let totalPriorServiceMinutes = 0;
    const priorActiveAppointments = appointmentsForSelectedDate
      .filter((app) => {
        const isActive =
          app.isCompleted === false || typeof app.isCompleted === "undefined";
        return (
          isActive && timeStringToMinutes(app.timeSlot) < selectedSlotInMinutes
        );
      })
      .sort(
        (a, b) =>
          timeStringToMinutes(a.timeSlot) - timeStringToMinutes(b.timeSlot)
      );

    // --- Add console log to see what's being processed ---
    console.log(
      "Selected date:",
      formData.date,
      "Selected time:",
      formData.timeSlot
    );
    console.log(
      "All appointments for selected date:",
      appointmentsForSelectedDate
    );
    console.log(
      "Filtered Prior Active Appointments for Waiting Time Calc:",
      priorActiveAppointments
    );
    // --- End console log ---

    priorActiveAppointments.forEach((app) => {
      // --- MODIFICATION FOR DATA STRUCTURE ---
      const vehicleKey = app.selectedVehicle || (app as any).vehicleType; // Use selectedVehicle, fallback to vehicleType
      const planKey = app.selectedPlan || (app as any).plan; // Use selectedPlan, fallback to plan
      // --- END MODIFICATION ---

      const vehicleType = vehicleKey as keyof typeof pricingOptions;
      const planPriceStr = planKey;

      if (pricingOptions[vehicleType] && planPriceStr) {
        const planDetails = pricingOptions[vehicleType];
        const planIndex = planDetails.prices.findIndex(
          (p) => p.toString() === planPriceStr
        );

        if (planIndex !== -1) {
          const durationString = planDetails.times[planIndex];
          totalPriorServiceMinutes += parseDurationToMinutes(durationString);
        } else {
          console.warn(
            `Plan price ${planPriceStr} for ${vehicleType} (key: ${planKey}) not found in pricingOptions. Defaulting duration for appointment ${app._id}.`
          );
          totalPriorServiceMinutes += 30; // Fallback duration
        }
      } else {
        console.warn(
          `Vehicle type ${vehicleType} (key: ${vehicleKey}) or plan ${planPriceStr} (key: ${planKey}) not found in pricingOptions. Defaulting duration for appointment ${app._id}.`
        );
        totalPriorServiceMinutes += 30; // Fallback duration
      }
    });

    console.log(
      "Total Prior Service Minutes Calculated:",
      totalPriorServiceMinutes
    ); // Add this log

    if (totalPriorServiceMinutes > 0) {
      const hours = Math.floor(totalPriorServiceMinutes / 60);
      const minutes = totalPriorServiceMinutes % 60;
      let message = "Estimated queue before this slot: ";
      if (hours > 0) message += `${hours} hour${hours > 1 ? "s" : ""} `;
      if (minutes > 0) message += `${minutes} minute${minutes > 1 ? "s" : ""}`;
      setWaitingTimeMessage(message.trim() || "Calculating...");
    } else {
      // Check if there were any appointments fetched at all for the day, or if they were all completed/after
      if (
        priorActiveAppointments.length === 0 &&
        appointmentsForSelectedDate.length > 0
      ) {
        setWaitingTimeMessage(
          "No active bookings before this slot. You could be next!"
        );
      } else if (appointmentsForSelectedDate.length === 0 && formData.date) {
        setWaitingTimeMessage("No bookings found for this date.");
      } else {
        // Default case, though the above should cover most scenarios
        setWaitingTimeMessage(
          "No active bookings before this slot. You could be next!"
        );
      }
    }
  };

  useEffect(() => {
    calculateAndSetWaitingTime();
  }, [
    formData.date,
    formData.timeSlot,
    isLoadingSlots,
    appointmentsForSelectedDate,
    bookedTimeSlots,
  ]);

  const getAvailableSlotsForSelection = () => {
    if (!formData.date) return allTimeSlots;
    return allTimeSlots.filter((slot) => !bookedTimeSlots.includes(slot));
  };
  const availableSlotsForSelection = getAvailableSlotsForSelection();

  const findAlternativeSlots = (bookedSlot: string) => {
    const bookedIndex = allTimeSlots.indexOf(bookedSlot);
    const alternatives = [];
    const currentAvailable = getAvailableSlotsForSelection(); // Use current available slots
    for (
      let i = bookedIndex + 1;
      i < allTimeSlots.length && alternatives.length < 3;
      i++
    ) {
      if (currentAvailable.includes(allTimeSlots[i]))
        alternatives.push(allTimeSlots[i]);
    }
    for (let i = bookedIndex - 1; i >= 0 && alternatives.length < 3; i--) {
      if (currentAvailable.includes(allTimeSlots[i]))
        alternatives.unshift(allTimeSlots[i]);
    }
    return alternatives;
  };

  const [recommendations, setRecommendations] = useState<Recommendation | null>(
    null
  );
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState("");

  const fetchRecommendations = async () => {
    const userEmail = sessionStorage.getItem("userEmail");
    if (!userEmail) return;
    setLoadingRecommendations(true);
    setRecommendationError("");
    try {
      const freshRecs = await getFreshRecommendations(userEmail);
      setRecommendations(freshRecs);
    } catch (error) {
      setRecommendationError("Could not load recommendations");
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoadingRecommendations(false);
    }
  };
  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVehicleSelect = (type: string) => {
    setSelectedVehicle(type);
    setSelectedPlan(null);
  };

  const handlePlanSelect = (planPrice: string) => {
    // planPrice is price as string
    setSelectedPlan(planPrice);
  };

  const toggleExtraFeature = (feature: string) => {
    setExtraFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  const handleTimeSlotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    if (formData.date && bookedTimeSlots.includes(value)) {
      // Toast logic for booked slot remains the same
      const alternatives = findAlternativeSlots(value);
      toast.error(
        <div> /* ... your existing toast for booked slot ... */ </div>,
        { autoClose: 10000 }
      );
      // Waiting time message is handled by the useEffect
      return;
    }
    setFormData((prev) => ({ ...prev, timeSlot: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userEmail = sessionStorage.getItem("userEmail");
    if (!userEmail) {
      toast.error("Please log in to confirm your booking.");
      router.push("/login");
      return;
    }
    if (
      !selectedVehicle ||
      !selectedPlan ||
      !formData.timeSlot ||
      !formData.date
    ) {
      toast.error("Please select vehicle, plan, date, and time slot.");
      return;
    }
    if (bookedTimeSlots.includes(formData.timeSlot)) {
      toast.error("Selected time slot was just booked. Please choose another.");
      return;
    }

    setIsSubmitting(true);
    try {
      const bookingPayload = {
        ...formData,
        email: userEmail,
        selectedVehicle,
        selectedPlan, // This is the price string
        extraFeatures,
      };
      const response = await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload),
      });

      const result = await response.json(); // API now returns { message, appointment }

      if (!response.ok) {
        throw new Error(result.message || "Unable to confirm booking");
      }
      toast.success(result.message || "Booking confirmed!");

      fetchRecommendations();

      // Refresh appointments for the current date to update UI
      if (formData.date) {
        await fetchAppointmentsForDate(formData.date);
      }

      // Reset form
      setFormData({
        name: "",
        phone: "",
        vehicleMake: "",
        vehicleName: "",
        vehicleModel: "",
        date: "",
        timeSlot: "",
        comment: "",
      });
      setSelectedVehicle(null);
      setSelectedPlan(null);
      setExtraFeatures([]);
      // waitingTimeMessage will be cleared by its useEffect when timeSlot is reset
    } catch (error) {
      console.error("Booking error:", error);
      toast.error(
        error instanceof Error ? error.message : "Booking submission failed."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyRecommendation = () => {
    if (!recommendations || !selectedVehicle) return;
    const vehiclePricing = pricingOptions[selectedVehicle];
    if (!vehiclePricing) return;
    let priceToSelect = vehiclePricing.prices[1]; // Default Full Wash
    if (
      recommendations.recommendedPlan.includes("General") &&
      vehiclePricing.prices[2] !== undefined
    )
      priceToSelect = vehiclePricing.prices[2];
    else if (
      recommendations.recommendedPlan.includes("Basic") &&
      vehiclePricing.prices[0] !== undefined
    )
      priceToSelect = vehiclePricing.prices[0];
    setSelectedPlan(priceToSelect.toString());
    setExtraFeatures(recommendations.recommendedFeatures);
    toast.success(`Applied: ${recommendations.recommendedPlan}`);
  };

  return (
    <div className="py-8 px-4 md:px-16">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <section className="h-[250px] md:h-[300px] w-full flex items-center justify-center mb-8">
        <img
          src={heroImage.src}
          alt="Car Wash Appointment"
          className="object-contain h-full w-auto max-w-[50%] md:max-w-[45%]"
        />
      </section>

      {/* Vehicle Type Section */}
      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-bold mb-4">
          1. Select Vehicle Type
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {Object.keys(pricingOptions).map((type) => (
            <button
              key={type}
              className={`p-4 border rounded-md text-center text-sm md:text-base transition-colors duration-150 ${
                selectedVehicle === type
                  ? "bg-blue-500 text-white ring-2 ring-blue-300"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => handleVehicleSelect(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Pricing Plan Section */}
      {selectedVehicle && (
        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4">
            2. Select Pricing Plan for {selectedVehicle}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {pricingOptions[selectedVehicle].prices.map((price, index) => (
              <button
                key={index}
                className={`p-4 border rounded-md text-center text-sm md:text-base transition-colors duration-150 ${
                  selectedPlan === price.toString()
                    ? "bg-orange-500 text-white ring-2 ring-orange-300"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
                onClick={() => handlePlanSelect(price.toString())}
              >
                <h3 className="font-semibold">
                  {index === 0
                    ? "Basic Wash"
                    : index === 1
                    ? "Full Wash"
                    : "General Wash"}
                </h3>
                <p className="text-lg font-bold">PKr/- {price}</p>
                <p className="text-sm text-gray-500">
                  {pricingOptions[selectedVehicle].times[index]}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Extra Features Section */}
      {selectedVehicle &&
        selectedPlan && ( // Show only if vehicle and plan are selected
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold mb-4">
              3. Choose Extra Features (Optional)
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[
                "Tire Shine",
                "Express Interior",
                "Interior Vacuum",
                "Dashboard Polish & Clean",
                "Engine Wash",
              ].map((feature) => (
                <button
                  key={feature}
                  className={`p-4 border rounded-md text-center text-sm md:text-base transition-colors duration-150 ${
                    extraFeatures.includes(feature)
                      ? "bg-green-500 text-white ring-2 ring-green-300"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  onClick={() => toggleExtraFeature(feature)}
                >
                  {feature}
                </button>
              ))}
            </div>
          </div>
        )}

      {/* Recommendations Section */}
      {recommendations && selectedVehicle && (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-md shadow">
          <h2 className="text-xl font-bold mb-2 text-blue-700">
            ✨ Recommended For You
          </h2>
          {loadingRecommendations ? (
            <p>Analyzing...</p>
          ) : recommendationError ? (
            <p className="text-red-500">{recommendationError}</p>
          ) : (
            <>
              <p className="mb-3 text-gray-700">
                {recommendations.explanation}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">Plan:</h3>
                  <p className="text-gray-600">
                    {recommendations.recommendedPlan}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Features:</h3>
                  <ul className="list-disc pl-5 text-gray-600">
                    {recommendations.recommendedFeatures.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <button
                onClick={applyRecommendation}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-150"
              >
                Apply Recommendation
              </button>
            </>
          )}
        </div>
      )}

      {/* Booking Details Form */}
      {selectedVehicle &&
        selectedPlan && ( // Show form only after plan selection
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4">
              4. Your Details & Booking Slot
            </h2>
            <form
              onSubmit={handleSubmit}
              className="space-y-6 bg-white p-6 rounded-lg shadow-md"
            >
              <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-2"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-2"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="vehicleName"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Vehicle Name (e.g., Civic)
                  </label>
                  <input
                    type="text"
                    id="vehicleName"
                    name="vehicleName"
                    placeholder="e.g., Civic, Corolla"
                    value={formData.vehicleName}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-2"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="vehicleMake"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Vehicle Make (e.g., Honda)
                  </label>
                  <input
                    type="text"
                    id="vehicleMake"
                    name="vehicleMake"
                    placeholder="e.g., Honda, Toyota"
                    value={formData.vehicleMake}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-2"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="vehicleModel"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Vehicle Model/Year
                  </label>
                  <input
                    type="text"
                    id="vehicleModel"
                    name="vehicleModel"
                    placeholder="e.g., 2020 LX"
                    value={formData.vehicleModel}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-2"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Appointment Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-2"
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  {" "}
                  {/* Time Slot and Waiting Time */}
                  <label
                    htmlFor="timeSlot"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Time Slot
                  </label>
                  <select
                    id="timeSlot"
                    name="timeSlot"
                    value={formData.timeSlot}
                    onChange={handleTimeSlotChange}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-2"
                    disabled={!formData.date || isLoadingSlots}
                    required
                  >
                    <option value="">
                      {isLoadingSlots
                        ? "Loading available slots..."
                        : "Select Time Slot"}
                    </option>
                    {!isLoadingSlots &&
                      availableSlotsForSelection.map((slot, index) => (
                        <option key={index} value={slot}>
                          {slot}
                        </option>
                      ))}
                    {!isLoadingSlots &&
                      availableSlotsForSelection.length === 0 &&
                      formData.date && (
                        <option disabled>
                          No slots available for this date.
                        </option>
                      )}
                  </select>
                  {formData.timeSlot && waitingTimeMessage && (
                    <p
                      className={`mt-2 text-sm p-2 rounded-md ${
                        bookedTimeSlots.includes(formData.timeSlot)
                          ? "text-red-700 bg-red-100 border border-red-300"
                          : "text-blue-700 bg-blue-100 border border-blue-300"
                      }`}
                    >
                      {waitingTimeMessage}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label
                  htmlFor="comment"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Additional Comments
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  placeholder="Any specific requests or notes?"
                  value={formData.comment}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 p-2"
                  rows={3}
                />
              </div>
              <button
                type="submit"
                className={`w-full flex justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm transition-opacity ${
                  isSubmitting ||
                  !selectedVehicle ||
                  !selectedPlan ||
                  !formData.date ||
                  !formData.timeSlot
                    ? "bg-orange-300 cursor-not-allowed"
                    : "bg-orange-500 hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
                }`}
                disabled={
                  isSubmitting ||
                  !selectedVehicle ||
                  !selectedPlan ||
                  !formData.date ||
                  !formData.timeSlot
                }
              >
                {isSubmitting ? "Booking..." : "Confirm Booking"}
              </button>
            </form>
          </div>
        )}
    </div>
  );
};

export default AppointmentPage;
