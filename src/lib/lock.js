// Локальная идентификация: PIN (соль + SHA-256) и биометрия через WebAuthn
// (Face ID / Touch ID на iPhone, Touch ID на Mac). Всё хранится на устройстве.
const LOCK_KEY = "daleros:lock";
const SESSION_KEY = "daleros:unlocked";

function getLock() {
  try { return JSON.parse(localStorage.getItem(LOCK_KEY)) || null; } catch { return null; }
}
function setLock(v) {
  if (v) localStorage.setItem(LOCK_KEY, JSON.stringify(v));
  else localStorage.removeItem(LOCK_KEY);
}

const toHex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
const randHex = (n = 16) => toHex(crypto.getRandomValues(new Uint8Array(n)));

async function hashPin(salt, pin) {
  const data = new TextEncoder().encode(`${salt}:${pin}`);
  return toHex(await crypto.subtle.digest("SHA-256", data));
}

export const hasLock = () => !!getLock();
export const isUnlockedThisSession = () => sessionStorage.getItem(SESSION_KEY) === "1";
export const markUnlocked = () => sessionStorage.setItem(SESSION_KEY, "1");
export const lockNow = () => sessionStorage.removeItem(SESSION_KEY);

export async function setPin(pin) {
  const salt = randHex();
  const prev = getLock();
  setLock({ salt, hash: await hashPin(salt, pin), credId: prev?.credId || null });
}

export async function verifyPin(pin) {
  const l = getLock();
  if (!l) return false;
  return (await hashPin(l.salt, pin)) === l.hash;
}

export function clearLock() {
  setLock(null);
  lockNow();
}

export const hasBiometric = () => !!getLock()?.credId;
export const biometricAvailable = () =>
  !!(window.PublicKeyCredential && navigator.credentials);

// Регистрация платформенного аутентификатора (Face ID / Touch ID)
export async function registerBiometric() {
  const l = getLock();
  if (!l) throw new Error("Сначала задай PIN");
  const cred = await navigator.credentials.create({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rp: { name: "DALER OS" },
      user: {
        id: new TextEncoder().encode("daler"),
        name: "Daler",
        displayName: "Daler",
      },
      pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
      authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
      timeout: 60000,
    },
  });
  setLock({ ...l, credId: toHex(cred.rawId) });
}

export async function biometricUnlock() {
  const l = getLock();
  if (!l?.credId) return false;
  const id = new Uint8Array(l.credId.match(/../g).map((h) => parseInt(h, 16)));
  try {
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        allowCredentials: [{ type: "public-key", id }],
        userVerification: "required",
        timeout: 60000,
      },
    });
    return !!assertion;
  } catch {
    return false;
  }
}

export function disableBiometric() {
  const l = getLock();
  if (l) setLock({ ...l, credId: null });
}
