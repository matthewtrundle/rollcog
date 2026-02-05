/**
 * @fileoverview Analytics intelligence engine for pattern analysis
 * @module lib/analytics/intelligence-engine
 *
 * Provides sophisticated analysis of session data including:
 * - Funnel analysis
 * - Session quality scoring
 * - Anomaly detection
 * - Conversion path analysis
 * - Cohort comparison
 * - Content effectiveness ranking
 */

import type {
  SessionWithJourney,
  DailyRawData,
  BaselineMetrics,
  PageViewData,
} from "./data-extraction";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface FunnelStage {
  name: string;
  count: number;
  percentage: number;
  dropOffRate: number;
}

export interface FunnelAnalysis {
  stages: FunnelStage[];
  overallConversionRate: number;
  biggestDropOff: { stage: string; rate: number } | null;
  insights: string[];
}

export interface SessionQualityScore {
  sessionId: string;
  score: number; // 0-100
  factors: {
    pageDepth: number; // 0-25 points
    engagement: number; // 0-25 points
    timeSignals: number; // 0-25 points
    conversion: number; // 0-25 points
  };
  label: "low" | "medium" | "high" | "very_high";
  hasConversion: boolean;
  isHighIntent: boolean; // High score but no conversion
}

export interface AnomalyDetection {
  type: "traffic" | "conversion" | "referrer" | "page" | "behavior";
  severity: "info" | "warning" | "critical";
  metric: string;
  currentValue: number;
  expectedValue: number;
  deviation: number; // percentage deviation
  message: string;
}

export interface ConversionPathAnalysis {
  path: string;
  count: number;
  percentage: number;
  avgSteps: number;
  commonEntryPages: string[];
}

export interface CohortComparison {
  cohortName: string;
  sessions: number;
  avgPagesPerSession: number;
  avgQualityScore: number;
  conversionRate: number;
  topEntryPages: string[];
}

export interface ContentEffectiveness {
  page: string;
  views: number;
  conversionAssist: number; // % of conversions that visited this page
  bounceRate: number;
  avgTimeOnPage: number | null; // If available
  effectivenessScore: number;
  role: "entry" | "terminal" | "assist" | "bounce";
}

export interface HighIntentSession {
  sessionId: string;
  qualityScore: number;
  location: string | null;
  source: string;
  pagesViewed: number;
  lastPage: string | null;
  engagementEvents: string[];
  stoppedAt: string | null;
}

export interface AnalysisResults {
  funnel: FunnelAnalysis;
  sessionQuality: {
    scores: SessionQualityScore[];
    avgScore: number;
    distribution: { low: number; medium: number; high: number; very_high: number };
  };
  anomalies: AnomalyDetection[];
  conversionPaths: ConversionPathAnalysis[];
  cohorts: CohortComparison[];
  contentEffectiveness: ContentEffectiveness[];
  highIntentSessions: HighIntentSession[];
  summary: {
    totalSessions: number;
    totalConversions: number;
    conversionRate: number;
    vsYesterday: { sessions: number; conversions: number; rate: number };
    vsWeekAgo: { sessions: number; conversions: number; rate: number };
    vsBaseline: { sessions: number; conversions: number; rate: number };
  };
}

// =============================================================================
// FUNNEL ANALYSIS
// =============================================================================

/**
 * Analyze the conversion funnel: Landing -> Service Page -> Contact -> Conversion
 */
