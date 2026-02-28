import Link from 'next/link';
import { Stethoscope } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen relative overflow-hidden">
      {/* Left panel — teal branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] relative gradient-teal flex-col justify-between p-10">
        {/* Background layers */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_10%_90%,oklch(0.35_0.08_185/0.6),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Logo */}
        <div className="relative">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 shadow-[0_0_24px_oklch(0.6_0.1_175/0.3)] group-hover:shadow-[0_0_32px_oklch(0.6_0.1_175/0.4)] transition-shadow duration-300">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl text-white tracking-tight font-[family-name:var(--font-display)]">
              FormMedic
            </span>
          </Link>
        </div>

        {/* Headline */}
        <div className="relative">
          <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight tracking-tight font-[family-name:var(--font-display)]">
            Complete government
            <br />
            medical forms in
            <br />
            <span className="text-white/50">under 2 minutes.</span>
          </h2>
          <p className="mt-4 text-sm text-white/50 leading-relaxed max-w-sm">
            AI-powered dictation for Australian GP clinics. Speak your clinical notes, get completed forms.
          </p>
        </div>

        {/* Bottom */}
        <p className="relative text-xs text-white/30">
          &copy; 2026 FormMedic
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-5 sm:p-8 bg-background relative">
        {/* Subtle background */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: `
              radial-gradient(ellipse at 70% 20%, oklch(0.47 0.1 175 / 0.04) 0%, transparent 50%),
              radial-gradient(ellipse at 30% 80%, oklch(0.47 0.1 175 / 0.02) 0%, transparent 50%),
              var(--background)
            `,
          }}
        />

        {/* Mobile logo (shown only on mobile) */}
        <div className="lg:hidden mb-8 flex flex-col items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl gradient-teal shadow-[0_4px_24px_oklch(0.47_0.1_175/0.25)]">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight font-[family-name:var(--font-display)]">
              FormMedic
            </span>
          </Link>
          <p className="text-xs text-muted-foreground">
            AI-powered medical form automation
          </p>
        </div>

        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
