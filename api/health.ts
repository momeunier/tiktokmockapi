import { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  console.log("Health check endpoint hit");
  res.status(200).json({ status: "ok" });
}
