import { notFound, redirect } from "next/navigation";

const API_URL = process.env.API_URL ?? "http://localhost:8080";

interface Props {
  params: Promise<{ code: string }>;
}

export default async function RedirectPage({ params }: Props) {
  const { code } = await params;

  const res = await fetch(`${API_URL}/api/redirect/${code}`, {
    cache: "no-store",
  });

  if (res.status === 404) notFound();
  if (!res.ok) throw new Error("redirect lookup failed");

  const { original_url } = await res.json();
  redirect(original_url);
}
