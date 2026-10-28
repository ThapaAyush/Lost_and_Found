import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Clock,
  Tag,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  Sparkles,
  MessageSquare,
  Edit,
  Trash2,
  CheckCircle2,
  Clock3,
  Loader2,
  Building,
  Flag,
  Image as ImageIcon,
  Lock,
} from 'lucide-react';
import { itemAPI, conversationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import ReportAbuseModal from '../components/ReportAbuseModal';
import ImageUploader from '../components/ImageUploader';
import MatchCard from '../components/MatchCard';
import { formatDate, formatTimeAgo, formatCustodyLabel } from '../utils/formatters';

const ItemDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [hasActiveClaim, setHasActiveClaim] = useState(false);
  const [activeClaimId, setActiveClaimId] = useState(null);
  const [claimStatus, setClaimStatus] = useState(null);
  const [approvedConversationId, setApprovedConversationId] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status / Return Modal State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [statusCustody, setStatusCustody] = useState('');
  const [statusHandoverLoc, setStatusHandoverLoc] = useState('');
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  // Delete Confirm Dialog State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Claim Modal State
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimExplanation, setClaimExplanation] = useState('');
  const [claimIdentifiers, setClaimIdentifiers] = useState('');
  const [claimFiles, setClaimFiles] = useState([]);
  const [claimPreviews, setClaimPreviews] = useState([]);
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState('');
  const [claimError, setClaimError] = useState('');

  // Contact Modal State
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitting, setContactSubmitting] = useState(false);

  // Report Abuse Modal State
  const [abuseModalOpen, setAbuseModalOpen] = useState(false);

  useEffect(() => {
    const fetchItemDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await itemAPI.getItemById(id);
        if (res.data?.success && res.data?.item) {
          setItem(res.data.item);
          setIsOwner(res.data.isOwner);
          setHasActiveClaim(res.data.hasActiveClaim);
          setActiveClaimId(res.data.activeClaimId);
          setClaimStatus(res.data.claimStatus);
          setApprovedConversationId(res.data.approvedConversationId);
          setNewStatus(res.data.item.status);
          setStatusCustody(res.data.item.custodyDetails || '');
          if (res.data.item.images && res.data.item.images.length > 0) {
            setSelectedImage(res.data.item.images[0]);
          }

          // Fetch matches for this item
          itemAPI
            .getItemMatches(id)
            .then((mRes) => {
              if (mRes.data?.matches) setMatches(mRes.data.matches);
            })
            .catch(() => {});
        }
      } catch (err) {
        setError(err.message || 'Item details could not be retrieved.');
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [id]);

  // Handle Item Status Update (including "Mark as Returned")
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setStatusSubmitting(true);
    try {
      const res = await itemAPI.updateItemStatus(id, {
        status: newStatus,
        note: statusNote,
        custodyDetails: statusCustody,
        handoverLocation: statusHandoverLoc,
      });
      if (res.data?.item) {
        setItem(res.data.item);
        setStatusModalOpen(false);
        setStatusNote('');
        setStatusHandoverLoc('');
      }
    } catch (err) {
      alert(err.message || 'Failed to update status');
    } finally {
      setStatusSubmitting(false);
    }
  };

  // Quick action: Mark directly as returned
  const openReturnModal = () => {
    setNewStatus('returned');
    setStatusCustody('returned_to_owner');
    setStatusNote('Item successfully returned to verified owner after safe campus handover.');
    setStatusHandoverLoc('Campus Security Desk / Lost Property Office');
    setStatusModalOpen(true);
  };

  // Handle Item Deletion
  const handleDeleteItem = async () => {
    setDeleteLoading(true);
    try {
      await itemAPI.deleteItem(id);
      navigate('/my-reports');
    } catch (err) {
      alert(err.message || 'Failed to delete report');
      setDeleteLoading(false);
      setDeleteModalOpen(false);
    }
  };

  // Handle Claim Submission
  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: `/items/${id}` } });
      return;
    }

    if (!claimExplanation.trim() || claimExplanation.trim().length < 10) {
      setClaimError('Please provide an ownership explanation with at least 10 characters.');
      return;
    }

    setClaimSubmitting(true);
    setClaimError('');
    try {
      const formData = new FormData();
      formData.append('explanation', claimExplanation.trim());
      formData.append('secretIdentifiers', claimIdentifiers.trim());
      claimFiles.forEach((file) => {
        formData.append('evidence', file);
      });

      const res = await itemAPI.submitClaim(id, formData);
      if (res.data?.success) {
        setClaimSuccess('Claim submitted successfully! The manager/administrator will verify your proof.');
        setHasActiveClaim(true);
        setActiveClaimId(res.data.claim._id);
        setTimeout(() => {
          setClaimModalOpen(false);
          setClaimSuccess('');
          setClaimExplanation('');
          setClaimIdentifiers('');
          setClaimFiles([]);
          setClaimPreviews([]);
          navigate(`/claims/${res.data.claim._id}`);
        }, 1500);
      }
    } catch (err) {
      setClaimError(err.message || 'Failed to submit claim.');
    } finally {
      setClaimSubmitting(false);
    }
  };

  // Handle Contact Initiation
  const handleStartConversation = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: `/items/${id}` } });
      return;
    }
    if (!contactMessage.trim()) return;

    setContactSubmitting(true);
    try {
      const res = await conversationAPI.createOrGetConversation({
        itemId: item._id,
        recipientId: item.owner._id,
        initialMessage: contactMessage.trim(),
        subject: `Regarding: ${item.title}`,
      });
      if (res.data?.conversation) {
        setContactModalOpen(false);
        navigate('/conversations');
      }
    } catch (err) {
      alert(err.message || 'Failed to initiate conversation');
    } finally {
      setContactSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading item specifications..." />;
  }

  if (error || !item) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">Report Not Available</h2>
        <p className="text-xs text-slate-500 mt-2">{error || 'Item listing was not found or was removed.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-5 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm"
        >
          Return to Previous Page
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Listings
        </button>

        {/* Action Buttons based on User Context */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mark as Returned Button (Available for owner, admin, or verified) */}
          {(isOwner || user?.role === 'admin') && item.status !== 'returned' && (
            <button
              type="button"
              onClick={openReturnModal}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Mark as Returned
            </button>
          )}

          {isOwner ? (
            <>
              <button
                type="button"
                onClick={() => setStatusModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
              >
                Update Lifecycle Status
              </button>
              <Link
                to={`/items/${item._id}/edit`}
                className="inline-flex items-center px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                <Edit className="w-3.5 h-3.5 mr-1.5" />
                Edit
              </Link>
              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                title="Delete Listing"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              {item.type === 'found' && (
                <>
                  {hasActiveClaim ? (
                    <Link
                      to={`/claims/${activeClaimId}`}
                      className="inline-flex items-center px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-xl transition shadow-sm"
                    >
                      <ShieldCheck className="w-4 h-4 mr-1.5 text-indigo-600" />
                      View Your Active Claim
                    </Link>
                  ) : item.status !== 'returned' ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (!user) {
                          navigate('/login', { state: { from: `/items/${id}` } });
                        } else {
                          setClaimModalOpen(true);
                        }
                      }}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-500/20 transition"
                    >
                      <ShieldCheck className="w-4 h-4 mr-1.5" />
                      Claim Ownership
                    </button>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      Returned to Owner
                    </span>
                  )}
                </>
              )}

              {item.type === 'found' && (
                claimStatus === 'approved' ? (
                  <Link
                    to="/conversations"
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
                  >
                    <MessageSquare className="w-4 h-4 mr-1.5" />
                    Chat with Finder
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (!user) {
                        navigate('/login', { state: { from: `/items/${id}` } });
                      } else if (!hasActiveClaim) {
                        setClaimModalOpen(true);
                      } else {
                        navigate(`/claims/${activeClaimId}`);
                      }
                    }}
                    className="inline-flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                    title="Claim verification required before private chat"
                  >
                    <Lock className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                    {hasActiveClaim ? 'Chat Locked (Under Review)' : 'Chat Locked (Claim Required)'}
                  </button>
                )
              )}

              <button
                type="button"
                onClick={() => setAbuseModalOpen(true)}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition"
                title="Report Inappropriate Listing"
              >
                <Flag className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Claim Status & Verification State Banners */}
      {claimStatus === 'approved' && (
        <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-200 rounded-3xl p-6 sm:p-7 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Ownership Verified & Approved by Manager
                </span>
                <h2 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                  Full Found-Item Report & In-App Handover Chat Unlocked!
                </h2>
                <p className="text-xs text-slate-600">
                  The campus administration has verified your proof of ownership. You can now chat privately with the finder to coordinate safe physical return on campus.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/conversations"
                className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                <MessageSquare className="w-4 h-4 mr-1.5" />
                Open In-App Chat with Finder
              </Link>
              {item.status !== 'returned' && (
                <button
                  type="button"
                  onClick={openReturnModal}
                  className="inline-flex items-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Mark as Returned
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {(claimStatus === 'pending' || claimStatus === 'under_review') && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Clock3 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                Claim Awaiting Manager Verification
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-1">
                Your proof of ownership is under administrator review
              </h3>
              <p className="text-xs text-slate-600">
                Campus administration verifies serial numbers and purchase receipts to prevent wrongful handovers. Once approved, the private in-app messaging system will unlock.
              </p>
            </div>
          </div>

          <Link
            to={`/claims/${activeClaimId}`}
            className="inline-flex items-center px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition whitespace-nowrap self-start sm:self-auto"
          >
            <ShieldCheck className="w-4 h-4 mr-1.5" />
            View Submitted Proof
          </Link>
        </div>
      )}

      {item.type === 'found' && !isOwner && !hasActiveClaim && item.status !== 'returned' && (
        <div className="bg-blue-50/70 border border-blue-200 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full">
                Found Item Verification Process
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-1">
                Is this your lost belonging?
              </h3>
              <p className="text-xs text-slate-600">
                Submit an ownership claim with photos or distinguishing details. Once the manager verifies your claim, private in-app chat is unlocked to arrange safe return.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!user) {
                navigate('/login', { state: { from: `/items/${id}` } });
              } else {
                setClaimModalOpen(true);
              }
            }}
            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition whitespace-nowrap self-start sm:self-auto"
          >
            <ShieldCheck className="w-4 h-4 mr-1.5" />
            Claim Ownership Now
          </button>
        </div>
      )}

      {item.status === 'returned' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 flex items-center space-x-3 text-emerald-800 text-xs font-bold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>This item has been officially marked as RETURNED to its owner. The reconnection is complete!</span>
        </div>
      )}

      {/* Main Grid: Left Photos & Right Item Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (5 cols): Photo Gallery */}
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-[4/3] rounded-3xl bg-slate-100 overflow-hidden border border-slate-200 shadow-sm relative">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <ImageIcon className="w-12 h-12 mb-2 opacity-40" />
                <span className="text-xs">No photograph provided</span>
              </div>
            )}

            {/* Badges Overlay */}
            <div className="absolute top-4 left-4">
              <span
                className={`px-3 py-1 text-xs font-black uppercase tracking-wider rounded-full shadow-sm ${
                  item.type === 'lost' ? 'bg-rose-500 text-white' : 'bg-blue-600 text-white'
                }`}
              >
                {item.type} Report
              </span>
            </div>
            <div className="absolute top-4 right-4">
              <StatusBadge status={item.status} size="sm" />
            </div>
          </div>

          {/* Thumbnails row */}
          {item.images && item.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {item.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition ${
                    selectedImage === img
                      ? 'border-blue-600 ring-2 ring-blue-200'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Custody Info Card (for Found Items) */}
          {item.type === 'found' && (
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 space-y-2">
              <div className="flex items-center space-x-2 text-blue-900 font-bold text-xs">
                <Building className="w-4 h-4 text-blue-600" />
                <span>Safekeeping Custody:</span>
                <span className="text-slate-700 font-medium">
                  {formatCustodyLabel(item.custodyDetails)}
                </span>
              </div>
              {item.custodyNotes && (
                <p className="text-xs text-slate-600 pl-6">{item.custodyNotes}</p>
              )}
            </div>
          )}
        </div>

        {/* Right Column (7 cols): Full Item Specifications */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div>
              <div className="flex items-center text-xs font-bold text-blue-600 space-x-2 mb-2">
                <span className="flex items-center">
                  <Tag className="w-3.5 h-3.5 mr-1 text-blue-500" />
                  {item.category}
                </span>
                {item.brand && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 font-normal">{item.brand}</span>
                  </>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {item.title}
              </h1>
              <p className="text-xs text-slate-400 mt-1">Listing Reference: #{item._id}</p>
            </div>

            {/* Key Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-y border-slate-100 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  {item.type === 'lost' ? 'Last Seen Location' : 'Discovered Location'}
                </span>
                <p className="flex items-center font-semibold text-slate-800">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-blue-600 flex-shrink-0" />
                  {item.locationDescription}
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  Incident Date & Time
                </span>
                <p className="flex items-center font-semibold text-slate-800">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400 flex-shrink-0" />
                  {formatDate(item.incidentDate)}
                  {item.incidentTime && ` • ${item.incidentTime}`}
                </p>
              </div>

              {item.color && (
                <div className="space-y-1">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                    Color / Hue
                  </span>
                  <p className="font-semibold text-slate-800">{item.color}</p>
                </div>
              )}

              {item.distinguishingFeatures && (
                <div className="space-y-1">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                    Distinguishing Markings
                  </span>
                  <p className="font-semibold text-slate-800">{item.distinguishingFeatures}</p>
                </div>
              )}
            </div>

            {/* Comprehensive Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Full Description
              </h3>
              <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Circumstances or Travel Route */}
            {(item.circumstances || item.travelRoute) && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
                {item.circumstances && (
                  <p>
                    <span className="font-bold text-slate-700">Circumstances: </span>
                    <span className="text-slate-600">{item.circumstances}</span>
                  </p>
                )}
                {item.travelRoute && (
                  <p>
                    <span className="font-bold text-slate-700">Travel Route on Campus: </span>
                    <span className="text-slate-600">{item.travelRoute}</span>
                  </p>
                )}
              </div>
            )}

            {/* Reporter Attribution */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {item.owner?.avatar ? (
                  <img
                    src={item.owner.avatar}
                    alt={item.owner.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                    {item.owner?.name?.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Reported by {item.owner?.name || 'Community Member'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Community member since {formatDate(item.owner?.createdAt)}
                  </p>
                </div>
              </div>

              <span className="text-[11px] text-slate-400 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {formatTimeAgo(item.createdAt)}
              </span>
            </div>
          </div>

          {/* Status Lifecycle & Handover Audit Trail */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Item Lifecycle & Handover History
            </h3>
            {item.history && item.history.length > 0 ? (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {item.history.map((entry, idx) => (
                  <div key={idx} className="relative group">
                    <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <StatusBadge status={entry.toStatus} size="xs" />
                        <span className="text-[11px] text-slate-400">
                          {formatTimeAgo(entry.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 font-medium">{entry.note}</p>
                      {entry.handoverLocation && (
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center font-medium">
                          <MapPin className="w-3 h-3 mr-1 text-blue-600" />
                          Handover location: {entry.handoverLocation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No status transitions recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Candidate Matches Section for this specific item */}
      {matches.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Smart Cross-Matches Detected ({matches.length})
              </h3>
              <p className="text-xs text-slate-500">
                Our algorithm compared category, brand, keywords, colors, and timestamps.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {matches.map((m, idx) => (
              <MatchCard key={idx} match={m} layout="vertical" />
            ))}
          </div>
        </div>
      )}

      {/* Status Update / Mark Returned Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Item Lifecycle Status"
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Lifecycle Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="lost">Lost</option>
              <option value="found">Found</option>
              <option value="handed_over">Handed Over to Custody</option>
              <option value="returned">Returned to Rightful Owner</option>
              <option value="closed">Closed / Inactive</option>
            </select>
          </div>

          {newStatus === 'returned' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Handover Location / Meeting Spot
              </label>
              <input
                type="text"
                value={statusHandoverLoc}
                onChange={(e) => setStatusHandoverLoc(e.target.value)}
                placeholder="e.g. Campus Security Desk, Student Union Info Desk"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Transition Note
            </label>
            <textarea
              rows={3}
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="e.g. Verified claimant student ID and handed over item at library desk..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setStatusModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={statusSubmitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {statusSubmitting ? 'Saving...' : 'Confirm Status Update'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Claim Ownership Modal */}
      <Modal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        title="Submit Ownership Claim"
      >
        <form onSubmit={handleSubmitClaim} className="space-y-4">
          <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-900 space-y-1">
            <p className="font-bold flex items-center">
              <Lock className="w-3.5 h-3.5 mr-1 text-indigo-600" />
              Confidential Ownership Verification
            </p>
            <p className="text-[11px] text-indigo-700">
              Your explanation, secret serial numbers, and uploaded proofs are kept confidential and
              only reviewed by campus administrators and the finder.
            </p>
          </div>

          {claimError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {claimError}
            </div>
          )}

          {claimSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
              {claimSuccess}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Statement of Ownership <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={claimExplanation}
              onChange={(e) => setClaimExplanation(e.target.value)}
              placeholder="Describe how and when you lost this item, including unique details only the owner would know..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Secret Identifiers / Private Clues
            </label>
            <input
              type="text"
              value={claimIdentifiers}
              onChange={(e) => setClaimIdentifiers(e.target.value)}
              placeholder="e.g. Serial #SN98241, sticker on bottom left, wallpaper is a dog"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Supporting Proof Documents / Receipts / Photos
            </label>
            <ImageUploader
              files={claimFiles}
              setFiles={setClaimFiles}
              previews={claimPreviews}
              setPreviews={setClaimPreviews}
              maxFiles={4}
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setClaimModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={claimSubmitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {claimSubmitting ? 'Submitting Proof...' : 'Submit Claim for Review'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Contact Finder / Reporter Modal */}
      <Modal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        title={`Message ${item.type === 'found' ? 'Finder' : 'Reporter'}`}
      >
        <form onSubmit={handleStartConversation} className="space-y-4">
          <p className="text-xs text-slate-500">
            Send an in-app message regarding "{item.title}". Your personal phone number and email
            remain private.
          </p>

          <div>
            <textarea
              rows={4}
              required
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder="Hi, I saw your listing for this item and would like to ask..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setContactModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={contactSubmitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {contactSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteItem}
        title="Delete Item Report?"
        message="Are you sure you want to permanently delete this report? This cannot be undone."
        confirmText="Delete Report"
        isDanger={true}
        loading={deleteLoading}
      />

      {/* Report Abuse Modal */}
      <ReportAbuseModal
        isOpen={abuseModalOpen}
        onClose={() => setAbuseModalOpen(false)}
        itemId={item._id}
        itemTitle={item.title}
      />
    </div>
  );
};

export default ItemDetailsPage;
