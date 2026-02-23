import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (login(email, password)) {
      navigate("/dashboard", { replace: true });
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-primary p-4">
      <Card className="w-full max-w-sm shadow-2xl border-0">
        <CardHeader className="items-center space-y-4 pb-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent">
            <Shield className="h-7 w-7 text-accent-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-extrabold text-foreground uppercase tracking-wide">DealerGuard</h1>
            <p className="text-sm text-muted-foreground font-medium">Lender Portal</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="test@lender.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full font-bold uppercase tracking-wide">
              Login
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Demo: test@lender.com / Password123
            </p>
          </form>
        </CardContent>
      </Card>
      <p className="mt-6 text-xs font-semibold text-accent">#CaringNotScaring</p>
      <p className="mt-1 text-[10px] text-primary-foreground/50">© The Compliance Guys</p>
    </div>
  );
}
