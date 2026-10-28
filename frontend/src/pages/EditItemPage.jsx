import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, Save } from 'lucide-react';
import { itemAPI } from '../services/api';
import ImageUploader from '../components/ImageUploader';
import LoadingSpinner from '../components/LoadingSpinner';

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

const EditItemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [locationDescription, setLocationDescription] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [incidentTime, setIncidentTime] = useState('');
  const [brand, setBrand] = useState('');
  const [color, setColor] = useState('');
  const [distinguishingFeatures, setDistinguishingFeatures] = useState('');
  const [circumstances, setCircumstances] = useState('');
  const [travelRoute, setTravelRoute] = useState('');

  // Images
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await itemAPI.getItemById(id);
        if (res.data?.success && res.data?.item) {
          const it = res.data.item;
          setTitle(it.title || '');
          setCategory(it.category || 'Electronics');
          setDescription(it.description || '');
          setLocationDescription(it.locationDescription || '');
          setIncidentDate(it.incidentDate ? it.incidentDate.split('T')[0] : '');
          setIncidentTime(it.incidentTime || '');
          setBrand(it.brand || '');
          setColor(it.color || '');
          setDistinguishingFeatures(it.distinguishingFeatures || '');
          setCircumstances(it.circumstances || '');
          setTravelRoute(it.travelRoute || '');
          setExistingImages(it.images || []);
        }
      } catch (err) {
        setErrorMessage(err.message || 'Failed to fetch item for editing');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim() || !category || !description.trim() || !locationDescription.trim() || !incidentDate) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
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

      newFiles.forEach((file) => {
        formData.append('images', file);
      });

      const res = await itemAPI.updateItem(id, formData);
      if (res.data?.success) {
        navigate(`/items/${id}`);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update item report.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading report data..." />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-150">
      <div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-blue-600 mb-3 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Details
        </button>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Edit Item Report</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Update the specifications, description, or photographs for this listing.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Item Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
                Brand
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Color
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Distinguishing Features
              </label>
              <input
                type="text"
                value={distinguishingFeatures}
                onChange={(e) => setDistinguishingFeatures(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Location Landmark *
            </label>
            <input
              type="text"
              required
              value={locationDescription}
              onChange={(e) => setLocationDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Incident Date *
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
        </div>

        {/* Image Management */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <ImageUploader
            files={newFiles}
            setFiles={setNewFiles}
            previews={newPreviews}
            setPreviews={setNewPreviews}
            existingImages={existingImages}
            setExistingImages={setExistingImages}
            label="Listing Photographs"
            maxFiles={5}
          />
        </div>

        {/* Submit */}
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
            disabled={saving}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Update Report
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditItemPage;
