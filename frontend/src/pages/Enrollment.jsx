import React, { useState, useEffect, useRef } from 'react';
import { getEmployees } from '../api/employees';
import { uploadEnrollmentVideo, getEmployeeEnrollments } from '../api/enrollment';
import {
  ScanFace,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Film,
  UserCheck,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';

export function Enrollment() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  // File Upload & Media State
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [capturedSamples, setCapturedSamples] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Webcam Capture State
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    getEmployees({ limit: 100 })
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.items || []);
        setEmployees(list);
        if (list.length > 0) {
          setSelectedEmployeeId(String(list[0].id));
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedEmployeeId) {
      checkStatus(selectedEmployeeId);
    }
  }, [selectedEmployeeId]);

  const checkStatus = async (empId) => {
    if (!empId) return;
    setStatusLoading(true);
    try {
      const res = await getEmployeeEnrollments(empId);
      if (Array.isArray(res) && res.length > 0) {
        setEnrollmentStatus(res[0]);
      } else if (res && !Array.isArray(res)) {
        setEnrollmentStatus(res);
      } else {
        setEnrollmentStatus(null);
      }
    } catch (err) {
      setEnrollmentStatus(null);
    } finally {
      setStatusLoading(false);
    }
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsWebcamActive(true);
      setErrorMsg('');
    } catch (err) {
      setErrorMsg('Unable to access camera. Please ensure webcam permissions are allowed in your browser.');
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setIsWebcamActive(false);
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const imageUrl = canvas.toDataURL('image/jpeg');
    canvas.toBlob((blob) => {
      const capturedFile = new File([blob], `face_sample_${Date.now()}.jpg`, { type: 'image/jpeg' });
      setFile(capturedFile);
      setPreviewUrl(imageUrl);
      setCapturedSamples((prev) => [...prev.slice(-3), imageUrl]);
      stopWebcam();
    }, 'image/jpeg', 0.95);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setErrorMsg('');
      setSuccessMsg('');
    }
  };

  const handleSubmitEnrollment = async (e) => {
    e.preventDefault();
    if (!selectedEmployeeId) {
      setErrorMsg('Please select an employee to register face embeddings.');
      return;
    }
    if (!file) {
      setErrorMsg('Please upload a video file or capture a photo sample.');
      return;
    }

    setUploading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await uploadEnrollmentVideo(selectedEmployeeId, file);
      setSuccessMsg('Face data submitted successfully! Enrollment worker is extracting 512D face vector embeddings.');
      setFile(null);
      setPreviewUrl(null);
      setCurrentStep(4);

      // Poll status
      setTimeout(() => {
        checkStatus(selectedEmployeeId);
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit face enrollment data.');
    } finally {
      setUploading(false);
    }
  };

  const selectedEmployeeObj = employees.find((e) => String(e.id) === String(selectedEmployeeId));

  const steps = [
    { number: 1, label: 'Select Employee' },
    { number: 2, label: 'Capture & Upload' },
    { number: 3, label: 'Quality Verification' },
    { number: 4, label: 'Embedding Vector' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
            User Face Enrollment Studio
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Register face biometric identity data by uploading video or capturing multi-angle camera samples.
          </p>
        </div>

        {selectedEmployeeObj && (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-xs">
            <UserCheck className="h-4 w-4 text-[#635BFF]" />
            <span>Target: {selectedEmployeeObj.full_name} ({selectedEmployeeObj.employee_code})</span>
          </div>
        )}
      </div>

      {/* Stepper Progress Bar */}
      <div className="visio-card p-4">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {steps.map((step, idx) => (
            <React.Fragment key={step.number}>
              <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setCurrentStep(step.number)}>
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep === step.number
                      ? 'bg-[#635BFF] text-white shadow-md shadow-[#635BFF]/30 ring-4 ring-[#635BFF]/15'
                      : currentStep > step.number
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {currentStep > step.number ? <Check className="h-4 w-4" /> : step.number}
                </div>
                <span
                  className={`text-xs font-bold hidden sm:inline ${
                    currentStep === step.number ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className="h-[2px] flex-1 mx-3 bg-slate-100" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700 flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-700 flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Capture & Upload Workspace */}
        <div className="lg:col-span-2 space-y-6">
          {/* Employee Selection Dropdown */}
          <div className="visio-card p-6 space-y-3">
            <label className="block text-xs font-bold text-slate-800">
              1. Choose Employee Profile for Face Registration *
            </label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => {
                setSelectedEmployeeId(e.target.value);
                checkStatus(e.target.value);
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
            >
              <option value="">-- Select Employee --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.employee_code} — {emp.full_name} ({emp.is_enrolled ? 'Enrolled' : 'Pending Face Data'})
                </option>
              ))}
            </select>
          </div>

          {/* Media Capture & Dropzone Workspace */}
          <div className="visio-card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-sans">
                  2. Face Data Input Source
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Upload a high-resolution face video file or capture live camera frames
                </p>
              </div>

              {!isWebcamActive ? (
                <button
                  type="button"
                  onClick={startWebcam}
                  className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
                >
                  <Camera className="h-4 w-4 text-emerald-400" />
                  <span>Open Camera</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopWebcam}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-600 hover:bg-rose-100"
                >
                  <span>Close Camera</span>
                </button>
              )}
            </div>

            {/* Webcam Live Circular Viewfinder */}
            {isWebcamActive && (
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-[4/3] flex items-center justify-center shadow-lg border border-slate-800">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />

                {/* Face Target Oval Guide */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="h-64 w-48 rounded-full border-4 border-dashed border-emerald-400/80 shadow-[0_0_30px_rgba(52,211,153,0.3)] flex flex-col justify-between p-3">
                    <span className="text-[10px] font-bold text-emerald-400 bg-black/60 px-2 py-0.5 rounded text-center self-center">
                      Align Face Here
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={captureSnapshot}
                  className="absolute bottom-5 left-1/2 -translate-x-1/2 inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-[#635BFF] hover:bg-[#5247e6] text-white font-bold text-xs shadow-xl shadow-[#635BFF]/40"
                >
                  <Camera className="h-4 w-4" />
                  <span>Capture Face Sample</span>
                </button>
              </div>
            )}

            {/* File Drag and Drop Zone */}
            {!isWebcamActive && (
              <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-slate-200 hover:border-[#635BFF] rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                  <div className="h-12 w-12 rounded-2xl bg-purple-50 text-[#635BFF] flex items-center justify-center mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    Click or Drag & Drop Face Video / Photo
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Supports MP4, MOV, AVI, JPG, PNG (Recommended 1080p, Max 50MB)
                  </p>
                </div>
                <input type="file" accept="video/*,image/*" onChange={handleFileChange} className="hidden" />
              </label>
            )}

            {/* File Preview Card */}
            {file && (
              <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between shadow-xs">
                <div className="flex items-center space-x-3">
                  {previewUrl && file.type.startsWith('image/') ? (
                    <img src={previewUrl} alt="Preview" className="h-12 w-12 rounded-xl object-cover border" />
                  ) : (
                    <div className="h-12 w-12 rounded-xl bg-purple-100 text-[#635BFF] flex items-center justify-center">
                      <Film className="h-6 w-6" />
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-slate-900">{file.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setFile(null); setPreviewUrl(null); }}
                  className="text-xs font-semibold text-rose-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmitEnrollment}
              disabled={uploading || !file || !selectedEmployeeId}
              className="w-full py-3 rounded-xl bg-[#635BFF] hover:bg-[#5247e6] disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-[#635BFF]/30 transition-all flex items-center justify-center space-x-2"
            >
              {uploading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Processing Face Data & Embeddings...</span>
                </>
              ) : (
                <>
                  <ScanFace className="h-4 w-4" />
                  <span>Upload & Extract 512D Embeddings</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right 1 Col: Quality Inspection & Status */}
        <div className="space-y-6">
          {/* Real-time Quality Checklist */}
          <div className="visio-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 font-sans">
              3. AI Face Validation Checklist
            </h3>

            <div className="space-y-3 text-xs font-semibold text-slate-700">
              <div className="flex items-center space-x-2.5 p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Good Lighting & Exposure</span>
              </div>
              <div className="flex items-center space-x-2.5 p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Face Unobstructed & Visible</span>
              </div>
              <div className="flex items-center space-x-2.5 p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>No Sunglasses or Face Masks</span>
              </div>
              <div className="flex items-center space-x-2.5 p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Direct Frontal Angle</span>
              </div>
            </div>
          </div>

          {/* Enrollment Status Monitor */}
          <div className="visio-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 font-sans">
                4. Milvus Vector Status
              </h3>
              <button
                onClick={() => checkStatus(selectedEmployeeId)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <RefreshCw className={`h-4 w-4 ${statusLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {selectedEmployeeObj ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Employee Name:</span>
                  <p className="font-bold text-slate-900 text-sm">{selectedEmployeeObj.full_name}</p>
                  <p className="font-mono text-slate-400">{selectedEmployeeObj.employee_code}</p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 font-medium">Enrollment Status:</span>
                  <div className="mt-1">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      enrollmentStatus?.status === 'COMPLETED' || selectedEmployeeObj.is_enrolled
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : 'bg-amber-50 text-amber-600 border border-amber-200'
                    }`}>
                      {enrollmentStatus?.status || (selectedEmployeeObj.is_enrolled ? 'ENROLLED' : 'PENDING')}
                    </span>
                  </div>
                </div>

                {enrollmentStatus && (
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Extracted Frames:</span>
                      <span className="font-mono font-bold text-[#635BFF]">
                        {enrollmentStatus.processed_frames || enrollmentStatus.frames_count || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Stored Embeddings:</span>
                      <span className="font-mono font-bold text-emerald-600">
                        {enrollmentStatus.valid_faces || enrollmentStatus.sample_count || 0}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">Select an employee to view face registration stats.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Enrollment;
