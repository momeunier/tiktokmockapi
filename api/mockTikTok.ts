import { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Your mock TikTok endpoint logic here
  res.json({
    // your mock response
  });
}
