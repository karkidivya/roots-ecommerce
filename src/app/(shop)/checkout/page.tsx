import { CheckoutForm } from './checkout-form';

export const metadata = { title: 'Checkout' };

export default function CheckoutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <CheckoutForm />
    </div>
  );
}
