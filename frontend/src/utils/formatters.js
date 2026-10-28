export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  return formatDate(dateString);
};

export const formatStatusLabel = (status) => {
  switch (status) {
    case 'lost':
      return 'Lost';
    case 'found':
      return 'Found';
    case 'handed_over':
      return 'Handed Over';
    case 'returned':
      return 'Returned to Owner';
    case 'closed':
      return 'Closed';
    case 'pending':
      return 'Pending Review';
    case 'under_review':
      return 'Under Review';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'withdrawn':
      return 'Withdrawn';
    default:
      return status?.replace('_', ' ') || '';
  }
};

export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'lost':
    case 'rejected':
      return 'bg-rose-50 text-rose-700 border border-rose-200/80';
    case 'found':
      return 'bg-blue-50 text-blue-700 border border-blue-200/80';
    case 'handed_over':
    case 'returned':
    case 'approved':
      return 'bg-teal-50 text-teal-700 border border-teal-200/80';
    case 'under_review':
    case 'pending':
      return 'bg-blue-50 text-blue-700 border border-blue-200/80';
    case 'closed':
    case 'withdrawn':
    default:
      return 'bg-slate-100 text-slate-600 border border-slate-200';
  }
};

export const formatCustodyLabel = (custody) => {
  switch (custody) {
    case 'still_with_finder':
      return 'With Finder';
    case 'reception_or_security':
      return 'Handed to Reception / Security Desk';
    case 'lost_property_office':
      return 'Authorized Lost Property Office';
    case 'returned_to_owner':
      return 'Returned to Verified Owner';
    default:
      return 'Not Specified';
  }
};
