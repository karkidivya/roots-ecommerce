import Image from 'next/image';

export const metadata = {
  title: 'Our Story',
  description: 'Heritage grains, wild honey and Ayurvedic herbs — farmer-direct from the Himalayas.',
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="container mx-auto px-6 py-20 md:py-28">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">Our story</p>
          <h1 className="font-serif text-4xl md:text-6xl leading-[1.05] text-balance">
            From highland farms to your kitchen.
          </h1>
          <p className="mt-6 text-muted-foreground leading-relaxed max-w-xl text-pretty">
            We started with one belief — that the best food in Nepal is grown
            by smallholder farmers at altitudes most people will never reach.
            Our job is simply to make it easy for you to taste it.
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

      {/* Sustainability */}
      <section id="sustainability" className="container mx-auto px-6 py-20 border-t">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="eyebrow mb-4">Sustainability</p>
            <h2 className="font-serif text-3xl md:text-4xl leading-tight text-balance">
              Slow food. Slow trade. Done right.
            </h2>
          </div>
          <div className="text-muted-foreground leading-relaxed space-y-4">
            <p>
              We pay our farmers above-market rates and commit to year-round
              purchases — not just during peak season. That stability is what
              keeps heritage varieties alive.
            </p>
            <p>
              Every package is recyclable or compostable. We don&apos;t use
              shrink wrap, plastic clamshells or single-use bubble wrap.
            </p>
          </div>
        </div>
      </section>

      {/* Farmers */}
      <section id="farmers" className="container mx-auto px-6 py-20 border-t">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="eyebrow mb-4">Our farmers</p>
            <h2 className="font-serif text-3xl md:text-4xl leading-tight text-balance">
              Single-village sourcing.
            </h2>
          </div>
          <div className="text-muted-foreground leading-relaxed space-y-4">
            <p>
              Our heritage rice comes from a single Marsi-growing village in
              Jumla. Our honey from one cliff in Taplejung. Our buckwheat from
              the high passes of Mustang.
            </p>
            <p>
              Single-village sourcing means we know exactly who grew what,
              where, and how. It also means small harvests sometimes — when
              an item is in season, it&apos;s in season; when it&apos;s gone,
              it&apos;s gone.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