export function analyzeFunnel(sessions: SessionWithJourney[]): FunnelAnalysis {
  const stages: FunnelStage[] = [];
  const insights: string[] = [];

  // Define funnel stages based on journey events
  const totalSessions = sessions.length;

  // Stage 1: All sessions (landing)
  const landingCount = totalSessions;

  // Stage 2: Viewed a service page
  const servicePageSessions = sessions.filter((s) =>
    s.journey.some(
      (j) =>
        j.page?.includes("/services/") || j.name === "service_view"
    )
  );
  const serviceCount = servicePageSessions.length;

  // Stage 3: Reached contact/engaged with contact form
  const contactSessions = sessions.filter((s) =>
    s.journey.some(
      (j) =>
        j.page?.includes("/contact") ||
        j.name === "form_start" ||
        j.name === "contact_click"
    )
  );
  const contactCount = contactSessions.length;

  // Stage 4: Conversions
  const conversionCount = sessions.filter((s) => s.has_conversion).length;

  // Build stages
  if (totalSessions > 0) {
    stages.push({
      name: "Landing",
      count: landingCount,
      percentage: 100,
      dropOffRate: 0,
    });

    stages.push({
      name: "Service Page View",
      count: serviceCount,
      percentage: (serviceCount / landingCount) * 100,
      dropOffRate: ((landingCount - serviceCount) / landingCount) * 100,
    });

    stages.push({
      name: "Contact Engagement",
      count: contactCount,
      percentage: (contactCount / landingCount) * 100,
      dropOffRate:
        serviceCount > 0
          ? ((serviceCount - contactCount) / serviceCount) * 100
          : 0,
    });

    stages.push({
      name: "Conversion",
      count: conversionCount,
      percentage: (conversionCount / landingCount) * 100,
      dropOffRate:
        contactCount > 0
          ? ((contactCount - conversionCount) / contactCount) * 100
          : 0,
    });
  }

  // Find biggest drop-off
  let biggestDropOff: { stage: string; rate: number } | null = null;
  for (const stage of stages) {
    if (!biggestDropOff || stage.dropOffRate > biggestDropOff.rate) {
      if (stage.dropOffRate > 0) {
        biggestDropOff = { stage: stage.name, rate: stage.dropOffRate };
      }
    }
  }

  // Generate insights
  if (biggestDropOff && biggestDropOff.rate > 50) {
    insights.push(
      `Major drop-off at ${biggestDropOff.stage}: ${biggestDropOff.rate.toFixed(1)}% of users leave`
    );
  }

  if (serviceCount > 0 && contactCount / serviceCount < 0.1) {
    insights.push(
      "Service pages have low engagement - users may not be finding clear CTAs"
    );
  }

  if (contactCount > 0 && conversionCount / contactCount < 0.2) {
    insights.push(
      "Contact page has low form completion - consider reducing form friction"
    );
  }

  const overallConversionRate =
    totalSessions > 0 ? (conversionCount / totalSessions) * 100 : 0;

  return {
    stages,
    overallConversionRate,
    biggestDropOff,
    insights,
  };
}

// =============================================================================
// SESSION QUALITY SCORING
// =============================================================================

/**
 * Score session quality on a 0-100 scale
 */
