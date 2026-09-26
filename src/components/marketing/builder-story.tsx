import { AnimateOnScroll } from '@/components/marketing/animate-on-scroll';
import { GITHUB_PROFILE_URL, REPO_URL, SITE_URL } from '@/components/marketing/links';

const links = [
  { label: 'Source code', href: REPO_URL },
  { label: 'github.com/abalpay', href: GITHUB_PROFILE_URL },
  { label: 'alpaylabs.cloud', href: SITE_URL },
];

export function BuilderStory() {
  return (
    <section id="builder" className="scroll-mt-20 relative py-8 sm:py-12">
      <div
        aria-hidden="true"
        className="bg-grid bg-grid-band pointer-events-none absolute inset-x-0 -inset-y-16 -z-10 opacity-50"
      />
      <div
        aria-hidden="true"
        className="glow pointer-events-none absolute left-1/2 top-0 -z-10 h-[16rem] w-[30rem] -translate-x-1/2 -translate-y-1/3 sm:w-[40rem] [--glow:oklch(0.7_0.12_180/0.2)]"
      />
      <div className="max-w-lg mx-auto px-5 sm:px-8 text-center">
        <AnimateOnScroll>
          <span aria-hidden="true" className="mx-auto block h-px w-12 bg-primary/50" />
          <p className="mt-6 text-xs font-semibold tracking-[0.2em] uppercase text-primary">
            Who built this
          </p>
          <h2 className="mt-4 text-2xl sm:text-3xl tracking-tight font-[family-name:var(--font-display)]">
            Built solo, for a real problem.
          </h2>
          <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-muted-foreground">
            <p>
              GPs lose hours to government paperwork. FormBridge GP is a portfolio project by a
              solo builder who works in a school by day.
            </p>
            <p>
              It isn&apos;t clinically deployed yet. The live demo runs the real pipeline on
              fictional patients, and the source is public so you can check every claim on this
              page.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 border-t border-white/10 pt-6 text-sm font-medium">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-sm text-foreground/80 hover:text-primary transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
