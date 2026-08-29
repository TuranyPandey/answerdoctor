"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Stethoscope, ArrowLeft } from "lucide-react";

/**
 * AnswerDoctor — institutional auth card
 * Step 1: dual role panels (Student / Teacher), each with its own email input.
 * Step 2: single password view for the locked-in role + email.
 *
 * Drop into a Next.js app router page/component. Requires:
 *   npm install framer-motion lucide-react
 */

const ROLES = {
  student: { label: "Student", icon: GraduationCap },
  teacher: { label: "Teacher", icon: Stethoscope },
};

const slideVariants = {
  enter: (dir) => ({ x: dir === "forward" ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir === "forward" ? -48 : 48, opacity: 0 }),
};

export default function AnswerDoctorAuthCard() {
  const [step, setStep] = useState("email"); // 'email' | 'password'
  const [direction, setDirection] = useState("forward");
  const [role, setRole] = useState(null);
  const [email, setEmail] = useState({ student: "", teacher: "" });
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleStepOneSubmit(e, roleKey) {
    e.preventDefault();
    const value = email[roleKey].trim();
    if (!value) return;
    setRole(roleKey);
    setDirection("forward");
    setStep("password");
  }

  function handleBack() {
    setDirection("back");
    setStep("email");
    setPassword("");
    setRole(null);
  }

  function handleLogin(e) {
    e.preventDefault();
    if (!password.trim()) return;
    setSubmitting(true);
    // Wire up real auth here.
    setTimeout(() => setSubmitting(false), 900);
  }

  const activeRole = role ? ROLES[role] : null;
  const ActiveIcon = activeRole?.icon;

  return (
    <div className="min-h-screen w-full bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Brand label */}
        <div className="mb-3 flex items-center justify-center">
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-slate-500">
            AnswerDoctor
          </span>
        </div>

        {/* Card */}
        <div className="relative bg-white border border-slate-300 shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-slate-900" />

          <div className="relative">
            <AnimatePresence mode="wait" custom={direction}>
              {step === "email" && (
                <motion.div
                  key="email-step"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                >
                  <div className="grid grid-cols-2 gap-8">
                    <RolePanel
                      roleKey="student"
                      label="Student"
                      Icon={GraduationCap}
                      value={email.student}
                      onChange={(v) => setEmail((s) => ({ ...s, student: v }))}
                      onSubmit={(e) => handleStepOneSubmit(e, "student")}
                      divider
                    />
                    <RolePanel
                      roleKey="teacher"
                      label="Teacher"
                      Icon={Stethoscope}
                      value={email.teacher}
                      onChange={(v) => setEmail((s) => ({ ...s, teacher: v }))}
                      onSubmit={(e) => handleStepOneSubmit(e, "teacher")}
                    />
                  </div>
                </motion.div>
              )}

              {step === "password" && activeRole && (
                <motion.div
                  key="password-step"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                  className="px-8 py-10"
                >
                  <form onSubmit={handleLogin} className="mx-auto max-w-xs">
                    <div className="flex flex-col items-center text-center mb-7">
                      <div className="w-12 h-12 border border-slate-300 bg-slate-50 flex items-center justify-center mb-3">
                        <ActiveIcon size={22} strokeWidth={1.75} className="text-slate-700" />
                      </div>
                      <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-500 mb-1">
                        {activeRole.label}
                      </span>
                      <span className="text-sm text-slate-900 font-medium break-all">
                        {email[role]}
                      </span>
                    </div>

                    <label
                      htmlFor="ad-password"
                      className="block text-[11px] font-semibold tracking-[0.1em] uppercase text-slate-500 mb-1.5"
                    >
                      Password
                    </label>
                    <input
                      id="ad-password"
                      type="password"
                      autoFocus
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 mb-5"
                    />

                    <button
                      type="submit"
                      disabled={submitting || !password.trim()}
                      className="w-full bg-slate-900 text-white text-sm font-semibold py-2.5 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      {submitting ? "Signing in…" : "Login"}
                    </button>

                    <div className="mt-5 flex justify-start">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 px-1"
                      >
                        <ArrowLeft size={13} strokeWidth={2} />
                        Back
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="mt-3 text-center text-[11px] text-slate-400">
          © AnswerDoctor. Institutional access only.
        </p>
      </div>
    </div>
  );
}

function RolePanel({ roleKey, label, Icon, value, onChange, onSubmit, divider = false }) {
  return (
    <form
      onSubmit={onSubmit}
      className={`px-8 py-9 flex flex-col items-center text-center ${
        divider ? "border-r border-slate-200" : ""
      }`}
    >
      <div className="w-11 h-11 border border-slate-300 bg-slate-50 flex items-center justify-center mb-3">
        <Icon size={20} strokeWidth={1.75} className="text-slate-700" />
      </div>
      <h2 className="text-sm font-semibold tracking-[0.08em] uppercase text-slate-800 mb-5">
        {label}
      </h2>

      <label
        htmlFor={`ad-email-${roleKey}`}
        className="self-start block text-[11px] font-semibold tracking-[0.1em] uppercase text-slate-500 mb-1.5"
      >
        Affiliated email
      </label>
      <input
        id={`ad-email-${roleKey}`}
        type="email"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`${roleKey}@institution.edu`}
        className="w-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 mb-4"
      />

      <button
        type="submit"
        className="w-full bg-white border border-slate-900 text-slate-900 text-sm font-semibold py-2 hover:bg-slate-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors"
      >
        Next
      </button>
    </form>
  );
}
