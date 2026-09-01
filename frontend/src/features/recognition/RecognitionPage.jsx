import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { recognitionApi } from '../../api/recognition';
import { milvusApi } from '../../api/milvus';
import { employeesApi } from '../../api/employees';
import { departmentsApi } from '../../api/departments';
import { designationsApi } from '../../api/designations';
import { useToast } from '../../context/ToastContext';
import { useNavigation } from '../../context/NavigationContext';
import PageBanner from '../../components/ui/PageBanner';
import DataTable from '../../components/ui/DataTable';
import { getInitials, getAvatarColor, cn } from '../../lib/utils';
import {
  ScanFace,
  Upload,
  Camera,
  UserCheck,
  UserX,
  AlertCircle,
  Loader2,
  Eye,
  Zap,
  Database,
  ChevronRight,
  UserPlus,
  Building2,
  Briefcase,
  Mail,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export function RecognitionPage() {
  const { navigate } = useNavigation();
  const { success, error: toastError } = useToast();

  // Mode: 'upload' | 'webcam'
  const [studioMode, setStudioMode] = useState('upload');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [recognitionResult, setRecognitionResult] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [historyFilter, setHistoryFilter] = useState(''); // '' | 'matched' | 'unmatched'

  // Live Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // 1. Fetch Milvus vector count
  const { data: milvusCountData } = useQuery({
    queryKey: ['milvus-count'],
    queryFn: milvusApi.getCount,
    refetchInterval: 10000,
  });
  const vectorCount = milvusCountData?.total_vectors ?? milvusCountData?.count ?? '—';

  // 2. Fetch Employees, Departments, Designations
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: employeesApi.getAll,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getAll,
  });

  const { data: designations = [] } = useQuery({
    queryKey: ['designations'],
    queryFn: designationsApi.getAll,
  });

  const employeeMap = useMemo(() => {
    const map = new Map();
    employees.forEach((e) => map.set(e.id, e));
    return map;
  }, [employees]);

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

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
      setStudioMode('webcam');
      setRecognitionResult(null);
    } catch {
      toastError('Camera Error', 'Could not access webcam. Please check browser permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Recognize Mutation
  const recognizeMutation = useMutation({
    mutationFn: (file) => recognitionApi.recognizeImage(file || imageFile),
    onSuccess: (data) => {
      setRecognitionResult(data);
      if (data.total_faces === 0) {
        toastError('No Faces Detected', 'Could not find any clear human faces in the image.');
      } else {
        const matchedCount = data.recognized_faces?.filter((f) => f.matched).length || 0;
        success(
          'Recognition Complete',
          `Detected ${data.total_faces} face(s) • ${matchedCount} verified in database.`
        );

        // Append to history
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const newHistoryItems = data.recognized_faces.map((f, i) => {
          const emp = f.employee ? employeeMap.get(f.employee.id) || f.employee : null;
          const fullName = f.employee ? `${f.employee.first_name} ${f.employee.last_name || ''}`.trim() : 'Unrecognized Person';
          // In Milvus COSINE metric, distance returned is cosine similarity (0.0 to 1.0)
          const rawScore = f.distance !== undefined ? f.distance : 0;
          const similarityScore = rawScore <= 1 ? rawScore * 100 : Math.max(0, (1 - rawScore) * 100);

          return {
            id: `${Date.now()}-${i}`,
            time: timeStr,
            matched: f.matched,
            employee: emp,
            fullName,
            employeeCode: f.employee_code || emp?.employee_code || '—',
            departmentId: emp?.department_id,
            designationId: emp?.designation_id,
            email: emp?.email,
            distance: rawScore,
            confidence: similarityScore,
          };
        });
        setSessionHistory((prev) => [...newHistoryItems, ...prev]);
      }
    },
    onError: (err) => {
      toastError('Recognition Failed', err.message);
    },
  });

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'camera_snapshot.jpg', { type: 'image/jpeg' });
        setImageFile(file);
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImagePreview(URL.createObjectURL(blob));
        stopCamera();
        recognizeMutation.mutate(file);
      }
    }, 'image/jpeg');
  };

  const handleFileSelect = (e) => {
    const file = e.target?.files?.[0] || e.dataTransfer?.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toastError('Invalid File', 'Please upload an image file (JPG, PNG, WebP).');
        return;
      }
      setImageFile(file);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(URL.createObjectURL(file));
      setRecognitionResult(null);
      setStudioMode('upload');
      stopCamera();
      recognizeMutation.mutate(file);
    }
  };

  const handleReset = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setRecognitionResult(null);
    stopCamera();
  };

  // Toggle Counts
  const totalScansCount = sessionHistory.length;
  const verifiedMatchesCount = useMemo(
    () => sessionHistory.filter((s) => s.matched).length,
    [sessionHistory]
  );
  const unmatchedFacesCount = useMemo(
    () => sessionHistory.filter((s) => !s.matched).length,
    [sessionHistory]
  );
  const verifiedPercentage =
    totalScansCount > 0 ? Math.round((verifiedMatchesCount / totalScansCount) * 100) : 0;

  // Filtered Session History
  const filteredHistory = useMemo(() => {
    if (!historyFilter) return sessionHistory;
    if (historyFilter === 'matched') return sessionHistory.filter((s) => s.matched);
    if (historyFilter === 'unmatched') return sessionHistory.filter((s) => !s.matched);
    return sessionHistory;
  }, [sessionHistory, historyFilter]);

  // Session History Table Columns matching EmployeesPage style
  const historyColumns = [
    {
      header: 'Recognized Employee',
      accessor: 'fullName',
      render: (item) => {
        const initials = getInitials(
          item.employee?.first_name || item.fullName,
          item.employee?.last_name || ''
        );
        const avatarColor = getAvatarColor(item.fullName);
        const desigName = item.designationId ? designationMap.get(item.designationId) : null;

        return (
          <div
            onClick={(e) => {
              if (item.employee?.id) {
                e.stopPropagation();
                navigate('employee-profile', {
                  employeeId: item.employee.id,
                  employeeName: item.fullName,
                });
              }
            }}
            className={cn(
              'flex items-center gap-3',
              item.employee?.id ? 'cursor-pointer group select-none' : ''
            )}
          >
            <div
              className={`w-9 h-9 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs transition-transform group-hover:scale-105 ${avatarColor}`}
            >
              {initials}
            </div>
            <div>
              <div
                className={cn(
                  'font-semibold text-slate-900 leading-tight',
                  item.employee?.id ? 'group-hover:text-indigo-600 transition-colors' : ''
                )}
              >
                {item.fullName}
              </div>
              <div className="text-[11px] text-slate-400 font-normal">
                {desigName ? `${desigName} • ` : ''}
                {item.email || (item.employeeCode !== '—' ? `Code: ${item.employeeCode}` : 'Unregistered')}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Code',
      accessor: 'employeeCode',
      render: (item) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
          {item.employeeCode}
        </span>
      ),
    },
    {
      header: 'Department',
      accessor: 'departmentId',
      render: (item) => {
        const deptName = item.departmentId ? departmentMap.get(item.departmentId) : null;
        return deptName ? (
          <span className="text-slate-800 font-medium">{deptName}</span>
        ) : (
          <span className="text-slate-400 italic">—</span>
        );
      },
    },
    {
      header: 'Similarity',
      accessor: 'confidence',
      render: (item) => (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'font-mono text-xs font-bold px-2 py-0.5 rounded-md border',
              item.matched
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            )}
          >
            {item.confidence.toFixed(1)}%
          </span>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
            (dist: {item.distance?.toFixed(4)})
          </span>
        </div>
      ),
    },
    {
      header: 'Scan Time',
      accessor: 'time',
      render: (item) => <span className="text-xs text-slate-500 font-mono">{item.time}</span>,
    },
    {
      header: 'Match Status',
      accessor: 'matched',
      render: (item) =>
        item.matched ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded-full border shadow-2xs bg-emerald-50 text-emerald-700 border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Verified</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded-full border shadow-2xs bg-amber-50 text-amber-700 border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Unmatched</span>
          </span>
        ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {item.employee?.id ? (
            <button
              type="button"
              onClick={() =>
                navigate('employee-profile', {
                  employeeId: item.employee.id,
                  employeeName: item.fullName,
                })
              }
              className="w-8 h-8 rounded-xl border border-slate-200/80 bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/60 shadow-2xs transition-all duration-150 flex items-center justify-center cursor-pointer active:scale-95 group"
              title="View Employee Profile"
            >
              <Eye className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('enrollments', { mode: 'wizard' })}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Enroll
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      {/* Top Banner */}
      <PageBanner
        badge="Face AI Engine"
        badgeIcon={ScanFace}
        title="Face Recognition Studio"
        description="Verify and test employee face vectors using live webcam capture or photo uploads against the Milvus database."
      />


      {/* Real-Time Blue Theme Metric Toggles (Matching Employees & Enrollment Page) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Toggle 1: Total Scans */}
        <button
          type="button"
          onClick={() => setHistoryFilter('')}
          className={cn(
            'flex items-center justify-between p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group min-h-[82px]',
            historyFilter === ''
              ? 'bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-blue-50/50 border-blue-500/60 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30'
          )}
        >
          <div className="min-w-0 pr-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
              Total Scans
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-none">
                {totalScansCount}
              </span>
              <span className="text-xs text-blue-600 font-medium truncate">All Session Scans</span>
            </div>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-100/70 border border-blue-200/60 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <ScanFace className="w-5 h-5" />
          </div>
        </button>

        {/* Toggle 2: Verified Matches */}
        <button
          type="button"
          onClick={() => setHistoryFilter(historyFilter === 'matched' ? '' : 'matched')}
          className={cn(
            'flex items-center justify-between p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group min-h-[82px]',
            historyFilter === 'matched'
              ? 'bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-blue-50/50 border-blue-500/60 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30'
          )}
        >
          <div className="min-w-0 pr-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
              Verified Matches
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-none">
                {verifiedMatchesCount}
              </span>
              <span className="text-xs text-blue-600 font-medium truncate">
                {verifiedPercentage}% Recognized
              </span>
            </div>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-100/70 border border-blue-200/60 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <UserCheck className="w-5 h-5" />
          </div>
        </button>

        {/* Toggle 3: Unmatched Faces */}
        <button
          type="button"
          onClick={() => setHistoryFilter(historyFilter === 'unmatched' ? '' : 'unmatched')}
          className={cn(
            'flex items-center justify-between p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group min-h-[82px]',
            historyFilter === 'unmatched'
              ? 'bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-blue-50/50 border-blue-500/60 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30'
          )}
        >
          <div className="min-w-0 pr-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
              Unmatched Faces
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-none">
                {unmatchedFacesCount}
              </span>
              <span className="text-xs text-blue-600 font-medium truncate">
                {unmatchedFacesCount} Unregistered
              </span>
            </div>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-100/70 border border-blue-200/60 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <UserX className="w-5 h-5" />
          </div>
        </button>

        {/* Toggle 4: Milvus Vector Gallery */}
        <div className="flex items-center justify-between p-4 sm:p-5 rounded-2xl border bg-white border-slate-200/80 shadow-xs min-h-[82px]">
          <div className="min-w-0 pr-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block truncate">
              Vector Gallery
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-none font-mono">
                {vectorCount}
              </span>
              <span className="text-xs text-blue-600 font-medium truncate">Indexed in Milvus</span>
            </div>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-100/70 border border-blue-200/60 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Database className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Studio Viewport (Left) + Match Results (Right) aligned with items-stretch */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Photo / Camera Viewport */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs flex-1 flex flex-col justify-between space-y-5">
            {/* Viewport Toolbar Header */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Input Source</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select a live webcam stream or upload an employee photo
                  </p>
                </div>

                {/* Mode Switch Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      setStudioMode('upload');
                    }}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer',
                      studioMode === 'upload'
                        ? 'bg-white text-indigo-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStudioMode('webcam');
                      startCamera();
                    }}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer',
                      studioMode === 'webcam'
                        ? 'bg-white text-indigo-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Live Camera
                  </button>
                </div>
              </div>

              {/* Viewport Body Area */}
              <div className="mt-5">
                {/* Webcam View */}
                {studioMode === 'webcam' && isCameraActive && (
                  <div className="space-y-4">
                    <div className="relative bg-slate-900 rounded-2xl overflow-hidden aspect-video max-w-xl mx-auto flex items-center justify-center shadow-inner">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-slate-900/80 text-white text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1.5 border border-slate-700/60">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        Live Camera
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={captureSnapshot}
                        className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-all cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        Capture & Run Recognition
                      </button>
                    </div>
                  </div>
                )}

                {/* Photo Preview Mode */}
                {imagePreview && (!isCameraActive || studioMode === 'upload') && (
                  <div className="space-y-4">
                    <div className="relative rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/80 flex items-center justify-center p-3 max-h-96">
                      <img
                        src={imagePreview}
                        alt="Target for recognition"
                        className="max-h-80 w-auto object-contain rounded-xl shadow-2xs"
                      />

                      {recognizeMutation.isPending && (
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center space-y-2 rounded-2xl">
                          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                          <span className="text-xs font-bold text-slate-800">
                            Analyzing facial landmarks & vectors...
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Empty Drag & Drop Upload State */}
                {!imagePreview && (!isCameraActive || studioMode === 'upload') && (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleFileSelect(e);
                    }}
                    className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/60 hover:bg-indigo-50/20 rounded-2xl p-10 text-center transition-all flex flex-col items-center justify-center space-y-4 min-h-[300px]"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-2xs border border-indigo-100">
                      <ScanFace className="w-7 h-7 stroke-[1.8]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Upload Photo for Face Recognition
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                        Drop an employee photo here to match against the Milvus vector database.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <label className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer transition-all">
                        <Upload className="w-3.5 h-3.5" />
                        Browse Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          setStudioMode('webcam');
                          startCamera();
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs cursor-pointer transition-all"
                      >
                        <Camera className="w-3.5 h-3.5 text-indigo-600" />
                        Use Camera
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions Bar (aligned) */}
            {imagePreview && (!isCameraActive || studioMode === 'upload') && (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => recognizeMutation.mutate(imageFile)}
                    disabled={recognizeMutation.isPending}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {recognizeMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Recognizing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Re-Analyze Photo
                      </>
                    )}
                  </button>

                  <label className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs cursor-pointer transition-all">
                    <Upload className="w-3.5 h-3.5 text-indigo-600" />
                    Change Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  Clear Photo
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Recognition Match Results (Equal Height) */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs flex-1 flex flex-col justify-between space-y-4">
            <div>
              {/* Header aligned perfectly with left card */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Match Results</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    AI vector similarity and employee identification
                  </p>
                </div>

                {recognitionResult && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
                    {recognitionResult.total_faces} Face{recognitionResult.total_faces === 1 ? '' : 's'} Found
                  </span>
                )}
              </div>

              {/* Match Content Body */}
              <div className="mt-5">
                {/* Pending State */}
                {recognizeMutation.isPending ? (
                  <div className="py-24 text-center space-y-3">
                    <Loader2 className="w-9 h-9 text-indigo-600 animate-spin mx-auto" />
                    <h4 className="text-sm font-bold text-slate-800">Calculating Vector Similarity...</h4>
                    <p className="text-xs text-slate-400">
                      Extracting 512-D face landmarks & searching Milvus collection
                    </p>
                  </div>
                ) : !recognitionResult ? (
                  /* Idle / Awaiting State */
                  <div className="py-24 text-center text-slate-400 space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center mx-auto text-slate-400 shadow-2xs">
                      <ScanFace className="w-7 h-7 stroke-[1.8]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-700">Awaiting Input</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                        Upload an image or take a webcam photo to view verified employee details here.
                      </p>
                    </div>
                  </div>
                ) : recognitionResult.total_faces === 0 ? (
                  /* No Faces Found */
                  <div className="py-20 text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
                      <AlertCircle className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">No Human Faces Detected</h4>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                        Please ensure the photo is well lit and the employee's face is clearly visible.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Rich & Spacious Employee Details Cards */
                  <div className="space-y-4">
                    {recognitionResult.recognized_faces?.map((match, idx) => {
                      const emp = match.employee;
                      const isMatched = match.matched && Boolean(emp);
                      const fullName = emp ? `${emp.first_name} ${emp.last_name || ''}`.trim() : 'Unrecognized Person';
                      const initials = emp ? getInitials(emp.first_name, emp.last_name) : 'UN';
                      const avatarColor = emp ? getAvatarColor(fullName) : 'bg-slate-100 text-slate-600 border-slate-200';

                      const fullEmp = emp ? employeeMap.get(emp.id) : null;
                      const deptName = fullEmp ? departmentMap.get(fullEmp.department_id) : 'Not Assigned';
                      const desigName = fullEmp ? designationMap.get(fullEmp.designation_id) : 'Staff';

                      // Milvus COSINE metric: match.distance is cosine similarity (e.g. 0.9714 = 97.14%)
                      const rawScore = match.distance !== undefined ? match.distance : 0;
                      const confidence = rawScore <= 1 ? rawScore * 100 : Math.max(0, (1 - rawScore) * 100);

                      return (
                        <div
                          key={idx}
                          className={cn(
                            'rounded-2xl border p-5 sm:p-6 transition-all duration-200 shadow-2xs space-y-5',
                            isMatched
                              ? 'bg-gradient-to-br from-emerald-50/50 via-white to-emerald-50/20 border-emerald-200'
                              : 'bg-gradient-to-br from-amber-50/50 via-white to-amber-50/20 border-amber-200'
                          )}
                        >
                          {/* 1. Header Banner & Status */}
                          <div className="flex items-center justify-between gap-3">
                            {isMatched ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
                                <UserCheck className="w-3.5 h-3.5" /> Verified Match
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full border border-amber-200 shadow-2xs">
                                <UserX className="w-3.5 h-3.5" /> Unregistered Face
                              </span>
                            )}

                            <div className="flex items-center gap-1 text-xs font-bold font-mono">
                              <span className="text-slate-400 font-sans font-medium">Similarity:</span>
                              <span
                                className={cn(
                                  'text-sm font-bold',
                                  isMatched ? 'text-emerald-700' : 'text-amber-700'
                                )}
                              >
                                {confidence.toFixed(1)}%
                              </span>
                            </div>
                          </div>

                          {/* 2. Employee Profile Header */}
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center font-bold text-base shrink-0 shadow-xs ${avatarColor}`}
                            >
                              {initials}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-slate-900 text-lg leading-tight truncate">
                                  {fullName}
                                </h4>
                                {emp?.employee_code && (
                                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 shadow-2xs">
                                    {emp.employee_code}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 mt-1 truncate">
                                {emp?.email || (isMatched ? 'Registered Workforce Member' : 'No employee record linked in Milvus')}
                              </p>
                            </div>
                          </div>

                          {/* 3. Detailed Metadata Grid */}
                          <div className="grid grid-cols-2 gap-3 pt-1">
                            <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                                <Building2 className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                                  Department
                                </span>
                                <span className="text-xs font-bold text-slate-800 truncate block">
                                  {deptName}
                                </span>
                              </div>
                            </div>

                            <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                                <Briefcase className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                                  Designation
                                </span>
                                <span className="text-xs font-bold text-slate-800 truncate block">
                                  {desigName}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* 4. Confidence Progress & Vector Distance Bar */}
                          <div className="space-y-1.5 p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                            <div className="flex items-center justify-between text-xs font-semibold">
                              <span className="text-slate-600">Match Confidence</span>
                              <span
                                className={cn(
                                  'font-mono font-bold',
                                  isMatched ? 'text-emerald-600' : 'text-amber-600'
                                )}
                              >
                                {confidence.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className={cn(
                                  'h-full rounded-full transition-all duration-500',
                                  isMatched
                                    ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                                    : 'bg-gradient-to-r from-amber-400 to-amber-600'
                                )}
                                style={{ width: `${Math.min(100, Math.max(5, confidence))}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-0.5">
                              <span>Cosine Sim: {rawScore.toFixed(4)}</span>
                              <span>Vector Dim: 512-D</span>
                            </div>
                          </div>

                          {/* 5. Prominent Action Button */}
                          <div className="pt-2">
                            {emp ? (
                              <button
                                type="button"
                                onClick={() =>
                                  navigate('employee-profile', {
                                    employeeId: emp.id,
                                    employeeName: fullName,
                                  })
                                }
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-all cursor-pointer"
                              >
                                View Employee Profile <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => navigate('enrollments', { mode: 'wizard' })}
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 shadow-2xs transition-all cursor-pointer"
                              >
                                <UserPlus className="w-3.5 h-3.5" /> Enroll Face In Milvus
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom space filler for alignment */}
            <div />
          </div>
        </div>
      </div>

      {/* Session History Table (DataTable Component Matching Employees Page) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-base font-bold text-slate-900">Session Activity Log</h3>
            <p className="text-xs text-slate-500">Live recognition history for the current session</p>
          </div>
          {sessionHistory.length > 0 && (
            <button
              type="button"
              onClick={() => setSessionHistory([])}
              className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
            >
              Clear Log
            </button>
          )}
        </div>

        <DataTable
          columns={historyColumns}
          data={filteredHistory}
          onRowClick={(row) => {
            if (row.employee?.id) {
              navigate('employee-profile', {
                employeeId: row.employee.id,
                employeeName: row.fullName,
              });
            }
          }}
          emptyTitle="No Recognition Scans Yet"
          emptyDescription="Upload an employee photo or use the live camera above to perform real-time face recognition."
        />

      </div>
    </div>
  );
}

export default RecognitionPage;
