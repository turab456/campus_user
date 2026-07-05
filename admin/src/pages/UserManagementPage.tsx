import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { adminApi } from '../services/adminApi';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { ScoreIndicator } from '../components/ScoreIndicator';
import { Alert } from '../components/Alert';
import { Flag, Trash2, CheckCircle } from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'delete' | 'flag' | 'unflag' | null>(null);
  const [reason, setReason] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await adminApi.getAllUsers(page, 10);
        setUsers(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page]);

  const handleAction = async () => {
    if (!selectedUser || !actionType) return;

    try {
      if (actionType === 'delete') {
        await adminApi.deleteUser(selectedUser._id, reason);
        setUsers(users.filter(u => u._id !== selectedUser._id));
      } else if (actionType === 'flag') {
        await adminApi.flagUser(selectedUser._id, reason);
        selectedUser.flagged = true;
      } else if (actionType === 'unflag') {
        await adminApi.unflagUser(selectedUser._id);
        selectedUser.flagged = false;
      }
      setShowActionModal(false);
      setReason('');
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Action failed');
    }
  };

  const openActionModal = (user: User, type: 'delete' | 'flag' | 'unflag') => {
    setSelectedUser(user);
    setActionType(type);
    setShowActionModal(true);
  };



  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">Manage users, approve registrations, and handle fraud.</p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Users List</h2>
            <div className="text-sm text-gray-600">
              Page {page} | Total: {users.length}
            </div>
          </div>
        </div>

        <DataTable
          columns={[
            {
              key: 'name',
              label: 'Name',
              render: (_, user) => (
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              )
            },
            {
              key: 'college',
              label: 'College',
              render: (val) => val || '-'
            },
            {
              key: 'rating',
              label: 'Rating',
              render: (val) => `${val}/5.0`
            },
            {
              key: 'isVerified',
              label: 'Verified',
              render: (val) => (
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  val ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {val ? 'Yes' : 'Pending'}
                </span>
              )
            }
          ]}
          data={users}
          loading={loading}
          onRowClick={(user) => {
            setSelectedUser(user);
            setShowDetailModal(true);
          }}
          emptyMessage="No users found"
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
        title={`User Details: ${selectedUser?.name}`}
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
            {selectedUser && (
              <>
                {selectedUser.flagged ? (
                  <button
                    onClick={() => openActionModal(selectedUser, 'unflag')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <CheckCircle size={18} /> Unflag User
                  </button>
                ) : (
                  <button
                    onClick={() => openActionModal(selectedUser, 'flag')}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
                  >
                    <Flag size={18} /> Flag User
                  </button>
                )}
                <button
                  onClick={() => openActionModal(selectedUser, 'delete')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <Trash2 size={18} /> Delete User
                </button>
              </>
            )}
          </>
        }
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-semibold text-gray-900">{selectedUser.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">College</p>
                <p className="font-semibold text-gray-900">{selectedUser.college || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="font-semibold text-gray-900">{selectedUser.department || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Rating</p>
                <p className="font-semibold text-gray-900">{selectedUser.rating}/5.0</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Reviews</p>
                <p className="font-semibold text-gray-900">{selectedUser.reviewsCount}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ScoreIndicator score={selectedUser.spamScore} label="Spam Score" />
              <ScoreIndicator score={selectedUser.scamScore} label="Scam Score" />
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Status</p>
              <div className="space-y-2">
                <p className={`text-sm px-3 py-2 rounded-lg ${
                  selectedUser.isVerified ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'
                }`}>
                  Email: {selectedUser.isVerified ? 'Verified' : 'Pending Verification'}
                </p>
                <p className={`text-sm px-3 py-2 rounded-lg ${
                  selectedUser.flagged ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'
                }`}>
                  {selectedUser.flagged ? 'Flagged for Review' : 'No Issues'}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Action Modal */}
      <Modal
        isOpen={showActionModal}
        title={`${actionType === 'delete' ? 'Delete User' : actionType === 'flag' ? 'Flag User' : 'Unflag User'}`}
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
                actionType === 'delete' ? 'bg-red-600 hover:bg-red-700' :
                'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Confirm
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {actionType === 'delete' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-medium">
                ⚠️ This will permanently delete the user and all their data.
              </p>
            </div>
          )}

          {(actionType === 'delete' || actionType === 'flag') && (
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

          {actionType === 'unflag' && (
            <p className="text-sm text-gray-600">
              This user will be removed from the flagged list.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};
