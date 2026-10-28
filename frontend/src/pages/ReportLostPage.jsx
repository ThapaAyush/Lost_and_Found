import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { itemAPI } from '../services/api';
import ImageUploader from '../components/ImageUploader';

const CATEGORIES = [
  'Electronics',
  'Wallets and purses',
  'Bags and backpacks',
  'Keys',
  'Documents and identity cards',
  'Jewelry',
  'Clothing',
  'Books',
  'Accessories',
  'Other',
];

const ReportLostPage = () => {
  const navigate = useNavigate();

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [description, setDescription] = useState('');
  const [locationDescription, setLocationDescription] = useState('');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [incidentTime, setIncidentTime] = useState('');
  const [brand, setBrand] = useState('');
  const [color, setColor] = useState('');
  const [distinguishingFeatures, setDistinguishingFeatures] = useState('');
  const [circumstances, setCircumstances] = useState('');
  const [travelRoute, setTravelRoute] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Uploaded files
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim() || !category || !description.trim() || !locationDescription.trim() || !incidentDate) {
      setErrorMessage('Please fill in all required fields (marked with *).');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('type', 'lost');
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('description', description.trim());
      formData.append('locationDescription', locationDescription.trim());
      formData.append('incidentDate', incidentDate);
      formData.append('incidentTime', incidentTime.trim());
      formData.append('brand', brand.trim());
      formData.append('color', color.trim());
      formData.append('distinguishingFeatures', distinguishingFeatures.trim());
      formData.append('circumstances', circumstances.trim());
      formData.append('travelRoute', travelRoute.trim());
      formData.append('additionalNotes', additionalNotes.trim());

      files.forEach((file) => {
        formData.append('images', file);
      });

      const res = await itemAPI.createItem(formData);
      if (res.data?.success && res.data?.item) {
        navigate(`/items/${res.data.item._id}`, { replace: true });
      } else {
        navigate('/my-reports');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to file lost report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-blue-600 mb-3 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back
        </button>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-blue-600 animate-pulse" />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Report a Lost Item
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Provide accurate details so our multi-factor matching engine and campus community can identify your belonging.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6"
      >
        {/* Core Details Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            1. Core Item Information
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Item Title / Name *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Midnight Blue Apple iPhone 15 Pro"
              className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Brand / Manufacturer
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Apple, Dell, Nike, Bellroy..."
                className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Primary Color(s)
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Matte Black, Deep Blue..."
                className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Distinguishing Marks or Features
              </label>
              <input
                type="text"
                value={distinguishingFeatures}
                onChange={(e) => setDistinguishingFeatures(e.target.value)}
                placeholder="e.g. Small sticker on corner, cracked screen protector..."
                className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Detailed Description *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide full description of item contents, appearance, accessories included, and identifying marks..."
              className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* Incident Time & Location */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            2. When & Where Was It Lost?
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Last Seen Location Landmark *
            </label>
            <input
              type="text"
              required
              value={locationDescription}
              onChange={(e) => setLocationDescription(e.target.value)}
              placeholder="e.g. Library 2nd Floor Silent Study Area, Student Union Food Court"
              className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Date Lost *
              </label>
              <input
                type="date"
                required
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Approximate Time
              </label>
              <input
                type="time"
                value={incidentTime}
                onChange={(e) => setIncidentTime(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Circumstances / Travel Route on Campus
            </label>
            <textarea
              rows={2}
              value={circumstances}
              onChange={(e) => setCircumstances(e.target.value)}
              placeholder="e.g. Walking from Chemistry Lab to Central Quad between 14:00 and 15:30..."
              className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* Photographs Upload */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            3. Reference Photographs (Optional)
          </h3>
          <p className="text-xs text-slate-500">
            Upload pictures of your item (or similar catalogue images) to assist community identification.
          </p>

          <ImageUploader
            files={files}
            setFiles={setFiles}
            previews={previews}
            setPreviews={setPreviews}
            maxFiles={5}
          />
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting Report...
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4 mr-2" />
                Publish Lost Report
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportLostPage;
