import { supabase } from '../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) return res.status(500).json({ error });
    return res.status(200).json(data);
  }
}
