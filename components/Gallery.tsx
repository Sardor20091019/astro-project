import { prisma } from "@/lib/prisma";

export default async function Gallery() {
  // Directly query the database from the server
  const photos = await prisma.photo.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {photos.map((photo) => (
        <div key={photo.id} className="overflow-hidden rounded-xl">
          <img 
            src={photo.url} 
            alt={photo.title} 
            className="w-full h-full object-cover hover:scale-105 transition-transform" 
          />
          <p className="mt-2 text-sm text-zinc-400">{photo.title}</p>
        </div>
      ))}
    </div>
  );
}