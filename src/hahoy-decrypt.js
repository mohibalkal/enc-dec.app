// Hahoy Key System
const wa_array = ["ChjVChm", "nJe1ota2mhf2tuXKAq", "ChvZAa", "C29YDa", "C3rYzwfTCW", "C2LNBMfS", "zMv0y2G", "ndH3u2vLvNG", "zMLSDgvY", "cIaGicbYzxr1CM4GCgfYC2uOzgf0ysWGChjVChmPoWOGia", "mJe1mZK1mKPYz0TeCa", "ntu2mtqWyLzuzhLj", "B2jQzwn0", "DhjPyNv0zxm", "BMfTzq", "CgfZC3DVCMq", "mtCYmJe5nMLKDMLlCa", "ntiYnZy1s2Tgt0jA", "odqZodyZne11ww91sq", "CgfYC2u", "C3vIDgL0BgvZ", "zgf0yq", "l3rPDgXLlW", "twLZC2LUzYbXDwvYEtOGDg1KyKLKlcbPBwrIswqSig9YihrPDgXLihjLCxvPCMvK", "mJrSy2jprgy", "BgfUz0nVzgu", "C3rYAw5N", "l3yWlW", "CMfUAW", "CgfYC2uY", "u291CMnLig5VDcbMB3vUzdOG", "zMLUza", "mtm5nta2rfLeuwjt", "zM9YrwfJAa", "zhvICW", "CM91Dgu", "zw5HyMXLza", "BgvUz3rO", "y29UzMLN", "BwfW"];

const ma_state = { rPXUJF: {}, XCyMsS: false, UTlsOe: null };

function ma(e) {
  e -= 327;
  const a = wa_array;
  let l = a[e];
  
  if (!ma_state.XCyMsS) {
    ma_state.UTlsOe = function(e) {
      let t = '', a = '';
      const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';
      
      for (let lVal, nVal, cVal = 0, sVal = 0; nVal = e.charAt(sVal++);) {
        const idx = alphabet.indexOf(nVal);
        if (idx !== -1) {
          lVal = cVal % 4 ? 64 * lVal + idx : idx;
          if (cVal++ % 4) t += String.fromCharCode(255 & (lVal >> (-2 * cVal & 6)));
        }
      }
      
      for (let i = 0; i < t.length; i++) {
        a += '%' + ('00' + t.charCodeAt(i).toString(16)).slice(-2);
      }
      return decodeURIComponent(a);
    };
    ma_state.XCyMsS = true;
  }
  
  const key = e + a[0];
  if (ma_state.rPXUJF[key]) return ma_state.rPXUJF[key];
  
  l = ma_state.UTlsOe(l);
  ma_state.rPXUJF[key] = l;
  return l;
}

// Initialize
(() => {
  const e = ma;
  const t = wa_array;
  try {
    let iterations = 0;
    while (true) {
      if (iterations++ > 1000) break;
      const checksum = -parseInt(e(336)) / 1 + -parseInt(e(351)) / 2 * (-parseInt(e(366)) / 3) + 
                       parseInt(e(330)) / 4 + parseInt(e(360)) / 5 + parseInt(e(329)) / 6 + 
                       parseInt(e(335)) / 7 * (-parseInt(e(343)) / 8) + -parseInt(e(337)) / 9;
      if (647412 === checksum) break;
      t.push(t.shift());
    }
  } catch (err) {
    t.push(t.shift());
  }
})();

function processOutput(wasmOutput) {
  let l = wasmOutput;
  if (l.length > 2) {
    const a = l.slice(0, -2);
    l = l.slice(-2) + a.split('').reverse().join('');
    const n = l.length % 4;
    if (n === 2) l += '==';
    else if (n === 3) l += '=';
  }
  
  const aAlt = l.replace(/-/g, '+').replace(/_/g, '/');
  const len = aAlt.length % 4;
  const padded = len !== 0 ? aAlt + '='.repeat(4 - len) : aAlt;
  
  const decoded = atob(padded);
  let s = '';
  for (let r = 0; r < decoded.length; r++) {
    s += String.fromCharCode(decoded.charCodeAt(r));
  }
  
  try {
    return decodeURIComponent(escape(s));
  } catch (e) {
    return s;
  }
}

