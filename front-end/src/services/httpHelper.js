// Small helper to parse axios errors and rethrow a normalized Error
export function parseAxiosError(err) {
  const status = err && err.response && err.response.status;
  const data = err && err.response && err.response.data ? err.response.data : null;
  const message = (data && (data.message || data.msg)) || err.message || 'Error en la solicitud';
  const errors = data && (data.errors || data.error) ? (data.errors || data.error) : null;
  return { status, message, data, errors };
}

export function throwParsedAxiosError(err) {
  const parsed = parseAxiosError(err);
  const e = new Error(parsed.message || 'Error');
  // keep original axios shape for backward compatibility
  e.original = err;
  e.response = err && err.response ? err.response : null;
  e.parsed = parsed;
  throw e;
}

export default { parseAxiosError, throwParsedAxiosError };
