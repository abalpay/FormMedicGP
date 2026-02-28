import Link from 'next/link';
import { ArrowRight, CheckCircle2, Sparkles, Mic, FileText, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative pt-[72px] bg-background overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-20 right-[15%] w-[500px] h-[500px] rounded-full bg-[oklch(0.47_0.1_175/0.06)] blur-3xl" />
      <div className="absolute top-60 right-[35%] w-[300px] h-[300px] rounded-full bg-[oklch(0.795_0.177_78/0.08)] blur-3xl" />
      <div className="absolute -bottom-20 left-[10%] w-[400px] h-[400px] rounded-full bg-[oklch(0.47_0.1_175/0.04)] blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left -- Copy */}
          <div className="max-w-xl">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/[0.06] border border-primary/10 text-primary text-xs font-medium tracking-wide uppercase animate-fade-in-up"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Medical Forms for Australian GPs
            </div>

            <h1
              className="mt-8 text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-extrabold leading-[1.08] tracking-tight text-foreground font-[family-name:var(--font-display)] animate-fade-in-up"
              style={{ animationDelay: '80ms' }}
            >
              Dictate.
              <br />
              Don&apos;t{' '}
              <span className="relative inline-block">
                type.
                <span className="absolute -bottom-1 left-0 right-0 h-3 bg-accent/25 -skew-x-3 rounded-sm" />
              </span>
            </h1>

            <p
              className="mt-6 text-lg sm:text-xl leading-relaxed text-muted-foreground max-w-lg animate-fade-in-up"
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
              <Button variant="teal" size="lg" className="h-12 px-7 text-[15px] font-semibold rounded-full" asChild>
                <Link href="/register">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-7 text-[15px] font-medium rounded-full"
                asChild
              >
                <Link href="#how-it-works">How It Works?</Link>
              </Button>
            </div>

            <div
              className="mt-10 flex flex-wrap items-center gap-3 animate-fade-in-up"
              style={{ animationDelay: '320ms' }}
            >
              {['5 government forms', 'Privacy-first', 'Free early access'].map((text) => (
                <div key={text} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right -- Floating UI cards collage */}
          <div
            className="hidden lg:block relative h-[460px] animate-fade-in-up"
            style={{ animationDelay: '300ms' }}
          >
            {/* Privacy badge — floating top-right, slightly overlaps main card */}
            <div className="absolute -top-2 right-4 z-30 rounded-xl bg-card border border-border shadow-md px-3.5 py-2.5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold">De-identified</p>
                <p className="text-[10px] text-muted-foreground">PII never reaches AI</p>
              </div>
            </div>

            {/* Main dictation card */}
            <div className="absolute top-8 left-4 right-12 rounded-2xl bg-card border border-border shadow-xl p-5 z-20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl gradient-teal flex items-center justify-center">
                    <FileText className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Centrelink Medical Certificate</p>
                    <p className="text-[11px] text-muted-foreground">SU415</p>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[11px] font-medium text-red-600">Recording</span>
                  </div>
                </div>
              </div>

              {/* Waveform */}
              <div className="rounded-xl bg-muted/50 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                    <Mic className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="flex-1 flex items-end gap-[2px] h-7">
                    {[3, 5, 2.5, 7, 4.5, 6, 2, 8, 4, 5.5, 3, 6.5, 5, 7.5, 3.5, 6, 4.5, 2.5, 5.5, 4, 7, 3, 5, 6.5, 4.5, 3.5, 6, 5, 7, 4, 3, 5.5, 6.5, 4.5, 2.5].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm bg-primary/50"
                        style={{ height: `${h * 10}%` }}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground italic leading-relaxed">
                  &quot;Patient presents with lower back pain of three weeks duration, radiating to the left leg...&quot;
                </p>
              </div>
            </div>

            {/* Extracted fields card — overlaps main card bottom */}
            <div className="absolute top-[255px] -left-2 z-30 rounded-2xl bg-card border border-border shadow-lg p-4 w-[260px]">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">Extracted Fields</p>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: 'Diagnosis', value: 'Lumbar radiculopathy' },
                  { label: 'Duration', value: '3 weeks' },
                  { label: 'Capacity', value: 'Unfit for work' },
                  { label: 'Treatment', value: 'Physio, NSAIDs' },
                ].map((field) => (
                  <div key={field.label} className="rounded-lg bg-muted/50 px-2.5 py-1.5">
                    <p className="text-[8px] text-muted-foreground font-medium uppercase tracking-wider">{field.label}</p>
                    <p className="text-[11px] font-medium text-foreground mt-0.5">{field.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Auto-filled badge — between main card and extracted fields, right side */}
            <div className="absolute top-[270px] right-8 z-30 rounded-full bg-primary/10 border border-primary/15 px-3 py-1.5 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs font-medium text-primary">14 fields auto-filled</span>
            </div>

            {/* Time badge — bottom-right, overlapping extracted fields area */}
            <div className="absolute bottom-2 right-12 z-30 rounded-xl bg-card border border-border shadow-md px-3.5 py-2.5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center">
                <Clock className="w-4 h-4 text-accent-foreground" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground leading-none">1:47</p>
                <p className="text-[10px] text-muted-foreground">Average completion</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
