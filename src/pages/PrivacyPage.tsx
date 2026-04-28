import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAppStore } from '../store/appStore';

export default function PrivacyPage() {
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
        <h1 className="font-syne font-extrabold text-4xl text-slate-900 dark:text-white mb-4">Privacy Policy</h1>
        <p className="text-slate-500 mb-12">Last Updated: April 28, 2026</p>

        <div className="space-y-8 prose prose-slate dark:prose-invert max-w-none">
          <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">1. Information We Collect</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Vellum AI is built with privacy at its core. Most of our tools run entirely in your browser using WebAssembly. This means your files are processed locally on your device and are never uploaded to our servers.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400">
              <li><strong>Local Processing:</strong> Files remain on your device.</li>
              <li><strong>Cloud Processing:</strong> For AI-based tools and specific large conversions, files are temporarily processed on secure cloud servers and instantly deleted.</li>
              <li><strong>Usage Analytics:</strong> We collect non-identifiable usage statistics to improve the app.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">2. Zero Retention Policy</h2>
            <p className="text-slate-600 dark:text-slate-400">
              We strictly enforce a Zero Retention Policy for all uploaded documents. If your document requires cloud processing, it is encrypted in transit using industry-standard TLS protocols. Once the processing task completes, the original file and its generated output are <strong>immediately and permanently deleted</strong> from our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">3. AI Features & Data Sharing</h2>
            <p className="text-slate-600 dark:text-slate-400">
              When utilizing our AI capabilities (e.g., AI Chat, Summarization), data extraction is powered by third-party APIs (such as Gemini AI). The contents of your documents are only shared with these providers for the explicit purpose of generating the requested output and are explicitly restricted from being used to train their models.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">4. User Accounts</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Creating an account is optional. If you choose to upgrade to Pro, we collect necessary billing and authentication data (email address) securely processed by our third-party payment gateways (e.g., Stripe).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Contact Us</h2>
            <p className="text-slate-600 dark:text-slate-400">
              If you have any questions about this Privacy Policy, please contact us at support@vellum-ai.example.com.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
