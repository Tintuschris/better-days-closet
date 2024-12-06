import Sidebar from './components/sidebar';
import Navbar from './components/navbar';
import { Toaster } from 'sonner';

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-6">
          {children}
        </main>
        <Toaster />
      </div>
    </div>
  );
}
