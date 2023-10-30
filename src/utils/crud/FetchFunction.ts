export function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(";").shift();
  return "";
}

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
  if (!data.ok) {
    throw new Error("There was an error with your request.");
  }
  return data;
}
