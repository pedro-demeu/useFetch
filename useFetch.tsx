import useSWR, { SWRConfiguration, Key, useSWRConfig, Fetcher } from "swr";

type DataFinal<Data, NormalizedData> = NormalizedData extends Data
  ? Data
  : NormalizedData;

type ConfigFetch<Data, NormalizedData> = SWRConfiguration<
  DataFinal<Data, NormalizedData>
> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: any;
  normalizeData?: (data: Data) => DataFinal<Data, NormalizedData>;
  conditionFn?: () => boolean;
  cleanCacheAfterMs?: number;
  key?: Key;
  baseURL?: string;
  responseType?: ResponseType;
};

async function fetcher<Data>(url: string, baseURL?: string): Promise<Data> {
  const fullUrl = baseURL ? `${baseURL}${url}` : url;
  const response = await fetch(fullUrl, { method: "GET" });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data = await response.json();
  return data as Data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useFetch<Data = any, NormalizedData = Data>(
  url: string,
  {
    normalizeData = (data: Data) => data as DataFinal<Data, NormalizedData>,
    conditionFn = () => true,
    cleanCacheAfterMs,
    params,
    key,
    baseURL,
    ...config
  }: ConfigFetch<Data, NormalizedData> = {}
) {
  const calcKey = key || params ? [url, ...Object.values(params)] : url;
  const { cache } = useSWRConfig();
  const fetcherFnp: Fetcher<DataFinal<Data, NormalizedData>> | null =
    conditionFn()
      ? async (_url: string) => {
          const data = await fetcher<Data>(_url, baseURL);

          if (cleanCacheAfterMs) {
            setTimeout(() => {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-expect-error
              cache.delete(calcKey);
            }, cleanCacheAfterMs);
          }

          return data
            ? normalizeData(data)
            : (data as DataFinal<Data, NormalizedData>);
        }
      : null;

  const response = useSWR<DataFinal<Data, NormalizedData>>(
    calcKey,
    fetcherFnp,
    {
      suspense: true,
      ...config,
    }
  );

  return response;
}

export default useFetch;
