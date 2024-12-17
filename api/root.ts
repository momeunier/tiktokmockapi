import { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  console.log(`\n=== Root Hit at ${new Date().toISOString()} ===`);
  res.setHeader("Content-Type", "application/json");
  return res.status(200).json({
    message: "TikTok Mock API Server",
    endpoints: {
      health: "/health",
      mockTikTok: "/open_api/v1.3/creative/report/get",
    },
  });
}
