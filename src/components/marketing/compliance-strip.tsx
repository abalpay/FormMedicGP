import { Shield, Server } from 'lucide-react';

const badges = [
  { icon: Shield, text: 'Australian Privacy Principles Aligned' },
  { icon: Server, text: 'Data Hosted in Australia' },
];

export function ComplianceStrip() {
  return (
    <div className="border-t border-border/40 bg-muted/30">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6">
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {badges.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Icon className="w-4 h-4 text-primary/60" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
