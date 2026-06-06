import Link from "next/link";

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] pt-24 pb-16 transition-colors duration-500">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Terms of Use</h1>
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-8">Last Updated: June 2026</p>

        <div className="space-y-6 text-sm text-[var(--text-dim)] leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-[var(--text)] uppercase tracking-wide mb-2">1. Acceptance of Terms</h2>
            <p>By logging into, accessing, or using Astrospectrum (astrospectrum.uz), you explicitly agree to be bound by these Terms of Use and our Privacy Policy each time you authenticate. If you do not agree, please do not use our platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--text)] uppercase tracking-wide mb-2">2. User Accounts & Security</h2>
            <p>To access community features like submitting frames or real-time messaging, you must sign in via our authentication options. You are entirely responsible for maintaining the confidentiality of your session and account activity.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--text)] uppercase tracking-wide mb-2">3. User-Generated Content & Automated Moderation</h2>
            <p>You retain all ownership rights to the photography/images ("Frames") you upload to Astrospectrum. However, by uploading content, you grant Astrospectrum a worldwide, non-exclusive, royalty-free license to host and display your content on the platform.</p>
            <p className="mt-2 font-semibold text-[var(--accent)]">
              All submitted media files are processed through automated AI filtering mechanisms powered by Sightengine. Any uploaded files containing copyrighted imagery you do not own, or content flagged as inappropriate, harmful, explicit, or violating community guidelines, will be rejected immediately before publishing.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--text)] uppercase tracking-wide mb-2">4. Community Conduct Rules</h2>
            <p>Our messaging system (powered by Pusher) is built for collaborative engagement. You agree not to use communication features to transmit spam, threaten or harass creators, or share malicious links.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--text)] uppercase tracking-wide mb-2">5. Platform Moderation and Termination</h2>
            <p>We reserve the ultimate right, at our sole discretion and without prior notice, to reject, hide, or permanently delete any image submission, or terminate any user profile that violates our operational values.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--text)] uppercase tracking-wide mb-2">6. Administration & Contacts</h2>
            <p>
              For legal inquiries, copyright claims, or profile updates, you must reach out directly to the platform administration using the official **Instagram, Telegram, or LinkedIn** links located inside the footer navigation of the website.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}