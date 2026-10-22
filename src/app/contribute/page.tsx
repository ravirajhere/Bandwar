import { getMasterData } from "@/lib/data";
import { ContributeForm } from "@/components/contribute/ContributeForm";

export const metadata = {
  title: "Contribute | Bandwar Portal",
  description: "Share your memories, report an issue, or suggest a correction for the Bandwar Village Portal.",
};

export default function ContributePage() {
  const config = getMasterData();
  const email = config.contact.email;

  return (
    <div className="bg-wiki-bg min-h-screen py-8">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl text-wiki-text mb-2">
            Contribute to the Portal
          </h1>
          <div className="w-full border-b border-wiki-border-light mb-3"></div>
          <p className="text-[15px] text-wiki-text-muted max-w-3xl">
            This portal is built by the community, for the community. Your memories, photos, and corrections make it better.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: The Form */}
          <div className="lg:col-span-2">
            <ContributeForm email={email} />
          </div>

          {/* RIGHT: Guidelines & Info */}
          <div className="space-y-6">
            
            <div className="border border-wiki-border-light bg-wiki-bg-alt p-4">
              <h3 className="font-bold text-wiki-text text-[15px] mb-3 border-b border-wiki-border-light pb-2">
                How it works
              </h3>
              <ul className="text-[13px] text-wiki-text-muted space-y-2 list-disc pl-4">
                <li>Fill out the form on the left.</li>
                <li>Click "Send via Email".</li>
                <li>Your default email app (like Gmail) will open.</li>
                <li>Just hit send! We will review your contribution.</li>
              </ul>
            </div>

            <div className="border border-wiki-border-light bg-wiki-bg p-4">
              <h3 className="font-bold text-wiki-text text-[15px] mb-3 border-b border-wiki-border-light pb-2">
                Prefer Direct Email?
              </h3>
              <p className="text-[13px] text-wiki-text-muted mb-2">
                You can also write to us directly at:
              </p>
              <a href={`mailto:${email}`} className="font-bold text-wiki-link hover:underline break-all text-[14px]">
                {email}
              </a>
              {config.contact.address && (
                <p className="text-[12px] text-wiki-text-muted mt-3 pt-3 border-t border-wiki-border-light">
                  {config.contact.address}
                </p>
              )}
            </div>

            <div className="bg-[#fef8e7] border border-[#fce8b2] p-4">
              <h4 className="font-bold text-[#b47a00] text-[13px] mb-1">Note for Photos:</h4>
              <p className="text-[12px] text-[#b47a00]">
                If you are submitting a photo, please attach it to the email after your mail app opens.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}