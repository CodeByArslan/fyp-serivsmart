"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setUserEmail(sessionStorage.getItem("userEmail"));
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("userEmail");
    setUserEmail(null);
    setIsMenuOpen(false);
  };

  const getLinkClass = (path: string) =>
    pathname === path
      ? "text-orange-500 font-semibold"
      : "text-gray-700 hover:text-orange-500";

  return (
    <nav className="bg-white shadow-md py-4 px-4 md:px-8 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <img src="/logo.png" alt="Logo" className="h-10" />
        </Link>

        {/* Hamburger Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-gray-700 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/" className={getLinkClass("/")}>
            Home
          </Link>
          <Link href="/services" className={getLinkClass("/services")}>
            Services
          </Link>
          <Link href="http://localhost:3000/" className={getLinkClass("/shop")}>
            Shop
          </Link>
          <Link href="/contact" className={getLinkClass("/news")}>
            Contact Us
          </Link>
          <Link href="/reviews" className={getLinkClass("/reviews")}>
            Reviews
          </Link>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex flex-row gap-4 items-center">
          <Link
            href="/appointment"
            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
          >
            Appointment
          </Link>
          {userEmail ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-2">
          <Link
            href="/"
            className={getLinkClass("/")}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/services"
            className={getLinkClass("/services")}
            onClick={() => setIsMenuOpen(false)}
          >
            Services
          </Link>
          <Link
            href="http://localhost:3000/"
            className={getLinkClass("/shop")}
            onClick={() => setIsMenuOpen(false)}
          >
            Shop
          </Link>
          <Link
            href="/contact"
            className={getLinkClass("/news")}
            onClick={() => setIsMenuOpen(false)}
          >
            Contact Us
          </Link>
          <Link
            href="/reviews"
            className={getLinkClass("/reviews")}
            onClick={() => setIsMenuOpen(false)}
          >
            Reviews
          </Link>
          <Link
            href="/appointment"
            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
            onClick={() => setIsMenuOpen(false)}
          >
            Appointment
          </Link>
          {userEmail ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
