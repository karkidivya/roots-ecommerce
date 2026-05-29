import Image from 'next/image';

export const metadata = {
  title: 'Our Story',
  description: 'AKSHYATA by Grain Roots Food — Rooted in nature, growing the future.',
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="container mx-auto px-6 py-20 md:py-28">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">Our story</p>
          <h1 className="font-serif text-4xl md:text-6xl leading-[1.05] text-balance">
            From a simple thought
            <br />
            <span className="italic">to something real, made for you.</span>
          </h1>
          <p className="mt-6 text-muted-foreground leading-relaxed max-w-xl text-pretty">
            Your love and support have been truly overwhelming — and we genuinely
            feel it. Grain Roots Food started with one belief: real strength,
            energy and nutrition is already connected to our roots.
          </p>
        </div>
      </section>

      {/* Editorial image */}
      <section className="container mx-auto px-6 pb-20">
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=85&w=2000"
            alt="Highland farms"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </section>

      {/* Why AKSHYATA */}
      <section className="container mx-auto px-6 py-20 border-t">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="eyebrow mb-4">AKSHYATA</p>
            <h2 className="font-serif text-3xl md:text-4xl leading-tight text-balance">
              Real food. Real strength. Rooted in nature.
            </h2>
          </div>
          <div className="text-muted-foreground leading-relaxed space-y-4">
            <p>
              Our grandmothers already knew it. Sattu, millets, cold-pressed
              oils, raw honey — this is what gave generations their energy and
              strength. The processed-food era made us forget.
            </p>
            <p>
              AKSHYATA is our answer. Premium sattu — Chana, Jau, Multigrain —
              slow-roasted and stone-ground fresh. Quick to prepare. Easy to
              consume. Made for busy modern mornings.
            </p>
            <p className="font-serif text-foreground italic">
              Pure. Honest. Nutritious. Real.
            </p>
          </div>
        </div>
      </section>

      {/* Sustainability */}
      <section id="sustainability" className="container mx-auto px-6 py-20 border-t">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="eyebrow mb-4">The bridge we&apos;re building</p>
            <h2 className="font-serif text-3xl md:text-4xl leading-tight text-balance">
              Traditional nutrition, modern healthy living.
            </h2>
          </div>
          <div className="text-muted-foreground leading-relaxed space-y-4">
            <p>
              We pay our farmers above-market rates and commit to year-round
              purchases — not just during peak season. That stability is what
              keeps heritage varieties alive.
            </p>
            <p>
              Every package is recyclable or compostable. No shrink wrap, no
              plastic clamshells, no single-use bubble wrap. Slow food, slow
              trade, done right.
            </p>
          </div>
        </div>
      </section>

      {/* Farmers */}
      <section id="farmers" className="container mx-auto px-6 py-20 border-t">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="eyebrow mb-4">The roots are spreading 🌾</p>
            <h2 className="font-serif text-3xl md:text-4xl leading-tight text-balance">
              From Biratnagar to Butwal and Hetauda — and just getting started.
            </h2>
          </div>
          <div className="text-muted-foreground leading-relaxed space-y-4">
            <p>
              AKSHYATA is now stocked at selected marts in Biratnagar, Butwal
              and Hetauda. Every store we reach, every family we feed, brings
              us one step closer to bringing real nutrition back to every Nepali
              home.
            </p>
            <p>
              Want AKSHYATA in your store?{' '}
              <a href="/wholesale" className="text-foreground underline underline-offset-4">
                Apply to be a stockist.
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
