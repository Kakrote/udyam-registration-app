import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await axios.post(`${BACKEND_URL}/api/submit`, req.body, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        'User-Agent': req.headers['user-agent'] || 'NextJS-API'
      }
    });

    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('Error submitting form:', error.message);
    
    if (error.response) {
      // Forward backend error response
      res.status(error.response.status).json(error.response.data);
    } else {
      // Network or other error
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to submit form. Please try again later.',
        timestamp: new Date().toISOString()
      });
    }
  }
}
