import { getCurrentUser } from "@/lib/auth";

export default async function HomeUserGreeting() {
  const user = await getCurrentUser();

return (
  <div className="world-card p-2 text-center text-xs world-text-muted">
    {user ? (
      <p>
        hi, ur currently logged in as: <strong className="world-text-bold">{user.name}</strong>
      </p>
    ) : (
      <p>hi</p>
    )}
  </div>
)}