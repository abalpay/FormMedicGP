import Link from 'next/link';
import { ArrowRight, CheckCircle2, Sparkles, Mic, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative pt-[72px] overflow-hidden">
      {/* Background — rich deep teal, no muddy overlays */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(160deg, oklch(0.32 0.08 175) 0%, oklch(0.24 0.07 178) 40%, oklch(0.18 0.05 182) 100%)',
        }}
      />
      {/* Subtle lighter accent in top-left for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_15%_10%,oklch(0.38_0.09_172/0.5),transparent)]" />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-28 lg:py-36">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left -- Copy */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/90 text-xs font-medium tracking-wide uppercase animate-fade-in-up">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Medical Forms for Australian GPs
            </div>

            <h1
              className="mt-8 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight text-white font-[family-name:var(--font-display)] animate-fade-in-up"
              style={{ animationDelay: '80ms' }}
            >
              Dictate.
              <br />
              <span className="text-white/50">Don&apos;t type.</span>
            </h1>

            <p
              className="mt-6 text-lg sm:text-xl leading-relaxed text-white/70 max-w-xl animate-fade-in-up"
              style={{ animationDelay: '160ms' }}
            >
              Speak your clinical notes naturally. FormMedic fills out Centrelink,
              WorkCover, and DSP forms in under two minutes — with patient
              privacy built into every step.
            </p>

            <div
              className="mt-10 flex flex-col sm:flex-row items-start gap-3 animate-fade-in-up"
              style={{ animationDelay: '240ms' }}
            >
              <Button variant="amber" size="lg" className="h-12 px-7 text-[15px] font-semibold" asChild>
                <Link href="/register">
                  Start For Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-7 text-[15px] font-medium border-white/20 text-white/90 hover:bg-white/10 hover:text-white hover:border-white/30 transition-all duration-300"
                asChild
              >
                <Link href="/login">Sign In</Link>
              </Button>
            </div>

            <div
              className="mt-12 flex flex-wrap items-center gap-3 animate-fade-in-up"
              style={{ animationDelay: '320ms' }}
            >
              {['5 government forms', 'Privacy-first pipeline', 'Free early access'].map((text) => (
                <div key={text} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.08] text-white/60 text-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white/40" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right -- Browser frame product mock-up */}
          <div
            className="hidden lg:block animate-fade-in-up"
            style={{ animationDelay: '400ms' }}
          >
            <div
              className="relative"
              style={{
                transform: 'perspective(1200px) rotateY(-8deg) rotateX(4deg)',
              }}
            >
              {/* Browser frame */}
              <div className="rounded-xl bg-[oklch(0.15_0.02_175)] border border-white/[0.1] shadow-2xl shadow-black/40 overflow-hidden">
                {/* Title bar */}
                <div className="flex items-center gap-2 px-4 py-3 bg-[oklch(0.12_0.02_175)] border-b border-white/[0.06]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-white/10" />
                    <div className="w-3 h-3 rounded-full bg-white/10" />
                    <div className="w-3 h-3 rounded-full bg-white/10" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="max-w-[260px] mx-auto h-6 rounded-md bg-white/[0.06] px-3 flex items-center">
                      <span className="text-[10px] text-white/30 font-mono truncate">app.formmedic.com.au/dictate</span>
                    </div>
                  </div>
                </div>

                {/* App content mock */}
                <div className="p-5 space-y-4">
                  {/* Form header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-white/70" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white/90">Centrelink Medical Certificate</p>
                        <p className="text-[10px] text-white/40">SU415</p>
                      </div>
                    </div>
                    <div className="px-2 py-1 rounded-md bg-red-500/20 border border-red-500/30">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                        <span className="text-[10px] font-medium text-red-300">Recording</span>
                      </div>
                    </div>
                  </div>

                  {/* Waveform area */}
                  <div className="rounded-lg bg-white/[0.04] border border-white/[0.06] p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                        <Mic className="w-4 h-4 text-red-400" />
                      </div>
                      <div className="flex-1 flex items-center gap-1 h-8">
                        {/* Waveform bars */}
                        {[40, 65, 30, 80, 55, 70, 25, 90, 45, 60, 35, 75, 50, 85, 40, 70, 55, 30, 65, 45].map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-full bg-gradient-to-t from-primary/40 to-primary/70"
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-white/50 italic leading-relaxed">
                      &quot;Patient presents with lower back pain of three weeks duration, radiating to the left leg. Unable to perform usual work duties...&quot;
                    </p>
                  </div>

                  {/* Extracted fields */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Extracted Fields</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Diagnosis', value: 'Lumbar radiculopathy' },
                        { label: 'Duration', value: '3 weeks' },
                        { label: 'Work capacity', value: 'Unfit for usual duties' },
                        { label: 'Treatment', value: 'Physiotherapy, NSAIDs' },
                      ].map((field) => (
                        <div key={field.label} className="rounded-md bg-white/[0.04] border border-white/[0.06] px-3 py-2">
                          <p className="text-[9px] text-white/30 font-medium uppercase tracking-wider">{field.label}</p>
                          <p className="text-[11px] text-white/70 mt-0.5">{field.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Glow effect under the browser frame */}
              <div className="absolute -inset-4 -z-10 bg-[radial-gradient(ellipse_at_center,oklch(0.47_0.1_175/0.15),transparent_70%)] blur-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade — tall for smooth transition */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background via-background/60 to-transparent" />
    </section>
  );
}
