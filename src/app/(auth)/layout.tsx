import { Stethoscope } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient mesh */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse at 20% 20%, oklch(0.47 0.1 175 / 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, oklch(0.47 0.1 175 / 0.05) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, oklch(0.795 0.177 78 / 0.03) 0%, transparent 40%),
            var(--background)
          `,
        }}
      />

      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl gradient-teal shadow-[0_4px_24px_oklch(0.47_0.1_175/0.25)]">
            <Stethoscope className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground font-[family-name:var(--font-display)]">FormMedic</h1>
          <p className="text-sm text-muted-foreground">
            AI-powered medical form automation
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
