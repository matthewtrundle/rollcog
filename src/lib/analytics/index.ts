/**
 * @fileoverview Analytics module exports
 * @module lib/analytics
 *
 * Daily Analytics Intelligence System
 * - Extracts data from PostgreSQL
 * - Analyzes patterns, anomalies, and conversion paths
 * - Generates AI-powered insights via Claude
 */

// Data extraction
export {
  extractDailyRawData,
  extractSessionsWithJourneys,
  extractConversions,
  extractBaselineMetrics,
  extractTopPages,
  extractTrafficSources,
  extractPreviewData,
  getAnalysisPeriods,
  type DailyRawData,
  type SessionWithJourney,
  type JourneyEvent,
  type ConversionEvent,
  type BaselineMetrics,
  type PageViewData,
  type TrafficSourceData,
} from "./data-extraction";

// Intelligence engine
export {
  runFullAnalysis,
  analyzeFunnel,
  analyzeSessionQuality,
  scoreSessionQuality,
  detectAnomalies,
  analyzeConversionPaths,
  compareCohorts,
  rankContent,
  identifyHighIntentSessions,
  type AnalysisResults,
  type FunnelAnalysis,
  type SessionQualityScore,
  type AnomalyDetection,
  type ConversionPathAnalysis,
  type CohortComparison,
  type ContentEffectiveness,
  type HighIntentSession,
} from "./intelligence-engine";

// AI synthesis
export {
  generateIntelligenceReport,
  synthesizeInsights,
  testAISynthesis,
  type AIInsights,
  type IntelligenceReport,
} from "./ai-synthesis";

// Google Ads
export {
  extractGoogleAdsMetrics,
  testGoogleAdsConnection,
  type GoogleAdsMetrics,
  type CampaignMetrics,
} from "./google-ads";
