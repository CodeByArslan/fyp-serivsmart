"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const ServicesTable = () => {
  const [services, setServices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 7;

  // Fetch services from the API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`/api/services?page=${currentPage}&limit=${limit}`);
        const data = await response.json();
        setServices(data.services);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchServices();
  }, [currentPage]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle edit action
  const handleEdit = (serviceId) => {
    console.log("Edit service with ID:", serviceId);
    // Add your edit logic here
  };

  // Handle delete action
  const handleDelete = async (serviceId) => {
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove the deleted service from the state
        setServices(services.filter((service) => service._id !== serviceId));
        toast.success("Service deleted successfully");
      } else {
        console.error("Failed to delete service:", await response.text());
      }
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  return (
    <div className="p-4">
      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gradient-to-r from-red-500 to-red-600">
            <tr>
              <th className="py-3 px-6 text-left text-white font-semibold uppercase tracking-wider">
                Service Name
              </th>
              <th className="py-3 px-6 text-left text-white font-semibold uppercase tracking-wider">
                Description
              </th>
              <th className="py-3 px-6 text-left text-white font-semibold uppercase tracking-wider">
                Banner
              </th>
              <th className="py-3 px-6 text-left text-white font-semibold uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {services.map((service) => (
              <tr
                key={service._id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="py-4 px-6 text-gray-700">{service.name}</td>
                <td className="py-4 px-6 text-gray-700">{service.description}</td>
                <td className="py-4 px-6">
                  <img
                    src={service.banner.base64}
                    alt={service.banner.fileName}
                    className="w-16 h-16 object-cover rounded-lg shadow-sm"
                  />
                </td>
                <td className="py-4 px-6 space-x-2">
                  {/* <button
                    onClick={() => handleEdit(service._id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md transition-all"
                  >
                    Edit
                  </button> */}
                  <button
                    onClick={() => handleDelete(service._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md transition-all"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 mx-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md transition-all disabled:opacity-50"
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            className={`px-4 py-2 mx-1 ${
              currentPage === index + 1
                ? "bg-blue-600 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            } rounded-lg shadow-md transition-all`}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 mx-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md transition-all disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ServicesTable;