export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto p-8">
    <h1 className="text-2xl font-bold mb-4">Privacy Policy <span className="text-sm font-normal text-red-500">(IT DOESNT APPLY YET, IT IS JUST A DRAFT)</span></h1>
      <p className="text-sm text-gray-500 mb-6">Last Updated: June 2026</p>
      
      <section className="mb-6">
        <h2 className="text-lg font-semibold">1. Data Collection</h2>
        <p>We collect minimal data to provide our services. This includes:</p>
        <ul className="list-disc pl-5 mt-2">
          <li><strong>Authentication:</strong> Email addresses and OTP tokens for secure login.</li>
          <li><strong>Usage Limits:</strong> Your IP address is processed temporarily to enforce rate-limiting (max 3 emails per minute) to prevent spam and bot activity.</li>
          <li><strong>Profile Info:</strong> Nicknames and names provided by users.</li>
          <li><strong>Content:</strong> Photos you upload and associated metadata.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold">2. Automated Moderation</h2>
        <p>All photos uploaded are automatically processed by <strong>Sightengine</strong> to ensure content safety. Images that violate community guidelines are blocked at the point of upload and are not stored in our database.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold">3. Data Retention</h2>
        <p>We store your data only as long as your account is active. If you delete your account, your personal data and uploaded content will be removed from our systems.</p>
      </section>
    </div>
  );
}