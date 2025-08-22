"use client";
import { useState } from 'react';
import { 
  FiUser, FiShoppingBag, FiHeart, FiMapPin, FiSettings, 
  FiChevronRight, FiEdit, FiCamera, FiStar, FiTrendingUp,
  FiClock, FiPackage, FiCreditCard, FiBell
} from 'react-icons/fi';
import { PremiumCard, Button, GradientText } from './ui';
import Image from 'next/image';

const ProfileHeader = ({ user, onEditProfile, onChangeAvatar }) => {
  return (
    <PremiumCard className="p-6 mb-6">
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primarycolor to-primarycolor/80 flex items-center justify-center shadow-lg shadow-primarycolor/30 overflow-hidden">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <FiUser className="w-10 h-10 text-white" />
            )}
          </div>
          <button
            onClick={onChangeAvatar}
            className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-primarycolor hover:bg-gray-50 transition-colors"
          >
            <FiCamera className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <GradientText className="text-2xl font-bold">
              {user.name}
            </GradientText>
            {user.verified && (
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <FiStar className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <p className="text-primarycolor/70 mb-3">{user.email}</p>
          <div className="flex items-center gap-4 text-sm text-primarycolor/70">
            <span>Member since {new Date(user.created_at).getFullYear()}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <FiShoppingBag className="w-3 h-3" />
              {user.totalOrders} orders
            </span>
          </div>
        </div>
        
        <Button
          onClick={onEditProfile}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <FiEdit className="w-4 h-4" />
          Edit Profile
        </Button>
      </div>
    </PremiumCard>
  );
};

const QuickStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <PremiumCard key={index} className="p-4 text-center">
          <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${stat.bgColor}`}>
            <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
          </div>
          <p className="text-2xl font-bold text-primarycolor mb-1">{stat.value}</p>
          <p className="text-sm text-primarycolor/70">{stat.label}</p>
          {stat.change && (
            <div className={`flex items-center justify-center gap-1 mt-1 text-xs ${
              stat.change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <FiTrendingUp className="w-3 h-3" />
              <span>{stat.change > 0 ? '+' : ''}{stat.change}%</span>
            </div>
          )}
        </PremiumCard>
      ))}
    </div>
  );
};

const ProfileMenuItem = ({ icon: Icon, title, subtitle, href, onClick, badge, rightElement }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      className="flex items-center justify-between p-4 hover:bg-primarycolor/5 transition-colors cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-primarycolor/10 rounded-full flex items-center justify-center group-hover:bg-primarycolor/20 transition-colors">
          <Icon className="w-5 h-5 text-primarycolor" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-primarycolor">{title}</p>
            {badge && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-primarycolor/70">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {rightElement}
        <FiChevronRight className="w-4 h-4 text-primarycolor/60 group-hover:text-primarycolor transition-colors" />
      </div>
    </div>
  );
};

const RecentActivity = ({ activities }) => {
  return (
    <PremiumCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <GradientText className="text-lg font-semibold">
          Recent Activity
        </GradientText>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.bgColor}`}>
              <activity.icon className={`w-5 h-5 ${activity.iconColor}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-primarycolor">{activity.title}</p>
              <p className="text-xs text-primarycolor/70">{activity.description}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-primarycolor/60">{activity.time}</p>
              {activity.amount && (
                <p className="text-sm font-semibold text-primarycolor">{activity.amount}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </PremiumCard>
  );
};

const ProfileMenuSection = ({ title, children }) => {
  return (
    <PremiumCard className="mb-6 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-primarycolor/5 to-secondarycolor/5 border-b border-primarycolor/10">
        <h3 className="font-semibold text-primarycolor">{title}</h3>
      </div>
      <div className="divide-y divide-primarycolor/10">
        {children}
      </div>
    </PremiumCard>
  );
};

const LoyaltyCard = ({ points, tier, nextTierPoints, benefits }) => {
  const progress = (points / nextTierPoints) * 100;

  return (
    <PremiumCard className="p-6 bg-gradient-to-br from-primarycolor/10 to-secondarycolor/10 border border-primarycolor/20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <GradientText className="text-lg font-semibold mb-1">
            Loyalty Program
          </GradientText>
          <p className="text-primarycolor/70">Current Tier: <span className="font-semibold text-primarycolor">{tier}</span></p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primarycolor">{points}</p>
          <p className="text-sm text-primarycolor/70">points</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-primarycolor/70">Progress to next tier</span>
          <span className="text-primarycolor">{nextTierPoints - points} points to go</span>
        </div>
        <div className="w-full bg-primarycolor/20 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-primarycolor to-secondarycolor h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-primarycolor">Your Benefits:</p>
        <div className="flex flex-wrap gap-2">
          {benefits.map((benefit, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-primarycolor/10 text-primarycolor text-xs rounded-full"
            >
              {benefit}
            </span>
          ))}
        </div>
      </div>
    </PremiumCard>
  );
};

const NotificationSettings = ({ notifications, onToggle }) => {
  return (
    <PremiumCard className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <FiBell className="w-5 h-5 text-primarycolor" />
        <GradientText className="text-lg font-semibold">
          Notification Preferences
        </GradientText>
      </div>
      
      <div className="space-y-4">
        {notifications.map((notification, index) => (
          <div key={index} className="flex items-center justify-between">
            <div>
              <p className="font-medium text-primarycolor">{notification.title}</p>
              <p className="text-sm text-primarycolor/70">{notification.description}</p>
            </div>
            <button
              onClick={() => onToggle(notification.id)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notification.enabled ? 'bg-primarycolor' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notification.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </PremiumCard>
  );
};

export {
  ProfileHeader,
  QuickStats,
  ProfileMenuItem,
  ProfileMenuSection,
  RecentActivity,
  LoyaltyCard,
  NotificationSettings
};
