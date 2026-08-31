import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '../../api/employees';
import { departmentsApi } from '../../api/departments';
import { designationsApi } from '../../api/designations';
import { enrollmentsApi } from '../../api/enrollments';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import PageBanner from '../../components/ui/PageBanner';
import { getInitials, getAvatarColor, cn } from '../../lib/utils';
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
  Images,
  Image as ImageIcon,
  Trash2,
  Plus,
  X,
  Building2,
  Briefcase,
  ScanFace,
  UserCheck,
  UserX,
  Layers,
  HelpCircle,
  Eye,
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
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('');
  const [enrollmentStatusFilter, setEnrollmentStatusFilter] = useState('all'); // 'all' | 'pending' | 'enrolled'

  // Capture mode: 'images' | 'file' | 'webcam'
  const [captureMode, setCaptureMode] = useState('images');

  // Multi-image upload state
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Video capture / upload state
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

  // 1. Fetch Employees
  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: employeesApi.getAll,
  });

  // 2. Fetch Departments
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getAll,
  });

  // 3. Fetch Designations
  const { data: designations = [] } = useQuery({
    queryKey: ['designations'],
    queryFn: designationsApi.getAll,
  });

  // 4. Fetch Enrollments to know current status
  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments'],
    queryFn: enrollmentsApi.getAll,
  });

  const departmentMap = useMemo(() => {
    const map = new Map();
    departments.forEach((d) => map.set(d.id, d.department_name));
    return map;
  }, [departments]);

  const designationMap = useMemo(() => {
    const map = new Map();
    designations.forEach((d) => map.set(d.id, d.designation_name));
    return map;
  }, [designations]);

  const enrollmentMap = useMemo(() => {
    const map = new Map();
    enrollments.forEach((e) => {
      const existing = map.get(e.employee_id);
      if (!existing || existing.status !== 'COMPLETED') {
        map.set(e.employee_id, e);
      }
    });
    return map;
  }, [enrollments]);

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
      imagePreviews.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [videoPreviewUrl, imagePreviews]);

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
    } catch {
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

  // Handle Video file drop/select
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

  // Handle Multiple Images Upload
  const handleImagesSelect = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer?.files || e.target?.files || []);
    if (files.length === 0) return;

    const validImages = files.filter((f) => f.type.startsWith('image/'));
    if (validImages.length === 0) {
      toastError('Invalid Format', 'Please upload valid image files (JPG, PNG, JPEG, WebP).');
      return;
    }

    const newPreviews = validImages.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
    }));

    setImageFiles((prev) => [...prev, ...validImages]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (indexToRemove) => {
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[indexToRemove]?.url);
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
    setImageFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleClearAllImages = () => {
    imagePreviews.forEach((item) => URL.revokeObjectURL(item.url));
    setImagePreviews([]);
    setImageFiles([]);
  };

  // Submit Enrollment Mutation
  const enrollMutation = useMutation({
    mutationFn: async () => {
      if (!selectedEmployee) {
        throw new Error('Please select an employee.');
      }
      if (captureMode === 'images') {
        if (imageFiles.length === 0) {
          throw new Error('Please upload at least 1 image of the employee.');
        }
        return enrollmentsApi.startWithImages(selectedEmployee.id, imageFiles);
      } else {
        if (!videoFile) {
          throw new Error('Please record or upload a video.');
        }
        return enrollmentsApi.startEnrollment(selectedEmployee.id, videoFile);
      }
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
        } catch {
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
  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      // Text search
      if (employeeSearch) {
        const q = employeeSearch.toLowerCase();
        const nameMatch = `${e.first_name} ${e.last_name || ''}`.toLowerCase().includes(q);
        const codeMatch = (e.employee_code || '').toLowerCase().includes(q);
        const emailMatch = (e.email || '').toLowerCase().includes(q);
        if (!nameMatch && !codeMatch && !emailMatch) return false;
      }

      // Department filter
      if (selectedDeptFilter && e.department_id !== selectedDeptFilter) {
        return false;
      }

      // Enrollment status filter
      if (enrollmentStatusFilter !== 'all') {
        const enrollment = enrollmentMap.get(e.id);
        const isEnrolled = enrollment && enrollment.status === 'COMPLETED';
        if (enrollmentStatusFilter === 'enrolled' && !isEnrolled) return false;
        if (enrollmentStatusFilter === 'pending' && isEnrolled) return false;
      }

      return true;
    });
  }, [employees, employeeSearch, selectedDeptFilter, enrollmentStatusFilter, enrollmentMap]);

  const canProceedToEnroll =
    captureMode === 'images' ? imageFiles.length > 0 : Boolean(videoFile);

  const stepsList = [
    { key: 'select', num: 1, title: 'Select Employee', desc: 'Pick staff member' },
    { key: 'capture', num: 2, title: 'Face Media Source', desc: 'Photos or webcam' },
    { key: 'processing', num: 3, title: 'AI Processing', desc: '512-D vector extraction' },
    { key: 'result', num: 4, title: 'Verification Result', desc: 'Milvus indexing status' },
  ];

  const stepKeys = ['select', 'capture', 'processing', 'result'];
  const currentStepIdx = stepKeys.indexOf(currentStep);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Banner with Back Button */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => navigate('enrollments')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Enrollments Pipeline
        </button>

        <PageBanner
          badge="Biometric AI Registration"
          badgeIcon={ScanFace}
          title="Face Biometric Enrollment Studio"
          description="Register and index 512-D InsightFace facial vector galleries in Milvus for high-accuracy workforce recognition."
        />
      </div>

      {/* Modern 4-Step Stepper Progress Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
          {stepsList.map((st, idx) => {
            const isCompleted = currentStepIdx > idx;
            const isCurrent = currentStepIdx === idx;

            return (
              <div
                key={st.key}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200',
                  isCurrent
                    ? 'bg-gradient-to-br from-indigo-50/90 to-blue-50/50 border-indigo-300 ring-2 ring-indigo-500/20'
                    : isCompleted
                    ? 'bg-emerald-50/50 border-emerald-200/80'
                    : 'bg-slate-50/50 border-slate-200/60 opacity-60'
                )}
              >
                <div
                  className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs transition-all',
                    isCurrent
                      ? 'bg-indigo-600 text-white shadow-indigo-600/30'
                      : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white text-slate-400 border border-slate-200'
                  )}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : st.num}
                </div>
                <div className="min-w-0">
                  <span
                    className={cn(
                      'text-xs font-bold block truncate',
                      isCurrent ? 'text-indigo-950' : isCompleted ? 'text-emerald-950' : 'text-slate-700'
                    )}
                  >
                    {st.title}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">{st.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Select Employee */}
      {currentStep === 'select' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Step 1: Choose Employee for Biometric Registration
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Select an employee from your workforce directory to generate and store face vectors
              </p>
            </div>
            {selectedEmployee && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 self-start sm:self-auto">
                Selected: {selectedEmployee.first_name} {selectedEmployee.last_name || ''}
              </span>
            )}
          </div>

          {/* Search and Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                placeholder="Search by name, employee code, or email..."
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-3">
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.department_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                value={enrollmentStatusFilter}
                onChange={(e) => setEnrollmentStatusFilter(e.target.value)}
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Not Enrolled (Pending)</option>
                <option value="enrolled">Already Enrolled</option>
              </select>
            </div>
          </div>

          {/* Employee Selection Cards Grid */}
          <div className="max-h-96 overflow-y-auto pr-1">
            {loadingEmployees ? (
              <div className="py-16 text-center space-y-2">
                <Loader2 className="w-7 h-7 text-indigo-600 animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Loading employee directory...</p>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="py-16 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-slate-700">No matching employees found</h4>
                <p className="text-xs text-slate-400 mt-0.5">Try clearing your search query or department filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredEmployees.map((emp) => {
                  const fullName = `${emp.first_name} ${emp.last_name || ''}`.trim();
                  const initials = getInitials(emp.first_name, emp.last_name);
                  const avatarColor = getAvatarColor(fullName);
                  const isSelected = selectedEmployee?.id === emp.id;
                  const deptName = emp.department_id ? departmentMap.get(emp.department_id) : 'Unassigned';
                  const desigName = emp.designation_id ? designationMap.get(emp.designation_id) : 'Staff';
                  const enrollment = enrollmentMap.get(emp.id);
                  const isEnrolled = enrollment && enrollment.status === 'COMPLETED';

                  return (
                    <div
                      key={emp.id}
                      onClick={() => setSelectedEmployee(emp)}
                      className={cn(
                        'p-4 rounded-2xl border transition-all duration-150 cursor-pointer flex items-center justify-between gap-3 shadow-2xs',
                        isSelected
                          ? 'bg-gradient-to-br from-indigo-50 via-white to-blue-50/40 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'bg-white border-slate-200/80 hover:border-indigo-300 hover:bg-slate-50/50'
                      )}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-2xl border flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${avatarColor}`}
                        >
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-xs truncate">{fullName}</h4>
                            <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 shrink-0">
                              {emp.employee_code}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1 truncate">
                            <span className="truncate">{deptName}</span>
                            <span>•</span>
                            <span className="text-amber-700 font-medium truncate">{desigName}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        {isEnrolled ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full hidden sm:inline">
                            Enrolled
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full hidden sm:inline">
                            Pending
                          </span>
                        )}

                        <div
                          className={cn(
                            'w-6 h-6 rounded-full border flex items-center justify-center transition-all',
                            isSelected
                              ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                              : 'border-slate-300 bg-white'
                          )}
                        >
                          {isSelected && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 1 Footer Action */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-400">
              {selectedEmployee ? (
                <span>
                  Ready to proceed with{' '}
                  <strong className="text-slate-800">
                    {selectedEmployee.first_name} {selectedEmployee.last_name || ''}
                  </strong>
                </span>
              ) : (
                'Select an employee card above to continue'
              )}
            </span>

            <button
              type="button"
              onClick={() => setCurrentStep('capture')}
              disabled={!selectedEmployee}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Continue to Face Media <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Media Source & Capture */}
      {currentStep === 'capture' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Header & Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Step 2: Provide Face Photos or Video</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Enrolling biometrics for{' '}
                <strong className="text-slate-900">
                  {selectedEmployee?.first_name} {selectedEmployee?.last_name || ''} ({selectedEmployee?.employee_code})
                </strong>
              </p>
            </div>

            {/* Switch Mode Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  stopWebcam();
                  setCaptureMode('images');
                }}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer',
                  captureMode === 'images'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Upload Photos
              </button>
              <button
                type="button"
                onClick={() => {
                  stopWebcam();
                  setCaptureMode('file');
                }}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer',
                  captureMode === 'file'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <Video className="w-3.5 h-3.5" />
                Upload Video
              </button>
              <button
                type="button"
                onClick={() => {
                  setCaptureMode('webcam');
                  startWebcam();
                }}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer',
                  captureMode === 'webcam'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <Camera className="w-3.5 h-3.5" />
                Live Camera
              </button>
            </div>
          </div>

          {/* Mode 1: Multiple Images Upload */}
          {captureMode === 'images' && (
            <div className="space-y-5">
              {/* Dropzone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleImagesSelect}
                className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/60 hover:bg-indigo-50/20 rounded-3xl p-8 sm:p-10 text-center transition-all flex flex-col items-center justify-center space-y-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-2xs border border-indigo-100">
                  <Images className="w-7 h-7 stroke-[1.8]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Upload Employee Face Photos (Single or Multiple)
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                    Drag and drop 1 to 10 photos of the employee. Different angles, lighting, and expressions enhance the Milvus multi-vector gallery.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] text-slate-500">
                  <span className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg">Frontal Face</span>
                  <span className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg">Slight Angles</span>
                  <span className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg">JPG, PNG, WebP</span>
                </div>

                <label className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer transition-all">
                  <Upload className="w-4 h-4" />
                  Select Photo Files
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImagesSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Photo Previews Grid */}
              {imagePreviews.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Selected Photos ({imagePreviews.length})
                      </span>
                      <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                        {imagePreviews.length >= 3 ? 'Optimal Gallery Quality' : 'Ready to Enroll'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" /> Add More
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImagesSelect}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleClearAllImages}
                        className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {imagePreviews.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-square shadow-2xs"
                      >
                        <img
                          src={img.url}
                          alt={`Face ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-mono font-bold backdrop-blur-xs">
                          #{idx + 1}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700 cursor-pointer shadow-xs"
                          title="Remove photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/80 to-transparent p-2 text-[10px] text-white truncate font-medium">
                          {img.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mode 2: Video File Upload */}
          {captureMode === 'file' && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/60 rounded-3xl p-10 text-center transition-all flex flex-col items-center justify-center space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-2xs border border-indigo-100">
                <Video className="w-7 h-7 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Drag and drop employee video here</h4>
                <p className="text-xs text-slate-500 mt-1">Accepts MP4, WebM, AVI (3-5 seconds continuous video)</p>
              </div>

              <label className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs cursor-pointer transition-all">
                <Upload className="w-4 h-4 text-indigo-600" />
                Browse Video File
                <input type="file" accept="video/*" onChange={handleFileDrop} className="hidden" />
              </label>

              {videoFile && (
                <div className="mt-4 p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 text-xs w-full max-w-sm text-left shadow-2xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="truncate flex-1">
                    <span className="font-bold text-slate-900 block truncate">{videoFile.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mode 3: Live Webcam Recorder */}
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
                    type="button"
                    onClick={handleStartRecording}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    Record 5s Face Video
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopRecording}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition-all cursor-pointer"
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
              type="button"
              onClick={() => {
                stopWebcam();
                setCurrentStep('select');
              }}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl cursor-pointer"
            >
              Back to Employee Selection
            </button>

            <button
              type="button"
              onClick={() => enrollMutation.mutate()}
              disabled={!canProceedToEnroll || enrollMutation.isPending}
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
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-xs text-center space-y-8">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto shadow-sm animate-pulse">
              <Sparkles className="w-8 h-8 stroke-[1.8]" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">AI Face Pipeline in Progress</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Generating 512-D ArcFace landmarks and indexing the employee multi-vector gallery into Milvus.
            </p>
          </div>

          {/* Visual Stages */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 text-left space-y-2">
              <div className="flex items-center justify-between">
                <Video className="w-5 h-5 text-indigo-600" />
                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
              </div>
              <h5 className="text-xs font-bold text-slate-900">1. Landmark Quality</h5>
              <p className="text-[11px] text-slate-500 leading-tight">Extracting sharp frames and bounding boxes</p>
            </div>

            <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 text-left space-y-2">
              <div className="flex items-center justify-between">
                <Cpu className="w-5 h-5 text-indigo-600" />
                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
              </div>
              <h5 className="text-xs font-bold text-slate-900">2. 512-D Embedding</h5>
              <p className="text-[11px] text-slate-500 leading-tight">InsightFace vector normalization</p>
            </div>

            <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 text-left space-y-2">
              <div className="flex items-center justify-between">
                <Database className="w-5 h-5 text-indigo-600" />
                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
              </div>
              <h5 className="text-xs font-bold text-slate-900">3. Milvus Storage</h5>
              <p className="text-[11px] text-slate-500 leading-tight">HNSW multi-vector gallery indexing</p>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-400">
            Pipeline ID: <span className="font-semibold text-slate-700">{enrollmentId}</span>
          </div>
        </div>
      )}

      {/* STEP 4: Result Screen */}
      {currentStep === 'result' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-xs text-center space-y-6">
          {enrollmentStatus === 'COMPLETED' ? (
            <div className="max-w-md mx-auto space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto shadow-sm">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Biometric Registration Successful</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Facial vectors for{' '}
                  <strong className="text-slate-900">
                    {selectedEmployee?.first_name} {selectedEmployee?.last_name || ''}
                  </strong>{' '}
                  are now active in the Milvus vector gallery. The employee will be recognized automatically in attendance streams.
                </p>
              </div>

              {/* Summary Profile Box */}
              {selectedEmployee && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3 text-left">
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 ${getAvatarColor(
                      selectedEmployee.first_name
                    )}`}
                  >
                    {getInitials(selectedEmployee.first_name, selectedEmployee.last_name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="font-bold text-slate-900 text-xs truncate">
                      {selectedEmployee.first_name} {selectedEmployee.last_name || ''}
                    </h5>
                    <span className="font-mono text-[10px] text-slate-500">
                      {selectedEmployee.employee_code} • {selectedEmployee.email || 'Registered'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('recognition')}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Test Face in Studio
                </button>
                <button
                  type="button"
                  onClick={() =>
                    navigate('employee-profile', {
                      employeeId: selectedEmployee.id,
                      employeeName: `${selectedEmployee.first_name} ${selectedEmployee.last_name || ''}`.trim(),
                    })
                  }
                  className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs transition-all cursor-pointer"
                >
                  View Profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEmployee(null);
                    handleClearAllImages();
                    setVideoFile(null);
                    setCurrentStep('select');
                  }}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Enroll Another
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto shadow-sm">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Enrollment Could Not Complete</h3>
                <p className="text-xs text-rose-600 mt-1 leading-relaxed">
                  {errorMessage || 'Face detection could not find a clear front-facing face.'}
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => retryMutation.mutate()}
                  disabled={retryMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Retry Pipeline
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep('capture')}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                >
                  Re-upload Media
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
