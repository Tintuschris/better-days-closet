// components/RealtimeDebugger.jsx
"use client"
import { supabase } from '../../../lib/supabase'

export default function RealtimeDebugger() {
    const testConnection = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .insert([
                    {
                        status: 'PENDING',
                        total_amount: 1000,
                        mpesa_code: 'TEST' + Date.now(),
                        user_id: '90a3bed7-2b2c-4113-96f8-d352d4cf0d15', // Replace with actual user id
                        delivery_option: 'delivery',
                        region: 'Nairobi'
                    }
                ])
                .select()

            console.log('Test insert result:', data, error)
        } catch (err) {
            console.error('Test insert error:', err)
        }
    }

    return (
        <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="font-bold mb-2">Realtime Debugger</h3>
            <button
                onClick={testConnection}
                className="bg-blue-500 text-white px-4 py-2 rounded"
            >
                Test Realtime Connection
            </button>
        </div>
    )
}