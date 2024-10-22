import Sidebar from './components/sidebar';
import Navbar from './components/navbar';
import AdminNotifications from './components/adminNotifications'
import RealtimeDebugger from './components/RealtimeDebugger'
import { Toaster } from 'sonner'

export default function AdminLayout({ children }) {
  return (

    <div className="flex">
      <Sidebar />
      <div className="flex-grow">
        <Navbar />
        <AdminNotifications />
        <RealtimeDebugger />
        <main className="p-6">{children}</main>
        <Toaster />
      </div>
    </div>

  );
}
