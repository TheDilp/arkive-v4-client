export async function FetchFunction({
  url,
  method,
  body,
}: {
  url: string;
  method: "GET" | "POST" | "DELETE";
  body?: string | FormData;
}) {
  const res = await fetch(url, {
    method,
    body,
    headers: {
      "Access-Control-Allow-Origin": "*",
      ...(typeof body === "string" ? { "Content-Type": "application/json" } : {}),
    },
  });

  const data = await res.json();

  return data;
}
