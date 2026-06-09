/* eslint-disable @typescript-eslint/no-unused-vars */
import { Instagram, Link, Linkedin, Send } from "lucide-react";


const socials = [
  { href: "https://linkedin.com/in/astrospectrum", label: "LinkedIn", icon: Linkedin },
  { href: "https://t.me/astro_spectrum", label: "Telegram", icon: Send },
  { href: "https://instagram.com/astro_spectrum", label: "Instagram", icon: Instagram },
];

export default function Footer() {
  return (
    <footer className="border-t border-(--border) bg-(--bg) px-6 py-12 transition-colors duration-300">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        
        {/* Branding */}
        <div>
          <p className="mb-2 text-sm font-black uppercase tracking-[0.18em] text-(--text)">
            Astro<span className="text-(--accent)">spectrum</span>
          </p>
          <p className="max-w-sm text-sm leading-6 text-(--text-dim)">
            A cinematic photography gallery by Sardor Sunatullayev.
          </p>
        </div>

        {/* Socials */}
        <div className="flex flex-wrap items-center gap-3">
          {socials.map(({ href, label, icon: Icon }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex min-h-11 min-w-11 items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-(--text-muted) transition-all hover:-translate-y-0.5 hover:border-(--accent) hover:text-(--text)"
            >
              <Icon size={14} className="transition group-hover:text-(--accent)" />
              {label}
            </a>
          ))}
        </div>

       <div className="flex gap-4 justify-center text-[10px] text-zinc-600 uppercase tracking-widest mt-8">
  <a href="/privacy" className="hover:text-zinc-400 transition-colors">Privacy Policy <span className="text-sm font-normal size-0.5 text-red-500">(IT DOESNT APPLY YET, IT IS JUST A DRAFT)</span></a>
  <span>•</span>
  <a href="/terms" className="hover:text-zinc-400 transition-colors">Terms of Use <span className="text-sm font-normal size-0.5 text-red-500">(IT DOESNT APPLY YET, IT IS JUST A DRAFT)</span></a>
</div>
        <p className="text-[10px] uppercase tracking-[0.22em] text-(--text-muted)">
          &copy; {new Date().getFullYear()} Sardor Sunatullayev
        </p>
      </div>
    </footer>
  );
}