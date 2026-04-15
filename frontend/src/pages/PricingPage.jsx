import { Link } from 'react-router-dom';

const navItems = ['About', 'Features', 'Learn', 'Business', 'Pricing', 'Images', 'Download'];

const plans = [
  {
    name: 'Free',
    description: 'Intelligence for everyday tasks',
    price: '₹0',
    cta: 'Get Free'
  },
  {
    name: 'Go',
    description: 'Keep chatting with expanded access',
    price: '₹399',
    cta: 'Get Go'
  },
  {
    name: 'Plus',
    description: 'Do more with advanced intelligence',
    price: '₹1,999',
    cta: 'Get Plus'
  },
  {
    name: 'Pro',
    description: 'Full access to the best of PriShi',
    price: '₹19,900',
    cta: 'Get Pro'
  }
];

export function PricingPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      <header className="px-7 py-4">
        <div className="flex items-center justify-between gap-6">
          <Link to="/app" className="flex items-center gap-3 text-[17px] font-semibold text-black">
            <span className="flex h-8 w-8 items-center justify-center rounded-full text-lg">◎</span>
            <span>PriShi</span>
          </Link>

          <nav className="hidden items-center gap-10 text-[15px] text-black/70 lg:flex">
            {navItems.map((item) => (
              <button
                key={item}
                type="button"
                className="transition hover:text-black"
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white"
            >
              Log in
            </button>
            <button
              type="button"
              className="rounded-full border border-black/15 bg-white px-5 py-2.5 text-sm font-medium text-black"
            >
              Sign up for free
            </button>
          </div>
        </div>
      </header>

      <main className="px-8 pb-10 pt-16">
        <section className="mx-auto max-w-4xl text-center">
          <div className="text-[22px] text-black/65">PriShi</div>
          <h1 className="mt-6 text-[70px] font-medium tracking-[-0.05em] text-black">
            Pricing
          </h1>
          <p className="mt-7 text-[18px] text-black/75">
            See pricing for our individual, business, and enterprise plans.
          </p>
        </section>

        <section className="mx-auto mt-20 grid max-w-[1280px] gap-5 xl:grid-cols-4 md:grid-cols-2">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className="rounded-[14px] border border-black/10 bg-white p-6"
            >
              <h2 className="text-[26px] font-medium tracking-[-0.03em] text-black">
                {plan.name}
              </h2>
              <p className="mt-2 text-[15px] leading-7 text-black/80">{plan.description}</p>
              <div className="mt-10 flex items-end gap-2">
                <div className="text-[40px] font-medium tracking-[-0.04em] text-black">
                  {plan.price}
                </div>
                <div className="pb-2 text-[16px] text-black/60">/ month</div>
              </div>
              <button
                type="button"
                className="mt-7 w-full rounded-full bg-black px-5 py-3 text-sm font-semibold text-white"
              >
                {plan.cta} ↗
              </button>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
