import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/adminApi';
import { DataTable } from '../components/DataTable';
import { ScoreIndicator } from '../components/ScoreIndicator';
import { Alert } from '../components/Alert';
import { Modal } from '../components/Modal';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface AppealTicket {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    spamScore: number;
    scamScore: number;
    blocked: boolean;
    flagged: boolean;
  } | null;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  adminComment?: string;
  resolvedAt?: string;
  createdAt: string;
}

export const ReconsiderationPage: React.FC = () => {
  const [tickets, setTickets] = useState<AppealTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [selectedTicket, setSelectedTicket] = useState<AppealTicket | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [adminComment, setAdminComment] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await adminApi.getReconsiderationTickets(page, 10, statusFilter);
      if (res.data && res.data.success) {
        setTickets(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch appeals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page, statusFilter]);

  const handleResolve = async (action: 'approve' | 'reject') => {
    if (!selectedTicket) return;
    setIsResolving(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await adminApi.resolveReconsiderationTicket(selectedTicket._id, action, adminComment.trim());
      if (res.data && res.data.success) {
        setSuccessMsg(`Appeal successfully ${action === 'approve' ? 'approved' : 'rejected'}.`);
        setShowDetailModal(false);
        setAdminComment('');
        setSelectedTicket(null);
        fetchTickets();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resolve appeal ticket.');
    } finally {
      setIsResolving(false);
    }
  };

  const pendingCount = tickets.filter(t => t.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reconsideration Appeals</h1>
        <p className="text-gray-600 mt-1">Review violation score appeals, clear scores, and restore user standing.</p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-yellow-500" size={24} />
            <h3 className="text-lg font-bold text-gray-900">Pending Review</h3>
          </div>
          <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
          <p className="text-sm text-gray-600 mt-1">Awaiting decision</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="text-green-600" size={24} />
            <h3 className="text-lg font-bold text-gray-900">Approved Appeals</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {tickets.filter(t => t.status === 'approved').length}
          </p>
          <p className="text-sm text-gray-600 mt-1">Violation scores cleared</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-600">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="text-red-600" size={24} />
            <h3 className="text-lg font-bold text-gray-900">Rejected Appeals</h3>
          </div>
          <p className="text-3xl font-bold text-red-600">
            {tickets.filter(t => t.status === 'rejected').length}
          </p>
          <p className="text-sm text-gray-600 mt-1">Appeals declined</p>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-bold text-gray-900">Appeals List</h2>
          <div className="flex gap-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((statusOption) => (
              <button
                key={statusOption}
                onClick={() => {
                  setStatusFilter(statusOption);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  statusFilter === statusOption
                    ? 'bg-blue-600 text-white border-blue-600 shadow'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {statusOption.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <DataTable
          columns={[
            {
              key: 'user',
              label: 'User Details',
              render: (_, ticket) => {
                if (!ticket.user) return <span className="text-gray-400 italic">Deleted User</span>;
                return (
                  <div>
                    <p className="font-semibold text-gray-900">{ticket.user.name}</p>
                    <p className="text-xs text-gray-500">{ticket.user.email}</p>
                  </div>
                );
              }
            },
            {
              key: 'reason',
              label: 'Appeal Reason',
              render: (val) => (
                <p className="truncate max-w-xs text-gray-600 italic">"{val}"</p>
              )
            },
            {
              key: 'userScores',
              label: 'Current Scores',
              render: (_, ticket) => {
                if (!ticket.user) return '-';
                return (
                  <div className="flex gap-4 text-xs font-medium text-gray-700">
                    <div>Spam: <span className="font-bold text-red-600">{ticket.user.spamScore}</span></div>
                    <div>Scam: <span className="font-bold text-red-600">{ticket.user.scamScore}</span></div>
                  </div>
                );
              }
            },
            {
              key: 'status',
              label: 'Status',
              render: (val) => (
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  val === 'approved' ? 'bg-green-100 text-green-800' :
                  val === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {val.toUpperCase()}
                </span>
              )
            },
            {
              key: 'createdAt',
              label: 'Submission Date',
              render: (val) => new Date(val).toLocaleDateString()
            }
          ]}
          data={tickets}
          loading={loading}
          onRowClick={(ticket) => {
            setSelectedTicket(ticket);
            setShowDetailModal(true);
          }}
          emptyMessage="No appeal tickets found."
        />
      </div>

      {/* Pagination */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 text-sm font-medium hover:bg-gray-50"
        >
          Previous
        </button>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={tickets.length < 10}
          className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 text-sm font-medium hover:bg-gray-50"
        >
          Next
        </button>
      </div>

      {/* Detail & Action Modal */}
      <Modal
        isOpen={showDetailModal}
        title={`Appeal Review — ${selectedTicket?.user?.name || 'User Appeal'}`}
        onClose={() => {
          setShowDetailModal(false);
          setAdminComment('');
        }}
        size="lg"
        footer={
          <>
            <button
              onClick={() => {
                setShowDetailModal(false);
                setAdminComment('');
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-semibold"
            >
              Close
            </button>
            {selectedTicket && selectedTicket.status === 'pending' && (
              <>
                <button
                  onClick={() => handleResolve('reject')}
                  disabled={isResolving}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm font-semibold disabled:opacity-50"
                >
                  <XCircle size={18} /> Decline Appeal
                </button>
                <button
                  onClick={() => handleResolve('approve')}
                  disabled={isResolving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm font-semibold disabled:opacity-50"
                >
                  <CheckCircle size={18} /> Approve & Clear Scores
                </button>
              </>
            )}
          </>
        }
      >
        {selectedTicket && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">User Email</p>
                <p className="font-semibold text-gray-900">{selectedTicket.user?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Appeal Submission Date</p>
                <p className="font-semibold text-gray-900">{new Date(selectedTicket.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {selectedTicket.user && (
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border">
                <ScoreIndicator score={selectedTicket.user.spamScore} label="Current Spam Score" />
                <ScoreIndicator score={selectedTicket.user.scamScore} label="Current Scam Score" />
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600 mb-1.5 font-semibold">User Appeal Statement:</p>
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm text-gray-800 italic leading-relaxed">
                "{selectedTicket.reason}"
              </div>
            </div>

            {selectedTicket.status === 'pending' ? (
              <div className="space-y-2">
                <label className="block text-sm text-gray-600 font-semibold">Review Decision Notes / Comments</label>
                <textarea
                  rows={3}
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  placeholder="Explain the approval or rejection decision (sent to user)..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm leading-relaxed"
                />
              </div>
            ) : (
              <div className="space-y-2 bg-gray-50 p-4 rounded-xl border">
                <p className="text-sm text-gray-600 font-semibold">Resolution Comments</p>
                <p className="text-sm text-gray-800 font-medium">
                  {selectedTicket.adminComment || <span className="text-gray-400 italic">No notes provided.</span>}
                </p>
                {selectedTicket.resolvedAt && (
                  <p className="text-[11px] text-gray-500 mt-2">
                    Resolved at: {new Date(selectedTicket.resolvedAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
