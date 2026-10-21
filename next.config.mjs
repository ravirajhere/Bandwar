/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // <--- Ye sabse important hai!
  images: {
    unoptimized: true, // Kyunki hum static export kar rahe hain
  },
};

export default nextConfig;