import { Check, Sprout, Truck, BadgePercent } from 'lucide-react';

export const metadata = {
  title: 'Wholesale Partners',
  description: 'Apply to become our distributor, wholesale or retail partner.',
};

export default function WholesalePage() {
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

      {/* Benefits strip */}
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

          <form
            action="mailto:karkidivya5@gmail.com?subject=Wholesale%20Partner%20Application"
            method="POST"
            encType="text/plain"
            className="space-y-5"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Business name" name="business" required />
              <Field label="Your name" name="name" required />
              <Field label="Email" name="email" type="email" required />
              <Field label="Phone" name="phone" type="tel" required />
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground block mb-2">
                Partner type
              </label>
              <select
                name="type"
                required
                className="h-11 w-full rounded-sm border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Select one…</option>
                <option>Distributor (regional / national)</option>
                <option>Wholesaler</option>
                <option>Retail store / Grocer</option>
                <option>Café / Restaurant / Hotel</option>
                <option>Online retailer</option>
                <option>Gift shop / Corporate gifting</option>
                <option>Other</option>
              </select>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="City" name="city" required />
              <Field label="Years in business" name="years" />
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground block mb-2">
                Tell us about your business
              </label>
              <textarea
                name="message"
                rows={6}
                placeholder="What categories do you sell? Which products from us interest you? What monthly volume?"
                required
                className="rounded-sm border border-input bg-background px-3 py-3 text-sm w-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="h-11 w-full sm:w-auto rounded-sm bg-foreground px-8 text-sm font-medium text-background hover:bg-foreground/85"
              >
                Submit application
              </button>
              <p className="mt-3 text-xs text-muted-foreground">
                This opens your email app. Direct submission via Resend will be added soon.
              </p>
            </div>
          </form>
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

function Field({
  label,
  name,
  type = 'text',
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-[0.18em] text-muted-foreground block mb-2">
        {label}
        {required && <span className="ml-1 text-foreground">*</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        className="h-11 w-full rounded-sm border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
    </div>
  );
}
