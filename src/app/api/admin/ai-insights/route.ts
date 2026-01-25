/**
 * @fileoverview AI Insights API with streaming response
 * @module app/api/admin/ai-insights/route
 *
 * Uses OpenRouter to generate marketing insights from analytics data.
 */

import { NextResponse } from "next/server";
import { query, getLeadStats } from "@/lib/db";

/**
 * POST /api/admin/ai-insights - Generate AI insights from dashboard data
 */
export async function POST(): Promise<Response> {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 500 }
      );
    }

    // Gather data for analysis
    const [leadStats, pageviewsResult, vitalsResult, topPagesResult, countryResult] = await Promise.all([
      getLeadStats(),
      query<{ count: string }>(
        `SELECT COUNT(*) as count FROM analytics_pageviews
         WHERE timestamp >= NOW() - INTERVAL '30 days'`
      ),
      query<{ metric_name: string; avg_value: string; rating: string }>(
        `SELECT metric_name, AVG(metric_value) as avg_value,
                MODE() WITHIN GROUP (ORDER BY metric_rating) as rating
         FROM analytics_web_vitals
         WHERE timestamp >= NOW() - INTERVAL '30 days'
         GROUP BY metric_name`
      ),
      query<{ href: string; count: string }>(
        `SELECT href, COUNT(*) as count
         FROM analytics_pageviews
         WHERE timestamp >= NOW() - INTERVAL '30 days'
         GROUP BY href
         ORDER BY count DESC
         LIMIT 5`
      ),
      query<{ country: string; count: string }>(
        `SELECT COALESCE(country, 'Unknown') as country, COUNT(*) as count
         FROM analytics_pageviews
         WHERE timestamp >= NOW() - INTERVAL '30 days'
         GROUP BY country
         ORDER BY count DESC
         LIMIT 5`
      ),
    ]);

    const pageviews = parseInt(pageviewsResult.rows[0]?.count || "0", 10);
    const sessionsResult = await query<{ count: string }>(
      `SELECT COUNT(DISTINCT session_id) as count FROM analytics_pageviews
       WHERE timestamp >= NOW() - INTERVAL '30 days'`
    );
    const sessions = parseInt(sessionsResult.rows[0]?.count || "0", 10);

    // Format web vitals
    const vitals = vitalsResult.rows.reduce((acc, row) => {
      acc[row.metric_name] = {
        value: parseFloat(row.avg_value),
        rating: row.rating,
      };
      return acc;
    }, {} as Record<string, { value: number; rating: string }>);

    // Format top pages
    const topPages = topPagesResult.rows.map((row) => {
      let path = "/";
      try {
        const url = new URL(row.href, "https://rollcog.com");
        path = url.pathname;
      } catch {
        path = row.href;
      }
      return { path, count: parseInt(row.count, 10) };
    });

    // Format countries
    const countries = countryResult.rows.map((row) => ({
      country: row.country,
      count: parseInt(row.count, 10),
    }));

    // Build the prompt
    const prompt = `You are a marketing analytics expert analyzing website data for a commercial roofing company. Provide actionable insights.

DATA:
- Pageviews (30 days): ${pageviews.toLocaleString()}
- Unique sessions: ${sessions.toLocaleString()}
- New leads this week: ${leadStats.thisWeek}
- Total leads: ${leadStats.total}
- Top pages: ${topPages.map((p) => `${p.path} (${p.count} views)`).join(", ")}
- Lead sources: ${Object.entries(leadStats.bySource).map(([k, v]) => `${k}: ${v}`).join(", ") || "No data yet"}
- Web Vitals: LCP ${vitals.LCP ? `${(vitals.LCP.value / 1000).toFixed(2)}s (${vitals.LCP.rating})` : "N/A"}, FID ${vitals.FID ? `${vitals.FID.value.toFixed(0)}ms (${vitals.FID.rating})` : "N/A"}, CLS ${vitals.CLS ? `${vitals.CLS.value.toFixed(3)} (${vitals.CLS.rating})` : "N/A"}
- Traffic by country: ${countries.map((c) => `${c.country}: ${c.count}`).join(", ")}

PROVIDE:
1. **Key Wins** - What's working well (2-3 points)
2. **Areas of Concern** - What needs attention (2-3 points)
3. **Recommendations** - Specific actions to take (3-4 points)
4. **Insight of the Week** - One surprising finding from the data

Use specific numbers. Be concise but impactful. Format with markdown.`;

    // Call OpenRouter with streaming
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://rollcogroofing.com",
        "X-Title": "Rollcog Admin Dashboard",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: [{ role: "user", content: prompt }],
        stream: true,
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenRouter error:", error);
      throw new Error("AI service error");
    }

    // Transform the response to a readable stream
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(encoder.encode(content));
                  }
                } catch {
                  // Ignore parse errors for incomplete chunks
                }
              }
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("AI Insights error:", error);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}
