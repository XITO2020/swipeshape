import type { NextApiResponse } from "next";

export function sendSuccess(res: NextApiResponse, data: any) {
  res.status(200).json({ success: true, data });
}

export function sendError(res: NextApiResponse, message: string, status = 400) {
  res.status(status).json({ success: false, error: message });
}
