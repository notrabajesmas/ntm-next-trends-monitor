import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | NTM - Next Trends Monitor",
  description: "Privacy Policy for Next Trends Monitor"
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-900 py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
          
          <div className="prose prose-invert prose-slate max-w-none">
            <p className="text-slate-400 mb-6">
              Last updated: January 2024
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">1. Information We Collect</h2>
              <p className="text-slate-300 mb-4">
                We collect information you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Account information (name, email address)</li>
                <li>Payment information (processed securely by Paddle)</li>
                <li>Usage data and preferences</li>
                <li>Queries and analysis requests</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
              <p className="text-slate-300 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Provide, maintain, and improve our Service</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">3. Information Sharing</h2>
              <p className="text-slate-300 mb-4">
                We do not sell your personal information. We may share your information with:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Service providers (Paddle for payments)</li>
                <li>AI providers for analysis processing</li>
                <li>Legal requirements when necessary</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">4. Data Security</h2>
              <p className="text-slate-300 mb-4">
                We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">5. Your Rights</h2>
              <p className="text-slate-300 mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">6. Contact Us</h2>
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <p className="text-slate-300">Email: privacy@ntm.io</p>
                <p className="text-slate-300">Website: https://ntm.io</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
