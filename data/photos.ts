export type PhotoCategory = 
  | "ASTROPHOTOGRAPHY" 
  | "NATURE" 
  | "SKY" 
  | "MOON" 
  | "WARM" 
  | "STREET" 
  | "ABSTRACT" 
  | "OTHER";

export const CATEGORIES: { value: PhotoCategory | "ALL"; label: string; icon: string }[] = [
  { value: "ALL", label: "All", icon: "✦" },
  { value: "ASTROPHOTOGRAPHY", label: "Astrophotography", icon: "🔭" },
  { value: "NATURE", label: "Nature", icon: "🌿" },
  { value: "SKY", label: "Sky", icon: "☁️" },
  { value: "MOON", label: "Moon", icon: "🌙" },
  { value: "WARM", label: "Warm", icon: "🌅" },
  { value: "STREET", label: "Street", icon: "🏙️" },
  { value: "ABSTRACT", label: "Abstract", icon: "◈" },
  { value: "OTHER", label: "Other", icon: "◉" },
];

export interface PhotoItem {
  id: number;
  src: string;
  title: string;
  location?: string;
  category: PhotoCategory;
  camera?: string;
  lens?: string;
  iso?: string;
  shutter?: string;
  aperture?: string;
  focalLength?: string;
  date?: string;
}

