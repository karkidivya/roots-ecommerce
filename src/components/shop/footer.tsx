import Link from 'next/link';
import { Facebook, Instagram } from 'lucide-react';
import { TiktokIcon } from '@/components/shop/tiktok-icon';

export function Footer() {
  const brand = process.env.NEXT_PUBLIC_APP_NAME || 'Nepal Shop';
  const year = new Date().getFullYear();

  return (
    <footer className="mt-32 border-t border-border/70">
      <div className="container mx-auto px-6 py-16">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-serif text-2xl leading-snug max-w-md text-balance">
              <span className="italic">AKSHYATA</span> by Grain Roots Food —
              rooted in nature, growing the future.
            </p>
            <p className="mt-3 text-sm text-muted-foreground max-w-md">
              Pure sattu and heritage grains. Made for modern life.
            </p>
          </div>

          <div className="md:col-span-2 md:col-start-7">
            <p className="eyebrow mb-4">Shop</p>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/products" className="hover:text-muted-foreground">All</Link></li>
              <li><Link href="/category/sattu" className="hover:text-muted-foreground">Sattu</Link></li>
              <li><Link href="/category/honey" className="hover:text-muted-foreground">Honey</Link></li>
              <li><Link href="/category/tea-herbs" className="hover:text-muted-foreground">Tea & Herbs</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="eyebrow mb-4">Company</p>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about" className="hover:text-muted-foreground">Story</Link></li>
              <li><Link href="/about#farmers" className="hover:text-muted-foreground">Farmers</Link></li>
              <li><Link href="/wholesale" className="hover:text-muted-foreground">Wholesale</Link></li>
              <li><Link href="/track" className="hover:text-muted-foreground">Track order</Link></li>
              <li><Link href="/contact" className="hover:text-muted-foreground">Contact</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className="eyebrow mb-4">Get in touch</p>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>foodgrainroots@gmail.com</li>
              <li>+977-9868074388</li>
              <li>Dhat, Biratnagar</li>
            </ul>
            <div className="mt-4 flex items-center gap-2">
              <a
                href="https://www.instagram.com/grainrootsfood/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="grid place-items-center h-9 w-9 rounded-full border hover:bg-foreground hover:text-background hover:border-foreground transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.facebook.com/grainrootsfood"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="grid place-items-center h-9 w-9 rounded-full border hover:bg-foreground hover:text-background hover:border-foreground transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://www.tiktok.com/@grainrootsfood"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="grid place-items-center h-9 w-9 rounded-full border hover:bg-foreground hover:text-background hover:border-foreground transition-colors"
              >
                <TiktokIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-border/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {year} {brand}</p>
          <p>eSewa · Khalti · Fonepay · Cash on delivery</p>
        </div>
      </div>
    </footer>
  );
}
