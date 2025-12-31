//protected - reset password page
"use client";
import React, { useState, useEffect } from 'react'
import { Eye, EyeClosed } from 'lucide-react';
import Forbidden from '@/components/Forbidden';
import { Usrauth } from '@/utils/firebaseConfig'; //Client-side auth
import { useAlert } from '@/utils/AlertProvider';
import { confirmPasswordReset } from 'firebase/auth';
import Footer from '@/components/Footer';

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const [oobCode, setOobCode] = useState("");
  const { showAlert } = useAlert();

  useEffect(() => {
    let currentURL = "";
    if (typeof window !== 'undefined') {
      currentURL = window.location.href;
    };
    const oob = new URL(currentURL).searchParams.get('oobCode');
    if (oob) {
      setOobCode(String(oob));
    }
  }, []);


  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    try {
      if (password !== confirm) showAlert("Password didn't match, Please retry!", "error");
      await confirmPasswordReset(Usrauth, oobCode, password)
      showAlert("Password reset successfull, Redirecting to Home-Page!", "success");
    }
    catch (err) {
      showAlert(err?.message || err || "Something went wrong", "error")
    }
  }

  if (!oobCode) {
    return <Forbidden />
  }
  return (
    <div className="min-h-screen w-full bg-gray-950">
      <header>
        <nav className='w-full h-fit flex items-center justify-center p-8'>
          <h1 className="text-2xl md:text-4xl font-semibold text-white text-center">
            Reset Password
          </h1>
        </nav>
      </header>
      <form className="bg-black/10 border border-gray-600 rounded-xl p-8 w-full max-w-md shadow-xl backdrop-blur-md absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" onSubmit={handleSubmitPassword}>
        <p className="text-gray-300 text-sm text-center mt-1 mb-6">
          Enter your new password below
        </p>
        {/* Password Input */}
        <div className="flex flex-col mb-4">
          <label className="text-white text-sm mb-1">New Password</label>
          <div className="relative">
            <input
              autoComplete="new-password"
              type={show ? "text" : "password"}
              placeholder="Enter new password"
              className="p-3 pr-10 w-full rounded-lg bg-[#2A2A2A] text-white border border-gray-600 focus:outline-[#F79F1F]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="absolute top-3 right-3 cursor-pointer text-gray-300"
              onClick={() => setShow(!show)}
            >
              {show ? <EyeClosed size={20} /> : <Eye size={20} />}
            </span>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col mb-6">
          <label className="text-white text-sm mb-1">Confirm Password</label>
          <div className="relative">
            <input
              autoComplete="new-password"
              type={show2 ? "text" : "password"}
              placeholder="Confirm new password"
              className="p-3 pr-10 w-full rounded-lg bg-[#2A2A2A] text-white border border-gray-600 focus:outline-[#F79F1F]"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            <span
              className="absolute top-3 right-3 cursor-pointer text-gray-300 "
              onClick={() => setShow2(!show2)}
            >
              {show2 ? <EyeClosed size={20} /> : <Eye size={20} />}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          className="w-full bg-[#F79F1F] hover:bg-[#b4710c] transition-all text-white py-3 rounded-lg font-medium"
        >
          Submit
        </button>
      </form>
      <Footer />
    </div>
  )
};

export default ResetPassword;
