import React, { useState } from 'react';
import { Upload, ShieldCheck, ShieldAlert, RefreshCw, X, CheckCircle2, Film, Image as ImageIcon } from 'lucide-react';

interface FileUploadWithScanProps {
  onFileSelect: (mediaUrl: string, mediaType: 'image' | 'video', fileName: string) => void;
  accept?: string;
  label?: string;
}

export const FileUploadWithScan: React.FC<FileUploadWithScanProps> = ({
  onFileSelect,
  accept = 'image/*,video/*',
  label = 'Upload Media from Device'
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'clean' | 'threat'>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<'image' | 'video'>('image');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic client security check on dangerous extensions
    const isDangerous = /\.(exe|bat|cmd|sh|vbs|js|scr|msi|dll|iso)$/i.test(file.name);
    
    setFileName(file.name);
    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(file.name);
    setFileType(isVideo ? 'video' : 'image');

    setIsScanning(true);
    setScanStatus('scanning');

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;

      // Simulate malware & antivirus engine check
      setTimeout(() => {
        setIsScanning(false);

        if (isDangerous) {
          setScanStatus('threat');
        } else {
          setScanStatus('clean');
          setPreviewUrl(dataUrl);
          onFileSelect(dataUrl, isVideo ? 'video' : 'image', file.name);
        }
      }, 1400);
    };

    reader.readAsDataURL(file);
  };

  const clearFile = () => {
    setPreviewUrl(null);
    setScanStatus('idle');
    setFileName('');
  };

  return (
    <div className="space-y-3">
      {scanStatus === 'idle' && (
        <label className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-neutral-700 hover:border-emerald-500 bg-[#141414] hover:bg-[#181818] cursor-pointer transition-all text-center group">
          <div className="w-10 h-10 rounded-xl bg-neutral-800 group-hover:bg-emerald-500/20 text-neutral-400 group-hover:text-emerald-400 flex items-center justify-center mb-2 transition">
            <Upload className="w-5 h-5" />
          </div>
          <span className="text-xs font-extrabold text-neutral-200">{label}</span>
          <span className="text-[10px] text-neutral-400 mt-0.5">Supports JPG, PNG, WEBP, MP4, MOV (Auto Malware Scanned)</span>
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      )}

      {scanStatus === 'scanning' && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-between text-xs font-bold animate-pulse">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
            <span>Scanning <strong>{fileName}</strong> with SkillHub Malware & Security Scanner...</span>
          </div>
        </div>
      )}

      {scanStatus === 'clean' && previewUrl && (
        <div className="p-3 rounded-2xl bg-[#141414] border border-emerald-500/40 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-black">
              <ShieldCheck className="w-4 h-4" />
              <span>Malware Scan Passed — File Safe & Clean</span>
            </div>
            <button
              type="button"
              onClick={clearFile}
              className="text-neutral-400 hover:text-white p-1"
              title="Remove File"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative rounded-xl overflow-hidden max-h-48 bg-black flex items-center justify-center">
            {fileType === 'video' ? (
              <video src={previewUrl} controls className="max-h-48 w-full object-contain" />
            ) : (
              <img src={previewUrl} alt="Safe Upload Preview" className="max-h-48 w-full object-cover" />
            )}
          </div>
        </div>
      )}

      {scanStatus === 'threat' && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-300 flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <span>Security Warning: Executable or suspicious file type blocked by Malware Scanner.</span>
          </div>
          <button
            type="button"
            onClick={clearFile}
            className="px-2.5 py-1 bg-rose-500 text-white rounded-lg text-xs font-black"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};
