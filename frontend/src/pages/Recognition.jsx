import React, { useState, useRef, useEffect } from 'react';
import { identifyFace } from '../api/recognition';
import { Camera, CheckCircle2, VideoOff, RefreshCw, ChevronRight, Scan } from 'lucide-react';

export function Recognition() {
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [recognizedPerson, setRecognizedPerson] = useState({
    name: 'Amit Sharma',
    code: 'EMP001',
    role: 'Software Engineer',
    confidence: 98,
    time: '10:24:35 AM',
    date: 'May 18, 2024',
    location: 'Main Entrance',
    access: 'Granted',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80',
  });
  const [loading, setLoading] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (isCameraActive) {
      startWebcam();
    } else {
      stopWebcam();
    }
    return () => stopWebcam();
  }, [isCameraActive]);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
  };

  const recentDetections = [
    { name: 'Amit Sharma', time: '10:24:35 AM', status: 'Recognized', isUnknown: false, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
    { name: 'Neha Verma', time: '10:24:18 AM', status: 'Recognized', isUnknown: false, img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
    { name: 'Unknown', time: '10:23:56 AM', status: 'Unknown', isUnknown: true, img: null },
    { name: 'Rohit Kumar', time: '10:23:40 AM', status: 'Recognized', isUnknown: false, img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
    { name: 'Priya Singh', time: '10:23:21 AM', status: 'Recognized', isUnknown: false, img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
    { name: 'Unknown', time: '10:22:10 AM', status: 'Unknown', isUnknown: true, img: null },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
            Live Recognition
          </h2>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
            Real-time face detection and recognition
          </p>
        </div>

        <button
          onClick={() => setIsCameraActive(!isCameraActive)}
          className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-md transition-all ${
            isCameraActive ? 'bg-[#635BFF] hover:bg-[#5247e6] shadow-[#635BFF]/30' : 'bg-slate-700 hover:bg-slate-800'
          }`}
        >
          {isCameraActive ? <Camera className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          <span>{isCameraActive ? 'Stop Camera' : 'Start Camera'}</span>
        </button>
      </div>

      {/* Main Grid: Video Stream & Recognized Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Camera Viewport */}
        <div className="lg:col-span-2 visio-card overflow-hidden relative bg-slate-950 aspect-[4/3] flex items-center justify-center border-0 shadow-lg">
          {isCameraActive ? (
            <div className="relative w-full h-full">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              
              {/* LIVE Badge */}
              <div className="absolute top-4 left-4 flex items-center space-x-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur text-white text-xs font-bold border border-white/10">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>LIVE</span>
              </div>

              {/* Face Detection Bounding Box Overlay */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-56 border-2 border-emerald-400 rounded-2xl shadow-[0_0_20px_rgba(52,211,153,0.4)] pointer-events-none flex flex-col justify-between p-2">
                <div className="self-end px-2 py-0.5 rounded bg-emerald-500 text-white font-mono text-[10px] font-bold shadow-sm">
                  96%
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500 space-y-3">
              <VideoOff className="h-10 w-10 mx-auto text-slate-600" />
              <p className="text-sm font-medium">Camera Feed Suspended</p>
            </div>
          )}
        </div>

        {/* Right Recognition Details Panel */}
        <div className="visio-card p-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-4">
              <span>Recognized</span>
              <CheckCircle2 className="h-4 w-4" />
            </div>

            {/* Employee Recognized Profile Card */}
            <div className="flex items-center space-x-4 mb-6">
              <img
                src={recognizedPerson.avatar}
                alt={recognizedPerson.name}
                className="h-14 w-14 rounded-full object-cover border-2 border-emerald-500 shadow-md"
              />
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-sans">
                  {recognizedPerson.name}
                </h3>
                <p className="text-xs font-mono font-semibold text-slate-400">
                  {recognizedPerson.code}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {recognizedPerson.role}
                </p>
              </div>
            </div>

            {/* Confidence Score Meter */}
            <div className="space-y-1.5 mb-6">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500 dark:text-slate-400">Confidence Score</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                  {recognizedPerson.confidence}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${recognizedPerson.confidence}%` }}
                />
              </div>
            </div>

            {/* Metadata Table */}
            <div className="space-y-3 text-xs pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-medium">Time</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">{recognizedPerson.time}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-medium">Date</span>
                <span className="font-semibold text-slate-900 dark:text-white">{recognizedPerson.date}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-medium">Location</span>
                <span className="font-semibold text-slate-900 dark:text-white">{recognizedPerson.location}</span>
              </div>
              <div className="flex justify-between py-1 items-center">
                <span className="text-slate-400 font-medium">Access</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold uppercase">
                  {recognizedPerson.access}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Recent Detections Carousel */}
      <div className="visio-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Detections</h3>
          <button className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {recentDetections.map((det, idx) => (
            <div key={idx} className="flex flex-col items-center text-center space-y-2">
              {det.isUnknown ? (
                <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 border border-rose-300 dark:border-rose-900">
                  <Scan className="h-6 w-6 text-rose-500" />
                </div>
              ) : (
                <img
                  src={det.img}
                  alt={det.name}
                  className="h-12 w-12 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm"
                />
              )}
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[90px]">
                  {det.name}
                </p>
                <p className="text-[10px] font-mono text-slate-400">{det.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Recognition;
