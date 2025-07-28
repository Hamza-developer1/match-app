import { NextApiRequest, NextApiResponse } from 'next';
import { initializeWebSocket } from '../../lib/websocket';

interface ExtendedNextApiRequest extends NextApiRequest {
  socket: {
    server: {
      io?: any;
    };
  };
}

export default function handler(req: ExtendedNextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return initializeWebSocket(req, res);
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}

export const config = {
  api: {
    bodyParser: false,
  },
};