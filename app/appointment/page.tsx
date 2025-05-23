
import Appointment from '@/components/Appointment'
import React from 'react'
import { ToastContainer } from "react-toastify";

export const Appointmentpage = () => {
  return (
    <div>
        <Appointment/>
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
  )
}

export default Appointmentpage
