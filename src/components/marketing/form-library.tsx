import {
  AnimateOnScroll,
  StaggerChildren,
  StaggerItem,
} from '@/components/marketing/animate-on-scroll';

const supportedForms = [
  { id: 'SU415', label: 'Medical Certificate', issuer: 'Centrelink' },
  { id: 'SA478', label: 'DSP Medical Evidence', issuer: 'Services Australia' },
  { id: 'SA332A', label: 'Carer Payment Report', issuer: 'Centrelink' },
  { id: 'MA002', label: 'Mobility Allowance Report', issuer: 'Services Australia' },
  { id: 'CAPACITY', label: 'Certificate of Capacity', issuer: 'WorkCover / TAC' },
  { id: 'NDIS_ACCESS', label: 'NDIS Access Evidence', issuer: 'NDIS' },
];

export function FormLibrary() {
  return (
    <section id="forms" className="scroll-mt-20 relative py-14 sm:py-20">
      <div
        aria-hidden="true"
        className="glow pointer-events-none absolute top-1/2 -right-[13rem] -z-10 h-[28rem] w-[28rem] sm:-right-[8rem] sm:h-[34rem] sm:w-[48rem] -translate-y-1/2 [--glow:oklch(0.795_0.177_78/0.1)]"
      />
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <AnimateOnScroll>
          <div className="max-w-xl mb-8 sm:mb-10">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary mb-3">
              Forms
            </p>
            <h2 className="text-3xl sm:text-4xl tracking-tight font-[family-name:var(--font-display)]">
              Six official forms, ready to dictate.
            </h2>
          </div>
        </AnimateOnScroll>

        <StaggerChildren
          staggerDelay={0.06}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
        >
          {supportedForms.map((form) => (
            <StaggerItem key={form.id}>
              <div className="glass-frame h-full rounded-xl px-4 py-3.5 transition-[border-color,background-color] duration-200 hover:border-white/20 hover:bg-white/[0.03]">
                <p className="font-mono text-[11px] font-medium tracking-wide text-primary">
                  {form.id}
                </p>
                <p className="mt-1.5 text-[13.5px] font-medium leading-snug text-foreground">
                  {form.label}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{form.issuer}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
