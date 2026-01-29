import CryptoJS from 'crypto-js';

// Hashids implementation
class Hashids {
  constructor(salt = '', minLength = 0, alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890', seps = 'cfhistuCFHISTU') {
    this.salt = salt.split('');
    this.alphabet = this.shuffle(
      alphabet.split('').filter(c => !seps.includes(c)),
      this.salt
    );
    this.seps = this.shuffle(
      seps.split('').filter(c => alphabet.includes(c)),
      this.salt
    );
  }

  shuffle(arr, salt) {
    if (salt.length === 0) return arr;
    const result = [...arr];
    for (let i = result.length - 1, v = 0, p = 0; i > 0; i--, v++) {
      v %= salt.length;
      p += salt[v].charCodeAt(0);
      const j = (salt[v].charCodeAt(0) + v + p) % i;
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  encode(numbers) {
    if (!Array.isArray(numbers)) numbers = [parseInt(numbers)];
    let alphabet = [...this.alphabet];
    const numbersHashInt = numbers.reduce((sum, n, i) => sum + (n % (i + 100)), 0);
    const lottery = alphabet[numbersHashInt % alphabet.length];
    let ret = [lottery];

    for (let i = 0; i < numbers.length; i++) {
      const num = numbers[i];
      const buffer = [lottery, ...this.salt, ...alphabet];
      alphabet = this.shuffle(alphabet, buffer);
      const last = this.hash(num, alphabet);
      ret.push(...last);
      if (i < numbers.length - 1) {
        const charCode = last[0].charCodeAt(0) + i;
        const sepsIndex = (num % charCode) % this.seps.length;
        ret.push(this.seps[sepsIndex]);
      }
    }
    return ret.join('');
  }

  hash(input, alphabet) {
    const hash = [];
    let num = input;
    do {
      hash.unshift(alphabet[num % alphabet.length]);
      num = Math.floor(num / alphabet.length);
    } while (num > 0);
    return hash;
  }
}

async function decryptAES(ciphertext, password) {
  try {
    const decrypted = CryptoJS.AES.decrypt(ciphertext, password);
    const res = decrypted.toString(CryptoJS.enc.Utf8);
    if (res && (res.trim().charAt(0) === '{' || res.trim().charAt(0) === '[')) return res;
    return null;
  } catch (e) {
    return null;
  }
}

export async function decryptVideasy(encryptedText, tmdbId) {
  if (!encryptedText || !tmdbId) {
    throw new Error('Missing required params: text and id');
  }

  // Load WASM module
  const wasmUrl = 'https://raw.githubusercontent.com/alkalx/enc-dec.app/main/netlify/wasm/module.wasm';
  const wasmResponse = await fetch(wasmUrl);
  const wasmBytes = await wasmResponse.arrayBuffer();

  let wasm;
  const readStr = (ptr) => {
    if (!ptr) return '';
    const buf = wasm.memory.buffer;
    const dv = new DataView(buf);
    const len = dv.getUint32(ptr - 4, true);
    const u16 = new Uint16Array(buf);
    let s = '';
    const start = ptr >>> 1;
    for (let k = 0; k < (len >>> 1); k++) s += String.fromCharCode(u16[start + k]);
    return s;
  };

  const writeStr = (s) => {
    const ptr = wasm.__new(s.length << 1, 2) >>> 0;
    const u16 = new Uint16Array(wasm.memory.buffer);
    for (let i = 0; i < s.length; i++) u16[(ptr >>> 1) + i] = s.charCodeAt(i);
    return ptr;
  };

  const result = await WebAssembly.instantiate(wasmBytes, {
    env: { seed: () => Math.random(), abort: () => {} }
  });
  wasm = result.instance.exports;

  const servePtr = wasm.serve();
  const wasmCode = readStr(servePtr);

  const context = {
    hash: null,
    mediaId: tmdbId.toString(),
    location: { href: 'https://player.videasy.net/', hostname: 'player.videasy.net', origin: 'https://player.videasy.net' },
    atob: (s) => atob(s),
    btoa: (s) => btoa(s),
    setTimeout: (fn, ms) => setTimeout(fn, ms),
    console: { log: () => {} }
  };

  const bridgeFn = new Function('window', `with(window) { ${wasmCode} }`);
  bridgeFn(context);

  let attempts = 0;
  while (!context.hash && attempts++ < 60) {
    await new Promise(r => setTimeout(r, 50));
  }

  if (!context.hash) throw new Error('WASM Bridge timeout');

  wasm.verify(writeStr(context.hash));
  const midPtr = wasm.decrypt(writeStr(encryptedText), parseFloat(tmdbId));
  const mid = readStr(midPtr);

  if (!mid) throw new Error('WASM decryption failed');

  // AES decryption
  const salt_c = '8c465aa8af6cbfd4c1f91bf0c8d678ba';
  let xor = 0;
  for (let k = 0; k < salt_c.length; k++) xor ^= salt_c.charCodeAt(k);

  const hexRaw = tmdbId + 'd486ae1ce6fdbe63b60bd1704541fcf0';
  let hex = '';
  for (let k = 0; k < hexRaw.length; k++) {
    const c = (hexRaw.charCodeAt(k) ^ xor).toString(16);
    hex += ('0' + c).slice(-2);
  }

  const nums = [];
  for (let k = 0; k < hex.length; k += 12) {
    nums.push(parseInt('1' + hex.slice(k, k + 12), 16));
  }

  const hids = new Hashids();
  const derivedKey = hids.encode(nums);

  const trials = ['4VqE3#N7z9*8H1k', derivedKey, '', hex, tmdbId];
  let finalResult = null;

  for (const key of trials) {
    const resAES = await decryptAES(mid, key);
    if (resAES) {
      try {
        finalResult = JSON.parse(resAES);
        if (finalResult) break;
      } catch (e) {}
    }
  }

  if (!finalResult && mid.trim().charAt(0) === '{') {
    try {
      finalResult = JSON.parse(mid);
    } catch (e) {}
  }

  if (!finalResult) throw new Error('AES decryption failed');

  return finalResult;
}
