import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X,
  Download,
  Loader2,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function BulkImportModal({
  isOpen,
  onClose,
  title = 'Bulk Import',
  entityName = 'Records',
  sampleTemplate = '',
  sampleFileName = 'sample_template.csv',
  onUpload,
  onSuccess,
}) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setResult(null);
    }
  };

  const handleDownloadSample = () => {
    const blob = new Blob([sampleTemplate], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', sampleFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await onUpload(formData);
      setResult(res);

      if (res.successful_count > 0 && onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setResult({
        total_records: 0,
        successful_count: 0,
        failed_count: 1,
        errors: [
          {
            row: 0,
            identifier: 'Upload Error',
            error: err.response?.data?.detail || err.message || 'Failed to upload CSV file.',
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-2xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500">
                Upload a CSV spreadsheet to import multiple {entityName.toLowerCase()} in one batch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Sample Download Banner */}
          {sampleTemplate && (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100/80 text-xs">
              <div className="flex items-center gap-2 text-indigo-900">
                <Download className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Need a reference template with required columns?</span>
              </div>
              <button
                type="button"
                onClick={handleDownloadSample}
                className="font-bold text-indigo-600 hover:text-indigo-700 underline shrink-0 cursor-pointer ml-2"
              >
                Download Sample CSV
              </button>
            </div>
          )}

          {/* Upload Dropzone */}
          {!result && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-3',
                dragOver
                  ? 'border-indigo-600 bg-indigo-50/40 scale-[1.01]'
                  : selectedFile
                  ? 'border-emerald-400 bg-emerald-50/20'
                  : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/60'
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xs transition-transform',
                  selectedFile
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-indigo-50 text-indigo-600'
                )}
              >
                {selectedFile ? (
                  <CheckCircle2 className="w-7 h-7" />
                ) : (
                  <UploadCloud className="w-7 h-7" />
                )}
              </div>

              <div>
                <p className="text-sm font-bold text-slate-800">
                  {selectedFile ? selectedFile.name : 'Click to upload or drag & drop CSV file'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedFile
                    ? `${(selectedFile.size / 1024).toFixed(1)} KB • Ready to import`
                    : 'Supports .CSV formatted files up to 10MB'}
                </p>
              </div>
            </div>
          )}

          {/* Upload Results Display */}
          {result && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Total Processed
                  </span>
                  <span className="text-xl font-black font-mono text-slate-900 mt-0.5 block">
                    {result.total_records}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Imported
                  </span>
                  <span className="text-xl font-black font-mono text-emerald-700 mt-0.5 block">
                    {result.successful_count}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-center">
                  <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
                    Failed / Skipped
                  </span>
                  <span className="text-xl font-black font-mono text-rose-700 mt-0.5 block">
                    {result.failed_count}
                  </span>
                </div>
              </div>

              {/* Error list if any */}
              {result.errors && result.errors.length > 0 && (
                <div className="border border-rose-200/80 bg-rose-50/40 rounded-2xl p-4 space-y-2 max-h-48 overflow-y-auto">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Errors Encountered ({result.errors.length}):</span>
                  </div>
                  <div className="divide-y divide-rose-100 text-xs text-rose-800">
                    {result.errors.map((err, i) => (
                      <div key={i} className="py-1.5 flex items-start gap-2">
                        <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-rose-200 shrink-0 text-[10px]">
                          Row {err.row}
                        </span>
                        <span className="flex-1 leading-snug">
                          {err.identifier && <strong>[{err.identifier}] </strong>}
                          {err.error}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          {result ? (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Upload Another File
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
          )}

          {result ? (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all"
            >
              Done
            </button>
          ) : (
            <button
              type="button"
              disabled={!selectedFile || loading}
              onClick={handleSubmit}
              className={cn(
                'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all',
                selectedFile && !loading
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-indigo-200'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              )}
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {loading ? 'Importing Data...' : `Import ${entityName}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default BulkImportModal;
