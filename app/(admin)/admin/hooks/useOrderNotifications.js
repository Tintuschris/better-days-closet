import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { toast } from 'sonner'

export function useOrderNotifications() {
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        console.log('Setting up realtime subscription...')
        
        const channel = supabase
            .channel('orders-changes')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to all events initially for testing
                    schema: 'public',
                    table: 'orders'
                },
                async (payload) => {
                    console.log('Received database change:', payload)
                    
                    if (payload.eventType === 'INSERT' && payload.new.mpesa_code) {
                        try {
                            // Fetch user details
                            const { data: userData, error: userError } = await supabase
                                .from('users')
                                .select('name')
                                .eq('id', payload.new.user_id)
                                .single()

                            if (userError) {
                                console.error('Error fetching user:', userError)
                                return
                            }

                            console.log('Found user data:', userData)
                            handleNewOrder(payload.new, userData)
                        } catch (error) {
                            console.error('Error processing notification:', error)
                        }
                    }
                }
            )
            .subscribe((status) => {
                console.log('Subscription status:', status)
            })

        return () => {
            console.log('Cleaning up subscription...')
            supabase.removeChannel(channel)
        }
    }, []) // handleNewOrder is defined after this useEffect, so we'll disable the warning

    const handleNewOrder = (order, userData) => {
        console.log('Creating notification for order:', order)
        
        const newNotification = {
            id: crypto.randomUUID(),
            orderId: order.id,
            mpesaCode: order.mpesa_code,
            amount: order.total_amount,
            customerName: userData?.name || 'Unknown Customer',
            timestamp: order.created_at,
            status: order.status,
            region: order.region,
            read: false
        }

        setNotifications(prev => {
            const updated = [newNotification, ...prev]
            saveNotificationsToStorage(updated)
            updateUnreadCount(updated)
            return updated
        })

        // Show toast notification
        toast.message('New Order Received!', {
            description: `${userData?.name || 'Unknown Customer'} - KES ${order.total_amount}`,
        })
    }

    // Storage functions
    const loadNotificationsFromStorage = () => {
        try {
            const stored = localStorage.getItem('orderNotifications')
            if (stored) {
                const parsedNotifications = JSON.parse(stored)
                setNotifications(parsedNotifications)
                updateUnreadCount(parsedNotifications)
            }
        } catch (error) {
            console.error('Error loading notifications:', error)
        }
    }

    const saveNotificationsToStorage = (notifications) => {
        try {
            // Keep only last 100 notifications
            const toStore = notifications.slice(0, 100)
            localStorage.setItem('orderNotifications', JSON.stringify(toStore))
        } catch (error) {
            console.error('Error saving notifications:', error)
        }
    }

    const updateUnreadCount = (notifications) => {
        const unread = notifications.filter(n => !n.read).length
        setUnreadCount(unread)
    }

    // Notification actions
    const markAsRead = (notificationId) => {
        setNotifications(prev => {
            const updated = prev.map(notification => 
                notification.id === notificationId 
                    ? { ...notification, read: true }
                    : notification
            )
            saveNotificationsToStorage(updated)
            updateUnreadCount(updated)
            return updated
        })
    }

    const markAllAsRead = () => {
        setNotifications(prev => {
            const updated = prev.map(notification => ({ ...notification, read: true }))
            saveNotificationsToStorage(updated)
            updateUnreadCount(updated)
            return updated
        })
    }

    const clearNotifications = () => {
        setNotifications([])
        localStorage.removeItem('orderNotifications')
        setUnreadCount(0)
    }

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications
    }
}