import { NextApiRequest, NextApiResponse } from 'next';
import { initializeWebSocket } from '../../lib/websocket';

interface ExtendedNextApiRequest extends NextApiRequest {
  socket: NextApiRequest['socket'] & {
    server: {
      io?: any;
    };
  };
}

export default function handler(req: ExtendedNextApiRequest, res: NextApiResponse) {
  return initializeWebSocket(req, res);
}

export const config = {
  api: {
    bodyParser: false,
  },
};