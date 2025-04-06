"use client"
import { useOrderNotifications } from '../hooks/useOrderNotifications'
import { Bell, CheckCircle } from 'lucide-react'

export default function AdminNotifications() {
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications
    } = useOrderNotifications()

    return (
        <div className="relative">
            {/* Notification Bell */}
            <button
                className="relative p-2"
                onClick={() => document.getElementById('notifications-panel').classList.toggle('hidden')}
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Notifications Panel */}
            <div
                id="notifications-panel"
                className="hidden absolute right-0 mt-2 w-[450px] bg-white rounded-lg shadow-lg border border-gray-200 max-h-[80vh] overflow-y-auto"
            >
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-semibold">Order Notifications</h3>
                    <div className="space-x-2">
                        <button
                            onClick={markAllAsRead}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            Mark all as read
                        </button>
                        <button
                            onClick={clearNotifications}
                            className="text-sm text-gray-600 hover:text-gray-800"
                        >
                            Clear all
                        </button>
                    </div>
                </div>

                <div className="divide-y divide-gray-100">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            No notifications
                        </div>
                    ) : (
                        notifications.map(notification => (
                            <div
                                key={notification.id}
                                className={`p-4 hover:bg-gray-50 transition-colors ${
                                    notification.read ? 'bg-white' : 'bg-blue-50'
                                }`}
                                onClick={() => markAsRead(notification.id)}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <p className="font-medium">
                                            New Order - {notification.customerName}
                                        </p>
                                        <div className="text-sm text-gray-600 space-y-0.5">
                                            <p>Amount: KES {notification.amount}</p>
                                            <p>M-PESA Code: {notification.mpesaCode}</p>
                                            <p>Region: {notification.region}</p>
                                            <p>Delivery: {notification.deliveryOption}</p>
                                            <p>Status: <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800">
                                                {notification.status}
                                            </span></p>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {new Date(notification.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                    {notification.read && (
                                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}