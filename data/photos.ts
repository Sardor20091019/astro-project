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
