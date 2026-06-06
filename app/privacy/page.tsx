import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] pt-24 pb-16 transition-colors duration-500">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-8">Last Updated: June 2026</p>

        <div className="space-y-6 text-sm text-[var(--text-dim)] leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-[var(--text)] uppercase tracking-wide mb-2">1. Information We Collect</h2>
            <p>We collect minimal personal data to operate the application safely and verify user interactions:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Account Profile Information:</strong> Your name, email address, or unique messaging identifiers and profile pictures provided during authentication.</li>
              <li><strong>Content Data:</strong> Images uploaded to our servers, user profile configurations, and chat logs transmitted through our live components.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--text)] uppercase tracking-wide mb-2">2. How Your Data Is Managed</h2>
            <p>We process data exclusively to keep your live session active, render your user profile interface, and support real-time chat instances. We do not distribute or sell personal user metadata to third-party advertising companies.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--text)] uppercase tracking-wide mb-2">3. Third-Party Data Processors</h2>
            <p>To deliver modern real-time performance and absolute platform safety, we share specific tracking structures with trusted cloud subprocessors:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>NextAuth:</strong> Manages secure cookie-based session keys to keep you authenticated safely.</li>
              <li><strong>UploadThing:</strong> Handles secure media uploads and file optimization pipeline logic for your frames.</li>
              <li><strong>Sightengine:</strong> Processes all incoming image content through automated AI moderation layers to detect and reject explicit, illicit, or harmful visuals instantly.</li>
              <li><strong>Pusher:</strong> Processes real-time WebSocket connection strings to power instance chat indicators and alerts.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--text)] uppercase tracking-wide mb-2">4. Cookies</h2>
            <p>We use strictly essential cookies necessary for system navigation and securing authentication flows. Disabling cookies will break session tracking structures across the platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--text)] uppercase tracking-wide mb-2">5. Data Retention & User Rights</h2>
            <p>Your data stays in our secure databases as long as your profile remains active. Users have the right to request account details or absolute profile removal at any moment.</p>
            <p className="mt-2">
              To request account deletion or technical data updates, you must contact the platform administration directly via the official **Instagram, Telegram, or LinkedIn** communication channels displayed clearly in the footer of the website.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}