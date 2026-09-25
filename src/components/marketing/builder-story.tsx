import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { getAllFormSchemas } from '@/lib/schemas';
import { AnimateOnScroll } from '@/components/marketing/animate-on-scroll';
import { GITHUB_PROFILE_URL, REPO_URL, SITE_URL } from '@/components/marketing/links';

// Computed at build time (the landing page is static).
const schemas = getAllFormSchemas();
const mappedFields = schemas.reduce(
  (sum, schema) =>
    sum + Object.values(schema.sections).reduce((n, section) => n + Object.keys(section.fields).length, 0),
  0
);

function countTestFiles() {
  try {
    return readdirSync(join(process.cwd(), 'tests')).filter((f) => f.endsWith('.test.mjs')).length;
  } catch {
    return null;
  }
}

const links = [
  { label: 'Source code', href: REPO_URL },
  { label: 'github.com/abalpay', href: GITHUB_PROFILE_URL },
  { label: 'alpaylabs.cloud', href: SITE_URL },
];

export function BuilderStory() {
  const testFiles = countTestFiles();
  const stats = [
    { value: schemas.length, label: 'forms' },
    { value: mappedFields, label: 'schema-mapped fields' },
    ...(testFiles ? [{ value: testFiles, label: 'unit test files' }] : []),
  ];

  return (
    <section id="builder" className="scroll-mt-20 py-20 sm:py-28 bg-muted/40">
      <div className="max-w-3xl mx-auto px-5 sm:px-8">
        <AnimateOnScroll>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">
            Who built this
          </p>
          <h2 className="text-3xl sm:text-4xl tracking-tight font-[family-name:var(--font-display)]">
            One builder, a real problem, no users yet.
          </h2>
          <div className="mt-6 space-y-4 text-base text-muted-foreground leading-relaxed">
            <p>
              FormBridge GP is a side project by a solo builder who works in a school, built as a
              portfolio piece while targeting health-AI engineering roles.
            </p>
            <p>
              It is not clinically deployed and has no users. The live demo runs the real pipeline
              on fictional patients, and the full source is public so you can check every claim on
              this page.
            </p>
          </div>

          <dl className="mt-10 grid grid-cols-3 gap-4 border-y border-border py-6">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <dt className="text-xs sm:text-sm text-muted-foreground">{stat.label}</dt>
                <dd className="order-first text-3xl sm:text-4xl tracking-tight font-[family-name:var(--font-display)] tabular-nums">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">Counted from the repository at build time.</p>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
