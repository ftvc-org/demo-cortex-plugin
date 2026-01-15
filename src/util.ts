const listKeyForUrl = (url: string): string => {
  const keysForKnownEndpoints = {
    "custom-data": null, // null indicates that the response is itself an array
    "custom-events": "events",
    catalog: "entities",
    "audit-logs": "logs",
  };
  const reqUrl = new URL(url);
  const lastPathElement = reqUrl.pathname.split("/").pop() as string;
  return lastPathElement in keysForKnownEndpoints
    ? keysForKnownEndpoints[lastPathElement]
    : lastPathElement;
};

export interface FetchPaginatedParams {
  listKey?: string;
  urlParams: Record<string, string>;
}

export const fetchPaginated = async (
  url: string,
  params: FetchPaginatedParams = { urlParams: {} }
): Promise<any[]> => {
  let pagesFetched = 0;
  let data: any[] = [];

  const listKey = params.listKey ?? listKeyForUrl(url);

  const reqUrl = new URL(url);
  const urlParams = Object.fromEntries(reqUrl.searchParams.entries());
  reqUrl.search = "";

  while (true) {
    const reqParams = {
      ...urlParams,
      ...params.urlParams,
      page: `${pagesFetched}`,
    };
    const response = await fetch(
      `${reqUrl.toString()}?${new URLSearchParams(reqParams).toString()}`
    );
    const responseBody = await response.json();
    const fetchedPage: any[] = listKey ? responseBody[listKey] : responseBody;
    data = [...data, ...fetchedPage];
    if (!fetchedPage || fetchedPage.length === 0) {
      break;
    }
    pagesFetched++;
  }
  return data;
};
