"use client";
import { Suspense } from 'react';
import AccountSettings from '../components/accountsettings';

function SettingsPageContent() {
  return <AccountSettings />;
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div>Loading settings...</div>}>
      <SettingsPageContent />
    </Suspense>
  );
}
