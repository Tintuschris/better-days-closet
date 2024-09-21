// pages/index.js
import Head from 'next/head';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="bg-white min-h-screen">
      

      <header className="flex justify-between items-center p-4">
        <button className="text-purple-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center">
          <span className="ml-2 text-purple-800 font-bold">BETTER DAYS CLOSET</span>
        </div>
        <div className="flex items-center">
          <button className="mr-4 text-purple-800 relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="absolute -top-2 -right-2 bg-pink-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">3</span>
          </button>
          <button className="text-purple-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>
      </header>

      <main className="p-4">
        <h2 className="text-purple-800 font-bold text-xl mb-4">CATEGORIES</h2>
        <div className="flex space-x-4 mb-6">
          <button className="bg-pink-300 text-purple-800 px-6 py-2 rounded-full">Women</button>
          <button className="bg-pink-300 text-purple-800 px-6 py-2 rounded-full">Men</button>
          <button className="bg-pink-300 text-purple-800 px-6 py-2 rounded-full">Kids</button>
        </div>

        <h2 className="text-purple-800 font-bold text-xl mb-4">TOP DEALS</h2>
<div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4">
  {/* Sample product card */}
  <div className="bg-gray-100 rounded-lg p-2 w-40 flex-shrink-0">
    <Image src="/product1.jpg" alt="College Jackets" width={150} height={200} className="w-full h-40 object-cover rounded-lg" />
    <h3 className="text-purple-800 font-semibold mt-2">College Jackets</h3>
    <p className="text-gray-500 line-through">Ksh. 3000</p>
    <p className="text-pink-500 font-bold">Ksh. 2000</p>
  </div>
  <div className="bg-gray-100 rounded-lg p-2 w-40 flex-shrink-0">
    <Image src="/product1.jpg" alt="College Jackets" width={150} height={200} className="w-full h-40 object-cover rounded-lg" />
    <h3 className="text-purple-800 font-semibold mt-2">College Jackets</h3>
    <p className="text-gray-500 line-through">Ksh. 3000</p>
    <p className="text-pink-500 font-bold">Ksh. 2000</p>
  </div>
  <div className="bg-gray-100 rounded-lg p-2 w-40 flex-shrink-0">
    <Image src="/product1.jpg" alt="College Jackets" width={150} height={200} className="w-full h-40 object-cover rounded-lg" />
    <h3 className="text-purple-800 font-semibold mt-2">College Jackets</h3>
    <p className="text-gray-500 line-through">Ksh. 3000</p>
    <p className="text-pink-500 font-bold">Ksh. 2000</p>
  </div>
  {/* Repeat for other products */}
</div>

        <h2 className="text-purple-800 font-bold text-xl mb-4">NEW ARRIVALS</h2>
        <div className="grid grid-cols-2 gap-4">
          {/* Sample new arrival product */}
          <div className="bg-gray-100 rounded-lg p-2">
            <Image src="/new-arrival1.jpg" alt="New Arrival" width={150} height={200} className="w-full h-40 object-cover rounded-lg" />
            <button className="absolute top-2 right-2 text-pink-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
          {/* Repeat for other new arrivals */}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex justify-around py-2">
          <button className="flex flex-col items-center text-pink-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs">Home</span>
          </button>
          <button className="flex flex-col items-center text-purple-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs">Search</span>
          </button>
          <button className="flex flex-col items-center text-purple-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-xs">Wishlist</span>
          </button>
          <button className="flex flex-col items-center text-purple-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </footer>
    </div>
  );
}