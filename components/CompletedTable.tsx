const CompletedTable = ({ completedAppointments }) => {
  return (
    <div className="p-4">
      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gradient-to-r from-blue-500 to-blue-600">
            <tr>
              <th className="py-3 px-6 text-left text-white font-semibold uppercase tracking-wider">
                Name
              </th>
              <th className="py-3 px-6 text-left text-white font-semibold uppercase tracking-wider">
                Phone
              </th>
              <th className="py-3 px-6 text-left text-white font-semibold uppercase tracking-wider">
                Vehicle Make
              </th>
              <th className="py-3 px-6 text-left text-white font-semibold uppercase tracking-wider">
                Vehicle Name
              </th>
              <th className="py-3 px-6 text-left text-white font-semibold uppercase tracking-wider">
                Vehicle Model
              </th>
              <th className="py-3 px-6 text-left text-white font-semibold uppercase tracking-wider">
                Date
              </th>
              <th className="py-3 px-6 text-left text-white font-semibold uppercase tracking-wider">
                Time Slot
              </th>
              <th className="py-3 px-6 text-left text-white font-semibold uppercase tracking-wider">
                Comment
              </th>
              <th className="py-3 px-6 text-left text-white font-semibold uppercase tracking-wider">
                Email
              </th>
              <th className="py-3 px-6 text-left text-white font-semibold uppercase tracking-wider">
                Selected Vehicle
              </th>
              <th className="py-3 px-6 text-left text-white font-semibold uppercase tracking-wider">
                Selected Plan
              </th>
              <th className="py-3 px-6 text-left text-white font-semibold uppercase tracking-wider">
                Extra Features
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {completedAppointments.map((appointment) => (
              <tr
                key={appointment._id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="py-4 px-6 text-gray-700">{appointment.name}</td>
                <td className="py-4 px-6 text-gray-700">{appointment.phone}</td>
                <td className="py-4 px-6 text-gray-700">
                  {appointment.vehicleMake}
                </td>
                <td className="py-4 px-6 text-gray-700">
                  {appointment.vehicleName}
                </td>
                <td className="py-4 px-6 text-gray-700">
                  {appointment.vehicleModel}
                </td>
                <td className="py-4 px-6 text-gray-700">{appointment.date}</td>
                <td className="py-4 px-6 text-gray-700">
                  {appointment.timeSlot}
                </td>
                <td className="py-4 px-6 text-gray-700">
                  {appointment.comment}
                </td>
                <td className="py-4 px-6 text-gray-700">{appointment.email}</td>
                <td className="py-4 px-6 text-gray-700">
                  {appointment.selectedVehicle}
                </td>
                <td className="py-4 px-6 text-gray-700">
                  {appointment.selectedPlan}
                </td>
                <td className="py-4 px-6 text-gray-700">
                  {Array.isArray(appointment.extraFeatures) 
                    ? appointment.extraFeatures.join(", ") 
                    : appointment.extraFeatures}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompletedTable;