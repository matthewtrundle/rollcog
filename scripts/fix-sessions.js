const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_Z0imEJMuwa6K@ep-summer-cell-ahy5cyze-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    console.log('Creating synthetic sessions from broken pageview data...\n');

    const pageviews = await pool.query(
      `SELECT id, href, referrer, country, timestamp
       FROM analytics_pageviews
       WHERE session_id = '0' OR session_id IS NULL
       ORDER BY timestamp ASC`
    );
    console.log(`Found ${pageviews.rows.length} pageviews to process`);

    // Group into sessions based on 30-min gaps
    let sessions = [];
    let currentSession = null;
    let counter = 0;

    for (const pv of pageviews.rows) {
      const ts = new Date(pv.timestamp).getTime();

      if (!currentSession || ts - currentSession.lastTs > 30 * 60 * 1000) {
        if (currentSession) sessions.push(currentSession);
        counter++;
        currentSession = {
          id: 'bf-' + Date.now() + '-' + counter,
          firstPage: pv.href,
          referrer: pv.referrer,
          country: pv.country,
          startedAt: pv.timestamp,
          lastTs: ts,
          pvs: [pv]
        };
      } else {
        currentSession.lastTs = ts;
        currentSession.pvs.push(pv);
      }
    }
    if (currentSession) sessions.push(currentSession);

    console.log(`Created ${sessions.length} synthetic sessions\n`);

    let journeyCount = 0;

    for (const s of sessions) {
      let path = s.firstPage;
      let src = null;

      try {
        const u = new URL(s.firstPage);
        path = u.pathname;
        src = u.searchParams.get('source') || u.searchParams.get('utm_source');
        if (u.searchParams.get('gclid')) src = src || 'google';
      } catch {}

      // Insert session
      await pool.query(
        `INSERT INTO analytics_sessions
         (session_id, first_page, entry_referrer, utm_source, device_type, country, started_at, last_activity_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (session_id) DO NOTHING`,
        [s.id, path, s.referrer, src, 'desktop', s.country, s.startedAt, new Date(s.lastTs)]
      );

      // Insert journey - session start
      let step = 1;
      await pool.query(
        `INSERT INTO analytics_user_journeys
         (session_id, step_number, event_type, page_path, event_name, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [s.id, step++, 'session', path, 'session_start', s.startedAt]
      );
      journeyCount++;

      // Insert journey - page views
      for (const pv of s.pvs) {
        let pp = pv.href;
        try { pp = new URL(pv.href).pathname; } catch {}

        await pool.query(
          `INSERT INTO analytics_user_journeys
           (session_id, step_number, event_type, page_path, event_name, timestamp)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [s.id, step++, 'pageview', pp, 'page_view', pv.timestamp]
        );
        journeyCount++;

        // Update original pageview with new session_id
        await pool.query(
          'UPDATE analytics_pageviews SET session_id = $1 WHERE id = $2',
          [s.id, pv.id]
        );
      }
    }

    console.log(`Created ${journeyCount} journey events\n`);

    // Final summary
    const r = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE started_at >= NOW() - INTERVAL '24 hours') as last_24h,
        COUNT(*) FILTER (WHERE started_at >= NOW() - INTERVAL '7 days') as last_7d
      FROM analytics_sessions
    `);
    console.log('Sessions summary:', r.rows[0]);

  } catch (e) {
    console.error('Error:', e);
  }

  await pool.end();
}

run();
