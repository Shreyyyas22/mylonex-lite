'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';

export default function LoginPage() {
  const [email, setEmail] = useState('buyer@mylonex.demo');
  const [password, setPassword] = useState('buyer123');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await signIn('credentials', { email, password, redirect: false });
    if (res?.error) setError('Invalid credentials');
    else router.push('/catalog');
  }

  function fillBuyer() { setEmail('buyer@mylonex.demo'); setPassword('buyer123'); }
  function fillSupplier() { setEmail('supplier@mylonex.demo'); setPassword('supplier123'); }

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card>
        <CardHeader><CardTitle>Login to MyloNex</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={fillBuyer}>Continue as Buyer</Button>
            <Button variant="outline" size="sm" onClick={fillSupplier}>Continue as Supplier</Button>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="email" />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full">Login</Button>
          </form>
          <div className="mt-6 text-xs bg-slate-50 p-3 rounded border">
            <p className="font-semibold">Demo credentials:</p>
            <p>Buyer: buyer@mylonex.demo / buyer123 — Arjun Mehta (ABC Apparel)</p>
            <p>Supplier: supplier@mylonex.demo / supplier123 — Kyal Textile Mills</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
