/* eslint-disable @typescript-eslint/no-unused-vars */
import Link from "next/link";
import { Instagram, Linkedin, Send, Mail, Phone } from "lucide-react";

const socials = [
  { href: "https://linkedin.com/in/astrospectrum", label: "LinkedIn", icon: Linkedin },
  { href: "https://t.me/astro_spectrum", label: "Telegram", icon: Send },
  { href: "https://instagram.com/astro_spectrum", label: "Instagram", icon: Instagram },
];

export default function Footer() {
  return (
    <footer className="border-t border-(--border) bg-(--surface-1) text-(--text) pt-16 pb-12 px-6 transition-colors duration-300 w-full flex justify-center">
      <div className="w-full max-w-7xl flex flex-col items-center">
        
        {/* Top Grid Container */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-(--border)/60 text-center md:text-left">
          
          {/* Column 1 & 2: Brand Bio */}
          <div className="lg:col-span-2 flex flex-col items-center md:items-start gap-4">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-(--text)">
              Astro<span className="text-(--accent)">spectrum</span>
            </p>
            <p className="max-w-sm text-xs leading-relaxed text-(--text-dim) text-center md:text-left">
              A premier cinematic photography gallery and digital media platform curated by Sardor Sunatullayev. Specializing in high-altitude landscape visual capture, architectural aesthetics, and advanced web architecture.
            </p>
          </div>

          {/* Column 3: Official Contacts */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-(--text-muted)">
              Corporate Contacts
            </p>
            <ul className="flex flex-col items-center md:items-start gap-3 text-xs">
              <li>
                <a href="mailto:astrospectrum@astrospectrum.uz" className="flex items-center gap-2.5 text-(--text-dim) hover:text-(--accent) transition-colors group">
                  <Mail size={14} className="text-(--accent) group-hover:scale-110 transition-transform" />
                  <span>astrospectrum@astrospectrum.uz</span>
                </a>
              </li>
              <li>
                <a href="tel:+998909911112" className="flex items-center gap-2.5 text-(--text-dim) hover:text-(--accent) transition-colors group">
                  <Phone size={14} className="text-(--accent) group-hover:scale-110 transition-transform" />
                  <span>+998 (99) 099-11-12</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Social Networks */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-(--text-muted)">
              Social Channels
            </p>
            <div className="flex flex-col items-center md:items-start gap-2.5">
              {socials.map(({ href, label, icon: Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ borderRadius: "var(--radius-sm)" }}
                  className="group flex items-center gap-2.5 text-xs text-(--text-dim) hover:text-(--accent) transition-colors py-1"
                >
                  <Icon size={14} className="text-(--accent) transition-transform duration-300 group-hover:scale-110" />
                  <span className="uppercase tracking-[0.15em] font-medium">{label}</span>
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="w-full pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] uppercase tracking-[0.2em] text-(--text-muted) text-center">
          <p>&copy; {new Date().getFullYear()} Astrospectrum &bull; Sardor Sunatullayev. All rights reserved.</p>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="/privacy" className="hover:text-(--text) transition-colors flex items-center gap-1.5">
              <span>Privacy Policy</span>
              <span className="text-[9px] font-normal lowercase tracking-normal text-amber-500/95 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">(Draft)</span>
            </a>
            <span className="text-(--border)">•</span>
            <a href="/terms" className="hover:text-(--text) transition-colors flex items-center gap-1.5">
              <span>Terms of Use</span>
              <span className="text-[9px] font-normal lowercase tracking-normal text-amber-500/95 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">(Draft)</span>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}