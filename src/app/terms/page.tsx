import { Metadata } from "next";
import { FileText, AlertTriangle, Scale, Copyright, UserX, Globe, Gavel } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use | Bandwar Portal",
  description: "Terms and conditions for using the Bandwar Village Portal and contributing to the digital archive.",
};

export default function TermsPage() {
  return (
    <div className="bg-canvas min-h-screen py-10 md:py-16 3xl:py-24">
      <div className="container mx-auto px-4 md:px-0 max-w-[900px]">
        
        {/* 🏛️ Page Header */}
        <div className="mb-12 md:mb-16 text-center">
          <div className="w-16 h-16 3xl:w-20 3xl:h-20 bg-surface border border-divider text-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Scale size={32} className="3xl:w-10 3xl:h-10" />
          </div>
          <h1 className="font-serif text-3xl md:text-5xl 3xl:text-6xl text-ink mb-4 font-semibold tracking-tight">
            Terms of Use
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
              Welcome to the Bandwar Village Portal. By accessing or using this website, you agree to comply with and be bound by the following Terms of Use. If you do not agree with any part of these terms, please refrain from using the portal.
            </p>

            <h2 className="flex items-center gap-2 mt-10 mb-4 text-ink">
              <Globe size={24} className="text-accent" /> 1. Nature of the Portal
            </h2>
            <p>
              The Bandwar Village Portal is a community-driven digital archive and informational website. It is <strong>not</strong> an official government website, nor is it affiliated with any political party or commercial entity. The content is managed by a volunteer editorial team comprising residents and descendants of Bandwar.
            </p>

            <h2 className="flex items-center gap-2 mt-10 mb-4 text-ink">
              <AlertTriangle size={24} className="text-accent" /> 2. Accuracy Disclaimer
            </h2>
            <p>
              While we strive to provide accurate and up-to-date information, the content on this portal is provided "as is" and for general informational purposes only. Because this is a community-maintained archive, errors or omissions may occur. For official matters (such as land records, government schemes, or emergency services), please contact the relevant government authorities directly.
            </p>

            <h2 className="flex items-center gap-2 mt-10 mb-4 text-ink">
              <FileText size={24} className="text-accent" /> 3. User Contributions & Conduct
            </h2>
            <p>
              We encourage visitors to contribute to the archive via our inline editing tools and Telegram bot. By submitting content, you agree to the following:
            </p>
            <ul className="space-y-2 mb-6">
              <li><strong>Accurate Information:</strong> You will provide truthful and accurate details. Deliberate misinformation or spam is strictly prohibited.</li>
              <li><strong>Respectful Conduct:</strong> Contributions must not contain abusive, defamatory, obscene, or politically inflammatory language.</li>
              <li><strong>Editorial Rights:</strong> The editorial team reserves the right to review, edit, or reject any submission before publishing. We are not obligated to publish every submission.</li>
              <li><strong>No Malicious Use:</strong> You must not attempt to hack, scrape, or disrupt the website's security or functionality.</li>
            </ul>

            <h2 className="flex items-center gap-2 mt-10 mb-4 text-ink">
              <Copyright size={24} className="text-accent" /> 4. Intellectual Property & Licensing
            </h2>
            <p>
              We believe in open knowledge. However, the rights to the content are managed as follows:
            </p>
            <ul className="space-y-2 mb-6">
              <li><strong>Content:</strong> All text and historical photographs are the property of their respective contributors. Content is licensed under <strong>CC BY-NC-SA 4.0</strong> (Creative Commons). You may share it for non-commercial purposes with proper attribution to the portal.</li>
              <li><strong>Code:</strong> The underlying source code of this portal is licensed under the <strong>MIT License</strong>.</li>
              <li><strong>Image Ownership:</strong> When you submit a photograph, you confirm that you own the rights to it or have permission to share it. Do not upload copyrighted images from the internet.</li>
            </ul>

            <h2 className="flex items-center gap-2 mt-10 mb-4 text-ink">
              <UserX size={24} className="text-accent" /> 5. Limitation of Liability
            </h2>
            <p>
              The Bandwar Village Community and the editors of this portal shall not be held liable for any direct, indirect, incidental, or consequential damages arising from the use of this website or reliance on its content. Use of the information provided is at your own risk.
            </p>

            <h2 className="flex items-center gap-2 mt-10 mb-4 text-ink">
              <Gavel size={24} className="text-accent" /> 6. Governing Law & Changes
            </h2>
            <p>
              These terms are governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Begusarai, Bihar. We reserve the right to modify these terms at any time. Continued use of the portal after changes are made constitutes acceptance of the new terms.
            </p>

            <p className="mt-10 pt-6 border-t border-divider">
              If you have any questions regarding these Terms of Use, please reach out to the editorial team via our Telegram bot or the <Link href="/contribute" className="text-accent hover:text-accent-hover underline underline-offset-4">Contribute page</Link>.
            </p>
            
          </div>
        </div>
      </div>
    </div>
  );
}