const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_Z0imEJMuwa6K@ep-summer-cell-ahy5cyze-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function fix() {
  console.log('Fixing UTM data in existing sessions...\n');

  // Get sessions and their first pageview URLs
  const sessions = await pool.query(`
    SELECT DISTINCT ON (s.session_id)
      s.session_id,
      p.href
    FROM analytics_sessions s
    JOIN analytics_pageviews p ON p.session_id = s.session_id
    ORDER BY s.session_id, p.timestamp ASC
  `);

  let updated = 0;
  for (const row of sessions.rows) {
    try {
      const url = new URL(row.href);
      const utmSource = url.searchParams.get('utm_source');
      const utmMedium = url.searchParams.get('utm_medium');
      const utmCampaign = url.searchParams.get('utm_campaign');
      const utmTerm = url.searchParams.get('utm_term');
      const utmContent = url.searchParams.get('utm_content');
      const gclid = url.searchParams.get('gclid');

      // Determine actual source - prioritize utm_source over custom source param
      let source = utmSource;
      let medium = utmMedium;

      // If gclid present and no utm_source, it's Google Ads
      if (gclid && !source) {
        source = 'google';
        medium = medium || 'cpc';
      }

      if (source || medium || utmCampaign) {
        await pool.query(`
          UPDATE analytics_sessions
          SET utm_source = COALESCE($2, utm_source),
              utm_medium = COALESCE($3, utm_medium),
              utm_campaign = COALESCE($4, utm_campaign),
              utm_term = COALESCE($5, utm_term),
              utm_content = COALESCE($6, utm_content)
          WHERE session_id = $1
        `, [row.session_id, source, medium, utmCampaign, utmTerm, utmContent]);
        updated++;
      }
    } catch (e) {
      // Skip invalid URLs
    }
  }

  console.log('Updated', updated, 'sessions with correct UTM data\n');

  // Show results
  const result = await pool.query(`
    SELECT utm_source, utm_medium, COUNT(*) as count
    FROM analytics_sessions
    WHERE started_at >= NOW() - INTERVAL '7 days'
    GROUP BY utm_source, utm_medium
    ORDER BY count DESC
  `);
  console.log('UTM Sources (last 7 days):');
  result.rows.forEach(r => {
    console.log('  ' + (r.utm_source || 'direct') + ' / ' + (r.utm_medium || 'none') + ': ' + r.count);
  });

  await pool.end();
}

fix();
