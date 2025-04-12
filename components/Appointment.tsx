"use client";

import React, { useState, useEffect } from "react";
import heroImage from "../public/images/appointment_hero.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
// Replace the existing import
import { getFreshRecommendations } from "../services/recommendationService";
const Appointment = () => {
  const router = useRouter();
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [extraFeatures, setExtraFeatures] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    vehicleMake: "",
    vehicleName: "",
    vehicleModel: "",
    date: "",
    timeSlot: "",
    comment: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  // Vehicle pricing options
  const pricingOptions = {
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

  // Generate all possible time slots (8AM - 8PM)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      const period = hour < 12 ? "AM" : "PM";
      const displayHour = hour > 12 ? hour - 12 : hour;
      slots.push(`${displayHour}:00 ${period}`);
      slots.push(`${displayHour}:30 ${period}`);
    }
    return slots;
  };

  const allTimeSlots = generateTimeSlots();

  // Fetch booked slots when date changes
  useEffect(() => {
    if (formData.date) {
      fetchBookedSlots(formData.date);
    } else {
      setBookedSlots([]);
    }
  }, [formData.date]);

// Change all API calls to use '/api' instead of '/api/appointments'
const fetchBookedSlots = async (date: string) => {
  setIsLoadingSlots(true);
  try {
    const response = await fetch(`/api?date=${date}`);
    if (!response.ok) throw new Error('Failed to fetch slots');
    const data = await response.json();
    setBookedSlots(data.bookedSlots || []);
  } catch (error) {
    toast.error("Error checking availability");
    console.error(error);
  } finally {
    setIsLoadingSlots(false);
  }
};

  // Filter available slots
  const getAvailableSlots = () => {
    if (!formData.date) return allTimeSlots;
    return allTimeSlots.filter(slot => !bookedSlots.includes(slot));
  };

  const availableSlots = getAvailableSlots();

  // Find alternative slots when a slot is booked
  const findAlternativeSlots = (bookedSlot: string) => {
    const bookedIndex = allTimeSlots.indexOf(bookedSlot);
    const alternatives = [];
    
    // Check next 3 available slots
    for (let i = bookedIndex + 1; i < allTimeSlots.length && alternatives.length < 3; i++) {
      if (availableSlots.includes(allTimeSlots[i])) {
        alternatives.push(allTimeSlots[i]);
      }
    }
    
    // If not enough, check previous slots
    for (let i = bookedIndex - 1; i >= 0 && alternatives.length < 3; i--) {
      if (availableSlots.includes(allTimeSlots[i])) {
        alternatives.unshift(allTimeSlots[i]);
      }
    }
    
    return alternatives;
  };







// Replace the existing recommendation state and useEffect
const [recommendations, setRecommendations] = useState<Recommendation | null>(null);
const [loadingRecommendations, setLoadingRecommendations] = useState(false);
const [recommendationError, setRecommendationError] = useState('');

// Fetch fresh recommendations on component mount and after bookings
const fetchRecommendations = async () => {
  const userEmail = sessionStorage.getItem("userEmail");
  if (!userEmail) return;
  
  setLoadingRecommendations(true);
  setRecommendationError('');
  try {
    const freshRecs = await getFreshRecommendations(userEmail);
    setRecommendations(freshRecs);
  } catch (error) {
    setRecommendationError('Could not load recommendations');
    console.error("Error fetching recommendations:", error);
  } finally {
    setLoadingRecommendations(false);
  }
};

