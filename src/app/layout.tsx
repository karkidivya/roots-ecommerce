import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { Analytics } from '@/components/analytics/analytics';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const LOGO_URL =
  'https://res.cloudinary.com/dlk4mtgle/image/upload/v1779509310/692749951_122102590203303257_7552527138558933451_n_njp3qz.jpg';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Nepal Shop';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP_NAME} — Buy Sattu Online in Nepal | AKSHYATA`,
    template: `%s · ${APP_NAME}`,
  },
  description:
    'Buy AKSHYATA sattu online in Nepal — chana, jau & multigrain sattu, slow-roasted and stone-ground. Heritage grains, millet flours and wild honey, farmer-direct. Home delivery in Biratnagar & across Nepal. Cash on delivery.',
  keywords: [
    'sattu',
    'buy sattu online',
    'sattu Nepal',
    'sattu Biratnagar',
    'chana sattu',
    'jau sattu',
    'multigrain sattu',
    'AKSHYATA',
    'Grain Roots',
  ],
  icons: {
    icon: [
      { url: LOGO_URL.replace('/upload/', '/upload/w_32,h_32,c_fill/'), sizes: '32x32' },
      { url: LOGO_URL.replace('/upload/', '/upload/w_64,h_64,c_fill/'), sizes: '64x64' },
    ],
    apple: LOGO_URL.replace('/upload/', '/upload/w_180,h_180,c_fill/'),
  },
  openGraph: {
    images: [LOGO_URL.replace('/upload/', '/upload/w_1200,h_630,c_fill/')],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'OnlineStore',
              name: APP_NAME,
              alternateName: 'AKSHYATA by Grain Roots Food',
              url: APP_URL,
              logo: LOGO_URL,
              description:
                'Buy AKSHYATA sattu, heritage grains and millet flours online in Nepal. Home delivery in Biratnagar and nationwide, cash on delivery.',
              telephone: '+977-9868074388',
              email: 'foodgrainroots@gmail.com',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Biratnagar',
                addressRegion: 'Koshi',
                addressCountry: 'NP',
              },
              areaServed: ['Biratnagar', 'Koshi Province', 'Nepal'],
              sameAs: [
                'https://www.instagram.com/grainrootsfood/',
                'https://www.facebook.com/grainrootsfood',
                'https://www.tiktok.com/@grainrootsfood',
              ],
            }),
          }}
        />
      </head>
      <body className="font-sans">
        {children}
        <Toaster richColors position="top-center" />
        <Analytics />
      </body>
    </html>
  );
}
