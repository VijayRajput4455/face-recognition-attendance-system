import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '../../api/employees';
import { enrollmentsApi } from '../../api/enrollments';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import { getInitials, getAvatarColor } from '../../lib/utils';
import {
  Video,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Square,
  Play,
  User,
  ShieldCheck,
  Cpu,
  Database,
  Search,
} from 'lucide-react';

export function EnrollmentWizard() {
  const queryClient = useQueryClient();
  const { pageParams, navigate } = useNavigation();
  const { success, error: toastError } = useToast();

  const preselectedEmployeeId = pageParams.employeeId;

  // Wizard Steps: 1: 'select', 2: 'capture', 3: 'processing', 4: 'result'
  const [currentStep, setCurrentStep] = useState(preselectedEmployeeId ? 'capture' : 'select');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeSearch, setEmployeeSearch] = useState('');

  // Video capture / upload state
  const [captureMode, setCaptureMode] = useState('file'); // 'file' | 'webcam'
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);

  // Webcam recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // Active Enrollment tracking
  const [enrollmentId, setEnrollmentId] = useState(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null); // 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  const [errorMessage, setErrorMessage] = useState(null);

  // Fetch employees for step 1
  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: employeesApi.getAll,
  });

  // Prepopulate selected employee if passed in params
  useEffect(() => {
    if (preselectedEmployeeId && employees.length > 0) {
      const found = employees.find((e) => e.id === preselectedEmployeeId);
      if (found) setSelectedEmployee(found);
    }
  }, [preselectedEmployeeId, employees]);

  // Clean up media stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
    };
  }, [videoPreviewUrl]);

  // Webcam streamer init
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      toastError('Camera Error', 'Could not access webcam. Please check browser permissions.');
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  // Start recording from webcam (typically 3-5 seconds video of employee face)
  const handleStartRecording = () => {
    if (!streamRef.current) return;
    recordedChunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const file = new File([blob], `enrollment_${selectedEmployee?.employee_code || 'face'}.webm`, {
        type: 'video/webm',
      });
      setVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(blob));
      stopWebcam();
      setIsRecording(false);
    };

    recorder.start(100);
    setIsRecording(true);
    setRecordingSeconds(0);
  };

  // Timer for recording
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 5) {
            handleStopRecording();
            return 5;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toastError('Invalid File', 'Please upload a video file (MP4, WebM, AVI).');
        return;
      }
      setVideoFile(file);
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
      setVideoPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Submit Enrollment Mutation
  const enrollMutation = useMutation({
    mutationFn: async () => {
      if (!selectedEmployee || !videoFile) {
        throw new Error('Please select an employee and provide a video.');
      }
      return enrollmentsApi.startEnrollment(selectedEmployee.id, videoFile);
    },
    onSuccess: (res) => {
      const id = res?.enrollment_id || res?.id;
      setEnrollmentId(id);
      setEnrollmentStatus(res?.status || 'PROCESSING');
      setCurrentStep('processing');
    },
    onError: (err) => {
      toastError('Enrollment Failed', err.message);
    },
  });

  // Retry Mutation
  const retryMutation = useMutation({
    mutationFn: () => enrollmentsApi.retry(enrollmentId),
    onSuccess: (res) => {
      const id = res?.enrollment_id || res?.id || enrollmentId;
      setEnrollmentId(id);
      setEnrollmentStatus('PROCESSING');
      setErrorMessage(null);
      setCurrentStep('processing');
    },
    onError: (err) => {
      toastError('Retry Failed', err.message);
    },
  });

  // Polling for Enrollment Status (every 1.2s until COMPLETED or FAILED, max 60 attempts)
  useEffect(() => {
    let pollInterval;
    let attempts = 0;

    if (currentStep === 'processing' && enrollmentId) {
      const checkStatus = async () => {
        attempts += 1;
        try {
          const res = await enrollmentsApi.getById(enrollmentId);
          if (res) {
            setEnrollmentStatus(res.status);

            if (res.status === 'COMPLETED') {
              if (pollInterval) clearInterval(pollInterval);
              queryClient.invalidateQueries({ queryKey: ['employees'] });
              queryClient.invalidateQueries({ queryKey: ['enrollments'] });
              queryClient.invalidateQueries({ queryKey: ['milvus-count'] });
              queryClient.invalidateQueries({ queryKey: ['employee', selectedEmployee?.id] });
              queryClient.invalidateQueries({ queryKey: ['enrollments-employee', selectedEmployee?.id] });
              success('Enrollment Complete', `${selectedEmployee?.first_name || 'Employee'}'s face biometric has been registered.`);
              setCurrentStep('result');
            } else if (res.status === 'FAILED') {
              if (pollInterval) clearInterval(pollInterval);
              setErrorMessage(res.error_message || 'Facial vector generation failed. Please try with clearer lighting.');
              setCurrentStep('result');
            }
          }

          if (attempts > 60) {
            if (pollInterval) clearInterval(pollInterval);
            setEnrollmentStatus('FAILED');
            setErrorMessage('Processing timed out. The worker may be busy.');
            setCurrentStep('result');
          }
        } catch (err) {
          if (attempts > 15) {
            if (pollInterval) clearInterval(pollInterval);
            setEnrollmentStatus('FAILED');
            setErrorMessage('Unable to check enrollment status.');
            setCurrentStep('result');
          }
        }
      };

      // Check immediately
      checkStatus();
      pollInterval = setInterval(checkStatus, 1200);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [currentStep, enrollmentId, selectedEmployee, queryClient, success]);

  // Filter employees for step 1
  const filteredEmployees = employees.filter((e) => {
    const q = employeeSearch.toLowerCase();
    return (
      `${e.first_name} ${e.last_name || ''}`.toLowerCase().includes(q) ||
      (e.employee_code || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('enrollments')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-1 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Pipeline
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Face Biometric Enrollment</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Capture or upload video to generate 512-D embeddings and index into Milvus.
          </p>
        </div>

        {/* Wizard Step Indicators */}
        <div className="hidden sm:flex items-center gap-2">
          {['Employee', 'Video Source', 'AI Processing', 'Result'].map((stepName, idx) => {
            const stepKeys = ['select', 'capture', 'processing', 'result'];
            const stepIdx = stepKeys.indexOf(currentStep);
            const isCompleted = stepIdx > idx;
            const isCurrent = stepIdx === idx;

            return (
              <div key={stepName} className="flex items-center gap-2">
                {idx > 0 && <div className="w-6 h-0.5 bg-slate-200" />}
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    isCurrent
                      ? 'bg-indigo-600 text-white'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <span>{idx + 1}</span>
                  <span className="hidden md:inline">{stepName}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Select Employee */}
      {currentStep === 'select' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Step 1: Select Employee for Biometric Registration</h3>
            <p className="text-xs text-slate-500 mt-0.5">Choose an employee from your workforce roster</p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={employeeSearch}
              onChange={(e) => setEmployeeSearch(e.target.value)}
              placeholder="Search by employee name or code..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-2xl">
            {loadingEmployees ? (
              <div className="p-8 text-center text-slate-400 text-xs">Loading employee roster...</div>
            ) : filteredEmployees.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No employees found matching search.</div>
            ) : (
              filteredEmployees.map((emp) => {
                const fullName = `${emp.first_name} ${emp.last_name || ''}`.trim();
                const initials = getInitials(emp.first_name, emp.last_name);
                const isSelected = selectedEmployee?.id === emp.id;

                return (
                  <div
                    key={emp.id}
                    onClick={() => setSelectedEmployee(emp)}
                    className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-50/80 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                        {initials}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-xs">{fullName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{emp.employee_code}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">{emp.email || 'No email'}</span>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setCurrentStep('capture')}
              disabled={!selectedEmployee}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Continue to Video Capture <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Video Source & Capture */}
      {currentStep === 'capture' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Step 2: Capture or Upload Video</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Enrolling biometrics for{' '}
                <strong className="text-slate-900">
                  {selectedEmployee?.first_name} {selectedEmployee?.last_name} ({selectedEmployee?.employee_code})
                </strong>
              </p>
            </div>

            {/* Switch Mode Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => {
                  stopWebcam();
                  setCaptureMode('file');
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  captureMode === 'file' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Upload Video
              </button>
              <button
                onClick={() => {
                  setCaptureMode('webcam');
                  startWebcam();
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  captureMode === 'webcam'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Live Camera
              </button>
            </div>
          </div>

          {/* Mode A: File Upload */}
          {captureMode === 'file' && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 rounded-2xl p-8 text-center transition-all flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-2xs">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Drag and drop employee video here</h4>
                <p className="text-xs text-slate-500 mt-1">Accepts MP4, WebM, AVI (typically 3-5 seconds)</p>
              </div>

              <label className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-indigo-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs cursor-pointer transition-all">
                <Upload className="w-3.5 h-3.5" />
                Browse File
                <input type="file" accept="video/*" onChange={handleFileDrop} className="hidden" />
              </label>

              {videoFile && (
                <div className="mt-4 p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3 text-xs w-full max-w-sm text-left">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="truncate flex-1">
                    <span className="font-semibold text-slate-900 block truncate">{videoFile.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mode B: Live Webcam Recorder */}
          {captureMode === 'webcam' && (
            <div className="space-y-4">
              <div className="relative bg-slate-900 rounded-2xl overflow-hidden aspect-video max-w-xl mx-auto flex items-center justify-center shadow-inner">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

                {/* Recording Overlay Indicator */}
                {isRecording && (
                  <div className="absolute top-4 left-4 bg-rose-600/90 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-2 backdrop-blur-md animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    Recording ({recordingSeconds}s / 5s)
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-3">
                {!isRecording ? (
                  <button
                    onClick={handleStartRecording}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    Record 5s Face Video
                  </button>
                ) : (
                  <button
                    onClick={handleStopRecording}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition-all cursor-pointer"
                  >
                    <Square className="w-4 h-4 fill-white" />
                    Stop Recording
                  </button>
                )}
              </div>

              {videoFile && (
                <p className="text-xs text-center text-emerald-600 font-semibold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Video captured ({videoFile.name})
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                stopWebcam();
                setCurrentStep('select');
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
            >
              Back
            </button>
            <button
              onClick={() => enrollMutation.mutate()}
              disabled={!videoFile || enrollMutation.isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-all cursor-pointer"
            >
              {enrollMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Start AI Face Enrollment <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: AI Processing Pipeline */}
      {currentStep === 'processing' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs text-center space-y-8">
          <div className="max-w-md mx-auto space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto shadow-sm animate-bounce">
              <Sparkles className="w-8 h-8 stroke-[1.8]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">AI Face Pipeline in Progress</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Video is being processed asynchronously by the background enrollment worker and InsightFace AI model.
            </p>
          </div>

          {/* Visual Stages */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 text-left space-y-2">
              <div className="flex items-center justify-between">
                <Video className="w-5 h-5 text-indigo-600" />
                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
              </div>
              <h5 className="text-xs font-bold text-slate-900">1. Frame Extraction</h5>
              <p className="text-[11px] text-slate-500 leading-tight">Extracting optimal sharp frames with landmarks</p>
            </div>

            <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 text-left space-y-2">
              <div className="flex items-center justify-between">
                <Cpu className="w-5 h-5 text-indigo-600" />
                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
              </div>
              <h5 className="text-xs font-bold text-slate-900">2. Vector Generation</h5>
              <p className="text-[11px] text-slate-500 leading-tight">512-D ArcFace embedding normalization</p>
            </div>

            <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 text-left space-y-2">
              <div className="flex items-center justify-between">
                <Database className="w-5 h-5 text-indigo-600" />
                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
              </div>
              <h5 className="text-xs font-bold text-slate-900">3. Milvus Indexing</h5>
              <p className="text-[11px] text-slate-500 leading-tight">HNSW cosine similarity storage</p>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-400">
            Pipeline ID: <span className="font-semibold text-slate-700">{enrollmentId}</span>
          </div>
        </div>
      )}

      {/* STEP 4: Result Screen (Success or Failed) */}
      {currentStep === 'result' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs text-center space-y-6">
          {enrollmentStatus === 'COMPLETED' ? (
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto shadow-sm">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Biometric Registration Successful</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Facial vectors for{' '}
                  <strong className="text-slate-900">
                    {selectedEmployee?.first_name} {selectedEmployee?.last_name}
                  </strong>{' '}
                  are now active in Milvus. The employee will now be recognized automatically in attendance streams.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => navigate('recognition')}
                  className="px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Test Recognition Live
                </button>
                <button
                  onClick={() => navigate('employees')}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Back to Workforce
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto shadow-sm">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Enrollment Could Not Complete</h3>
                <p className="text-xs text-rose-600 mt-1">{errorMessage || 'Face detection could not find a clear face.'}</p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => retryMutation.mutate()}
                  disabled={retryMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Retry Pipeline
                </button>
                <button
                  onClick={() => setCurrentStep('capture')}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Record New Video
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EnrollmentWizard;
