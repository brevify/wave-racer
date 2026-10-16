import type { Request, Response } from 'express';

// In-memory store for received feedback submissions during runtime
const feedbackLog: Array<{
  id: string;
  name: string;
  email: string;
  category: string;
  message: string;
  timestamp: string;
}> = [];

export default function handler(req: Request, res: Response) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'POST') {
    const { name, email, category, message } = req.body || {};

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'missing_message',
        message: 'Feedback message cannot be empty.',
      });
    }

    const newFeedback = {
      id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: (name || 'Anonymous Enthusiast').trim(),
      email: (email || '').trim(),
      category: (category || 'General Feedback').trim(),
      message: message.trim(),
      timestamp: new Date().toISOString(),
    };

    feedbackLog.unshift(newFeedback);

    return res.status(200).json({
      success: true,
      message: 'Feedback received successfully. Thank you for contributing to Singapore marine safety!',
      item: newFeedback,
    });
  }

  // GET returns feedback count or status
  return res.status(200).json({
    status: 'active',
    totalFeedbackReceived: feedbackLog.length,
    recentFeedback: feedbackLog.slice(0, 10),
  });
}
