import Sidebar from './components/sidebar';
import Navbar from './components/navabr';

export default function AdminLayout({ children }) {
  return (

    <div className="flex">
      <Sidebar />
      <div className="flex-grow">
        <Navbar />
        <main className="p-6">{children}</main>
      </div>
    </div>

  );
}
