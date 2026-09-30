import crypto from 'node:crypto';

// Builds the signature Cloudinary asks for on a "signed upload".
// Rule from Cloudinary's docs: sort the parameters by name, join them as "a=1&b=2",
// add the API secret at the end, then take the SHA-1 hash in hex.
// This is a pure function: same input, same output, no network.
export default function signUpload(params: Record<string, string | number>, apiSecret: string): string {
  const joined = Object.keys(params)
    .sort()
    .map((name) => `${name}=${params[name]}`)
    .join('&');

  return crypto
    .createHash('sha1')
    .update(joined + apiSecret)
    .digest('hex');
}
