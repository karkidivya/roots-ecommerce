import { MessageCircle } from 'lucide-react';

// Numbers are read from env. WhatsApp wants the full international number with
// no "+" or spaces, e.g. 9779800000000. Viber uses the same digits.
const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/[^0-9]/g, '');
const VIBER = process.env.NEXT_PUBLIC_VIBER_NUMBER?.replace(/[^0-9]/g, '');

export function whatsappLink(message?: string): string | null {
  if (!WA) return null;
  const q = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${WA}${q}`;
}

/** Floating chat button, bottom-right on every storefront page. */
export function WhatsAppWidget() {
  const wa = whatsappLink('Hi! I have a question about your products.');
  const viber = VIBER ? `viber://chat?number=%2B${VIBER}` : null;

  if (!wa && !viber) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 print:hidden">
      {viber && (
        <a
          href={viber}
          aria-label="Chat on Viber"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7360f2] text-white shadow-lg transition-transform hover:scale-105"
        >
          <MessageCircle className="h-6 w-6" />
        </a>
      )}
      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-medium text-white shadow-lg transition-transform hover:scale-105"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="hidden sm:inline">Chat / Order</span>
        </a>
      )}
    </div>
  );
}
