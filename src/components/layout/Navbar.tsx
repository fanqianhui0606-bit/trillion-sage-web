"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const NAV_LINKS = [
  { href: "/#values", label: "关于我们" },
  { href: "/quiz", label: "数理测评" },
  { href: "/programs", label: "学术营" },
  { href: "/team", label: "硕博团队" },
  { href: "/cooperation", label: "合作方" },
  { href: "/contact", label: "联系我们" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-[12px] shadow-glass"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-bridge-blue font-bold text-xl tracking-wider"
        >
          <Image
            src="/images/logo.png"
            alt="千殊教育 logo"
            width={32}
            height={32}
            className="object-contain rounded"
            priority
          />
          千殊教育
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8 text-sm">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-bridge-text hover:text-bridge-blue transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="菜单"
        >
          <span className="block w-5 h-0.5 bg-bridge-text mb-1" />
          <span className="block w-5 h-0.5 bg-bridge-text mb-1" />
          <span className="block w-5 h-0.5 bg-bridge-text" />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-[12px] border-t border-white/50">
          <div className="flex flex-col px-6 py-4 gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-bridge-text hover:text-bridge-blue transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
