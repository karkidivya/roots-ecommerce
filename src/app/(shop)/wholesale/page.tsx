import { Sprout, Truck, BadgePercent } from 'lucide-react';

export const metadata = {
  title: 'Wholesale Partners',
  description: 'Apply to become our distributor, wholesale or retail partner.',
};

export default function WholesalePage() {
  const formUrl = process.env.NEXT_PUBLIC_WHOLESALE_FORM_URL;

  return (
    <>
      {/* Hero */}
      <section className="container mx-auto px-6 py-20 md:py-28">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">Partnerships</p>
          <h1 className="font-serif text-4xl md:text-6xl leading-[1.05] text-balance">
            Apply to be our distributor,
            <br />
            <span className="italic">wholesaler or retail partner.</span>
          </h1>
          <p className="mt-6 text-muted-foreground leading-relaxed max-w-xl text-pretty">
            We work directly with grocery stores, cafés, gyms, gift shops and
            online retailers across Nepal and abroad. If you sell food, wellness
            or premium gifting — let&apos;s talk.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-6 py-16 border-t">
        <div className="grid gap-10 md:grid-cols-3">
          <Benefit
            icon={<BadgePercent className="h-5 w-5" />}
            title="Wholesale pricing"
            body="Tiered margins starting at 30%, with stronger terms for committed monthly volume."
          />
          <Benefit
            icon={<Truck className="h-5 w-5" />}
            title="Free delivery"
            body="Free dispatch within Kathmandu Valley above a small order minimum. Logistics support for outside-valley shipments."
          />
          <Benefit
            icon={<Sprout className="h-5 w-5" />}
            title="Single-origin trust"
            body="Lab-tested, fully traceable products. Our certificates, source villages and process notes are shared on request."
          />
        </div>
      </section>

      {/* Form */}
      <section className="container mx-auto px-6 pt-8 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p className="eyebrow mb-3">Application</p>
            <h2 className="font-serif text-3xl md:text-4xl">
              Tell us about your business
            </h2>
            <p className="mt-3 text-muted-foreground text-sm">
              We respond to every application within 2 business days.
            </p>
          </div>

          {formUrl ? (
            <div className="relative overflow-hidden rounded-sm border bg-card">
              <iframe
                src={formUrl}
                width="100%"
                height={1200}
                className="block w-full"
                title="Wholesale Partner Application"
                loading="lazy"
              >
                Loading…
              </iframe>
            </div>
          ) : (
            <div className="rounded-sm border border-dashed bg-muted/30 p-8 text-center">
              <p className="font-serif text-lg mb-2">Application form coming soon.</p>
              <p className="text-sm text-muted-foreground mb-6">
                In the meantime, email us directly with your business details.
              </p>
              <a
                href="mailto:foodgrainroots@gmail.com?subject=Wholesale%20Partner%20Application"
                className="inline-flex h-11 items-center justify-center rounded-sm bg-foreground px-6 text-sm font-medium text-background hover:bg-foreground/85"
              >
                Email us
              </a>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function Benefit({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div>
      <span className="grid place-items-center h-10 w-10 rounded-full bg-foreground text-background mb-4">
        {icon}
      </span>
      <h3 className="font-serif text-xl mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