export async function decryptHahoy(encryptedText) {
  if (!encryptedText) {
    throw new Error('Missing required param: text');
  }

  let encryptedData = encryptedText.trim();
  try {
    if (encryptedData.startsWith('{')) {
      const j = JSON.parse(encryptedData);
      encryptedData = j.encryptedData || j.data || encryptedData;
    }
  } catch (e) {}
  
  if (typeof encryptedData === 'string') {
    encryptedData = encryptedData.replace(/^"|"$/g, '');
  }

  // Load WASM
  const wasmUrl = 'https://raw.githubusercontent.com/alkalx/enc-dec.app/main/netlify/wasm/decryptor.wasm';
  const wasmResponse = await fetch(wasmUrl);
  const wasmBytes = await wasmResponse.arrayBuffer();

  let wasm;
  const getMem = () => new Uint8Array(wasm.memory.buffer);
  const getDV = () => new DataView(wasm.memory.buffer);

  const imports = {
    wbg: {
      __wbg_atob_6fb33d1246c05dea: (resPtr, ref, strPtr, strLen) => {
        const str = new TextDecoder('utf-8').decode(getMem().subarray(strPtr, strPtr + strLen));
        const decoded = Uint8Array.from(atob(str), c => c.charCodeAt(0));
        const outPtr = wasm.__wbindgen_malloc(decoded.length, 1) >>> 0;
        getMem().set(decoded, outPtr);
        const dv = getDV();
        dv.setInt32(resPtr + 4, decoded.length, true);
        dv.setInt32(resPtr + 0, outPtr, true);
      },
      __wbg_call_13410aac570ffff7: () => {},
      __wbg_instanceof_Window_12d20d558ef92592: () => false,
      __wbg_log_6c7b5f4f00b8ce3f: () => {},
      __wbg_log_7917fde260a8fd39: () => {},
      __wbg_newnoargs_254190557c45b4ec: () => 0,
      __wbg_static_accessor_GLOBAL_8921f820c2ce3f12: () => 0,
      __wbg_static_accessor_GLOBAL_THIS_f0a4409105898184: () => 0,
      __wbg_static_accessor_SELF_995b214ae681ff99: () => 0,
      __wbg_static_accessor_WINDOW_cde3890479c675ea: () => 0,
      __wbg_wbindgenisundefined_c4b71d073b92f3c5: () => true,
      __wbg_wbindgenthrow_451ec1a8469d7eb6: () => { throw new Error('WASM Throw'); },
      __wbindgen_cast_2241b6af4c4b2941: () => '',
      __wbindgen_init_externref_table: () => {}
    }
  };

  const result = await WebAssembly.instantiate(wasmBytes, imports);
  wasm = result.instance.exports;

  const key = ma(334);
  const encoder = new TextEncoder();
  
  const encData = encoder.encode(encryptedData);
  const keyData = encoder.encode(key);
  
  const p1Ptr = wasm.__wbindgen_malloc(encData.length, 1) >>> 0;
  const p2Ptr = wasm.__wbindgen_malloc(keyData.length, 1) >>> 0;
  
  getMem().set(encData, p1Ptr);
  getMem().set(keyData, p2Ptr);

  const resultPtr = wasm.parser(p1Ptr, encData.length, p2Ptr, keyData.length);
  
  const mem32 = new Int32Array(wasm.memory.buffer);
  const outPtr = mem32[resultPtr >>> 2];
  const outLen = mem32[(resultPtr >>> 2) + 1];

  if (!outPtr || outLen <= 0) throw new Error('WASM Parser output error');

  const u8 = new Uint8Array(wasm.memory.buffer).subarray(outPtr, outPtr + outLen);
  const wasmOutput = new TextDecoder('utf-8').decode(u8);
  const finalJson = processOutput(wasmOutput);

  return JSON.parse(finalJson);
}
