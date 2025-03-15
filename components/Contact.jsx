"use client";
import { EarthCanvas, StarsCanvas } from "@/canvas";
import React, { useState } from "react";
import { FaCheck, FaSpinner } from "react-icons/fa";

const initialState = {
  name: "",
  email: "",
  message: "",
};
const Contact = () => {
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [formData, setFormData] = useState(initialState);

  const handleInputValues = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);

    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
      setFormData(initialState);
    }, 2000);
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center">
      <div className="absolute inset-0">
        <StarsCanvas />
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between w-full max-w-6xl px-6 sm:px-12 gap-10">
        <div className="w-full max-w-[500px] bg-[#0b192e]/80 backdrop-blur-md p-8 rounded-lg shadow-lg border border-white/20">
          <h3 className="text-cyan-400 uppercase text-lg">Get in Touch</h3>
          <h2 className="text-5xl font-bold text-cyan-300">Contact.</h2>
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <label className="text-white">
              Your Name
              <input
                type="text"
                name="name"
                placeholder="What's your good name?"
                className="w-full mt-2 p-3 bg-transparent border border-white rounded-lg text-white"
                onChange={handleInputValues}
                value={formData?.name}
              />
            </label>

            <label className="text-white">
              Your Email
              <input
                type="email"
                name="email"
                placeholder="What's your web address?"
                className="w-full mt-2 p-3 bg-transparent border border-white rounded-lg text-white"
                onChange={handleInputValues}
                value={formData?.email}
              />
            </label>

            <label className="text-white">
              Your Message
              <textarea
                name="message"
                placeholder="What you want to say?"
                className="w-full mt-2 p-3 bg-transparent border border-white rounded-lg text-white h-32"
                onChange={handleInputValues}
                value={formData?.message}
              />
            </label>

            <div className="flex w-full justify-end">
              <button
                type="submit"
                className={`cursor-pointer py-2 px-6 rounded-lg flex items-center gap-2 transition-all duration-500 ${
                  isSent ? "bg-green-500 text-white border-none" : "border border-[#45e7ec] text-[#45e7ec] hover:shadow-[#45e7ec] hover:shadow"
                }`}
                disabled={isSending || isSent}
              >
                {isSending ? (
                  <>
                    <FaSpinner className="animate-spin" /> Sending...
                  </>
                ) : isSent ? (
                  <>
                    <FaCheck /> Successfully Sent
                  </>
                ) : (
                  "Send"
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="flex justify-center sm:w-auto">
          <div className="w-[500px] h-[500px] sm:w-[300px] sm:h-[300px] lg:w-[600px] lg:h-[600px]">
            <EarthCanvas />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
