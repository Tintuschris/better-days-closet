"use client"
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

export default function TransactionMonitor() {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        // Subscribe to real-time updates
        const subscription = supabase
            .from('orders')
            .on('*', payload => {
                setTransactions(current => [...current, payload.new]);
            })
            .subscribe();

        return () => {
            supabase.removeSubscription(subscription);
        };
    }, []);

    return (
        <div className="p-4">
            <h2>Transaction Monitor</h2>
            <div className="mt-4">
                {transactions.map((tx, index) => (
                    <div key={index} className="mb-2 p-2 border">
                        <p>Status: {tx.status}</p>
                        <p>Amount: {tx.total_amount}</p>
                        <p>M-PESA Code: {tx.mpesa_code || 'Pending'}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}