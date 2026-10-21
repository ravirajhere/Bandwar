import Image from "next/image";
import { VisionData } from "@/lib/schema";

type Priority = VisionData["priorities"][0];

export function PriorityCard({ data }: { data: Priority }) {
  return (
    <div className="bg-white border border-[#1a1a18]/10 rounded-2xl overflow-hidden mb-16 shadow-sm">
      
      {/* Header */}
      <div className="bg-[#efece4] p-6 border-b border-[#1a1a18]/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[#a64b2a] font-bold text-sm tracking-widest uppercase mb-1 block">
            Priority {data.number} · {data.category}
          </span>
          <h3 className="font-serif text-2xl md:text-3xl font-bold text-[#1a1a18]">
            {data.title}
          </h3>
        </div>
        <div className="text-left md:text-right">
          <span className="inline-block bg-[#1f3d2f] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            Target: {data.targetYear}
          </span>
          <p className="text-sm text-[#1a1a18]/60 font-medium">Ward: {data.ward}</p>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {/* Present vs Required Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="relative aspect-video rounded-xl overflow-hidden group">
            <Image src={`/${data.present.photo}`} alt="Present" fill className="object-cover grayscale-[30%] group-hover:grayscale-0 transition-all" />
            <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">Current Reality</div>
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-10">
              <p className="text-white text-sm font-medium">{data.present.caption}</p>
            </div>
          </div>
          <div className="relative aspect-video rounded-xl overflow-hidden group border-2 border-[#1f3d2f]">
            <Image src={`/${data.required.photo}`} alt="Vision" fill className="object-cover" />
            <div className="absolute top-2 left-2 bg-[#1f3d2f] text-white text-xs px-2 py-1 rounded">Target Vision</div>
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-10">
              <p className="text-white text-sm font-medium">{data.required.caption}</p>
            </div>
          </div>
        </div>

        {/* Reality vs Vision Text */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-red-50/50 p-5 rounded-xl border border-red-100">
            <h4 className="font-bold text-red-900 mb-2 flex items-center gap-2">⚠️ The Reality</h4>
            <p className="text-[#1a1a18]/80 text-sm leading-relaxed">{data.reality}</p>
          </div>
          <div className="bg-green-50/50 p-5 rounded-xl border border-green-100">
            <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">✨ The Vision</h4>
            <p className="text-[#1a1a18]/80 text-sm leading-relaxed">{data.vision}</p>
          </div>
        </div>

        {/* How to achieve & Checklist */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div>
              <h4 className="font-serif font-bold text-lg mb-3 border-b pb-2">How to Achieve</h4>
              <ul className="space-y-3 text-sm">
                <li><strong className="text-[#1a1a18]/60 block text-xs uppercase">Scheme</strong> {data.how.scheme}</li>
                <li><strong className="text-[#1a1a18]/60 block text-xs uppercase">Est. Cost</strong> {data.how.cost}</li>
                <li><strong className="text-[#1a1a18]/60 block text-xs uppercase">Authority</strong> {data.how.authority}</li>
                <li><strong className="text-[#1a1a18]/60 block text-xs uppercase">Timeline</strong> {data.how.timeline}</li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-2">
             <h4 className="font-serif font-bold text-lg mb-3 border-b pb-2">{data.inside.intro}</h4>
             <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {data.inside.checklist.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-[#1a1a18]/80">
                    <span className="text-[#1f3d2f] mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
             </ul>
          </div>
        </div>

      </div>
    </div>
  );
}