export function scoreSessionQuality(
  session: SessionWithJourney
): SessionQualityScore {
  const factors = {
    pageDepth: 0,
    engagement: 0,
    timeSignals: 0,
    conversion: 0,
  };

  // Page depth scoring (0-25)
  // 1 page = 5, 2 = 10, 3 = 15, 4 = 20, 5+ = 25
  factors.pageDepth = Math.min(session.page_count * 5, 25);

  // Engagement scoring (0-25)
  // CTA clicks, scroll events, form interactions
  const engagementEvents = session.journey.filter(
    (j) =>
      j.name?.includes("click") ||
      j.name?.includes("scroll") ||
      j.name === "form_start" ||
      j.type === "engagement"
  );
  factors.engagement = Math.min(engagementEvents.length * 5, 25);

  // Time signals scoring (0-25)
  // Based on session duration and multiple page views
  const journeyDuration =
    session.journey.length >= 2
      ? new Date(session.journey[session.journey.length - 1].ts).getTime() -
        new Date(session.journey[0].ts).getTime()
      : 0;
  const durationMinutes = journeyDuration / (1000 * 60);

  if (durationMinutes > 5) factors.timeSignals = 25;
  else if (durationMinutes > 3) factors.timeSignals = 20;
  else if (durationMinutes > 1) factors.timeSignals = 15;
  else if (durationMinutes > 0.5) factors.timeSignals = 10;
  else factors.timeSignals = 5;

  // Conversion scoring (0-25)
  if (session.has_conversion) {
    factors.conversion = 25;
  } else {
    // Partial credit for conversion intent
    const hasFormStart = session.journey.some((j) => j.name === "form_start");
    const hasContactPage = session.journey.some((j) =>
      j.page?.includes("/contact")
    );
    const hasPhoneVisible = session.journey.some(
      (j) => j.name === "phone_visible"
    );

    if (hasFormStart) factors.conversion = 15;
    else if (hasContactPage) factors.conversion = 10;
    else if (hasPhoneVisible) factors.conversion = 5;
  }

  const score =
    factors.pageDepth +
    factors.engagement +
    factors.timeSignals +
    factors.conversion;

  let label: SessionQualityScore["label"];
  if (score >= 80) label = "very_high";
  else if (score >= 60) label = "high";
  else if (score >= 40) label = "medium";
  else label = "low";

  // High intent = score >= 60 but no conversion
  const isHighIntent = score >= 60 && !session.has_conversion;

  return {
    sessionId: session.session_id,
    score,
    factors,
    label,
    hasConversion: session.has_conversion,
    isHighIntent,
  };
}

/**
 * Batch score all sessions and return aggregate stats
 */
export function analyzeSessionQuality(sessions: SessionWithJourney[]): {
  scores: SessionQualityScore[];
  avgScore: number;
  distribution: { low: number; medium: number; high: number; very_high: number };
} {
  const scores = sessions.map(scoreSessionQuality);

  const avgScore =
    scores.length > 0
      ? scores.reduce((sum, s) => sum + s.score, 0) / scores.length
      : 0;

  const distribution = {
    low: scores.filter((s) => s.label === "low").length,
    medium: scores.filter((s) => s.label === "medium").length,
    high: scores.filter((s) => s.label === "high").length,
    very_high: scores.filter((s) => s.label === "very_high").length,
  };

  return { scores, avgScore, distribution };
}

// =============================================================================
// ANOMALY DETECTION
// =============================================================================

/**
 * Detect anomalies comparing today vs baselines
 */
