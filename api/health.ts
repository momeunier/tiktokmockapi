import { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  console.log(`\n=== Health Check Hit at ${new Date().toISOString()} ===`);
  console.log("Environment:", process.env.VERCEL_ENV);
  console.log("Region:", process.env.VERCEL_REGION);
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("Headers:", JSON.stringify(req.headers, null, 2));

  res.setHeader("Content-Type", "application/json");
  return res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: process.env.VERCEL_ENV,
    region: process.env.VERCEL_REGION,
  });
}
