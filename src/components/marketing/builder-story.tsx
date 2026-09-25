import { AnimateOnScroll } from '@/components/marketing/animate-on-scroll';
import { GITHUB_PROFILE_URL, REPO_URL, SITE_URL } from '@/components/marketing/links';

const links = [
  { label: 'Source code', href: REPO_URL },
  { label: 'github.com/abalpay', href: GITHUB_PROFILE_URL },
  { label: 'alpaylabs.cloud', href: SITE_URL },
];

export function BuilderStory() {
  return (
    <section id="builder" className="scroll-mt-20 relative py-20 sm:py-28">
      <div className="max-w-lg mx-auto px-5 sm:px-8 text-center">
        <AnimateOnScroll>
          <span aria-hidden="true" className="mx-auto block h-px w-12 bg-primary/50" />
          <p className="mt-6 text-xs font-semibold tracking-[0.2em] uppercase text-primary">
            Who built this
          </p>
          <h2 className="mt-4 text-2xl sm:text-3xl tracking-tight font-[family-name:var(--font-display)]">
            One builder, a real problem, no users yet.
          </h2>
          <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-muted-foreground">
            <p>
              FormBridge GP is a portfolio project by a solo builder who works in a school by
              day, building toward health-AI engineering roles.
            </p>
            <p>
              It isn&apos;t clinically deployed and has no users. The live demo runs the real
              pipeline on fictional patients, and the source is public so you can check every
              claim on this page.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-white/10 pt-6 text-sm font-medium">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/80 hover:text-primary transition-colors duration-200"
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
