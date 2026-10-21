import { getMasterData } from "@/lib/data";

export const metadata = {
  title: "Contribute | Bandwar Archive",
  description: "Share your memories, report an issue, or suggest a correction for the Bandwar Village Archive.",
};

export default function ContributePage() {
  const config = getMasterData();
  const email = config.contact.email;

  // Mailto links generate karne ka function
  const createMailto = (subject: string, body: string) => {
    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const options = [
    {
      icon: "✏️",
      title: "Suggest a Correction",
      description: "Spotted an error in an article? Let us know so we can fix it.",
      subject: "Correction Suggestion",
      body: "Article Name / URL:\n\nWhat needs to be corrected:\n\nCorrect Information:\n",
      color: "bg-blue-50 border-blue-200 text-blue-900",
    },
    {
      icon: "➕",
      title: "Add Information",
      description: "Have a story, historical fact, or detail we missed? Share it with us.",
      subject: "New Information Submission",
      body: "Topic / Page:\n\nInformation to add:\n\nSource (if any):\n",
      color: "bg-green-50 border-green-200 text-green-900",
    },
    {
      icon: "👤",
      title: "Add a Person",
      description: "Nominate a notable personality, elder, or leader from Bandwar.",
      subject: "Person Submission",
      body: "Full Name:\nRole/Occupation:\nLocality (Ward/Tola):\nBrief Bio:\n\nDo you have a photo? (Yes/No):\n",
      color: "bg-amber-50 border-amber-200 text-amber-900",
    },
    {
      icon: "📸",
      title: "Submit a Photo",
      description: "Share old or new photographs of the village, temples, or events.",
      subject: "Photo Submission",
      body: "Photo Description:\nYear/Decade (if known):\nLocation in Village:\n\nPlease attach the photo to this email.\n",
      color: "bg-purple-50 border-purple-200 text-purple-900",
    },
    {
      icon: "🐞",
      title: "Report an Issue",
      description: "Found a broken link, missing image, or technical glitch?",
      subject: "Website Issue Report",
      body: "Page / URL:\n\nWhat is the issue:\n\n(If possible, please attach a screenshot)\n",
      color: "bg-red-50 border-red-200 text-red-900",
    }
  ];

  return (
    <div className="bg-[#f7f5ef] min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#1a1a18] mb-4">
            Contribute to the Archive
          </h1>
          <p className="text-lg text-[#1a1a18]/60 max-w-2xl mx-auto">
            This archive is built by the community, for the community. Your memories, photos, and corrections make it better.
          </p>
          <p className="mt-4 text-sm font-medium text-[#a64b2a] bg-[#a64b2a]/10 inline-block px-4 py-2 rounded-lg">
            No login required. All contributions happen via email.
          </p>
        </div>

        {/* Email Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {options.map((opt, idx) => (
            <a 
              key={idx}
              href={createMailto(opt.subject, opt.body)}
              className={`group p-6 rounded-2xl border-2 transition-all hover:-translate-y-1 hover:shadow-md ${opt.color} bg-white`}
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{opt.icon}</div>
              <h3 className="font-serif text-xl font-bold mb-2">{opt.title}</h3>
              <p className="text-sm opacity-80 leading-relaxed mb-4">{opt.description}</p>
              <div className="text-sm font-bold flex items-center gap-2">
                <span>Open Email App</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </a>
          ))}
        </div>

        {/* Contact Info */}
        <div className="mt-16 text-center text-[#1a1a18]/60 text-sm">
          <p>Prefer to write directly? Email us at:</p>
          <a href={`mailto:${email}`} className="font-bold text-[#1f3d2f] text-lg hover:underline mt-2 block">
            {email}
          </a>
          {config.contact.address && (
            <p className="mt-4">{config.contact.address}</p>
          )}
        </div>

      </div>
    </div>
  );
}