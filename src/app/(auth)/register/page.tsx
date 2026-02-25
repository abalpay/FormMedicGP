import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <Card className="shadow-lg animate-fade-in-up">
      <CardHeader>
        <CardTitle className="text-center font-[family-name:var(--font-display)]">Create your account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            placeholder="Dr. Jane Smith"
            className="focus:shadow-[0_0_0_3px_oklch(0.47_0.1_175/0.1)]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="doctor@clinic.com.au"
            className="focus:shadow-[0_0_0_3px_oklch(0.47_0.1_175/0.1)]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            className="focus:shadow-[0_0_0_3px_oklch(0.47_0.1_175/0.1)]"
          />
        </div>
        <Button className="w-full gradient-teal text-white border-0 hover:opacity-90">
          Create account
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
