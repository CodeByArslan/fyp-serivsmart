"use client";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const Reviews = () => {
  const [appointments, setAppointments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const recordsPerPage = 7;

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch("/api"); 
        const data = await response.json();

        const userEmail = sessionStorage.getItem("userEmail");

        const filteredAppointments = data.filter(
          (appointment) => appointment.email === userEmail
        );

        setAppointments(filteredAppointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        toast.error("Failed to fetch appointments. Please try again.");
      }
    };

    fetchAppointments();
  }, []);

  const handleEditClick = (appointment) => {
    setSelectedAppointment(appointment);
    setReviewText(""); 
    setIsModalOpen(true);
  };
  

  const handleSaveReview = async () => {
    if (!selectedAppointment) return;

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentId: selectedAppointment._id,
          email: selectedAppointment.email,
          date: selectedAppointment.date,
          name: selectedAppointment.name,
          vehicleName: selectedAppointment.vehicleName,
          review: reviewText,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save review");
      }

      const data = await response.json();

      const updatedAppointments = appointments.map((appointment) =>
        appointment._id === selectedAppointment._id
          ? { ...appointment, comment: reviewText }
          : appointment
      );

      setAppointments(updatedAppointments);
      setIsModalOpen(false);

      toast.success("Review saved successfully!");
    } catch (error) {
      console.error("Error saving review:", error);
      toast.error("Failed to save review. Please try again.");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Reviews</h2>
      {appointments.length > 0 ? (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <tr key={appointment._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {appointment.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {appointment.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {appointment.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {appointment.vehicleName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleEditClick(appointment)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Edit Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600">No reviews found for this user.</p>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h3 className="text-lg font-bold mb-4">Edit Review</h3>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              rows="4"
              placeholder="Write your review..."
            />
            <div className="flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReview}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
