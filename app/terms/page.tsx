export default function TermsOfUse() {
  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Terms of Use <span className="text-sm font-normal text-red-500">(IT DOESNT APPLY YET, IT IS JUST A DRAFT)</span></h1>
      
      <section className="mb-6">
        <h2 className="text-lg font-semibold">1. User Content & Copyright</h2>
        <p>You retain full copyright ownership of the photos you upload. However, by uploading content, you grant us a non-exclusive license to host, display, and distribute your content within the platform.</p>
        <p className="mt-2 text-red-600 font-medium">
          <strong>Liability Disclaimer:</strong> We are not responsible for any copyright infringement caused by user-uploaded content. Users are solely responsible for ensuring they have the rights to the content they upload. If you believe your copyright has been violated, please contact us immediately for removal.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold">2. Conduct & Moderation</h2>
        <p>We reserve the right to remove any content or terminate user accounts at our sole discretion, especially if content is flagged by our moderation systems as harmful, illegal, or inappropriate.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold">3. Governing Law</h2>
        <p>These terms shall be governed by and construed in accordance with the laws of the Republic of Uzbekistan. Any disputes arising from these terms will be handled through direct communication with the site administration.</p>
      </section>
    </div>
  );
}