export function detectAnomalies(
  todaySessions: SessionWithJourney[],
  yesterdaySessions: SessionWithJourney[],
  weekAgoSessions: SessionWithJourney[],
  baseline: BaselineMetrics
): AnomalyDetection[] {
  const anomalies: AnomalyDetection[] = [];

  const todaySessionCount = todaySessions.length;
  const todayConversions = todaySessions.filter((s) => s.has_conversion).length;
  const todayConversionRate =
    todaySessionCount > 0 ? (todayConversions / todaySessionCount) * 100 : 0;

  const yesterdayCount = yesterdaySessions.length;
  const weekAgoCount = weekAgoSessions.length;

  // Traffic anomaly - compare to baseline
  if (baseline.avg_daily_sessions > 0) {
    const trafficDeviation =
      ((todaySessionCount - baseline.avg_daily_sessions) /
        baseline.avg_daily_sessions) *
      100;

    if (Math.abs(trafficDeviation) > 50) {
      anomalies.push({
        type: "traffic",
        severity: Math.abs(trafficDeviation) > 75 ? "critical" : "warning",
        metric: "Daily Sessions",
        currentValue: todaySessionCount,
        expectedValue: baseline.avg_daily_sessions,
        deviation: trafficDeviation,
        message:
          trafficDeviation > 0
            ? `Traffic spike: ${todaySessionCount} sessions (${trafficDeviation.toFixed(0)}% above average)`
            : `Traffic drop: ${todaySessionCount} sessions (${Math.abs(trafficDeviation).toFixed(0)}% below average)`,
      });
    }
  }

  // Conversion rate anomaly
  if (baseline.avg_conversion_rate > 0) {
    const conversionDeviation =
      ((todayConversionRate - baseline.avg_conversion_rate) /
        baseline.avg_conversion_rate) *
      100;

    if (Math.abs(conversionDeviation) > 30) {
      anomalies.push({
        type: "conversion",
        severity: conversionDeviation < -50 ? "critical" : "warning",
        metric: "Conversion Rate",
        currentValue: todayConversionRate,
        expectedValue: baseline.avg_conversion_rate,
        deviation: conversionDeviation,
        message:
          conversionDeviation > 0
            ? `Conversion rate up: ${todayConversionRate.toFixed(1)}% (${conversionDeviation.toFixed(0)}% above average)`
            : `Conversion rate down: ${todayConversionRate.toFixed(1)}% (${Math.abs(conversionDeviation).toFixed(0)}% below average)`,
      });
    }
  }

  // Day-over-day comparison
  if (yesterdayCount > 0) {
    const dodDeviation =
      ((todaySessionCount - yesterdayCount) / yesterdayCount) * 100;
    if (Math.abs(dodDeviation) > 40) {
      anomalies.push({
        type: "traffic",
        severity: "info",
        metric: "Day-over-Day Sessions",
        currentValue: todaySessionCount,
        expectedValue: yesterdayCount,
        deviation: dodDeviation,
        message:
          dodDeviation > 0
            ? `Sessions up ${dodDeviation.toFixed(0)}% vs yesterday`
            : `Sessions down ${Math.abs(dodDeviation).toFixed(0)}% vs yesterday`,
      });
    }
  }

  // Week-over-week comparison
  if (weekAgoCount > 0) {
    const wowDeviation =
      ((todaySessionCount - weekAgoCount) / weekAgoCount) * 100;
    if (Math.abs(wowDeviation) > 50) {
      anomalies.push({
        type: "traffic",
        severity: "info",
        metric: "Week-over-Week Sessions",
        currentValue: todaySessionCount,
        expectedValue: weekAgoCount,
        deviation: wowDeviation,
        message:
          wowDeviation > 0
            ? `Sessions up ${wowDeviation.toFixed(0)}% vs same day last week`
            : `Sessions down ${Math.abs(wowDeviation).toFixed(0)}% vs same day last week`,
      });
    }
  }

  // New referrer sources
  const todayReferrers = new Set(
    todaySessions
      .map((s) => s.entry_referrer)
      .filter((r) => r && !r.includes("rollcog"))
  );
  const baselineReferrers = new Set([
    ...yesterdaySessions.map((s) => s.entry_referrer),
    ...weekAgoSessions.map((s) => s.entry_referrer),
  ]);

  const newReferrers = [...todayReferrers].filter(
    (r) => r && !baselineReferrers.has(r)
  );
  if (newReferrers.length > 0) {
    anomalies.push({
      type: "referrer",
      severity: "info",
      metric: "New Traffic Sources",
      currentValue: newReferrers.length,
      expectedValue: 0,
      deviation: 100,
      message: `New referrer${newReferrers.length > 1 ? "s" : ""} detected: ${newReferrers.slice(0, 3).join(", ")}`,
    });
  }

  return anomalies;
}

// =============================================================================
// CONVERSION PATH ANALYSIS
// =============================================================================

/**
 * Analyze the most common paths to conversion
 */
