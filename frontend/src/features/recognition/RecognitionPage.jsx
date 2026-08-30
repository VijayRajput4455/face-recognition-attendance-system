import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { recognitionApi } from '../../api/recognition';
import { useToast } from '../../context/ToastContext';
import { useNavigation } from '../../context/NavigationContext';
import StatusBadge from '../../components/ui/StatusBadge';
import PageBanner from '../../components/ui/PageBanner';
import { formatConfidence, getInitials, getAvatarColor } from '../../lib/utils';
import {
  ScanFace,
  Upload,
  Camera,
  UserCheck,
  UserX,
  AlertCircle,
  Loader2,
  Sparkles,
  RefreshCw,
  Eye,
  CheckCircle2,
  X,
  Zap,
} from 'lucide-react';

export function RecognitionPage() {
  const { navigate } = useNavigation();
  const { success, error: toastError } = useToast();

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [recognitionResult, setRecognitionResult] = useState(null);

  // Live Camera mode
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
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
      setRecognitionResult(null);
    } catch {
      toastError('Camera Access Denied', 'Unable to access webcam.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'snapshot.jpg', { type: 'image/jpeg' });
        setImageFile(file);
        setImagePreview(URL.createObjectURL(blob));
        stopCamera();
        // Auto recognize snapshot
        recognizeMutation.mutate(file);
      }
    }, 'image/jpeg');
  };

  const handleFileSelect = (e) => {
    const file = e.target?.files?.[0] || e.dataTransfer?.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toastError('Invalid File', 'Please upload a valid image file (JPG, PNG, WebP).');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setRecognitionResult(null);
    }
  };

  // Recognize Mutation
  const recognizeMutation = useMutation({
    mutationFn: (file) => recognitionApi.recognizeImage(file || imageFile),
    onSuccess: (data) => {
      setRecognitionResult(data);
      if (data.total_faces === 0) {
        toastError('No Faces', 'No human faces were detected in the image.');
      } else {
        success('Analysis Complete', `Detected ${data.total_faces} face(s) in image.`);
      }
    },
    onError: (err) => {
      toastError('Recognition Failed', err.message);
    },
  });

  const handleReset = () => {
    setImageFile(null);
    setImagePreview(null);
    setRecognitionResult(null);
    stopCamera();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Hero Header */}
      <PageBanner
        badge="Computer Vision Studio"
        badgeIcon={ScanFace}
        title="Face Recognition Studio"
        description="Perform real-time biometric identification and verification against enrolled employee vectors."
        actions={
          <>
            {!isCameraActive ? (
              <button
                onClick={startCamera}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-semibold backdrop-blur-md border border-white/10 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4 text-indigo-300" />
                Use Webcam
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/80 hover:bg-rose-500 text-white text-xs font-semibold backdrop-blur-md transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
                Close Camera
              </button>
            )}

            {imagePreview && (
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-indigo-950 bg-white hover:bg-indigo-50 active:bg-indigo-100 rounded-xl shadow-md transition-all cursor-pointer"
              >
                Clear Photo
              </button>
            )}
          </>
        }
      />

      {/* Main Workspace Layout (2 columns: Studio canvas + Recognition Results) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Canvas / Upload Box */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            {/* Live Camera View */}
            {isCameraActive ? (
              <div className="space-y-4">
                <div className="relative bg-slate-900 rounded-2xl overflow-hidden aspect-video flex items-center justify-center shadow-inner">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  <div className="absolute inset-0 border-2 border-indigo-500/40 rounded-2xl pointer-events-none" />
                </div>

                <button
                  onClick={captureSnapshot}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  Capture Snapshot & Recognize
                </button>
              </div>
            ) : imagePreview ? (
              /* Image Preview Canvas with detection highlights */
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center max-h-96 shadow-inner">
                  <img src={imagePreview} alt="Target for recognition" className="max-h-96 w-auto object-contain" />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-500 truncate max-w-xs">{imageFile?.name || 'Image'}</span>

                  <button
                    onClick={() => recognizeMutation.mutate(imageFile)}
                    disabled={recognizeMutation.isPending}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {recognizeMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing Faces...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Run Facial Recognition
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Drag & Drop Upload Zone */
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileSelect(e);
                }}
                className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 rounded-2xl p-12 text-center transition-all flex flex-col items-center justify-center space-y-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-2xs">
                  <ScanFace className="w-7 h-7 stroke-[1.8]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Upload Image for Face Recognition</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Drop a single photo containing one or more employee faces to instantly match against Milvus vectors.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <label className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    Browse Photo
                    <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                  </label>

                  <button
                    onClick={startCamera}
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

        {/* Right Column: AI Recognition Results */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4 min-h-96">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recognition Results</h3>
                <p className="text-[11px] text-slate-500">Vector distance & employee matches</p>
              </div>
              {recognitionResult && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {recognitionResult.total_faces} Face(s) Detected
                </span>
              )}
            </div>

            {recognizeMutation.isPending ? (
              <div className="py-20 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-700">Detecting landmarks & calculating embeddings...</p>
                <p className="text-[11px] text-slate-400">Querying Milvus HNSW index</p>
              </div>
            ) : !recognitionResult ? (
              <div className="py-24 text-center text-slate-400 space-y-2">
                <ScanFace className="w-8 h-8 mx-auto text-slate-300 stroke-[1.5]" />
                <p className="text-xs">Upload or snap a photo to view AI detection matches here.</p>
              </div>
            ) : recognitionResult.total_faces === 0 ? (
              <div className="py-16 text-center text-slate-500 space-y-3">
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">No Human Faces Detected</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  The AI model could not detect any faces in this image. Please ensure good lighting and clear front angles.
                </p>
              </div>
            ) : (
              /* Detected Faces List */
              <div className="space-y-3">
                {recognitionResult.recognized_faces?.map((match, idx) => {
                  const emp = match.employee;
                  const isMatched = match.matched && Boolean(emp);
                  const fullName = emp ? `${emp.first_name} ${emp.last_name || ''}`.trim() : 'Unknown Person';
                  const initials = emp ? getInitials(emp.first_name, emp.last_name) : 'UN';
                  const avatarColor = emp ? getAvatarColor(fullName) : 'bg-slate-100 text-slate-600 border-slate-200';

                  // Similarity score conversion from cosine distance:
                  // For Cosine similarity, distance is typically between 0 (exact match) and 1 (dissimilar)
                  const confidence = match.distance !== undefined ? Math.max(0, (1 - match.distance) * 100) : null;

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border transition-all ${
                        isMatched
                          ? 'bg-emerald-50/50 border-emerald-200 shadow-2xs'
                          : 'bg-amber-50/50 border-amber-200 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-2xl border flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs ${avatarColor}`}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900 text-sm">{fullName}</h4>
                              {isMatched ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                                  <UserCheck className="w-3 h-3" /> Matched
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                                  <UserX className="w-3 h-3" /> Unmatched
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-mono text-slate-500 mt-0.5">
                              {emp?.employee_code || 'Unrecognized Vector'}
                            </p>
                          </div>
                        </div>

                        {confidence !== null && (
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
                              Similarity
                            </span>
                            <span className="text-xs font-bold text-emerald-700 font-mono">
                              {confidence.toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>

                      {emp && (
                        <div className="mt-3 pt-2.5 border-t border-emerald-100 flex items-center justify-between text-[11px] text-slate-600">
                          <span>{emp.email || 'Registered Employee'}</span>
                          <button
                            onClick={() =>
                              navigate('employee-profile', {
                                employeeId: emp.id,
                                employeeName: fullName,
                              })
                            }
                            className="font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                          >
                            Profile <Eye className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecognitionPage;
