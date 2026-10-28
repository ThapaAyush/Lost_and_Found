import React, { useRef } from 'react';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';

const ImageUploader = ({
  files = [],
  setFiles,
  previews = [],
  setPreviews,
  existingImages = [],
  setExistingImages,
  multiple = true,
  maxFiles = 5,
  label = 'Item Photographs',
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;

    // Check count
    const totalCount = (previews?.length || 0) + (existingImages?.length || 0) + selectedFiles.length;
    if (totalCount > maxFiles) {
      alert(`You can only upload up to ${maxFiles} images.`);
      return;
    }

    // Generate previews
    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));

    if (multiple) {
      setFiles((prev) => [...prev, ...selectedFiles]);
      setPreviews((prev) => [...prev, ...newPreviews]);
    } else {
      setFiles(selectedFiles.slice(0, 1));
      setPreviews(newPreviews.slice(0, 1));
    }
  };

  const removeNewFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeExistingImage = (index) => {
    if (setExistingImages) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">{label}</label>

      {/* Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50 hover:bg-blue-50/40 transition group"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple={multiple}
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-105 transition shadow-sm">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-700">
            Click to upload or drag & drop photographs
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            PNG, JPG, WebP up to 5MB each (Max {maxFiles} images)
          </p>
        </div>
      </div>

      {/* Thumbnails Preview */}
      {(existingImages?.length > 0 || previews?.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
          {/* Existing server images */}
          {existingImages?.map((url, idx) => (
            <div
              key={`exist-${idx}`}
              className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-square bg-slate-100"
            >
              <img src={url} alt="Uploaded item" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeExistingImage(idx)}
                className="absolute top-1.5 right-1.5 p-1 bg-black/60 text-white rounded-full hover:bg-rose-600 transition"
                title="Remove photo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <span className="absolute bottom-1 left-1 text-[10px] bg-slate-900/60 text-white px-1.5 py-0.5 rounded">
                Saved
              </span>
            </div>
          ))}

          {/* Newly staged previews */}
          {previews?.map((url, idx) => (
            <div
              key={`preview-${idx}`}
              className="relative group rounded-xl overflow-hidden border-2 border-blue-500 aspect-square bg-slate-100 shadow-sm"
            >
              <img src={url} alt="Local preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeNewFile(idx)}
                className="absolute top-1.5 right-1.5 p-1 bg-black/60 text-white rounded-full hover:bg-rose-600 transition"
                title="Remove photo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <span className="absolute bottom-1 left-1 text-[10px] bg-blue-600 text-white font-bold px-1.5 py-0.5 rounded">
                New
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
