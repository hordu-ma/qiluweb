const DEFAULT_PB_BASE_URL = "/pb";

const resolvePbBaseUrl = () => {
  try {
    if (
      typeof import.meta !== "undefined" &&
      import.meta.env &&
      typeof import.meta.env.VITE_PB_BASE_URL === "string" &&
      import.meta.env.VITE_PB_BASE_URL.trim()
    ) {
      return import.meta.env.VITE_PB_BASE_URL.trim().replace(/\/$/, "");
    }
  } catch (e) {
    // ignore
  }
  return DEFAULT_PB_BASE_URL;
};

const joinUrl = (baseUrl, path) => {
  const base = (baseUrl || "").replace(/\/$/, "");
  const p = (path || "").replace(/^\//, "");
  return `${base}/${p}`;
};

const pbFetchJson = async (path) => {
  const baseUrl = resolvePbBaseUrl();
  const url = joinUrl(baseUrl, path);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PocketBase request failed: ${response.status} ${text}`);
  }

  return response.json();
};

export const pbFileUrl = (collection, recordId, filename) => {
  const baseUrl = resolvePbBaseUrl();
  const collectionPart = encodeURIComponent(collection);
  const recordPart = encodeURIComponent(recordId);
  const filePart = encodeURIComponent(filename);
  return joinUrl(
    baseUrl,
    `/api/files/${collectionPart}/${recordPart}/${filePart}`
  );
};

export const listCenterNews = async ({ page, perPage }) => {
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safePerPage = Number.isFinite(perPage) && perPage > 0 ? perPage : 10;

  const filter = encodeURIComponent('status="published"');
  const sort = encodeURIComponent("-publish_at,-created");

  return pbFetchJson(
    `/api/collections/center_news/records?page=${safePage}&perPage=${safePerPage}&filter=${filter}&sort=${sort}`
  );
};

export const getCenterNews = async (id) => {
  const safeId = encodeURIComponent(id);
  return pbFetchJson(`/api/collections/center_news/records/${safeId}`);
};
