"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { navigateHomeSection } from "@/lib/home-sections";

const NAV_LINKS = [
  { href: "/#values", label: "了解千殊", anchor: "values" },
  { href: "/#quiz-teaser", label: "素质测验", anchor: "quiz-teaser" },
  { href: "/#chat-teaser", label: "聊天共振", anchor: "chat-teaser" },
  { href: "/#consultation", label: "咨询引航", anchor: "consultation" },
  { href: "/#programs-preview", label: "线上营", anchor: "programs-preview" },
  { href: "/tracker", label: "服务流程" },
  { href: "/#contact", label: "联系我们", anchor: "contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (
    e: React.MouseEvent,
    href: string,
    anchor?: string
  ) => {
    if (!anchor) return;
    if (href.startsWith("/#") || href.startsWith("#")) {
      e.preventDefault();
      if (anchor === "contact") {
        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
      } else {
        navigateHomeSection(anchor);
      }
      setMobileOpen(false);
      window.history.replaceState(null, "", `/#${anchor}`);
    }
  };

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
          className="flex items-center gap-2 text-bridge-blue font-bold text-xl tracking-wider font-brand"
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

        <div className="hidden md:flex items-center gap-6 text-base">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-bridge-text hover:text-bridge-blue transition-colors font-sans"
              onClick={(e) => handleNavClick(e, link.href, link.anchor)}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="菜单"
          type="button"
        >
          <span className="block w-5 h-0.5 bg-bridge-text mb-1" />
          <span className="block w-5 h-0.5 bg-bridge-text mb-1" />
          <span className="block w-5 h-0.5 bg-bridge-text" />
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-[12px] border-t border-white/50">
          <div className="flex flex-col px-6 py-4 gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-bridge-text hover:text-bridge-blue transition-colors font-sans"
                onClick={(e) => {
                  handleNavClick(e, link.href, link.anchor);
                  setMobileOpen(false);
                }}
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
