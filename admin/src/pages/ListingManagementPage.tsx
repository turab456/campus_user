import React, { useEffect, useState } from 'react';
import { Listing } from '../types';
import { adminApi } from '../services/adminApi';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { ScoreIndicator } from '../components/ScoreIndicator';
import { Alert } from '../components/Alert';
import { Trash2, CheckCircle, XCircle } from 'lucide-react';

export const ListingManagementPage: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'delete' | null>(null);
  const [reason, setReason] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const response = await adminApi.getAllListings(page, 10);
        setListings(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load listings');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [page]);

  const handleAction = async () => {
    if (!selectedListing || !actionType) return;

    try {
      if (actionType === 'approve') {
        await adminApi.approveListing(selectedListing._id);
      } else if (actionType === 'reject') {
        await adminApi.rejectListing(selectedListing._id, reason);
      } else if (actionType === 'delete') {
        await adminApi.deleteListing(selectedListing._id, reason);
        setListings(listings.filter(l => l._id !== selectedListing._id));
      }
      setShowActionModal(false);
      setReason('');
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Action failed');
    }
  };

  const openActionModal = (listing: Listing, type: 'approve' | 'reject' | 'delete') => {
    setSelectedListing(listing);
    setActionType(type);
    setShowActionModal(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Listing Management</h1>
        <p className="text-gray-600 mt-1">Review and approve listings. Detect fraud and suspicious items.</p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Listings</h2>
        </div>

        <DataTable
          columns={[
            {
              key: 'title',
              label: 'Title',
              render: (_, listing) => (
                <div>
                  <p className="font-medium">{listing.title}</p>
                  <p className="text-xs text-gray-500">by {listing.seller?.name || 'Unknown'}</p>
                </div>
              )
            },
            {
              key: 'price',
              label: 'Price',
              render: (val) => `$${val}`
            },
            {
              key: 'condition',
              label: 'Condition'
            },
            {
              key: 'fraudScore',
              label: 'Fraud Risk',
              render: (score) => (
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  score >= 70 ? 'bg-red-100 text-red-800' :
                  score >= 40 ? 'bg-orange-100 text-orange-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {score}/100
                </span>
              )
            }
          ]}
          data={listings}
          loading={loading}
          onRowClick={(listing) => {
            setSelectedListing(listing);
            setShowDetailModal(true);
          }}
          emptyMessage="No listings found"
        />
      </div>

      {/* Pagination */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => setPage(p => p + 1)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          Next
        </button>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        title={`Listing: ${selectedListing?.title}`}
        onClose={() => setShowDetailModal(false)}
        size="lg"
        footer={
          <>
            <button
              onClick={() => setShowDetailModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
            {selectedListing && (
              <>
                <button
                  onClick={() => openActionModal(selectedListing, 'approve')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <CheckCircle size={18} /> Approve
                </button>
                <button
                  onClick={() => openActionModal(selectedListing, 'reject')}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
                >
                  <XCircle size={18} /> Reject
                </button>
                <button
                  onClick={() => openActionModal(selectedListing, 'delete')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <Trash2 size={18} /> Delete
                </button>
              </>
            )}
          </>
        }
      >
        {selectedListing && (
          <div className="space-y-6">
            {/* Images */}
            {selectedListing.images && selectedListing.images.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Images</p>
                <div className="grid grid-cols-4 gap-2">
                  {selectedListing.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Item ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Price</p>
                <p className="font-semibold text-gray-900">${selectedListing.price}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Condition</p>
                <p className="font-semibold text-gray-900">{selectedListing.condition}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Seller</p>
                <p className="font-semibold text-gray-900">{selectedListing.seller?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <p className="font-semibold text-gray-900">{selectedListing.category}</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Description</p>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                {selectedListing.description}
              </p>
            </div>

            {/* Fraud Score */}
            <ScoreIndicator
              score={selectedListing.fraudScore}
              label="Fraud Risk Score"
              showReasons={[
                selectedListing.images?.length === 0 ? 'No images provided' : '',
                selectedListing.description?.length < 50 ? 'Short description' : '',
              ].filter(Boolean)}
            />
          </div>
        )}
      </Modal>

      {/* Action Modal */}
      <Modal
        isOpen={showActionModal}
        title={`${actionType === 'approve' ? 'Approve' : actionType === 'reject' ? 'Reject' : 'Delete'} Listing`}
        onClose={() => setShowActionModal(false)}
        footer={
          <>
            <button
              onClick={() => setShowActionModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAction}
              className={`px-4 py-2 text-white rounded-lg ${
                actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                actionType === 'delete' ? 'bg-red-600 hover:bg-red-700' :
                'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              Confirm
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {(actionType === 'reject' || actionType === 'delete') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for this action..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>
          )}
          {actionType === 'approve' && (
            <p className="text-sm text-gray-600">
              This listing will be approved and made visible to all users.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};
