import { EyeOff, Server, Lock } from 'lucide-react';

const privacyFeatures = [
  {
    icon: EyeOff,
    title: 'De-identified Processing',
    description:
      'Name, DOB, address, Medicare number — all PII is separated from clinical data before the AI model processes anything. The model never sees who the patient is.',
  },
  {
    icon: Server,
    title: 'Zero Retention',
    description:
      'Form data lives in-memory during your session and is never written to disk. PDFs are generated and streamed directly to your browser, then discarded.',
  },
  {
    icon: Lock,
    title: 'Server-Side Merge',
    description:
      'Patient details are re-merged into the completed form on our server after AI processing — PII never reaches any external AI service at any point.',
  },
];

export function Privacy() {
  return (
    <section id="privacy" className="relative py-20 sm:py-28 overflow-hidden">
      {/* Dark teal background */}
      <div className="absolute inset-0 bg-[oklch(0.18_0.035_180)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_70%_30%,oklch(0.25_0.06_175/0.6),transparent)]" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
        <div className="max-w-2xl mb-20">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[oklch(0.6_0.1_175)] mb-3">
            Security
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-[family-name:var(--font-display)]">
            Privacy isn&apos;t a feature.
            <br className="hidden sm:block" />
            It&apos;s the architecture.
          </h2>
          <p className="mt-4 text-base text-white/50 leading-relaxed max-w-lg">
            Patient data protection is built into every layer — not bolted on as
            an afterthought.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {privacyFeatures.map((item) => (
            <div key={item.title} className="group">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mb-5 group-hover:bg-white/[0.1] group-hover:border-white/[0.15] group-hover:shadow-[0_0_24px_oklch(0.47_0.1_175/0.2)] transition-all duration-300">
                <item.icon className="w-5 h-5 text-[oklch(0.6_0.1_175)]" />
              </div>
              <h3 className="text-base font-bold text-white font-[family-name:var(--font-display)] mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-white/55 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
