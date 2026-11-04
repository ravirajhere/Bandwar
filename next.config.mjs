/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  trailingSlash: false, // 🚀 SEO FIX: Prevents duplicate URLs like /about/ and /about

  // 🚀 SEO FIX: Image Optimization
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days cache
    deviceSizes: [400, 640, 800, 1024, 1200, 1600, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    dangerouslyAllowSVG: false,
  },

  // 🚀 SECURITY FIX: Global & Admin Headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" },
          { key: "X-Frame-Options", value: "DENY" }, // Prevents clickjacking
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
      {
        source: "/api/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ];
  },

  // 🚀 SEO FIX: 301 Redirects for old URLs
  async redirects() {
    return [
      { source: '/article', destination: '/section', permanent: true },
      { source: '/section/people', destination: '/people', permanent: true }, // From categories.json cleanup
      
      // --- HEALTH ---
      { source: '/article/health-infrastructure', destination: '/article/health-infrastructure-bandwar-village', permanent: true },
      { source: '/article/diarrhea-outbreak', destination: '/article/diarrhea-outbreak-bandwar-september-2025', permanent: true },
      { source: '/article/health-challenges', destination: '/article/health-infrastructure-bandwar-village', permanent: true },

      // --- CULTURE ---
      { source: '/article/janmashtami-mela', destination: '/article/janmashtami-mela-bandwar-bihar', permanent: true },
      { source: '/article/chhath-puja', destination: '/article/chhath-puja-bandwar-bandh-burhi-gandak', permanent: true },
      { source: '/article/sama-chakeva', destination: '/article/sama-chakeva-mithila-festival-bandwar', permanent: true },
      { source: '/article/mithila-painting', destination: '/article/mithila-painting-madhubani-bandwar', permanent: true },
      { source: '/article/ram-katha-2021', destination: '/article/ram-katha-thakurbari-bandwar-2021', permanent: true },
      { source: '/article/kushti', destination: '/article/kushti-mud-pit-wrestling-bandwar-mela', permanent: true },
      { source: '/article/cricket-tournament', destination: '/article/shahid-rajesh-memorial-cricket-tournament-bandwar', permanent: true },

      // --- EDUCATION ---
      { source: '/article/snk-high-school', destination: '/article/snk-high-school-bandwar', permanent: true },
      { source: '/article/ms-bandwar', destination: '/article/ms-bandwar-middle-school', permanent: true },
      { source: '/article/gps-paschimibandwar', destination: '/article/gps-paschimibandwar-school', permanent: true },
      { source: '/article/gps-mohanpur-kanya', destination: '/article/gps-mohanpur-kanya-school', permanent: true },
      { source: '/article/gps-bandwar-musahri', destination: '/article/gps-bandwar-musahri-school', permanent: true },
      { source: '/article/adharsh-vikash', destination: '/article/adharsh-vikash-vidhya-mandir', permanent: true },
      { source: '/article/st-paul-school', destination: '/article/st-paul-school-bandwar', permanent: true },
      { source: '/article/vaani-vilas-library', destination: '/article/vaani-vilas-library-bandwar', permanent: true },

      // --- GEOGRAPHY & LANDMARKS ---
      { source: '/article/burhi-gandak', destination: '/article/burhi-gandak-river-bandwar', permanent: true },
      { source: '/article/shaheed-dwar', destination: '/article/shaheed-ramchandra-dwar-bandwar', permanent: true },
      { source: '/article/chandrashekhar-chowk', destination: '/article/chandrashekhar-chowk-bandwar', permanent: true },
      { source: '/article/historic-well', destination: '/article/historic-well-chaupal-bandwar', permanent: true },
      { source: '/article/bandh', destination: '/article/bandh-embankment-bandwar', permanent: true },

      // --- INFRASTRUCTURE ---
      { source: '/article/sbi-bank', destination: '/article/sbi-bank-bandwar', permanent: true },
      { source: '/article/post-office', destination: '/article/bandwar-post-office', permanent: true },
      { source: '/article/petrol-pump', destination: '/article/ram-janki-petrol-pump-bandwar', permanent: true },
      { source: '/article/jal-jeevan-tank', destination: '/article/jal-jeevan-mission-water-tower-bandwar', permanent: true },
      { source: '/article/roads', destination: '/article/roads-connectivity-bandwar', permanent: true },

      // --- RELIGION ---
      { source: '/article/shivala', destination: '/article/shivala-temple-bandwar', permanent: true },
      { source: '/article/ram-mandir-thakurbari', destination: '/article/ram-mandir-thakurbari-bandwar', permanent: true },
      { source: '/article/krishna-mandir-bada', destination: '/article/bada-krishna-mandir-bandwar', permanent: true },
      { source: '/article/krishna-mandir-chhota', destination: '/article/chhota-krishna-mandir-bandwar', permanent: true },
      { source: '/article/maharishi-gautam-mandir', destination: '/article/maharishi-gautam-durga-mandir-bandwar', permanent: true },
      { source: '/article/hanuman-mandir', destination: '/article/sankat-mochan-hanuman-mandir-bandwar', permanent: true },
      { source: '/article/baba-bhole-mandir', destination: '/article/baba-bhole-durgasthan-hanuman-mandir-bandwar', permanent: true },
    ];
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns"],
  },
};

export default nextConfig;