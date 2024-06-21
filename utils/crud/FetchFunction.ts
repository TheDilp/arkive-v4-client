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
  const res = await fetch(url, {
    method,
    body,
    credentials: isPublic ? "omit" : "include",
    headers: {
      module: "wiki",
      "Access-Control-Allow-Origin": "*",
      ...(typeof body === "string" ? { "Content-Type": "application/json" } : {}),
    },
  });

  const data = await res.json();
  if (!data.ok) {
    if ((data.message === "NO_PUBLIC_ACCESS" || data.message === "UNAUTHORIZED") && res.status === 401) {
      throw new Error("No public access");
    } else if (data.message === "NO_ROLE_ACCESS") {
      return { role_access: false, ok: false };
    }

    throw new Error("There was an error with your request.");
  }
  return data;
}
