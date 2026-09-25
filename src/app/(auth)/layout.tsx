import Link from 'next/link';
import { BrandLogo } from '@/components/brand/brand-logo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen relative overflow-hidden">
      {/* Left panel — teal branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] relative gradient-teal flex-col p-10">
        {/* Background layers */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_10%_90%,oklch(0.35_0.08_185/0.6),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Logo — top */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5 group">
            <BrandLogo
              variant="iconOnDark"
              className="w-10 h-10 transition-opacity duration-200 group-hover:opacity-90"
              sizes="40px"
            />
            <span className="font-extrabold text-xl text-white tracking-tight font-[family-name:var(--font-display)] leading-none">
              FormBridge
              <span className="text-[#B7E8DE] ml-0.5">GP</span>
            </span>
          </Link>
        </div>

        {/* Main content — centered */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-16">
          {/* Headline */}
          <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight tracking-tight font-[family-name:var(--font-display)]">
            Dictate the note.
            <br />
            Review the
            <br />
            <span className="text-white/50">filled form.</span>
          </h2>
          <p className="mt-4 text-sm text-white/50 leading-relaxed max-w-sm">
            Speak your clinical notes; identifiers are removed before AI processing and the official
            Australian government form is filled for you to check.
          </p>
        </div>

        {/* Copyright — bottom */}
        <p className="relative z-10 text-xs text-white/30">
          &copy; 2026 FormBridge GP
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
            <BrandLogo
              variant="icon"
              className="w-11 h-11"
              sizes="44px"
            />
            <span className="font-extrabold text-xl tracking-tight font-[family-name:var(--font-display)]">
              FormBridge GP
            </span>
          </Link>
          <p className="text-xs text-muted-foreground">
            AI-powered medical form automation
          </p>
        </div>

        <div className="w-full max-w-[400px]">
          {children}
        </div>
      </div>
    </div>
  );
}
