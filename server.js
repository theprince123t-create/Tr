import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

// Simple health-check
app.get("/", (_req, res) => res.send("OK"));

// Proxy endpoint: /proxy?url=<encoded cricheroes json url>
app.get("/proxy", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "missing url param" });

    // security: allow only cricheroes next-data json
    const ok = /^https:\/\/cricheroes\.com\/_next\/data\/.+\.json$/i.test(url);
    if (!ok) return res.status(400).json({ error: "invalid source" });

    const upstream = await fetch(url, {
      headers: { "user-agent": "Mozilla/5.0" }
    });

    const text = await upstream.text();
    res.set("content-type", upstream.headers.get("content-type") || "application/json");
    res.set("cache-control", "no-store");
    return res.status(upstream.status).send(text);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "proxy failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`proxy running on :${PORT}`));
