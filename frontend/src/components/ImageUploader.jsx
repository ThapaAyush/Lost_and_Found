import React, { useRef, useState } from 'react';
import { UploadCloud, X, Plus, Image as ImageIcon } from 'lucide-react';

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
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = (selectedFiles) => {
    if (!selectedFiles || !selectedFiles.length) return;

    // Check count limit
    const currentCount = (previews?.length || 0) + (existingImages?.length || 0);
    const availableSlots = maxFiles - currentCount;

    if (availableSlots <= 0) {
      alert(`You can only upload up to ${maxFiles} images.`);
      return;
    }

    const filesToAdd = multiple ? selectedFiles.slice(0, availableSlots) : selectedFiles.slice(0, 1);

    if (selectedFiles.length > availableSlots && multiple) {
      alert(`Only ${availableSlots} more image(s) could be added to stay within the limit of ${maxFiles}.`);
    }

    // Generate previews
    const newPreviews = filesToAdd.map((file) => URL.createObjectURL(file));

    if (multiple) {
      setFiles((prev) => [...prev, ...filesToAdd]);
      setPreviews((prev) => [...prev, ...newPreviews]);
    } else {
      setFiles(filesToAdd);
      setPreviews(newPreviews);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    processFiles(selectedFiles);
    // Reset input value so same file can be selected again if needed
    if (e.target) e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer?.files || []).filter((f) =>
      f.type.startsWith('image/')
    );
    processFiles(droppedFiles);
  };

  const removeNewFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      if (prev[index]) URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeExistingImage = (index) => {
    if (setExistingImages) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const totalCount = (existingImages?.length || 0) + (previews?.length || 0);
  const hasImages = totalCount > 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
        {hasImages && (
          <span className="text-[11px] font-semibold text-slate-500">
            {totalCount} / {maxFiles} images
          </span>
        )}
      </div>

      {/* Upload Zone - Photos are displayed INSIDE this container */}
      <div
        onClick={() => {
          if (!hasImages || totalCount < maxFiles) {
            fileInputRef.current?.click();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl transition duration-200 cursor-pointer overflow-hidden ${
          isDragging
            ? 'border-blue-500 bg-blue-50/70'
            : hasImages
            ? 'border-slate-300 bg-slate-50/80 hover:border-blue-400'
            : 'border-slate-200 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/40 group'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple={multiple}
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
        />

        {!hasImages ? (
          /* Empty State inside dashed box */
          <div className="py-8 px-4 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition shadow-sm">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-700">
              Click to upload or drag & drop photographs
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              PNG, JPG, WebP up to 5MB each (Max {maxFiles} images)
            </p>
          </div>
        ) : (
          /* Populated State: Previews Rendered INSIDE the Dashed Box */
          <div className="p-4 sm:p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {/* Existing Server Images */}
              {existingImages?.map((url, idx) => (
                <div
                  key={`exist-${idx}`}
                  className="relative group/thumb rounded-xl overflow-hidden border border-slate-200 aspect-square bg-white shadow-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img src={url} alt="Uploaded item" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeExistingImage(idx);
                    }}
                    className="absolute top-1.5 right-1.5 p-1 bg-slate-900/75 hover:bg-rose-600 text-white rounded-full transition shadow-sm"
                    title="Remove photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute bottom-1 left-1 text-[9px] bg-slate-900/70 text-white font-bold px-1.5 py-0.5 rounded">
                    Saved
                  </span>
                </div>
              ))}

              {/* Newly Uploaded File Previews */}
              {previews?.map((url, idx) => (
                <div
                  key={`preview-${idx}`}
                  className="relative group/thumb rounded-xl overflow-hidden border-2 border-blue-500 aspect-square bg-white shadow-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img src={url} alt="Local preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNewFile(idx);
                    }}
                    className="absolute top-1.5 right-1.5 p-1 bg-slate-900/75 hover:bg-rose-600 text-white rounded-full transition shadow-sm"
                    title="Remove photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute bottom-1 left-1 text-[9px] bg-blue-600 text-white font-black px-1.5 py-0.5 rounded">
                    New
                  </span>
                </div>
              ))}

              {/* Add More Tile inside the grid if under maxFiles */}
              {totalCount < maxFiles && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="rounded-xl border-2 border-dashed border-blue-300 hover:border-blue-500 bg-white hover:bg-blue-50/60 aspect-square flex flex-col items-center justify-center text-blue-600 transition group/add shadow-xs"
                  title="Add another photograph"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 group-hover/add:bg-blue-100 flex items-center justify-center mb-1 text-blue-600 transition">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 group-hover/add:text-blue-600">
                    Add Photo
                  </span>
                  <span className="text-[9px] text-slate-400">
                    ({totalCount}/{maxFiles})
                  </span>
                </button>
              )}
            </div>

            {/* Helper footer text inside the box */}
            <div className="mt-3.5 pt-3 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-medium text-slate-600">
                {totalCount} of {maxFiles} photographs added
              </span>
              {totalCount < maxFiles ? (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  + Click or drop to add more
                </span>
              ) : (
                <span className="text-emerald-600 font-bold">
                  ✓ Maximum photographs reached
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
