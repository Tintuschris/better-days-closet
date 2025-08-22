"use client";
import EnhancedDashboard from "./components/EnhancedDashboard";
import RealTimeDebugger from "./components/RealTimeDebugger";
import { GradientText } from "../../components/ui";

export default function AdminDashboard() {

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <GradientText className="text-2xl lg:text-3xl font-bold mb-2">
            Admin Dashboard
          </GradientText>
          <p className="text-primarycolor/70">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
      </div>

      {/* Enhanced Dashboard */}
      <EnhancedDashboard />

      {/* Debug Component */}
      <RealTimeDebugger />
    </div>
  );
}
