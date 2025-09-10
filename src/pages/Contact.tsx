
import { motion } from "framer-motion";
import { useState } from "react";
import { submitContactForm } from "../services/contact";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setError("Please fill in all fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Send to primary admin by default (change to true to send to all Super Admins)
      const sendToAllAdmins = true; // Change this to true if you want to send to all Super Admins
      const result = await submitContactForm(formData, sendToAllAdmins);

      if (result) {
        setSuccess(true);
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        setError("There was a problem submitting your message. Please try again later.");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Hero section with tech background */}
      <div
        className="relative isolate text-white min-h-[70vh] flex items-center overflow-hidden"
        style={{
          backgroundImage: `url('/headers/contact_header.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative mx-auto max-w-7xl w-full px-6 lg:px-8 py-32 z-10"
        >
          <div className="text-left">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl mb-6 leading-tight">
              Contact Us
            </h1>
            <p className="text-lg leading-8 text-white/90 mb-10 font-regular">
              Have questions about GSDC? We're here to help.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Centered Phoenix Icon overlapping sections */}
      <div className="relative z-20 flex justify-end">
        <div
          className="phoenix-icon-parent"
        >
          <img
            src="/logo_gsdc_icon.png"
            alt="Phoenix Icon"
            className="phoenix-icon-large"
          />
        </div>
      </div>

      {/* Contact Form section */}
      <div className="bg-gray-200 py-24 sm:py-32 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-xl">
            {success ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-2xl shadow-lg"
              >
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Thank you for contacting us. We'll get back to you as soon as possible.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSuccess(false)}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-full text-white shadow-sm transition-all duration-200 hover:scale-105"
                    style={{
                      background: "linear-gradient(135deg, #f6b62e 0%, #e74134 100%)",
                    }}
                  >
                    Send Another Message
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onSubmit={handleSubmit}
                className="rounded-2xl p-8 shadow-lg"
                style={{
                  background: "linear-gradient(to bottom, #6d97bf, #446c93)",
                }}
              >
                <div className="space-y-6">
                  <div>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="block w-full rounded-md border-0 bg-white/20 backdrop-blur-sm px-4 py-3 text-white placeholder:text-white/70 shadow-sm ring-1 ring-inset ring-white/30 focus:ring-2 focus:ring-inset focus:ring-white/50 sm:text-sm"
                      placeholder="FIRST AND LAST NAME"
                      required
                    />
                  </div>

                  <div>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="block w-full rounded-md border-0 bg-white/20 backdrop-blur-sm px-4 py-3 text-white placeholder:text-white/70 shadow-sm ring-1 ring-inset ring-white/30 focus:ring-2 focus:ring-inset focus:ring-white/50 sm:text-sm"
                      placeholder="E-MAIL"
                      required
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      name="subject"
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="block w-full rounded-md border-0 bg-white/20 backdrop-blur-sm px-4 py-3 text-white placeholder:text-white/70 shadow-sm ring-1 ring-inset ring-white/30 focus:ring-2 focus:ring-inset focus:ring-white/50 sm:text-sm"
                      placeholder="SUBJECT"
                      required
                    />
                  </div>

                  <div>
                    <textarea
                      name="message"
                      id="message"
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="block w-full rounded-md border-0 bg-white/20 backdrop-blur-sm px-4 py-3 text-white placeholder:text-white/70 shadow-sm ring-1 ring-inset ring-white/30 focus:ring-2 focus:ring-inset focus:ring-white/50 sm:text-sm resize-none"
                      placeholder="MESSAGE"
                      required
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                      {error}
                    </div>
                  )}

                  <div className="flex justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={loading}
                      className="rounded-full px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 disabled:opacity-70"
                      style={{
                        background: "linear-gradient(135deg, #f6b62e 0%, #e74134 100%)",
                      }}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        "Send Message"
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
