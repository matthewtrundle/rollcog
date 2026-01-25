"use client";

/**
 * @fileoverview Admin dashboard main page
 * @module app/admin/page
 */

import { useEffect, useState, type ReactElement } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import StatsCard from "@/components/admin/StatsCard";
import TrafficChart from "@/components/admin/TrafficChart";
import WebVitalsGauge from "@/components/admin/WebVitalsGauge";

interface DashboardStats {
  leads: {
    total: number;
    thisWeek: number;
    byStatus: Record<string, number>;
    bySource: Record<string, number>;
  };
  traffic: {
    pageviews: number;
    pageviewsChange: number;
    sessions: number;
    sessionsChange: number;
    avgLcp: number;
    lcpRating: "good" | "needs-improvement" | "poor";
  };
  trafficOverTime: Array<{
    date: string;
    pageviews: number;
    sessions: number;
  }>;
  webVitals: Array<{
    name: "LCP" | "FID" | "CLS" | "TTFB" | "INP" | "FCP";
    value: number;
    rating: "good" | "needs-improvement" | "poor";
  }>;
  topPages: Array<{
    path: string;
    pageviews: number;
    percentage: number;
  }>;
  recentLeads: Array<{
    id: number;
    name: string;
    email: string;
    service: string | null;
    created_at: string;
  }>;
  countriesTraffic: Array<{
    country: string;
    pageviews: number;
    percentage: number;
  }>;
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function LoadingSkeleton(): ReactElement {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-800 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-96 bg-gray-800 rounded-2xl" />
        <div className="h-96 bg-gray-800 rounded-2xl" />
      </div>
    </div>
  );
}

export default function AdminDashboardPage(): ReactElement {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats(): Promise<void> {
      try {
        const response = await fetch("/api/admin/stats");
        if (!response.ok) throw new Error("Failed to fetch stats");
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return <div />;

  const lcpStatus = stats.traffic.lcpRating === "good" ? "good" : stats.traffic.lcpRating === "needs-improvement" ? "warning" : "bad";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <span className="text-sm text-gray-500">
          Showing data for last 30 days
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Leads"
          value={stats.leads.total}
          change={stats.leads.thisWeek}
          changeLabel="this week"
          delay={0}
          icon={
            <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatsCard
          title="Pageviews"
          value={stats.traffic.pageviews}
          change={stats.traffic.pageviewsChange}
          changeLabel="vs prev 30d"
          delay={100}
          icon={
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          }
        />
        <StatsCard
          title="Sessions"
          value={stats.traffic.sessions}
          change={stats.traffic.sessionsChange}
          changeLabel="vs prev 30d"
          delay={200}
          icon={
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatsCard
          title="Avg LCP"
          value={stats.traffic.avgLcp / 1000}
          format="time"
          suffix="s"
          status={lcpStatus}
          delay={300}
          icon={
            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Traffic Chart */}
        <div className="lg:col-span-2">
          <TrafficChart data={stats.trafficOverTime} title="Traffic Over Time (30 days)" />
        </div>

        {/* Top Pages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Top Pages</h3>
          <div className="space-y-3">
            {stats.topPages.slice(0, 5).map((page, index) => (
              <div key={page.path} className="flex items-center gap-3">
                <span className="text-gray-500 text-sm w-4">{index + 1}.</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{page.path || "/"}</p>
                  <div className="h-1.5 bg-gray-700 rounded-full mt-1 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${page.percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                      className="h-full bg-orange-500 rounded-full"
                    />
                  </div>
                </div>
                <span className="text-gray-400 text-sm">{page.percentage}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Web Vitals and Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <WebVitalsGauge vitals={stats.webVitals} />

        {/* Recent Leads */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Leads</h3>
            <Link
              href="/admin/leads"
              className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recentLeads.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No leads yet</p>
            ) : (
              stats.recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-3 bg-gray-700/50 rounded-xl"
                >
                  <div className="min-w-0">
                    <p className="text-white font-medium truncate">{lead.name}</p>
                    <p className="text-gray-400 text-sm truncate">{lead.email}</p>
                  </div>
                  <div className="text-right ml-4">
                    {lead.service && (
                      <span className="inline-block px-2 py-1 text-xs bg-gray-600 text-gray-300 rounded-full mb-1">
                        {lead.service.replace(/-/g, " ")}
                      </span>
                    )}
                    <p className="text-gray-500 text-xs">{getTimeAgo(lead.created_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Traffic by Country and Lead Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic by Country */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Traffic by Country</h3>
          <div className="space-y-3">
            {stats.countriesTraffic.slice(0, 5).map((country, index) => (
              <div key={country.country} className="flex items-center gap-3">
                <span className="text-gray-400 text-sm w-12 uppercase">{country.country}</span>
                <div className="flex-1">
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${country.percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                      className="h-full bg-blue-500 rounded-full"
                    />
                  </div>
                </div>
                <span className="text-gray-400 text-sm w-12 text-right">{country.percentage}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Lead Sources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Lead Sources</h3>
          <div className="space-y-3">
            {Object.entries(stats.leads.bySource).length === 0 ? (
              <p className="text-gray-400 text-center py-8">No lead sources yet</p>
            ) : (
              Object.entries(stats.leads.bySource)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([source, count], index) => {
                  const total = Object.values(stats.leads.bySource).reduce((a, b) => a + b, 0);
                  const percentage = Math.round((count / total) * 100);
                  return (
                    <div key={source} className="flex items-center gap-3">
                      <span className="text-gray-400 text-sm w-24 truncate capitalize">
                        {source.replace(/-/g, " ")}
                      </span>
                      <div className="flex-1">
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, delay: 0.7 + index * 0.1 }}
                            className="h-full bg-purple-500 rounded-full"
                          />
                        </div>
                      </div>
                      <span className="text-gray-400 text-sm w-12 text-right">{percentage}%</span>
                    </div>
                  );
                })
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
