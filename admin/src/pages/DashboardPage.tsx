import React, { useEffect, useState } from 'react';
import { StatCard } from '../components/StatCard';
import { ScoreIndicator } from '../components/ScoreIndicator';
import { Alert } from '../components/Alert';
import { adminApi } from '../services/adminApi';
import { Dashboard as DashboardType } from '../types';
import {
  Users, Package, MessageSquare, AlertTriangle,
  TrendingUp, Activity
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<DashboardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await adminApi.getDashboard();
        setDashboard(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your overview.</p>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          label="Total Users"
          value={dashboard?.totalUsers || 0}
          icon={<Users />}
          color="blue"
        />
        <StatCard
          label="Total Listings"
          value={dashboard?.totalListings || 0}
          icon={<Package />}
          color="green"
        />
        <StatCard
          label="Total Messages"
          value={dashboard?.totalMessages || 0}
          icon={<MessageSquare />}
          color="purple"
        />
        <StatCard
          label="Flagged Users"
          value={dashboard?.flaggedUsers || 0}
          icon={<AlertTriangle />}
          color="red"
        />
        <StatCard
          label="Flagged Listings"
          value={dashboard?.flaggedListings || 0}
          icon={<TrendingUp />}
          color="yellow"
        />
        <StatCard
          label="Spam Reports"
          value={dashboard?.flaggedMessages || 0}
          icon={<Activity />}
          color="red"
        />
      </div>

      {/* Recent High Risk Users */}
      {dashboard?.highRiskUsers && dashboard.highRiskUsers.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">High Risk Users</h2>
          <div className="space-y-4">
            {dashboard.highRiskUsers.slice(0, 5).map((user) => (
              <div key={user._id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                    HIGH RISK
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <ScoreIndicator score={user.spamScore} label="Spam Score" />
                  <ScoreIndicator score={user.scamScore} label="Scam Score" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Spam Reports */}
      {dashboard?.recentSpamReports && dashboard.recentSpamReports.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Spam Reports</h2>
          <div className="space-y-3">
            {dashboard.recentSpamReports.slice(0, 5).map((report) => (
              <div key={report._id} className="flex items-start justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{report.reason}</p>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{report.text}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ml-2 ${
                  report.spamScore >= 70 ? 'bg-red-100 text-red-800' :
                  report.spamScore >= 40 ? 'bg-orange-100 text-orange-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {report.spamScore}/100
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
