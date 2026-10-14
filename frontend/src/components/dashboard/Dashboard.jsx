import React, { useEffect, useState } from "react";
import StatsCard from "./StatsCard";
import ActivityFeed from "./ActivityFeed";
import api from "../../services/api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    jobs: { this_week: 0, this_month: 0 },
    applications: { this_week: 0, this_month: 0 },
    shortlisted: 0,
    interviewing: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    const loadStats = async () => {
      try {
        const response = await api.get("/users/dashboard-stats/");
        if (isCurrent) setStats(response.data);
      } catch (error) {
        if (isCurrent) {
          setStatsError("Dashboard statistics could not be loaded.");
          console.error("Failed to load dashboard statistics:", error);
        }
      } finally {
        if (isCurrent) setStatsLoading(false);
      }
    };

    loadStats();
    return () => {
      isCurrent = false;
    };
  }, []);

  const [activities] = useState([
    {
      id: 1,
      message: 'Searching LinkedIn for "Senior React Engineer"...',
      time: "2 min ago",
      type: "search",
    },
    {
      id: 2,
      message: "Parsing job description for Stripe — Staff Engineer",
      time: "15 min ago",
      type: "parse",
    },
    {
      id: 3,
      message: "Tailoring resume for Vercel — DX Engineer",
      time: "1 hour ago",
      type: "tailor",
    },
    {
      id: 4,
      message: "Submitted application to Google — Frontend Developer",
      time: "3 hours ago",
      type: "submit",
    },
  ]);

  return (
    <div className="space-y-6 bg-black text-white p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      </div>

      {statsError && (
        <p className="text-sm text-red-400" role="alert">{statsError}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          title="Jobs Found This Week"
          value={statsLoading ? "..." : stats.jobs.this_week}
          applications="jobs"
        />
        <StatsCard
          title="Jobs Found This Month"
          value={statsLoading ? "..." : stats.jobs.this_month}
          applications="jobs"
        />
        <StatsCard
          title="Applied This Week"
          value={statsLoading ? "..." : stats.applications.this_week}
          applications="applications"
        />
        <StatsCard
          title="Applied This Month"
          value={statsLoading ? "..." : stats.applications.this_month}
          applications="applications"
        />
        <StatsCard
          title="Shortlisted"
          value={statsLoading ? "..." : stats.shortlisted}
          applications="saved jobs"
        />
        <StatsCard
          title="Interviewing"
          value={statsLoading ? "..." : stats.interviewing}
          applications="applications"
        />
      </div>

      {/* Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-black ">
        <div className="lg:col-span-2">
          <div className="bg-black-600 rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              AI Live Feed
            </h2>
            <ActivityFeed activities={activities} />
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-black-600 rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition">
                Start Auto-Apply
              </button>
              <button className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition">
                View Applications
              </button>
              <button className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition">
                Upload Resume
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


