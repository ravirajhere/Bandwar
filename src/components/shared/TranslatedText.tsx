"use client";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function TranslatedText({ 
  en, hi, an, className, as: Component = "p" 
}: { en: string, hi?: string, an?: string, className?: string, as?: any }) {
  const { language } = useLanguage();
  
  let text = en;
  if (language === "hi") text = hi || en;
  if (language === "an") text = an || hi || en; // Agar Angika nahi hai, toh Hindi, warna English

  return <Component className={className}>{text}</Component>;
}