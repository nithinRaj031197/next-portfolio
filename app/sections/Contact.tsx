import React, { BaseSyntheticEvent, FormEvent, useRef, useState } from "react";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";

import { slideIn } from "../utils/motion";
import { EarthCanvas } from "../canvas";

import { styles } from "../styles";
import "../scss/globals.css";

const Contact = () => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: BaseSyntheticEvent) => {
    const { target } = e;
    const { name, value } = target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (form.name === "" || form.email === "") return;

    emailjs
      .send(
        process.env.VITE_APP_EMAILJS_SERVICE_ID || "",
        process.env.VITE_APP_EMAILJS_TEMPLATE_ID || "",
        {
          from_name: form.name,
          to_name: "JavaScript Mastery",
          from_email: form.email,
          to_email: "sujata@jsmastery.pro",
          message: form.message,
        },
        process.env.VITE_APP_EMAILJS_PUBLIC_KEY || ""
      )
      .then(() => {
        alert("Thank you. I will get back to you as soon as possible.");

        setForm({
          name: "",
          email: "",
          message: "",
        });
      })
      .catch((error) => {
        console.error(error);

        alert("Ahh, something went wrong. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className={`xl:mt-12 flex xl:flex-row flex-col-reverse gap-10 overflow-hidden`}>
      <motion.section variants={slideIn("left", "tween", 0.2, 1)} className="flex-[0.75] bg-black-100 p-8 rounded-2xl">
        <p className={`${styles.sectionSubText} contact_para`}>Get in touch</p>
        <h3 className={`${styles.sectionHeadText} contact_title`}>Contact.</h3>

        <form ref={formRef} onSubmit={handleSubmit} className="mt-5 flex flex-col gap-8">
          <label className="flex flex-col">
            <span className="text-white font-medium mb-4">Your Name</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="What's your good name?"
              className="border-x border-white py-4 px-6 placeholder:text-secondary text-white rounded-lg outline-none bg-transparent border-y font-medium"
            />
          </label>
          <label className="flex flex-col">
            <span className="text-white font-medium mb-4">Your email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="What's your web address?"
              className="border-x border-white py-4 px-6 placeholder:text-secondary text-white rounded-lg outline-none bg-transparent border-y font-medium"
            />
          </label>
          <label className="flex flex-col">
            <span className="text-white font-medium mb-4">Your Message</span>
            <textarea
              rows={4}
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="What you want to say?"
              className="border-x border-white py-4 px-6 placeholder:text-secondary text-white rounded-lg outline-none bg-transparent border-y font-medium"
            />
          </label>

          <button
            type="submit"
            className="border-y-white border  py-3 px-8 rounded-xl outline-none w-fit text-white font-bold shadow-md shadow-primary"
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </form>
      </motion.section>

      <motion.div variants={slideIn("right", "tween", 0.2, 1)} className="xl:flex-1 xl:h-auto md:h-[550px] h-[350px]">
        <EarthCanvas />
      </motion.div>
    </div>
  );
};

export default Contact;
