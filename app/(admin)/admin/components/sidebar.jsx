import Link from 'next/link';

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-primarycolor text-white">
      <h2 className="text-2xl font-bold p-4">Admin Dashboard</h2>
      <ul className="space-y-2">
        <li className="p-4">
          <Link href="/admin/products">Products</Link>
        </li>
        <li className="p-4">
          <Link href="/admin/categories">Categories</Link>
        </li>
        <li className="p-4">
          <Link href="/admin/orders">Orders</Link>
        </li>
        <li className="p-4">
          <Link href="/admin/reports">Sales Reports</Link>
        </li>
      </ul>
    </div>
  );
}
