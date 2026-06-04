import { Instagram, Linkedin, Send } from "lucide-react";

const socials = [
  { href: "https://linkedin.com/in/astrospectrum", label: "LinkedIn", icon: Linkedin },
  { href: "https://t.me/astro_spectrum", label: "Telegram", icon: Send },
  { href: "https://instagram.com/astro_spectrum", label: "Instagram", icon: Instagram },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black px-6 py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-2 text-sm font-black uppercase tracking-[0.18em]">
            Astro<span className="text-red-500">spectrum</span>
          </p>
          <p className="max-w-sm text-sm leading-6 text-white/40">
            A cinematic photography gallery by Sardor Sunatullayev.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {socials.map(({ href, label, icon: Icon }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex min-h-11 min-w-11 items-center gap-2 rounded-full border border-white/10 bg-white/3 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/45 transition hover:-translate-y-0.5 hover:border-red-400/50 hover:text-white"
            >
              <Icon size={14} className="transition group-hover:text-red-400" />
              {label}
            </a>
          ))}
        </div>

        <p className="text-[10px] uppercase tracking-[0.22em] text-white/25">(c) 2026 Sardor Sunatullayev</p>
      </div>
    </footer>
  );
}
