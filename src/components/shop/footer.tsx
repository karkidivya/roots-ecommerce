import Link from 'next/link';

export function Footer() {
  const brand = process.env.NEXT_PUBLIC_APP_NAME || 'Nepal Shop';
  const year = new Date().getFullYear();

  return (
    <footer className="mt-32 border-t border-border/70">
      <div className="container mx-auto px-6 py-16">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-serif text-2xl leading-snug max-w-md text-balance">
              Heritage grains, wild honey and Ayurvedic herbs — sourced
              farmer-direct from the Himalayas.
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
              <li><a href="#" className="hover:text-muted-foreground">Story</a></li>
              <li><a href="#" className="hover:text-muted-foreground">Farmers</a></li>
              <li><a href="#" className="hover:text-muted-foreground">Journal</a></li>
              <li><Link href="/contact" className="hover:text-muted-foreground">Contact</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className="eyebrow mb-4">Get in touch</p>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>support@example.com</li>
              <li>+977-1-XXX-XXXX</li>
              <li>Kathmandu, Nepal</li>
            </ul>
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