export function analyzeConversionPaths(
  sessions: SessionWithJourney[]
): ConversionPathAnalysis[] {
  const convertedSessions = sessions.filter((s) => s.has_conversion);
  const pathCounts: Map<
    string,
    { count: number; steps: number[]; entryPages: string[] }
  > = new Map();

  for (const session of convertedSessions) {
    // Build path from page views and key events
    const pathSteps: string[] = [];

    for (const step of session.journey) {
      if (step.page) {
        // Simplify page path for grouping
        let simplifiedPath = step.page;
        if (step.page.includes("/services/")) {
          simplifiedPath = "Service Page";
        } else if (step.page === "/" || step.page === "") {
          simplifiedPath = "Home";
        } else if (step.page.includes("/contact")) {
          simplifiedPath = "Contact";
        } else if (step.page.includes("/about")) {
          simplifiedPath = "About";
        } else if (step.page.includes("/blog") || step.page.includes("/insights")) {
          simplifiedPath = "Blog";
        }
        pathSteps.push(simplifiedPath);
      } else if (step.name === "form_submit" || step.name === "phone_click") {
        pathSteps.push("CONVERT");
      }
    }

    // Deduplicate consecutive same pages
    const deduped = pathSteps.filter(
      (step, i) => i === 0 || step !== pathSteps[i - 1]
    );
    const pathKey = deduped.join(" -> ");

    const existing = pathCounts.get(pathKey);
    if (existing) {
      existing.count++;
      existing.steps.push(deduped.length);
      if (session.first_page) {
        existing.entryPages.push(session.first_page);
      }
    } else {
      pathCounts.set(pathKey, {
        count: 1,
        steps: [deduped.length],
        entryPages: session.first_page ? [session.first_page] : [],
      });
    }
  }

  // Convert to array and sort
  const totalConverted = convertedSessions.length;
  const paths: ConversionPathAnalysis[] = [];

  for (const [path, data] of pathCounts) {
    const avgSteps =
      data.steps.reduce((a, b) => a + b, 0) / data.steps.length;

    // Find most common entry pages
    const entryPageCounts = new Map<string, number>();
    for (const ep of data.entryPages) {
      entryPageCounts.set(ep, (entryPageCounts.get(ep) || 0) + 1);
    }
    const commonEntryPages = [...entryPageCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([page]) => page);

    paths.push({
      path,
      count: data.count,
      percentage: totalConverted > 0 ? (data.count / totalConverted) * 100 : 0,
      avgSteps,
      commonEntryPages,
    });
  }

  return paths.sort((a, b) => b.count - a.count).slice(0, 10);
}

// =============================================================================
// COHORT COMPARISON
// =============================================================================

/**
 * Compare behavior by traffic source cohorts
 */
export function compareCohorts(
  sessions: SessionWithJourney[],
  qualityScores: SessionQualityScore[]
): CohortComparison[] {
  // Group sessions by traffic source
  const cohorts: Map<
    string,
    {
      sessions: SessionWithJourney[];
      scores: SessionQualityScore[];
    }
  > = new Map();

  const scoreMap = new Map(qualityScores.map((s) => [s.sessionId, s]));

  for (const session of sessions) {
    const cohortName = session.utm_source || "Direct";
    const existing = cohorts.get(cohortName);
    const score = scoreMap.get(session.session_id);

    if (existing) {
      existing.sessions.push(session);
      if (score) existing.scores.push(score);
    } else {
      cohorts.set(cohortName, {
        sessions: [session],
        scores: score ? [score] : [],
      });
    }
  }

  // Calculate metrics for each cohort
  const results: CohortComparison[] = [];

  for (const [name, data] of cohorts) {
    const { sessions: cohortSessions, scores } = data;
    const sessionCount = cohortSessions.length;
    const conversions = cohortSessions.filter((s) => s.has_conversion).length;

    const avgPages =
      sessionCount > 0
        ? cohortSessions.reduce((sum, s) => sum + s.page_count, 0) / sessionCount
        : 0;

    const avgQuality =
      scores.length > 0
        ? scores.reduce((sum, s) => sum + s.score, 0) / scores.length
        : 0;

    // Find top entry pages
    const entryPageCounts = new Map<string, number>();
    for (const s of cohortSessions) {
      if (s.first_page) {
        entryPageCounts.set(
          s.first_page,
          (entryPageCounts.get(s.first_page) || 0) + 1
        );
      }
    }
    const topEntryPages = [...entryPageCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([page]) => page);

    results.push({
      cohortName: name,
      sessions: sessionCount,
      avgPagesPerSession: Math.round(avgPages * 10) / 10,
      avgQualityScore: Math.round(avgQuality),
      conversionRate:
        sessionCount > 0 ? (conversions / sessionCount) * 100 : 0,
      topEntryPages,
    });
  }

  return results.sort((a, b) => b.sessions - a.sessions);
}