useEffect(() => {
  fetchRecommendations();
}, []);











  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVehicleSelect = (type: string) => {
    setSelectedVehicle(type);
    setSelectedPlan(null);
  };

  const handlePlanSelect = (plan: string) => {
    setSelectedPlan(plan);
  };

  const toggleExtraFeature = (feature: string) => {
    setExtraFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature) 
        : [...prev, feature]
    );
  };

  const handleTimeSlotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    
    // Check if selected slot is available
    if (formData.date && bookedSlots.includes(value)) {
      const alternatives = findAlternativeSlots(value);
      toast.error(
        <div>
          <p>This time slot is already booked.</p>
          <p className="font-semibold mt-2">Available slots around this time:</p>
          <ul className="list-disc pl-5 mt-1">
            {alternatives.map((slot, i) => (
              <li 
                key={i} 
                className="cursor-pointer hover:text-blue-500"
                onClick={() => {
                  setFormData(prev => ({ ...prev, timeSlot: slot }));
                  toast.dismiss();
                }}
              >
                {slot}
              </li>
            ))}
          </ul>
        </div>,
        { autoClose: 10000 }
      );
      return;
    }
    
    setFormData({ ...formData, timeSlot: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Check if user is logged in
    const userEmail = sessionStorage.getItem("userEmail");
    if (!userEmail) {
      toast.error("Please log in to confirm your booking.");
      router.push("/login");
      return;
    }
  
    // Validate selections
    if (!selectedVehicle || !selectedPlan || !formData.timeSlot) {
      toast.error("Please select a vehicle type, pricing plan, and time slot.");
      return;
    }
  
    // Double-check slot availability
    if (formData.date && bookedSlots.includes(formData.timeSlot)) {
      const alternatives = findAlternativeSlots(formData.timeSlot);
      toast.error(
        <div>
          <p>This time slot was just booked by someone else.</p>
          <p className="font-semibold mt-2">Available slots around this time:</p>
          <ul className="list-disc pl-5 mt-1">
            {alternatives.map((slot, i) => (
              <li 
                key={i} 
                className="cursor-pointer hover:text-blue-500"
                onClick={() => {
                  setFormData(prev => ({ ...prev, timeSlot: slot }));
                  toast.dismiss();
                }}
              >
                {slot}
              </li>
            ))}
          </ul>
        </div>,
        { autoClose: 10000 }
      );
      return;
    }
  
    setIsSubmitting(true);
    setResponseMessage("");
  
    try {
      // Submit booking data
      const response = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          email: userEmail,
          selectedVehicle,
          selectedPlan,
          extraFeatures
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Unable to confirm booking");
      }
  
      // On successful booking:
      toast.success("Booking confirmed!");
  
      // Refresh recommendations with fresh data from GROQ
      try {
        setLoadingRecommendations(true);
        const freshRecs = await getFreshRecommendations(userEmail);
        setRecommendations(freshRecs);
      } catch (recError) {
        console.error("Failed to refresh recommendations:", recError);
        toast.info("Booking confirmed! Could not refresh recommendations.");
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
  
      // Refresh booked slots if date was selected
      if (formData.date) {
        await fetchBookedSlots(formData.date);
      }
  
    } catch (error) {
      console.error("Booking error:", error);
      toast.error(error instanceof Error ? error.message : "Error occurred while submitting the form.");
    } finally {
      setIsSubmitting(false);
      setLoadingRecommendations(false);
    }
  };




  const applyRecommendation = () => {
    if (!recommendations || !selectedVehicle) return;
  
    // Convert recommendation to actual prices
    const prices = pricingOptions[selectedVehicle].prices;
    let priceToSelect = prices[1]; // Default to Full Wash
  
    if (recommendations.recommendedPlan.includes("General") && prices[2]) {
      priceToSelect = prices[2];
    } else if (recommendations.recommendedPlan.includes("Basic") && prices[0]) {
      priceToSelect = prices[0];
    }
  
    setSelectedPlan(priceToSelect.toString());
    setExtraFeatures(recommendations.recommendedFeatures);
    
    toast.success(`Applied: ${recommendations.recommendedPlan} with ${recommendations.recommendedFeatures.join(', ')}`);
  };



  return (
    <div className="py-8 px-4 md:px-16">
      <section className="h-[300px] w-full flex items-center justify-center">
        <img
          src={heroImage.src}
          alt="Hero Image"
          className="object-cover"
          style={{
            width: "45%",
            height: "auto",
          }}
        />
      </section>

      {/* Vehicle Type Section */}
      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-bold mb-4">
          Select Vehicle Type
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {Object.keys(pricingOptions).map((type) => (
            <button
              key={type}
              className={`p-4 border rounded-md text-center text-sm md:text-base ${
                selectedVehicle === type
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100"
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
            Select Pricing Plan
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {pricingOptions[selectedVehicle].prices.map((price, index) => (
              <button
                key={index}
                className={`p-4 border rounded-md text-center text-sm md:text-base ${
                  selectedPlan === price.toString()
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100"
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
                <p className="text-lg font-bold">{price}</p>
                <p className="text-sm text-gray-500">
                  {pricingOptions[selectedVehicle].times[index]}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Extra Features Section */}
      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-bold mb-4">
          Choose Extra Features
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
              className={`p-4 border rounded-md text-center text-sm md:text-base ${
                extraFeatures.includes(feature)
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100"
              }`}
              onClick={() => toggleExtraFeature(feature)}
            >
              {feature}
            </button>
          ))}
        </div>
      </div>

      {/* Booking Details Form */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold mb-4">
          Enter Your Details
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleInputChange}
              className="p-2 border rounded-md w-full text-sm md:text-base"
              required
            />
            <input
              type="text"
              name="vehicleName"
              placeholder="Your Vehicle Name"
              value={formData.vehicleName}
              onChange={handleInputChange}
              className="p-2 border rounded-md w-full text-sm md:text-base"
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleInputChange}
              className="p-2 border rounded-md w-full text-sm md:text-base"
              required
            />
            <input
              type="text"
              name="vehicleMake"
              placeholder="Vehicle Make"
              value={formData.vehicleMake}
              onChange={handleInputChange}
              className="p-2 border rounded-md w-full text-sm md:text-base"
              required
            />
            <input
              type="text"
              name="vehicleModel"
              placeholder="Vehicle Model"
              value={formData.vehicleModel}
              onChange={handleInputChange}
              className="p-2 border rounded-md w-full text-sm md:text-base"
              required
            />
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="p-2 border rounded-md w-full text-sm md:text-base"
              min={new Date().toISOString().split('T')[0]}
              required
            />

            <select
              name="timeSlot"
              value={formData.timeSlot}
              onChange={handleTimeSlotChange}
              className="p-2 border rounded-md w-full text-sm md:text-base"
              disabled={!formData.date || isLoadingSlots}
              required
            >
              <option value="">Select Time Slot</option>
              {isLoadingSlots ? (
                <option>Loading available slots...</option>
              ) : (
                availableSlots.map((slot, index) => (
                  <option key={index} value={slot}>
                    {slot}
                  </option>
                ))
              )}
            </select>
          </div>
          <textarea
            name="comment"
            placeholder="Write Comment"
            value={formData.comment}
            onChange={handleInputChange}
            className="p-2 border rounded-md w-full text-sm md:text-base"
          />





{/* Replace the existing recommendations section */}
<div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
  <h2 className="text-xl font-bold mb-2">Recommended For You</h2>
  
  {loadingRecommendations ? (
    <p>Analyzing your booking history...</p>
  ) : recommendationError ? (
    <p className="text-red-500">{recommendationError}</p>
  ) : recommendations ? (
    <>
      <p className="mb-3">{recommendations.explanation}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
        <div>
          <h3 className="font-semibold">Recommended Plan:</h3>
          <p>{recommendations.recommendedPlan}</p>
        </div>
        <div>
          <h3 className="font-semibold">Recommended Features:</h3>
          <ul className="list-disc pl-5">
            {recommendations.recommendedFeatures.map((feature, i) => (
              <li key={i}>{feature}</li>
            ))}
          </ul>
        </div>
      </div>
      <button
        onClick={applyRecommendation}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
      >
        Apply Recommendations
      </button>
    </>
  ) : (
    <p>No recommendations available</p>
  )}
</div>




          <button
            type="submit"
            className={`w-full bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Confirm Booking"}
          </button>
        </form>
        {responseMessage && (
          <p className="mt-4 text-center text-sm text-red-600">
            {responseMessage}
          </p>
        )}
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Appointment;