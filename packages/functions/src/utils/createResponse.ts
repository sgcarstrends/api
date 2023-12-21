interface HttpResponse<T> {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

export const createResponse = <T>(
  data: T,
  statusCode: number = 200,
  headers: Record<string, string> = {},
): HttpResponse<T> => {
  headers = {
    "Content-Type": "application/json",
    ...headers,
  };

  return {
    statusCode,
    headers,
    body: JSON.stringify(data),
  };
};
