type AllowedMethodsType = "GET" | "POST" | "DELETE";
export async function FetchFunction({
  url,
  method,
  body,
}: {
  url: string;
  method: AllowedMethodsType;
  body?: string | FormData;
}) {
  const fetchParams: {
    method: AllowedMethodsType;
    headers: Record<string, string>;
    body?: string | FormData;
    credentials?: string;
  } = {
    method,
    body,
    headers: {
      module: "editor",
      ...(typeof body === "string" ? { "Content-Type": "application/json" } : {}),
    },
  };

  if (IS_PUBLIC === false || IS_PUBLIC === undefined) {
    fetchParams.credentials = "include";
  }

  // @ts-ignore
  const res = await fetch(url, fetchParams);
  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  const data = await res.json();
  if ((data.message === "NO_PUBLIC_ACCESS" || data.message === "UNAUTHORIZED") && res.status === 401) {
    throw new Error("No public access");
  } else if (data.message === "NO_ROLE_ACCESS") {
    return { role_access: false, ok: false };
  } else if (data.ok === false) {
    throw new Error(data.message);
  }

  return data;
}
