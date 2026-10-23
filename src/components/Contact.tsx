"use client";

import { useState } from "react";
import { initialProfile } from "@/lib/data";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0F0C20]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Get In Touch</h2>
          <p className="text-[#A7A3BC]">Have a project or opportunity? Let's discuss details.</p>
          <div className="w-16 h-1 bg-[#8B5CF6] mx-auto rounded-full mt-4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-[#16132B] border border-[#30294A] flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[#8B5CF6]/20 text-[#8B5CF6]">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-[#A7A3BC]">Email</p>
                <a href={`mailto:${initialProfile.email}`} className="text-sm font-semibold text-white hover:text-[#8B5CF6] transition-colors">
                  {initialProfile.email}
                </a>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#16132B] border border-[#30294A] flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[#EC4899]/20 text-[#EC4899]">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-[#A7A3BC]">Phone</p>
                <a href={`tel:${initialProfile.phone}`} className="text-sm font-semibold text-white hover:text-[#EC4899] transition-colors">
                  {initialProfile.phone}
                </a>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#16132B] border border-[#30294A] flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[#06B6D4]/20 text-[#06B6D4]">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-[#A7A3BC]">Location</p>
                <p className="text-sm font-semibold text-white">{initialProfile.location}</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 p-8 rounded-2xl bg-[#16132B] border border-[#30294A]">
            {submitted ? (
              <div className="p-6 rounded-xl bg-[#22C55E]/10 border border-[#22C55E] text-[#22C55E] text-center font-medium">
                Thank you! Your message has been received successfully.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#A7A3BC] mb-2">Name</label>
                    <input
                      required
                      type="text"
                      placeholder="Your Full Name"
                      className="w-full px-4 py-3 rounded-xl bg-[#1A1638] border border-[#30294A] text-white focus:outline-none focus:border-[#8B5CF6] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#A7A3BC] mb-2">Email</label>
                    <input
                      required
                      type="email"
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-3 rounded-xl bg-[#1A1638] border border-[#30294A] text-white focus:outline-none focus:border-[#8B5CF6] text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A7A3BC] mb-2">Subject</label>
                  <input
                    required
                    type="text"
                    placeholder="Project Inquiry / Opportunity"
                    className="w-full px-4 py-3 rounded-xl bg-[#1A1638] border border-[#30294A] text-white focus:outline-none focus:border-[#8B5CF6] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A7A3BC] mb-2">Message</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your requirements or inquiry..."
                    className="w-full px-4 py-3 rounded-xl bg-[#1A1638] border border-[#30294A] text-white focus:outline-none focus:border-[#8B5CF6] text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#8B5CF6] text-white font-semibold hover:bg-[#7C3AED] transition-all"
                >
                  Send Message <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}