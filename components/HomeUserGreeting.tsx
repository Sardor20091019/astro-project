import { getCurrentUser } from "@/lib/auth";

export default async function HomeUserGreeting() {
  const user = await getCurrentUser();

  return (
    <div className="bg-zinc-900 p-2 text-center text-xs text-zinc-400">
      {user ? (
        <p>
          hi, ur currently logged in as: <strong>{user.name}</strong>
        </p>
      ) : (
        <p>hi</p>
      )}
    </div>
  );
}
