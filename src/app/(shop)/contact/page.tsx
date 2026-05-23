import { Mail, Phone, MapPin, Instagram, Facebook } from 'lucide-react';

export const metadata = {
  title: 'Contact',
  description: 'Get in touch with our team.',
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-6 py-20 md:py-28">
      <div className="max-w-3xl mx-auto">
        <p className="eyebrow mb-4">Reach us</p>
        <h1 className="font-serif text-4xl md:text-5xl leading-[1.05] text-balance">
          We&apos;d love to hear from you.
        </h1>
        <p className="mt-5 text-muted-foreground leading-relaxed max-w-xl">
          Whether you&apos;re curious about a product, want to partner with us,
          or have feedback to share — drop us a line. We answer most messages
          within one business day.
        </p>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <ContactItem
            icon={<Mail className="h-4 w-4" />}
            label="Email"
            value="karkidivya5@gmail.com"
            href="mailto:karkidivya5@gmail.com"
          />
          <ContactItem
            icon={<Phone className="h-4 w-4" />}
            label="Phone"
            value="+977-9863867234"
            href="tel:+977xxxxxxx"
          />
          <ContactItem
            icon={<MapPin className="h-4 w-4" />}
            label="Address"
            value="Biratnagar, Nepal"
          />
          <ContactItem
            icon={<Instagram className="h-4 w-4" />}
            label="Social"
            value="@grainroots"
            href="#"
            secondary={{
              icon: <Facebook className="h-4 w-4" />,
              value: 'facebook.com/grainrootsfood',
              href: '#',
            }}
          />
        </div>

        <div className="mt-16 border-t pt-10">
          <h2 className="font-serif text-2xl mb-6">Send a message</h2>
          <form
            action="mailto:karkidivya5@gmail.com"
            method="POST"
            encType="text/plain"
            className="grid gap-4 max-w-xl"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="text"
                name="name"
                placeholder="Your name"
                required
                className="h-11 rounded-sm border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <input
                type="email"
                name="email"
                placeholder="Your email"
                required
                className="h-11 rounded-sm border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <input
              type="text"
              name="subject"
              placeholder="Subject"
              className="h-11 rounded-sm border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <textarea
              name="message"
              placeholder="How can we help?"
              required
              rows={6}
              className="rounded-sm border border-input bg-background px-3 py-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <button
              type="submit"
              className="h-11 self-start rounded-sm bg-foreground px-6 text-sm font-medium text-background hover:bg-foreground/85"
            >
              Send message
            </button>
            <p className="text-xs text-muted-foreground">
              This opens your email app. We&apos;ll wire up direct sending soon.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function ContactItem({
  icon,
  label,
  value,
  href,
  secondary,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  secondary?: { icon: React.ReactNode; value: string; href: string };
}) {
  const Wrap = href ? 'a' : 'div';
  return (
    <div>
      <p className="eyebrow mb-3">{label}</p>
      <Wrap
        {...(href ? { href } : {})}
        className="flex items-center gap-2.5 text-base hover:text-muted-foreground transition-colors"
      >
        <span className="grid place-items-center h-8 w-8 rounded-full bg-muted">
          {icon}
        </span>
        <span>{value}</span>
      </Wrap>
      {secondary && (
        <a
          href={secondary.href}
          className="mt-2 flex items-center gap-2.5 text-base hover:text-muted-foreground transition-colors"
        >
          <span className="grid place-items-center h-8 w-8 rounded-full bg-muted">
            {secondary.icon}
          </span>
          <span>{secondary.value}</span>
        </a>
      )}
    </div>
  );
}
