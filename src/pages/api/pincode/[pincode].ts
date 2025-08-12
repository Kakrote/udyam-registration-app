import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pincode } = req.query;

  if (!pincode || typeof pincode !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'PIN code is required'
    });
  }

  try {
    const response = await axios.get(`${BACKEND_URL}/api/pincode/${pincode}`, {
      timeout: 10000,
    });

    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('Error fetching pincode details:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      // Fallback to external API if backend is not available
      try {
        const fallbackResponse = await axios.get(
          `https://api.postalpincode.in/pincode/${pincode}`,
          { timeout: 5000 }
        );

        if (fallbackResponse.data?.[0]?.Status === 'Success') {
          const postOffice = fallbackResponse.data[0].PostOffice[0];
          res.status(200).json({
            success: true,
            data: {
              pincode: pincode,
              city: postOffice.Name,
              district: postOffice.District,
              state: postOffice.State,
            },
            message: 'Location details retrieved successfully'
          });
        } else {
          res.status(404).json({
            success: false,
            message: 'Location details not found for the provided PIN code'
          });
        }
      } catch (fallbackError) {
        res.status(500).json({
          success: false,
          message: 'Unable to fetch location details. Please try again later.'
        });
      }
    }
  }
}
