type AllowedMethodsType = "GET" | "POST" | "DELETE";

function getContentType(url: string, body: string | FormData | undefined): { "Content-Type": string } | {} {
  if (typeof body === "string") return { "Content-Type": "application/json" };
  return {};
}

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
      ...getContentType(url, body),
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
  if (data.message === "NO_PUBLIC_ACCESS") {
    throw new Error("NO_PUBLIC_ACCESS");
  } else if (data.message === "NO_ROLE_ACCESS") {
    return { role_access: false, ok: false };
  } else if (data.ok === false) {
    throw new Error(data.message);
  }

  return data;
}
