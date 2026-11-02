import { getContributorByUsername } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import { User, Calendar, ChevronRight } from "lucide-react";
import { ProfileClientWrapper } from "@/components/contributor/ProfileClientWrapper";

export async function generateStaticParams() {
  return [];
}

export default async function ContributorProfile({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = await params;
  const username = decodeURIComponent(resolvedParams.username);
  const contributor = getContributorByUsername(username);

  if (!contributor) notFound();

  return (
    <div className="bg-canvas min-h-screen py-10 md:py-16">
      <div className="container mx-auto px-4 md:px-0 max-w-3xl">
        
        <nav className="flex items-center gap-2 text-sm text-ink-muted mb-8">
          <Link href="/" className="hover:text-accent">Home</Link>
          <ChevronRight size={14} className="text-divider" />
          <Link href="/about" className="hover:text-accent">Contributors</Link>
          <ChevronRight size={14} className="text-divider" />
          <span className="text-ink font-medium">{contributor.displayName}</span>
        </nav>

        <div className="bg-surface border border-divider rounded-sm p-6 md:p-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
            
            {/* Avatar */}
            <div className="w-24 h-24 md:w-32 md:h-32 bg-canvas border border-divider rounded-full flex items-center justify-center shrink-0 overflow-hidden">
              {contributor.photo ? (
                <img src={contributor.photo} alt={contributor.displayName} className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-ink/20" />
              )}
            </div>

            {/* Info */}
            <div className="flex-grow text-center md:text-left">
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-ink mb-2">
                {contributor.displayName}
              </h1>
              
              <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-ink-muted mb-6">
                <Calendar size={14} />
                <span>Joined {contributor.joinedAt}</span>
              </div>

              <div className="prose prose-sm dark:prose-invert max-w-none text-ink/80 mb-6">
                {contributor.bio ? (
                  <p className="whitespace-pre-wrap">{contributor.bio}</p>
                ) : (
                  <p className="italic text-ink/40">This contributor has not added a bio yet.</p>
                )}
              </div>

              <ProfileClientWrapper contributor={contributor} />
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}