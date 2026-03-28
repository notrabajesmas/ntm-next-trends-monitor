import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | NTM - Next Trends Monitor",
  description: "Terms of Service and User Agreement for Next Trends Monitor"
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-900 py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>
          
          <div className="prose prose-invert prose-slate max-w-none">
            <p className="text-slate-400 mb-6">
              Last updated: January 2024
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-slate-300 mb-4">
                By accessing and using Next Trends Monitor (&quot;NTM&quot;, &quot;Service&quot;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">2. Description of Service</h2>
              <p className="text-slate-300 mb-4">
                NTM provides digital analysis tools including business scanning, trend detection, digital auditing, and report generation. The service uses artificial intelligence and public data sources to generate insights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">3. User Accounts</h2>
              <p className="text-slate-300 mb-4">
                To access certain features of the Service, you must register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">4. Subscription and Payments</h2>
              <p className="text-slate-300 mb-4">
                NTM offers both free and paid subscription plans. Paid subscriptions are processed through Paddle.com. By subscribing, you authorize Paddle to charge your payment method for the subscription fees.
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>All prices are in USD unless otherwise specified</li>
                <li>Subscriptions renew automatically unless cancelled</li>
                <li>You may cancel your subscription at any time</li>
                <li>Refunds are handled on a case-by-case basis</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">5. Acceptable Use</h2>
              <p className="text-slate-300 mb-4">
                You agree not to use the Service for any unlawful purpose or in any way that could damage, disable, overburden, or impair the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">6. Data and Privacy</h2>
              <p className="text-slate-300 mb-4">
                Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">7. Contact Information</h2>
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <p className="text-slate-300">Email: legal@ntm.io</p>
                <p className="text-slate-300">Website: https://ntm.io</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
