/** 指定値が有効なHTTPS URLかを判定する。 */
export function isHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}