export const photos: PhotoItem[] = [
  { 
    id: 1, 
    src: "/photos/p1.jpg", 
    title: "Spectrum Frame 01", 
    location: "Astrospectrum Observatory", 
    category: "ASTROPHOTOGRAPHY",
    camera: "Xiaomi 15T Pro",
    lens: "24mm f/1.7 Main",
    iso: "ISO 1600",
    shutter: "15s",
    aperture: "f/1.7",
    date: "October 2025"
  },
  { 
    id: 2, 
    src: "/photos/p2.jpg", 
    title: "Spectrum Frame 02", 
    location: "Botanical Canopy", 
    category: "NATURE",
    camera: "Xiaomi 15T Pro",
    lens: "50mm Telephoto",
    iso: "ISO 100",
    shutter: "1/500s",
    aperture: "f/2.2",
    date: "October 2025"
  },
  { 
    id: 3, 
    src: "/photos/p3.jpg", 
    title: "Spectrum Frame 03", 
    location: "High Altitude Horizon", 
    category: "SKY",
    camera: "Xiaomi 15T Pro",
    lens: "24mm f/1.7 Main",
    iso: "ISO 200",
    shutter: "1/1000s",
    aperture: "f/1.7",
    date: "November 2025"
  },
  { 
    id: 4, 
    src: "/photos/p4.jpg", 
    title: "Spectrum Frame 04", 
    location: "Lunar Crater Rim", 
    category: "MOON",
    camera: "Xiaomi 15T Pro",
    lens: "Telephoto Periscope",
    iso: "ISO 400",
    shutter: "1/250s",
    aperture: "f/3.0",
    date: "November 2025"
  },
  { 
    id: 5, 
    src: "/photos/p5.jpg", 
    title: "Spectrum Frame 05", 
    location: "Golden Hour Valley", 
    category: "WARM",
    camera: "Xiaomi 15T Pro",
    lens: "24mm f/1.7 Main",
    iso: "ISO 100",
    shutter: "1/750s",
    aperture: "f/1.7",
    date: "December 2025"
  },
  { 
    id: 6, 
    src: "/photos/p6.jpg", 
    title: "Spectrum Frame 06", 
    location: "Urban Concrete", 
    category: "STREET",
    camera: "Xiaomi 15T Pro",
    lens: "24mm f/1.7 Main",
    iso: "ISO 320",
    shutter: "1/125s",
    aperture: "f/1.7",
    date: "December 2025"
  },
  { 
    id: 7, 
    src: "/photos/p7.jpg", 
    title: "Spectrum Frame 07", 
    location: "Deep Space Field", 
    category: "ASTROPHOTOGRAPHY",
    camera: "Xiaomi 15T Pro",
    lens: "24mm f/1.7 Main",
    iso: "ISO 3200",
    shutter: "30s",
    aperture: "f/1.7",
    date: "January 2026"
  },
  { 
    id: 8, 
    src: "/photos/p8.jpg", 
    title: "Spectrum Frame 08", 
    location: "Pine Forest Depths", 
    category: "NATURE",
    camera: "Xiaomi 15T Pro",
    lens: "50mm Telephoto",
    iso: "ISO 200",
    shutter: "1/250s",
    aperture: "f/2.2",
    date: "January 2026"
  },
  { 
    id: 9, 
    src: "/photos/p9.jpg", 
    title: "Spectrum Frame 09", 
    location: "Cumulus Layer", 
    category: "SKY",
    camera: "Xiaomi 15T Pro",
    lens: "24mm f/1.7 Main",
    iso: "ISO 100",
    shutter: "1/1500s",
    aperture: "f/1.7",
    date: "January 2026"
  },
  { 
    id: 10, 
    src: "/photos/p10.jpg", 
    title: "Spectrum Frame 10", 
    location: "Nightfall Crescent", 
    category: "MOON",
    camera: "Xiaomi 15T Pro",
    lens: "Telephoto Periscope",
    iso: "ISO 400",
    shutter: "1/320s",
    aperture: "f/3.0",
    date: "February 2026"
  },
  { 
    id: 11, 
    src: "/photos/p11.jpg", 
    title: "Spectrum Frame 11", 
    location: "Dusk Silhouette", 
    category: "WARM",
    camera: "Xiaomi 15T Pro",
    lens: "24mm f/1.7 Main",
    iso: "ISO 150",
    shutter: "1/400s",
    aperture: "f/1.7",
    date: "February 2026"
  },
  { 
    id: 12, 
    src: "/photos/p12.jpg", 
    title: "Spectrum Frame 12", 
    location: "Geometric Shadows", 
    category: "ABSTRACT",
    camera: "Xiaomi 15T Pro",
    lens: "50mm Telephoto",
    iso: "ISO 100",
    shutter: "1/200s",
    aperture: "f/2.2",
    date: "February 2026"
  },
  { 
    id: 13, 
    src: "/photos/p13.jpg", 
    title: "Spectrum Frame 13", 
    location: "Stellar Constellation", 
    category: "ASTROPHOTOGRAPHY",
    camera: "Xiaomi 15T Pro",
    lens: "24mm f/1.7 Main",
    iso: "ISO 1600",
    shutter: "20s",
    aperture: "f/1.7",
    date: "March 2026"
  },
  { 
    id: 14, 
    src: "/photos/p14.jpg", 
    title: "Spectrum Frame 14", 
    location: "Alpine Ridge", 
    category: "NATURE",
    camera: "Xiaomi 15T Pro",
    lens: "24mm f/1.7 Main",
    iso: "ISO 100",
    shutter: "1/640s",
    aperture: "f/1.7",
    date: "March 2026"
  },
  { 
    id: 15, 
    src: "/photos/p15.jpg", 
    title: "Spectrum Frame 15", 
    location: "Overcast Atmosphere", 
    category: "SKY",
    camera: "Xiaomi 15T Pro",
    lens: "24mm f/1.7 Main",
    iso: "ISO 125",
    shutter: "1/500s",
    aperture: "f/1.7",
    date: "March 2026"
  },
  { 
    id: 16, 
    src: "/photos/p16.jpg", 
    title: "Spectrum Frame 16", 
    location: "Full Moon Glow", 
    category: "MOON",
    camera: "Xiaomi 15T Pro",
    lens: "Telephoto Periscope",
    iso: "ISO 200",
    shutter: "1/500s",
    aperture: "f/3.0",
    date: "April 2026"
  },
  { 
    id: 17, 
    src: "/photos/p17.jpg", 
    title: "Spectrum Frame 17", 
    location: "Amber Horizon", 
    category: "WARM",
    camera: "Xiaomi 15T Pro",
    lens: "24mm f/1.7 Main",
    iso: "ISO 100",
    shutter: "1/800s",
    aperture: "f/1.7",
    date: "April 2026"
  },
  { 
    id: 18, 
    src: "/photos/p18.jpg", 
    title: "Spectrum Frame 18", 
    location: "Metropolitan Alley", 
    category: "STREET",
    camera: "Xiaomi 15T Pro",
    lens: "24mm f/1.7 Main",
    iso: "ISO 400",
    shutter: "1/60s",
    aperture: "f/1.7",
    date: "April 2026"
  },
  { 
    id: 19, 
    src: "/photos/p19.jpg", 
    title: "Spectrum Frame 19", 
    location: "Liquid Light", 
    category: "ABSTRACT",
    camera: "Xiaomi 15T Pro",
    lens: "50mm Telephoto",
    iso: "ISO 200",
    shutter: "1/100s",
    aperture: "f/2.2",
    date: "May 2026"
  },
  { 
    id: 20, 
    src: "/photos/p20.jpg", 
    title: "Spectrum Frame 20", 
    location: "Milky Way Arch", 
    category: "ASTROPHOTOGRAPHY",
    camera: "Xiaomi 15T Pro",
    lens: "24mm f/1.7 Main",
    iso: "ISO 3200",
    shutter: "25s",
    aperture: "f/1.7",
    date: "May 2026"
  },
  { 
    id: 21, 
    src: "/photos/p21.jpg", 
    title: "Spectrum Frame 21", 
    location: "River Valley", 
    category: "NATURE",
    camera: "Xiaomi 15T Pro",
    lens: "24mm f/1.7 Main",
    iso: "ISO 100",
    shutter: "1/320s",
    aperture: "f/1.7",
    date: "May 2026"
  },
  { 
    id: 22, 
    src: "/photos/p22.jpg", 
    title: "Spectrum Frame 22", 
    location: "Morning Stratus", 
    category: "SKY",
    camera: "Xiaomi 15T Pro",
    lens: "24mm f/1.7 Main",
    iso: "ISO 100",
    shutter: "1/1000s",
    aperture: "f/1.7",
    date: "June 2026"
  },
  { 
    id: 23, 
    src: "/photos/p23.jpg", 
    title: "Spectrum Frame 23", 
    location: "Lunar Eclipse Phase", 
    category: "MOON",
    camera: "Xiaomi 15T Pro",
    lens: "Telephoto Periscope",
    iso: "ISO 800",
    shutter: "1/60s",
    aperture: "f/3.0",
    date: "June 2026"
  },
  { 
    id: 24, 
    src: "/photos/p24.jpg", 
    title: "Spectrum Frame 24", 
    location: "Sunset Glow", 
    category: "WARM",
    camera: "Xiaomi 15T Pro",
    lens: "24mm f/1.7 Main",
    iso: "ISO 100",
    shutter: "1/500s",
    aperture: "f/1.7",
    date: "June 2026"
  },
  { 
    id: 25, 
    src: "/photos/p25.jpg", 
    title: "Spectrum Frame 25", 
    location: "Downtown Crosswalk", 
    category: "STREET",
    camera: "Xiaomi 15T Pro",
    lens: "24mm f/1.7 Main",
    iso: "ISO 250",
    shutter: "1/200s",
    aperture: "f/1.7",
    date: "July 2026"
  },
  { 
    id: 26, 
    src: "/photos/p26.jpg", 
    title: "Spectrum Frame 26", 
    location: "Monochrome Patterns", 
    category: "ABSTRACT",
    camera: "Xiaomi 15T Pro",
    lens: "50mm Telephoto",
    iso: "ISO 100",
    shutter: "1/400s",
    aperture: "f/2.2",
    date: "July 2026"
  },
  { 
    id: 27, 
    src: "/photos/p27.jpg", 
    title: "Spectrum Frame 27", 
    location: "Deep Cosmos", 
    category: "ASTROPHOTOGRAPHY",
    camera: "Xiaomi 15T Pro",
    lens: "24mm f/1.7 Main",
    iso: "ISO 1600",
    shutter: "20s",
    aperture: "f/1.7",
    date: "July 2026"
  },
  { 
    id: 28, 
    src: "/photos/p28.jpg", 
    title: "Spectrum Frame 28", 
    location: "Mossy Glade", 
    category: "NATURE",
    camera: "Xiaomi 15T Pro",
    lens: "50mm Telephoto",
    iso: "ISO 200",
    shutter: "1/125s",
    aperture: "f/2.2",
    date: "August 2026"
  },
  { 
    id: 29, 
    src: "/photos/p29.jpg", 
    title: "Spectrum Frame 29", 
    location: "Cirrus Trails", 
    category: "SKY",
    camera: "Xiaomi 15T Pro",
    lens: "24mm f/1.7 Main",
    iso: "ISO 100",
    shutter: "1/1250s",
    aperture: "f/1.7",
    date: "August 2026"
  },
  { 
    id: 30, 
    src: "/photos/p30.jpg", 
    title: "Spectrum Frame 30", 
    location: "Evening Fire", 
    category: "WARM",
    camera: "Xiaomi 15T Pro",
    lens: "24mm f/1.7 Main",
    iso: "ISO 200",
    shutter: "1/160s",
    aperture: "f/1.7",
    date: "August 2026"
  },
  { 
    id: 31, 
    src: "/photos/p31.jpg", 
    title: "Spectrum Frame 31", 
    location: "Solitary Moon", 
    category: "MOON",
    camera: "Xiaomi 15T Pro",
    lens: "Telephoto Periscope",
    iso: "ISO 400",
    shutter: "1/400s",
    aperture: "f/3.0",
    date: "August 2026"
  },
  { 
    id: 32, 
    src: "/photos/p32.jpg", 
    title: "Spectrum Frame 32", 
    location: "Prismatic Light", 
    category: "ABSTRACT",
    camera: "Xiaomi 15T Pro",
    lens: "50mm Telephoto",
    iso: "ISO 100",
    shutter: "1/250s",
    aperture: "f/2.2",
    date: "August 2026"
  },
];