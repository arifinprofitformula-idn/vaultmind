import { AuthProvider } from "@/lib/auth-context";

export default function VaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
