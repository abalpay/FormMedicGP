import { Navbar } from '@/components/marketing/navbar';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark marketing-dark min-h-dvh bg-background text-foreground">
      <Navbar />
      {children}
    </div>
  );
}
