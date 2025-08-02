import { md5 } from "@noble/hashes/legacy";

export function hashStyle(prefix: string, style: string) {
  return `${prefix}-${Array.from(md5(style))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .substring(0, 8)}`;
}
