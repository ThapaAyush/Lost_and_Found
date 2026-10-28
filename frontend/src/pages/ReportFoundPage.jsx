import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Loader2, AlertCircle, ArrowLeft, Building } from 'lucide-react';
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

const CUSTODY_OPTIONS = [
  { value: 'still_with_finder', label: 'Still with me (Finder safekeeping)' },
  { value: 'reception_or_security', label: 'Handed over to Campus Reception / Security Desk' },
  { value: 'lost_property_office', label: 'Deposited at Campus Lost Property Office' },
];

const ReportFoundPage = () => {
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
  const [custodyDetails, setCustodyDetails] = useState('still_with_finder');
  const [custodyNotes, setCustodyNotes] = useState('');
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
      formData.append('type', 'found');
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('description', description.trim());
      formData.append('locationDescription', locationDescription.trim());
      formData.append('incidentDate', incidentDate);
      formData.append('incidentTime', incidentTime.trim());
      formData.append('brand', brand.trim());
      formData.append('color', color.trim());
      formData.append('distinguishingFeatures', distinguishingFeatures.trim());
      formData.append('custodyDetails', custodyDetails);
      formData.append('custodyNotes', custodyNotes.trim());
      formData.append('additionalNotes', additionalNotes.trim());

      files.forEach((file) => {
        formData.append('images', file);
      });

      const res = await itemAPI.createItem(formData);
      if (res.data?.success && res.data?.item) {
        navigate(`/items/${res.data.item._id}`, { replace: true });
      } else {
        navigate('/found-items');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to file found report. Please try again.');
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
            Report a Found Item
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Thank you for being a good samaritan! Registering discovered belongings helps rightful owners verify ownership.
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
            1. Discovered Item Information
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
              placeholder="e.g. Silver HydroFlask Water Bottle with Stickers"
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
                placeholder="e.g. Apple, HydroFlask, Sony..."
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
                placeholder="e.g. Silver, Blue, Red..."
                className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Visible Markings / Condition
              </label>
              <input
                type="text"
                value={distinguishingFeatures}
                onChange={(e) => setDistinguishingFeatures(e.target.value)}
                placeholder="e.g. Dented lid, cartoon stickers..."
                className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Public Description *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the item general appearance (avoid revealing secret serial numbers or private identifiers so claimant can verify them)..."
              className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* Discovery Location & Custody */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            2. Discovery Location & Custody
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Discovery Location Landmark *
            </label>
            <input
              type="text"
              required
              value={locationDescription}
              onChange={(e) => setLocationDescription(e.target.value)}
              placeholder="e.g. Under Bench near Main Campus Fountain, Library 1st Floor Cafe"
              className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Date Found *
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
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
              <Building className="w-3.5 h-3.5 mr-1 text-blue-600" />
              Current Safekeeping Custody *
            </label>
            <select
              required
              value={custodyDetails}
              onChange={(e) => setCustodyDetails(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
            >
              {CUSTODY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Custody Notes (e.g. reference tag number or desk staff name)
            </label>
            <input
              type="text"
              value={custodyNotes}
              onChange={(e) => setCustodyNotes(e.target.value)}
              placeholder="e.g. Left with Officer Davis at Security Desk, Tag #LF-881"
              className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* Photographs Upload */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            3. Photographs of Discovered Item
          </h3>
          <p className="text-xs text-slate-500">
            Upload clear photographs of the item. Photos significantly speed up owner recognition.
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
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Publishing Report...
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4 mr-2" />
                Publish Found Report
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportFoundPage;
