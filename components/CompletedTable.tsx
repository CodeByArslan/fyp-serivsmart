const CompletedTable = ({ completedAppointments }) => {
    return (
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Phone</th>
            <th className="py-2 px-4 border-b">Vehicle Make</th>
            <th className="py-2 px-4 border-b">Vehicle Name</th>
            <th className="py-2 px-4 border-b">Vehicle Model</th>
            <th className="py-2 px-4 border-b">Date</th>
            <th className="py-2 px-4 border-b">Time Slot</th>
            <th className="py-2 px-4 border-b">Comment</th>
            <th className="py-2 px-4 border-b">Email</th>
            <th className="py-2 px-4 border-b">Selected Vehicle</th>
            <th className="py-2 px-4 border-b">Selected Plan</th>
            <th className="py-2 px-4 border-b">Extra Features</th>
            <th className="py-2 px-4 border-b">Engine Wash</th>
          </tr>
        </thead>
        <tbody>
          {completedAppointments.map((appointment) => (
            <tr key={appointment.id}>
              <td className="py-2 px-4 border-b">{appointment.name}</td>
              <td className="py-2 px-4 border-b">{appointment.phone}</td>
              <td className="py-2 px-4 border-b">{appointment.vehicleMake}</td>
              <td className="py-2 px-4 border-b">{appointment.vehicleName}</td>
              <td className="py-2 px-4 border-b">{appointment.vehicleModel}</td>
              <td className="py-2 px-4 border-b">{appointment.date}</td>
              <td className="py-2 px-4 border-b">{appointment.timeSlot}</td>
              <td className="py-2 px-4 border-b">{appointment.comment}</td>
              <td className="py-2 px-4 border-b">{appointment.email}</td>
              <td className="py-2 px-4 border-b">{appointment.selectedVehicle}</td>
              <td className="py-2 px-4 border-b">{appointment.selectedPlan}</td>
              <td className="py-2 px-4 border-b">{appointment.extraFeatures}</td>
              <td className="py-2 px-4 border-b">{appointment.engineWash ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };
  
  export default CompletedTable;