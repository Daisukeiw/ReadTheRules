const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const getToken = () => localStorage.getItem("token");
export const setToken = (t: string | null) => (t ? localStorage.setItem("token", t) : localStorage.removeItem("token"));

// id do usuário logado, lido do payload do JWT (o mestre precisa dele para convidar).
export const meuId = (): string => {
  try { return JSON.parse(atob(getToken()!.split(".")[1])).id; } catch { return ""; }
};

export async function api<T = any>(path: string, method = "GET", body?: unknown): Promise<T> {
  const res = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json", ...(getToken() && { Authorization: `Bearer ${getToken()}` }) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 401) { setToken(null); location.href = "/login"; }
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message ?? `Erro ${res.status}`);
  return data;
}