// =============================================================================
// CONTENT EFFECTIVENESS
// =============================================================================

/**
 * Rank content by effectiveness at driving conversions
 */
export function rankContent(
  sessions: SessionWithJourney[],
  topPages: PageViewData[]
): ContentEffectiveness[] {
  const convertedSessions = sessions.filter((s) => s.has_conversion);
  const totalConversions = convertedSessions.length;

  const results: ContentEffectiveness[] = [];

  for (const page of topPages) {
    // Count how many conversions visited this page
    const conversionsWithPage = convertedSessions.filter((s) =>
      s.journey.some((j) => j.page === page.href)
    ).length;

    // Calculate bounce rate (single page sessions)
    const sessionsOnPage = sessions.filter((s) =>
      s.journey.some((j) => j.page === page.href)
    );
    const bouncedSessions = sessionsOnPage.filter(
      (s) => s.page_count === 1
    ).length;
    const bounceRate =
      sessionsOnPage.length > 0
        ? (bouncedSessions / sessionsOnPage.length) * 100
        : 0;

    // Determine page role
    let role: ContentEffectiveness["role"] = "assist";
    const isEntryPage = sessions.filter(
      (s) => s.first_page === page.href
    ).length;
    const entryRate =
      sessionsOnPage.length > 0
        ? (isEntryPage / sessionsOnPage.length) * 100
        : 0;

    if (page.href.includes("/contact")) {
      role = "terminal";
    } else if (bounceRate > 70) {
      role = "bounce";
    } else if (entryRate > 50) {
      role = "entry";
    }

    // Calculate effectiveness score
    const conversionAssist =
      totalConversions > 0 ? (conversionsWithPage / totalConversions) * 100 : 0;
    const effectivenessScore = Math.round(
      conversionAssist * 0.6 + (100 - bounceRate) * 0.4
    );

    results.push({
      page: page.href,
      views: page.views,
      conversionAssist,
      bounceRate,
      avgTimeOnPage: null, // Would need additional tracking
      effectivenessScore,
      role,
    });
  }

  return results.sort((a, b) => b.effectivenessScore - a.effectivenessScore);
}

// =============================================================================
// HIGH INTENT SESSION IDENTIFICATION
// =============================================================================

/**
 * Identify high-intent sessions that didn't convert
 */
export function identifyHighIntentSessions(
  sessions: SessionWithJourney[],
  qualityScores: SessionQualityScore[]
): HighIntentSession[] {
  const scoreMap = new Map(qualityScores.map((s) => [s.sessionId, s]));

  const highIntentSessions: HighIntentSession[] = [];

  for (const session of sessions) {
    const score = scoreMap.get(session.session_id);
    if (!score || !score.isHighIntent) continue;

    // Get engagement events
    const engagementEvents = session.journey
      .filter(
        (j) =>
          j.name?.includes("click") ||
          j.name === "form_start" ||
          j.name?.includes("scroll")
      )
      .map((j) => j.name!)
      .filter((n, i, arr) => arr.indexOf(n) === i); // Unique

    // Find where they stopped
    const lastStep = session.journey[session.journey.length - 1];
    const stoppedAt = lastStep?.page || lastStep?.name || null;

    highIntentSessions.push({
      sessionId: session.session_id,
      qualityScore: score.score,
      location: session.country,
      source: session.utm_source || "Direct",
      pagesViewed: session.page_count,
      lastPage: session.journey.filter((j) => j.page).pop()?.page || null,
      engagementEvents,
      stoppedAt,
    });
  }

  return highIntentSessions
    .sort((a, b) => b.qualityScore - a.qualityScore)
    .slice(0, 10);
}

