import { supabase } from '../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, mpesaCode } = req.body;
    // Process order logic
    return res.status(200).json({ message: 'Order processed successfully' });
  }
}
