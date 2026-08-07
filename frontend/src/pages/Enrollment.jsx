import React, { useState } from 'react';
import { CheckCircle2, ChevronRight, Upload, Camera, Scan, Sparkles } from 'lucide-react';

export function Enrollment() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: 'Rahul Verma',
    employeeId: 'EMP158',
    email: 'rahul.verma@company.com',
    department: 'Engineering',
    designation: 'Senior Developer',
  });

  const steps = [
    { number: 1, label: 'Employee Info' },
    { number: 2, label: 'Capture Faces' },
    { number: 3, label: 'Review & Confirm' },
    { number: 4, label: 'Completed' },
  ];

  const capturedThumbnails = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
          Employee Enrollment
        </h2>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
          Add new employee and capture face data
        </p>
      </div>

      {/* Stepper Header */}
      <div className="visio-card p-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {steps.map((step, idx) => (
            <React.Fragment key={step.number}>
              <div className="flex items-center space-x-2">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep === step.number
                    ? 'bg-[#635BFF] text-white shadow-md shadow-[#635BFF]/30'
                    : currentStep > step.number
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}>
                  {currentStep > step.number ? <CheckCircle2 className="h-4 w-4" /> : step.number}
                </div>
                <span className={`text-xs font-semibold hidden sm:inline ${
                  currentStep === step.number ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                }`}>
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className="h-[2px] flex-1 mx-3 bg-slate-100 dark:bg-slate-800" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Grid: Employee Form & Face Viewfinder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Employee Info Form */}
        <div className="visio-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Employee Information</h3>

          <form className="space-y-3.5" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Employee ID
              </label>
              <input
                type="text"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
              >
                <option value="Engineering">Engineering</option>
                <option value="HR">HR</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Designation
              </label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
              />
            </div>

            <button
              type="submit"
              onClick={() => setCurrentStep(2)}
              className="w-full mt-4 py-2.5 rounded-xl bg-[#635BFF] hover:bg-[#5247e6] text-white font-semibold text-xs shadow-md shadow-[#635BFF]/25 transition-all"
            >
              Next Step
            </button>
          </form>
        </div>

        {/* Right Panel: Face Viewfinder & Capture Checklist */}
        <div className="lg:col-span-2 visio-card p-6 flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Capture Face</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Position your face in the frame and follow the instructions
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 items-center">
              {/* Circular Viewfinder Guide */}
              <div className="md:col-span-2 flex justify-center">
                <div className="relative h-60 w-60 rounded-full border-4 border-dashed border-emerald-500 p-2 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80"
                    alt="Face Capture"
                    className="h-full w-full rounded-full object-cover"
                  />
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Good Lighting</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Face Clearly Visible</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span>No Accessories</span>
                    <p className="text-[10px] font-normal text-slate-400">Remove glasses, mask, etc.</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Look Straight</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Captured Frames Strip */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-500 mb-3">Captured Face Samples (4/5)</p>
            <div className="flex space-x-3 overflow-x-auto">
              {capturedThumbnails.map((thumb, idx) => (
                <div key={idx} className="relative shrink-0">
                  <img
                    src={thumb}
                    alt={`Sample ${idx}`}
                    className="h-14 w-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                </div>
              ))}
              {/* Dotted Placeholder */}
              <div className="h-14 w-14 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                <Camera className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Enrollment;
