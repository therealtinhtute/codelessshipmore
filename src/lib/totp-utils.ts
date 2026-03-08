const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
const TOTP_PERIOD_SECONDS = 30
const TOTP_DIGITS = 6

function normalizeSecret(secret: string) {
  return secret.toUpperCase().replace(/[\s-]+/g, "")
}

export function isValidBase32Secret(secret: string) {
  try {
    decodeBase32Secret(secret)
    return true
  } catch {
    return false
  }
}

export function decodeBase32Secret(secret: string) {
  const normalized = normalizeSecret(secret)

  if (!normalized) {
    throw new Error("Please enter a Base32 secret")
  }

  if (!/^[A-Z2-7]+=*$/.test(normalized)) {
    throw new Error("Secret must contain only Base32 characters (A-Z, 2-7)")
  }

  const firstPaddingIndex = normalized.indexOf("=")
  if (firstPaddingIndex !== -1 && !/^=+$/.test(normalized.slice(firstPaddingIndex))) {
    throw new Error("Secret contains invalid Base32 padding")
  }

  const unpadded = normalized.replace(/=+$/g, "")

  if (![0, 2, 4, 5, 7].includes(unpadded.length % 8)) {
    throw new Error("Secret has an invalid Base32 length")
  }

  let bits = ""

  for (const character of unpadded) {
    const value = BASE32_ALPHABET.indexOf(character)

    if (value === -1) {
      throw new Error("Secret contains invalid Base32 characters")
    }

    bits += value.toString(2).padStart(5, "0")
  }

  const bytes = new Uint8Array(Math.floor(bits.length / 8))

  for (let index = 0; index < bytes.length; index += 1) {
    const chunk = bits.slice(index * 8, index * 8 + 8)
    bytes[index] = Number.parseInt(chunk, 2)
  }

  if (bytes.length === 0) {
    throw new Error("Secret is too short to decode")
  }

  return bytes
}

async function importTotpKey(secret: string) {
  const secretBytes = decodeBase32Secret(secret)

  return crypto.subtle.importKey(
    "raw",
    secretBytes,
    {
      name: "HMAC",
      hash: "SHA-1"
    },
    false,
    ["sign"]
  )
}

function createCounterBuffer(counter: number) {
  const buffer = new ArrayBuffer(8)
  const view = new DataView(buffer)
  const high = Math.floor(counter / 2 ** 32)
  const low = counter % 2 ** 32

  view.setUint32(0, high, false)
  view.setUint32(4, low, false)

  return buffer
}

export async function generateTotpCode(secret: string, timestamp = Date.now()) {
  const counter = Math.floor(timestamp / 1000 / TOTP_PERIOD_SECONDS)
  const key = await importTotpKey(secret)
  const signature = await crypto.subtle.sign("HMAC", key, createCounterBuffer(counter))
  const bytes = new Uint8Array(signature)
  const offset = bytes[bytes.length - 1] & 0x0f
  const binary =
    ((bytes[offset] & 0x7f) << 24) |
    (bytes[offset + 1] << 16) |
    (bytes[offset + 2] << 8) |
    bytes[offset + 3]

  return String(binary % 10 ** TOTP_DIGITS).padStart(TOTP_DIGITS, "0")
}

export function getTotpSecondsRemaining(timestamp = Date.now()) {
  const elapsedSeconds = Math.floor(timestamp / 1000) % TOTP_PERIOD_SECONDS
  return TOTP_PERIOD_SECONDS - elapsedSeconds
}
