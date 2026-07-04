import { MessageCircle, Instagram, Facebook } from 'lucide-react';

// Order/chat channels are read from env. Each button only renders if its
// handle/number is set, so you can enable them one at a time.
// WhatsApp/Viber want the full international number, digits only (e.g. 9779800000000).
// Messenger/Instagram want the account username (e.g. grainrootsfood).
const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/[^0-9]/g, '');
const VIBER = process.env.NEXT_PUBLIC_VIBER_NUMBER?.replace(/[^0-9]/g, '');
const MESSENGER = process.env.NEXT_PUBLIC_MESSENGER_USERNAME?.replace(/[^A-Za-z0-9.]/g, '');
const INSTAGRAM = process.env.NEXT_PUBLIC_INSTAGRAM_USERNAME?.replace(/[^A-Za-z0-9._]/g, '');

export function whatsappLink(message?: string): string | null {
  if (!WA) return null;
  const q = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${WA}${q}`;
}

/** Floating multi-channel order/chat stack, bottom-right on every storefront page. */
export function WhatsAppWidget() {
  const wa = whatsappLink('Hi! I have a question about your products.');
  const viber = VIBER ? `viber://chat?number=%2B${VIBER}` : null;
  // m.me opens a Messenger chat with your Page; ig.me/m opens an Instagram DM.
  const messenger = MESSENGER ? `https://m.me/${MESSENGER}` : null;
  const instagram = INSTAGRAM ? `https://ig.me/m/${INSTAGRAM}` : null;

  if (!wa && !viber && !messenger && !instagram) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 print:hidden">
      {instagram && (
        <a
          href={instagram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Order via Instagram"
          className="flex h-9 w-9 items-center justify-center rounded-full text-white shadow-md transition-transform hover:scale-105"
          style={{
            background:
              'radial-gradient(circle at 30% 107%, #fdf497 0%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
          }}
        >
          <Instagram className="h-4 w-4" />
        </a>
      )}
      {messenger && (
        <a
          href={messenger}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Order via Messenger"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0084FF] text-white shadow-md transition-transform hover:scale-105"
        >
          <Facebook className="h-4 w-4" />
        </a>
      )}
      {viber && (
        <a
          href={viber}
          aria-label="Chat on Viber"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7360f2] text-white shadow-md transition-transform hover:scale-105"
        >
          <MessageCircle className="h-4 w-4" />
        </a>
      )}
      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="flex items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-2 text-xs font-medium text-white shadow-md transition-transform hover:scale-105"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Chat / Order</span>
        </a>
      )}
    </div>
  );
}
