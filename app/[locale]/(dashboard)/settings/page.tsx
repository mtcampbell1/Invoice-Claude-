"use client";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Lock, Upload, Trash2 } from "lucide-react";
import { Link } from "@/i18n/navigation";

export default function SettingsPage() {
  const { data: session } = useSession();
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const td = useTranslations("doc");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [canSave, setCanSave] = useState(false);
  const [canUploadLogo, setCanUploadLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          setLogoUrl(b.logoUrl || null);
        }
      })
      .catch(() => {});

    fetch("/api/tokens")
      .then((r) => r.json())
      .then((tok) => {
        const isPaid = ["pro", "business"].includes(tok.plan) || tok.tokenPackPurchased;
        setCanSave(["pro", "business"].includes(tok.plan));
        setCanUploadLogo(isPaid);
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("logo", file);

    const res = await fetch("/api/business/logo", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setLogoUploading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    setLogoUrl(data.logoUrl);
  };

  const handleLogoRemove = async () => {
    setLogoUploading(true);
    await fetch("/api/business/logo", { method: "DELETE" });
    setLogoUrl(null);
    setLogoUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <p className="text-sm text-gray-500">{t("subtitle")}</p>
      </div>

      {!canSave && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <Lock className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">{t("proFeature")}</p>
            <p className="text-xs text-amber-600">{t("proFeatureDesc")}</p>
          </div>
          <Link href="/upgrade" className="ml-auto">
            <Button size="sm">{tc("upgrade")}</Button>
          </Link>
        </div>
      )}

      {/* Logo upload section */}
      {canUploadLogo && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold">{t("logoLabel")}</h2>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {logoUrl ? (
                <div className="relative">
                  <img
                    src={logoUrl}
                    alt="Business logo"
                    className="h-16 w-auto max-w-[200px] rounded border border-gray-200 object-contain p-1"
                  />
                  <button
                    type="button"
                    onClick={handleLogoRemove}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex h-16 w-32 items-center justify-center rounded border-2 border-dashed border-gray-300 text-gray-400">
                  <Upload className="h-5 w-5" />
                </div>
              )}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  loading={logoUploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-3.5 w-3.5" />
                  {t("logoUpload")}
                </Button>
                <p className="mt-1 text-xs text-gray-400">{t("logoHint")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        <Card className={!canSave ? "opacity-60 pointer-events-none" : ""}>
          <CardHeader>
            <h2 className="font-semibold">{t("businessInfo")}</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label={t("businessNameLabel")} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Company Inc." required disabled={!canSave} />
            <Input label={td("address")} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main Street" disabled={!canSave} />
            <div className="grid grid-cols-3 gap-3">
              <Input label={td("city")} value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" disabled={!canSave} />
              <Input label={td("state")} value={state} onChange={(e) => setState(e.target.value)} placeholder="ST" disabled={!canSave} />
              <Input label={td("zip")} value={zip} onChange={(e) => setZip(e.target.value)} placeholder="12345" disabled={!canSave} />
            </div>
            <Input label={t("country")} value={country} onChange={(e) => setCountry(e.target.value)} placeholder="United States" disabled={!canSave} />
            <div className="grid grid-cols-2 gap-3">
              <Input label={td("phone")} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" disabled={!canSave} />
              <Input label={td("email")} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="billing@company.com" disabled={!canSave} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label={t("website")} value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourcompany.com" disabled={!canSave} />
              <Input label={td("taxId")} value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="XX-XXXXXXX" disabled={!canSave} />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {saved && <p className="text-sm text-green-600">{t("savedSuccess")}</p>}
            <div className="flex justify-end pt-2">
              <Button type="submit" loading={loading} disabled={!canSave}>
                {t("saveButton")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
