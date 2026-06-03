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

 export const photos = [
  { id: 1, src: "/photos/p1.jpg", title: "Spectrum Frame 01", location: "Astrospectrum Gallery", category: "ASTROPHOTOGRAPHY" as PhotoCategory },
  { id: 2, src: "/photos/p2.jpg", title: "Spectrum Frame 02", location: "Astrospectrum Gallery", category: "NATURE" as PhotoCategory },
  { id: 3, src: "/photos/p3.jpg", title: "Spectrum Frame 03", location: "Astrospectrum Gallery", category: "SKY" as PhotoCategory },
  { id: 4, src: "/photos/p4.jpg", title: "Spectrum Frame 04", location: "Astrospectrum Gallery", category: "MOON" as PhotoCategory },
  { id: 5, src: "/photos/p5.jpg", title: "Spectrum Frame 05", location: "Astrospectrum Gallery", category: "WARM" as PhotoCategory },
  { id: 6, src: "/photos/p6.jpg", title: "Spectrum Frame 06", location: "Astrospectrum Gallery", category: "STREET" as PhotoCategory },
  { id: 7, src: "/photos/p7.jpg", title: "Spectrum Frame 07", location: "Astrospectrum Gallery", category: "ASTROPHOTOGRAPHY" as PhotoCategory },
  { id: 8, src: "/photos/p8.jpg", title: "Spectrum Frame 08", location: "Astrospectrum Gallery", category: "NATURE" as PhotoCategory },
  { id: 9, src: "/photos/p9.jpg", title: "Spectrum Frame 09", location: "Astrospectrum Gallery", category: "SKY" as PhotoCategory },
  { id: 10, src: "/photos/p10.jpg", title: "Spectrum Frame 10", location: "Astrospectrum Gallery", category: "MOON" as PhotoCategory },
  { id: 11, src: "/photos/p11.jpg", title: "Spectrum Frame 11", location: "Astrospectrum Gallery", category: "WARM" as PhotoCategory },
  { id: 12, src: "/photos/p12.jpg", title: "Spectrum Frame 12", location: "Astrospectrum Gallery", category: "ABSTRACT" as PhotoCategory },
  { id: 13, src: "/photos/p13.jpg", title: "Spectrum Frame 13", location: "Astrospectrum Gallery", category: "ASTROPHOTOGRAPHY" as PhotoCategory },
  { id: 14, src: "/photos/p14.jpg", title: "Spectrum Frame 14", location: "Astrospectrum Gallery", category: "NATURE" as PhotoCategory },
  { id: 15, src: "/photos/p15.jpg", title: "Spectrum Frame 15", location: "Astrospectrum Gallery", category: "SKY" as PhotoCategory },
  { id: 16, src: "/photos/p16.jpg", title: "Spectrum Frame 16", location: "Astrospectrum Gallery", category: "MOON" as PhotoCategory },
  { id: 17, src: "/photos/p17.jpg", title: "Spectrum Frame 17", location: "Astrospectrum Gallery", category: "WARM" as PhotoCategory },
  { id: 18, src: "/photos/p18.jpg", title: "Spectrum Frame 18", location: "Astrospectrum Gallery", category: "STREET" as PhotoCategory },
  { id: 19, src: "/photos/p19.jpg", title: "Spectrum Frame 19", location: "Astrospectrum Gallery", category: "ABSTRACT" as PhotoCategory },
  { id: 20, src: "/photos/p20.jpg", title: "Spectrum Frame 20", location: "Astrospectrum Gallery", category: "ASTROPHOTOGRAPHY" as PhotoCategory },
  { id: 21, src: "/photos/p21.jpg", title: "Spectrum Frame 21", location: "Astrospectrum Gallery", category: "NATURE" as PhotoCategory },
  { id: 22, src: "/photos/p22.jpg", title: "Spectrum Frame 22", location: "Astrospectrum Gallery", category: "SKY" as PhotoCategory },
  { id: 23, src: "/photos/p23.jpg", title: "Spectrum Frame 23", location: "Astrospectrum Gallery", category: "MOON" as PhotoCategory },
  { id: 24, src: "/photos/p24.jpg", title: "Spectrum Frame 24", location: "Astrospectrum Gallery", category: "WARM" as PhotoCategory },
  { id: 25, src: "/photos/p25.jpg", title: "Spectrum Frame 25", location: "Astrospectrum Gallery", category: "STREET" as PhotoCategory },
  { id: 26, src: "/photos/p26.jpg", title: "Spectrum Frame 26", location: "Astrospectrum Gallery", category: "ABSTRACT" as PhotoCategory },
  { id: 27, src: "/photos/p27.jpg", title: "Spectrum Frame 27", location: "Astrospectrum Gallery", category: "ASTROPHOTOGRAPHY" as PhotoCategory },
  { id: 28, src: "/photos/p28.jpg", title: "Spectrum Frame 28", location: "Astrospectrum Gallery", category: "NATURE" as PhotoCategory },
  { id: 29, src: "/photos/p29.jpg", title: "Spectrum Frame 29", location: "Astrospectrum Gallery", category: "SKY" as PhotoCategory },
  { id: 30, src: "/photos/p30.jpg", title: "Spectrum Frame 30", location: "Astrospectrum Gallery", category: "WARM" as PhotoCategory },
  { id: 31, src: "/photos/p31.jpg", title: "Spectrum Frame 31", location: "Astrospectrum Gallery", category: "MOON" as PhotoCategory },
  { id: 32, src: "/photos/p32.jpg", title: "Spectrum Frame 32", location: "Astrospectrum Gallery", category: "ABSTRACT" as PhotoCategory },
];