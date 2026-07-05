import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/adminApi';
import { DataTable } from '../components/DataTable';
import { ScoreIndicator } from '../components/ScoreIndicator';
import { Alert } from '../components/Alert';
import { Modal } from '../components/Modal';
import { Trash2, AlertTriangle } from 'lucide-react';


export const SpamDetectionPage: React.FC = () => {
  const [spamReports, setSpamReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await adminApi.getSpamReports(page, 10);
        setSpamReports(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load spam reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [page]);

  const handleDeleteMessage = async () => {
    if (!selectedReport) return;

    try {
      await adminApi.deleteMessage(selectedReport.messageId, deleteReason);
      setSpamReports(spamReports.filter(r => r._id !== selectedReport._id));
      setShowDeleteModal(false);
      setShowDetailModal(false);
      setDeleteReason('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete message');
    }
  };

  const highRiskCount = spamReports.filter(r => r.spamScore >= 70).length;
  const mediumRiskCount = spamReports.filter(r => r.spamScore >= 40 && r.spamScore < 70).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Spam & Scam Detection</h1>
        <p className="text-gray-600 mt-1">Monitor unwanted messages, spam, and scam attempts.</p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Risk Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-600">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="text-red-600" size={24} />
            <h3 className="text-lg font-bold text-gray-900">High Risk</h3>
          </div>
          <p className="text-3xl font-bold text-red-600">{highRiskCount}</p>
          <p className="text-sm text-gray-600 mt-1">Spam score ≥ 70</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-600">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="text-orange-600" size={24} />
            <h3 className="text-lg font-bold text-gray-900">Medium Risk</h3>
          </div>
          <p className="text-3xl font-bold text-orange-600">{mediumRiskCount}</p>
          <p className="text-sm text-gray-600 mt-1">Spam score 40-69</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="text-blue-600" size={24} />
            <h3 className="text-lg font-bold text-gray-900">Total Reports</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">{spamReports.length}</p>
          <p className="text-sm text-gray-600 mt-1">Spam messages reported</p>
        </div>
      </div>

      {/* Spam Reports Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Spam Messages</h2>
        </div>

        <DataTable
          columns={[
            {
              key: 'senderName',
              label: 'Reported User',
              render: (_, report) => (
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{report.senderName || 'Unknown User'}</div>
                  <div className="text-[10px] text-gray-500">{report.senderEmail || 'N/A'}</div>
                </div>
              )
            },
            {
              key: 'text',
              label: 'Details / Context',
              render: (_, report) => (
                <div className="max-w-xs truncate text-sm text-gray-700 font-mono">{report.text}</div>
              )
            },
            {
              key: 'reason',
              label: 'Report Reason',
              render: (val) => <div className="max-w-xs truncate text-sm text-gray-600">{val}</div>
            },
            {
              key: 'spamScore',
              label: 'Violation Score',
              render: (score) => (
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  score >= 70 ? 'bg-red-100 text-red-800' :
                  score >= 40 ? 'bg-orange-100 text-orange-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {score}/100
                </span>
              )
            },
            {
              key: 'createdAt',
              label: 'Reported',
              render: (val) => new Date(val).toLocaleDateString()
            }
          ]}
          data={spamReports}
          loading={loading}
          onRowClick={(report) => {
            setSelectedReport(report);
            setShowDetailModal(true);
          }}
          emptyMessage="No spam reports found"
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
        title="Spam Report Details"
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
            {selectedReport && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <Trash2 size={18} /> Delete Message
              </button>
            )}
          </>
        }
      >
        {selectedReport && (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 font-medium">
                ⚠️ This message has been reported as spam/scam
              </p>
            </div>

            <ScoreIndicator
              score={selectedReport.spamScore}
              label="Spam/Scam Score"
            />

            <div>
              <p className="text-sm text-gray-600 mb-2">Full Message</p>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap break-words">
                {selectedReport.text}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Report Reason</p>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                {selectedReport.reason}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Sender / Reported User</p>
              <p className="font-semibold text-gray-900">
                {selectedReport.senderName || 'Unknown'} ({selectedReport.senderEmail || 'N/A'})
              </p>
              <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {selectedReport.senderId}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Reported Date</p>
              <p className="font-semibold text-gray-900">
                {new Date(selectedReport.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        title="Delete Message"
        onClose={() => setShowDeleteModal(false)}
        footer={
          <>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteMessage}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete Message
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium">
              ⚠️ This will permanently delete the message.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Deletion
            </label>
            <textarea
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="Enter reason (spam, harassment, inappropriate content, etc.)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
