import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/adminApi';
import { DataTable } from '../components/DataTable';
import { ScoreIndicator } from '../components/ScoreIndicator';
import { Alert } from '../components/Alert';
import { Modal } from '../components/Modal';
import { AlertTriangle, ExternalLink } from 'lucide-react';

interface FraudReport {
  _id: string;
  itemId: string;
  itemType: 'user' | 'listing';
  reason: string;
  score: number;
  createdAt: string;
}

export const FraudDetectionPage: React.FC = () => {
  const [reports, setReports] = useState<FraudReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedReport, setSelectedReport] = useState<FraudReport | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await adminApi.getFraudReports(page, 10);
        setReports(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load fraud reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Fraud Detection</h1>
        <p className="text-gray-600 mt-1">Monitor suspicious activities and fraudulent users/listings.</p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Fraud Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-600">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="text-red-600" size={24} />
            <h3 className="text-lg font-bold text-gray-900">High Risk</h3>
          </div>
          <p className="text-3xl font-bold text-red-600">
            {reports.filter(r => r.score >= 70).length}
          </p>
          <p className="text-sm text-gray-600 mt-1">Items with score ≥ 70</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-600">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="text-orange-600" size={24} />
            <h3 className="text-lg font-bold text-gray-900">Medium Risk</h3>
          </div>
          <p className="text-3xl font-bold text-orange-600">
            {reports.filter(r => r.score >= 40 && r.score < 70).length}
          </p>
          <p className="text-sm text-gray-600 mt-1">Items with score 40-69</p>
        </div>
      </div>

      {/* Fraud Reports Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Fraud Reports</h2>
        </div>

        <DataTable
          columns={[
            {
              key: 'itemType',
              label: 'Type',
              render: (val) => (
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  {val === 'user' ? 'User' : 'Listing'}
                </span>
              )
            },
            {
              key: 'reason',
              label: 'Reason',
              render: (val) => <div className="max-w-xs truncate">{val}</div>
            },
            {
              key: 'score',
              label: 'Risk Score',
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
          data={reports}
          loading={loading}
          onRowClick={(report) => {
            setSelectedReport(report);
            setShowDetailModal(true);
          }}
          emptyMessage="No fraud reports found"
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
        title="Fraud Report Details"
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
            <a
              href={
                selectedReport?.itemType === 'user'
                  ? `/admin/users`
                  : `/admin/listings`
              }
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <ExternalLink size={18} /> View Item
            </a>
          </>
        }
      >
        {selectedReport && (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 font-medium">
                ⚠️ This item has been flagged for fraudulent activity
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Item Type</p>
                <p className="font-semibold text-gray-900">
                  {selectedReport.itemType === 'user' ? 'User Account' : 'Listing'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Item ID</p>
                <p className="font-mono text-gray-900 text-xs break-all">
                  {selectedReport.itemId}
                </p>
              </div>
            </div>

            <ScoreIndicator
              score={selectedReport.score}
              label="Fraud Risk Score"
            />

            <div>
              <p className="text-sm text-gray-600 mb-2">Reason</p>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                {selectedReport.reason}
              </p>
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
    </div>
  );
};
