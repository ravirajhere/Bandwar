import { Metadata } from "next";
import { Shield, Lock, Database, EyeOff, UserCheck, ShieldAlert } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Bandwar Portal",
  description: "Learn how the Bandwar Village Portal collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-canvas min-h-screen py-10 md:py-16 3xl:py-24">
      <div className="container mx-auto px-4 md:px-0 max-w-[900px]">
        
        {/* 🏛️ Page Header */}
        <div className="mb-12 md:mb-16 text-center">
          <div className="w-16 h-16 3xl:w-20 3xl:h-20 bg-surface border border-divider text-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Shield size={32} className="3xl:w-10 3xl:h-10" />
          </div>
          <h1 className="font-serif text-3xl md:text-5xl 3xl:text-6xl text-ink mb-4 font-semibold tracking-tight">
            Privacy Policy
          </h1>
          <div className="w-20 h-1 bg-accent mb-6 rounded-full mx-auto"></div>
          <p className="text-base md:text-lg 3xl:text-xl text-ink/60 leading-relaxed">
            Last Updated: November 2026
          </p>
        </div>

        {/* 📄 Content Body */}
        <div className="bg-surface border border-divider rounded-lg shadow-sm p-6 md:p-10 3xl:p-14">
          <div className="prose prose-lg dark:prose-invert max-w-none text-ink/80 leading-relaxed 3xl:prose-xl">
            
            <p className="text-lg 3xl:text-xl font-medium text-ink mb-8">
              The Bandwar Village Portal is a community-driven digital archive. We are committed to protecting the privacy and security of our visitors and contributors. This policy outlines how we collect, use, and safeguard your information in accordance with the Digital Personal Data Protection (DPDP) Act, 2023 (India).
            </p>

            <h2 className="flex items-center gap-2 mt-10 mb-4 text-ink">
              <Database size={24} className="text-accent" /> 1. Information We Collect
            </h2>
            <p>When you contribute to the portal (via inline editing, forms, or our Telegram bot), we may collect the following information:</p>
            <ul className="space-y-2 mb-6">
              <li><strong>Content Contributions:</strong> Text, article edits, directory listings, and photographs you submit.</li>
              <li><strong>Verification Details:</strong> Your Full Name (or alias), Contact Number/Email (optional), and the Source of Information (e.g., "I am the owner," "Local resident").</li>
              <li><strong>Technical Data:</strong> We do not use tracking cookies, analytics, or third-party advertising pixels. Your IP address is not permanently stored or tracked by the portal.</li>
            </ul>

            <h2 className="flex items-center gap-2 mt-10 mb-4 text-ink">
              <EyeOff size={24} className="text-accent" /> 2. How We Use Your Information
            </h2>
            <p>The information collected is used strictly for the following purposes:</p>
            <ul className="space-y-2 mb-6">
              <li><strong>Editorial Verification:</strong> To verify the accuracy of the information submitted before it is published on the website.</li>
              <li><strong>Attribution:</strong> If you submit a photograph or article, your name may be published as a contributor (if you provide consent).</li>
              <li><strong>Communication:</strong> To contact you via the provided details if the editorial team needs clarification regarding your submission.</li>
            </ul>
            <p className="bg-canvas border-l-4 border-accent p-4 rounded-r-md text-sm 3xl:text-base italic mb-6">
              Note: We will <strong>never</strong> publish your contact number, email address, or private verification details on the public website.
            </p>

            <h2 className="flex items-center gap-2 mt-10 mb-4 text-ink">
              <Lock size={24} className="text-accent" /> 3. Telegram Integration & Data Routing
            </h2>
            <p>
              To ensure swift moderation, all submissions (including edits, new listings, and images) are securely routed to the editorial team through a dedicated **Telegram Bot**. This means your submitted data is transmitted via Telegram's secure infrastructure. 
            </p>
            <p>
              By submitting information, you acknowledge that data is processed via Telegram. The portal's editorial team controls access to this bot and does not share this data with third parties. We recommend reviewing Telegram's own Privacy Policy for information on their data security.
            </p>

            <h2 className="flex items-center gap-2 mt-10 mb-4 text-ink">
              <UserCheck size={24} className="text-accent" /> 4. Your Rights & Data Retention
            </h2>
            <p>Under the DPDP Act, you have the right to:</p>
            <ul className="space-y-2 mb-6">
              <li><strong>Access and Correction:</strong> Request to view or correct the personal data we hold about you.</li>
              <li><strong>Withdrawal of Consent:</strong> You may request the deletion of your submitted content or verification details at any time.</li>
              <li><strong>Data Retention:</strong> Verification details are retained only for as long as necessary to moderate the submission and maintain editorial records. Public content remains on the portal as part of the village archive unless requested otherwise.</li>
            </ul>

            <h2 className="flex items-center gap-2 mt-10 mb-4 text-ink">
              <ShieldAlert size={24} className="text-accent" /> 5. Security & Third-Party Links
            </h2>
            <p>
              We implement reasonable security measures to protect your data. However, no method of transmission over the internet is 100% secure. The portal may contain links to external websites (e.g., government portals, Google Maps). We are not responsible for the privacy practices of those external sites.
            </p>

            <h2 className="flex items-center gap-2 mt-10 mb-4 text-ink">
              <Shield size={24} className="text-accent" /> 6. Contact & Updates
            </h2>
            <p>
              This policy may be updated periodically. Any significant changes will be reflected on this page. If you have questions about this privacy policy, wish to access your data, or want to withdraw consent, please contact the editorial team via our official Telegram bot.
            </p>
            <p className="mt-8">
              <Link href="/contribute" className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-md font-medium transition-colors shadow-sm no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
                Contact Editorial Team
              </Link>
            </p>
            
          </div>
        </div>
      </div>
    </div>
  );
}