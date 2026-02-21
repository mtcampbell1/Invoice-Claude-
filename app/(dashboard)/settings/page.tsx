"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { Lock } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [canSave, setCanSave] = useState(false);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [taxId, setTaxId] = useState("");

  useEffect(() => {
    fetch("/api/business")
      .then((r) => r.json())
      .then((b) => {
        if (b && b.name) {
          setName(b.name || "");
          setAddress(b.address || "");
          setCity(b.city || "");
          setState(b.state || "");
          setZip(b.zip || "");
          setCountry(b.country || "");
          setPhone(b.phone || "");
          setEmail(b.email || "");
          setWebsite(b.website || "");
          setTaxId(b.taxId || "");
        }
      })
      .catch(() => {});

    // Check if user can save
    fetch("/api/tokens")
      .then((r) => r.json())
      .then((t) => {
        setCanSave(["pro", "business"].includes(t.plan));
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/business", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, address, city, state, zip, country, phone, email, website, taxId }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Business Settings</h1>
        <p className="text-sm text-gray-500">
          Save your business info to auto-fill documents
        </p>
      </div>

      {!canSave && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <Lock className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Pro feature – Upgrade to save your business info
            </p>
            <p className="text-xs text-amber-600">
              Available on Pro ($5.99/mo) and Business ($19.99/mo) plans.
            </p>
          </div>
          <Link href="/upgrade" className="ml-auto">
            <Button size="sm">Upgrade</Button>
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className={!canSave ? "opacity-60 pointer-events-none" : ""}>
          <CardHeader>
            <h2 className="font-semibold">Business Information</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Business Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Company Inc."
              required
              disabled={!canSave}
            />
            <Input
              label="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main Street"
              disabled={!canSave}
            />
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                disabled={!canSave}
              />
              <Input
                label="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="ST"
                disabled={!canSave}
              />
              <Input
                label="ZIP"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="12345"
                disabled={!canSave}
              />
            </div>
            <Input
              label="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="United States"
              disabled={!canSave}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                disabled={!canSave}
              />
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="billing@company.com"
                disabled={!canSave}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourcompany.com"
                disabled={!canSave}
              />
              <Input
                label="Tax ID / EIN"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="XX-XXXXXXX"
                disabled={!canSave}
              />
            </div>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            {saved && (
              <p className="text-sm text-green-600">Business info saved!</p>
            )}
            <div className="flex justify-end pt-2">
              <Button type="submit" loading={loading} disabled={!canSave}>
                Save business info
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
