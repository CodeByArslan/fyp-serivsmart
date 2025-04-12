"use client";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ServicesTable from "../components/serviceTable";
import AppointmentsTable from "../components/AppointmentsTable";
import CompletedTable from "../components/CompletedTable";
import CreateServiceModal from "../components/CreateServiceModal";
import ReviewsTable from "./ReviewsTable";
import ContactUs from "./contactus";
import ContactTable from "./contactTable";

const AdminDashboard = () => {
  const [services, setServices] = useState([
    {
      id: 1,
      name: "Oil Change",
      description: "Regular oil change service",
      icon: "oil-change-icon.png",
      banner: "oil-change-banner.jpg",
    },
    // Add more services here
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      name: "John Doe",
      phone: "123-456-7890",
      vehicleMake: "Toyota",
      vehicleName: "Camry",
      vehicleModel: "2020",
      date: "2023-10-15",
      timeSlot: "10:00 AM",
      comment: "Regular maintenance",
      email: "john@example.com",
      selectedVehicle: "Toyota Camry",
      selectedPlan: "Basic",
      extraFeatures: "Interior Cleaning",
      engineWash: true,
    },
    // Add more appointments here
  ]);

  const [completedAppointments, setCompletedAppointments] = useState([]);

  useEffect(() => {
    const fetchCompletedAppointments = async () => {
      try {
        const response = await fetch("/api");
        if (response.ok) {
          const data = await response.json();

          // Filter for completed appointments only
          const completed = data.filter(
            (appointment) => appointment.isCompleted === true
          );

          setCompletedAppointments(completed);
        }
      } catch (error) {
        console.error("Error fetching completed appointments:", error);
      }
    };

    fetchCompletedAppointments();
  }, []);

  const handleDeleteService = (id) => {
    setServices(services.filter((service) => service.id !== id));
  };

  const handleEditService = (id, updatedService) => {
    setServices(
      services.map((service) =>
        service.id === id ? { ...service, ...updatedService } : service
      )
    );
  };

  const handleMarkAsDone = async (id) => {
    const appointment = appointments.find((app) => app.id === id);
    if (!appointment) return;

    try {
      const response = await fetch("/api/completedAppointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointment),
      });

      if (response.ok) {
        // Remove from active appointments and add to completed locally
        setCompletedAppointments([...completedAppointments, appointment]);
        setAppointments(appointments.filter((app) => app.id !== id));
        toast.success("Appointment marked as done successfully!");
      } else {
        console.error("Failed to mark as done:", await response.json());
        toast.error("Failed to mark appointment as done.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while marking the appointment as done.");
    }
  };

  const handleDeleteAppointment = (id) => {
    setAppointments(appointments.filter((app) => app.id !== id));
    toast.success("Appointment deleted successfully!");
  };
  const handleCreateService = async (newService) => {
    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newService), // Ensure the data is stringified
      });

      if (response.ok) {
        const data = await response.json();
        setServices([...services, data.service]); // Add the new service to the list
        toast.success("Service created successfully!");
      } else {
        console.error("Failed to create service:", await response.json());
        toast.error("Failed to create service.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while creating the service.");
    }
  };
  const handleSuccess = () => {
    // This function will be called when the service is successfully created
    // Reset the form fields in the modal
    setIsModalOpen(false); // Close the modal
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>

      <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Services</h2>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={() => setIsModalOpen(true)}
          >
            + Create Service
          </button>
        </div>
        <ServicesTable
          services={services}
          onDelete={handleDeleteService}
          onEdit={handleEditService}
        />
      </div>

      <CreateServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateService}
        onSuccess={handleSuccess} // Pass the success callback
      />

      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Appointments</h2>
        <AppointmentsTable appointments={appointments} />
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Reviews</h2>
        <ReviewsTable
        // appointments={appointments}
        // onMarkAsDone={handleMarkAsDone}
        // onDelete={handleDeleteAppointment}
        />
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Contact</h2>
        <ContactTable
        // appointments={appointments}
        // onMarkAsDone={handleMarkAsDone}
        // onDelete={handleDeleteAppointment}
        />
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Completed Appointments</h2>
        <CompletedTable completedAppointments={completedAppointments} />
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
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

export default AdminDashboard;
