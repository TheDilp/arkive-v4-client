export function getCookie(name: string) {
  const value = `; ${document?.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(";").shift();
  return "";
}

export async function FetchFunction({
  url,
  method,
  body,
  isPublic,
}: {
  url: string;
  method: "GET" | "POST" | "DELETE";
  body?: string | FormData;
  isPublic?: boolean;
}) {
  // @ts-ignore
  const token = isPublic ? null : await window.Clerk.session.getToken();
  const res = await fetch(url, {
    method,
    body,
    headers: {
      Authorization: isPublic ? "" : `Bearer ${token}`,
      "Access-Control-Allow-Origin": "*",
      ...(typeof body === "string" ? { "Content-Type": "application/json" } : {}),
    },
  });

  const data = await res.json();
  if (!data.ok) {
    if (data.message === "UNAUTHORIZED" && res.status === 403) {
      // @ts-ignore
      window?.Clerk?.signOut();
    } else if (data.message === "NO_PUBLIC_ACCESS" && res.status === 403) {
      throw new Error("No public access");
    }

    throw new Error("There was an error with your request.");
  }
  return data;
}
