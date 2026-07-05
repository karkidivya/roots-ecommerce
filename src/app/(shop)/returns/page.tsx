import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Returns & Refunds Policy',
  description:
    'AKSHYATA by Grain Roots — returns, replacements and refunds for damaged, defective or incorrect food products. Report within 48 hours of delivery for a free replacement or full refund.',
};

const CONTACT_PHONE = '+977-9868074388';
const CONTACT_EMAIL = 'foodgrainroots@gmail.com';

export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-16 max-w-3xl">
      <h1 className="font-serif text-3xl sm:text-4xl">Returns & Refunds</h1>
      <p className="mt-3 text-muted-foreground">
        We want you to be completely happy with your AKSHYATA products. Because our
        products are food items, we handle returns a little differently than other
        stores — here is exactly how it works.
      </p>

      <div className="mt-10 space-y-10 text-sm leading-relaxed">
        <section>
          <h2 className="font-serif text-xl mb-3">What can be returned</h2>
          <p className="text-muted-foreground">
            We accept returns and offer free replacements or full refunds when:
          </p>
          <ul className="mt-3 space-y-2 text-muted-foreground list-disc pl-5">
            <li>The product arrived damaged (torn packet, leakage, crushed packaging)</li>
            <li>The product is defective or spoiled</li>
            <li>You received the wrong item or the wrong quantity</li>
            <li>The product is past its best-before date on delivery</li>
          </ul>
          <p className="mt-3 text-muted-foreground">
            For hygiene and food-safety reasons, we cannot accept returns of opened or
            used food products unless they are defective.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl mb-3">Return window</h2>
          <p className="text-muted-foreground">
            Please check your order when it arrives and report any problem within{' '}
            <strong className="text-foreground">48 hours of delivery</strong>. A photo of
            the product and packaging helps us resolve it fastest.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl mb-3">How to request a return</h2>
          <ol className="space-y-2 text-muted-foreground list-decimal pl-5">
            <li>
              Contact us on WhatsApp / phone at{' '}
              <a href={`tel:${CONTACT_PHONE}`} className="text-foreground underline underline-offset-2">
                {CONTACT_PHONE}
              </a>{' '}
              or email{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-foreground underline underline-offset-2">
                {CONTACT_EMAIL}
              </a>
            </li>
            <li>Share your order number and a photo of the issue</li>
            <li>
              We will arrange a <strong className="text-foreground">free replacement</strong>{' '}
              with your next delivery, or a <strong className="text-foreground">full refund</strong> —
              your choice
            </li>
          </ol>
          <p className="mt-3 text-muted-foreground">
            You never pay for return shipping on damaged, defective or incorrect items —
            we cover all costs.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl mb-3">Refunds</h2>
          <p className="text-muted-foreground">
            Refunds are issued within <strong className="text-foreground">3–5 business days</strong>{' '}
            after we confirm the issue: to your eSewa / Khalti / bank account for prepaid
            orders, or in cash / wallet transfer for cash-on-delivery orders.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl mb-3">Exchanges</h2>
          <p className="text-muted-foreground">
            Yes — if you received a damaged, defective or incorrect product, we will gladly
            exchange it for the same item or another product of equal value.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl mb-3">Order cancellation</h2>
          <p className="text-muted-foreground">
            You can cancel any order free of charge before it has been dispatched — just
            call or message us with your order number.
          </p>
        </section>
      </div>
    </div>
  );
}
