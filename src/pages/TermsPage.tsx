import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-dm-sans transition-colors duration-300">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16 dark:text-slate-300">
        <h1 className="font-syne font-extrabold text-4xl text-slate-900 dark:text-white mb-4">Terms of Service</h1>
        <p className="text-slate-500 mb-12">Last Updated: April 28, 2026</p>

        <div className="space-y-8 prose prose-slate dark:prose-invert max-w-none">
          <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-600 dark:text-slate-400">
              By accessing and using Vellum AI ("Service"), you accept and agree to be bound by the terms and provisions of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">2. Description of Service</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Vellum AI provides a suite of online tools primarily geared toward processing, viewing, and manipulating Portable Document Format (.pdf) files and images. The Service is provided "as is" without warranty of any kind.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">3. Pro Upgrades & Billing</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Certain features, such as advanced AI tools and unlimited batch processing, are exclusive to Pro subscribers. All payments are securely processed through third-party billing providers. Subscriptions renew automatically unless canceled prior to the renewal date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">4. User Responsibilities</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              You agree not to use the Service to process files that contain illegal content, including but not limited to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400">
              <li>Documents violating intellectual property rights.</li>
              <li>Unauthorized distribution of sensitive personal information.</li>
              <li>Malicious software or embedded exploits.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">5. Limitation of Liability</h2>
            <p className="text-slate-600 dark:text-slate-400">
              In no event shall Vellum AI, nor its creators, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