// =============================================================================
// MAIN ANALYSIS FUNCTION
// =============================================================================

/**
 * Run all analysis modules and return comprehensive results
 */
export function runFullAnalysis(rawData: DailyRawData): AnalysisResults {
  // Run session quality analysis first (needed by other modules)
  const qualityAnalysis = analyzeSessionQuality(rawData.sessions);

  // Run all other analyses
  const funnel = analyzeFunnel(rawData.sessions);
  const anomalies = detectAnomalies(
    rawData.sessions,
    rawData.yesterdayData,
    rawData.weekAgoData,
    rawData.monthBaseline
  );
  const conversionPaths = analyzeConversionPaths(rawData.sessions);
  const cohorts = compareCohorts(rawData.sessions, qualityAnalysis.scores);
  const contentEffectiveness = rankContent(rawData.sessions, rawData.topPages);
  const highIntentSessions = identifyHighIntentSessions(
    rawData.sessions,
    qualityAnalysis.scores
  );

  // Calculate summary metrics
  const todaySessions = rawData.sessions.length;
  const todayConversions = rawData.sessions.filter(
    (s) => s.has_conversion
  ).length;
  const todayRate =
    todaySessions > 0 ? (todayConversions / todaySessions) * 100 : 0;

  const yesterdaySessions = rawData.yesterdayData.length;
  const yesterdayConversions = rawData.yesterdayData.filter(
    (s) => s.has_conversion
  ).length;
  const yesterdayRate =
    yesterdaySessions > 0
      ? (yesterdayConversions / yesterdaySessions) * 100
      : 0;

  const weekAgoSessions = rawData.weekAgoData.length;
  const weekAgoConversions = rawData.weekAgoData.filter(
    (s) => s.has_conversion
  ).length;
  const weekAgoRate =
    weekAgoSessions > 0 ? (weekAgoConversions / weekAgoSessions) * 100 : 0;

  return {
    funnel,
    sessionQuality: qualityAnalysis,
    anomalies,
    conversionPaths,
    cohorts,
    contentEffectiveness,
    highIntentSessions,
    summary: {
      totalSessions: todaySessions,
      totalConversions: todayConversions,
      conversionRate: todayRate,
      vsYesterday: {
        sessions:
          yesterdaySessions > 0
            ? ((todaySessions - yesterdaySessions) / yesterdaySessions) * 100
            : 0,
        conversions:
          yesterdayConversions > 0
            ? ((todayConversions - yesterdayConversions) / yesterdayConversions) *
              100
            : 0,
        rate: todayRate - yesterdayRate,
      },
      vsWeekAgo: {
        sessions:
          weekAgoSessions > 0
            ? ((todaySessions - weekAgoSessions) / weekAgoSessions) * 100
            : 0,
        conversions:
          weekAgoConversions > 0
            ? ((todayConversions - weekAgoConversions) / weekAgoConversions) * 100
            : 0,
        rate: todayRate - weekAgoRate,
      },
      vsBaseline: {
        sessions:
          rawData.monthBaseline.avg_daily_sessions > 0
            ? ((todaySessions - rawData.monthBaseline.avg_daily_sessions) /
                rawData.monthBaseline.avg_daily_sessions) *
              100
            : 0,
        conversions:
          rawData.monthBaseline.avg_daily_conversions > 0
            ? ((todayConversions - rawData.monthBaseline.avg_daily_conversions) /
                rawData.monthBaseline.avg_daily_conversions) *
              100
            : 0,
        rate: todayRate - rawData.monthBaseline.avg_conversion_rate,
      },
    },
  };
}
