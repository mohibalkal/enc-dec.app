/* eslint-disable */
// @ts-nocheck
var fs = require('fs');
var path = require('path');
var CryptoJS = require('crypto-js');

// --- Hashids Implementation (Strict ES5) ---
var shuffle = function(t, e) {
  var r;
  if (0 === e.length) return t;
  var sArr = [];
  for (var k = 0; k < t.length; k++) sArr.push(t[k]);
  for (var tIdx = sArr.length - 1, nVal = 0, iVal = 0; tIdx > 0; tIdx--, nVal++) {
    nVal %= e.length;
    var charVal = e[nVal].charCodeAt(0);
    iVal += charVal;
    var oVal = (charVal + nVal + iVal) % tIdx;
    var aVal = sArr[tIdx];
    sArr[tIdx] = sArr[oVal];
    sArr[oVal] = aVal;
  }
  return sArr;
};

var Hashids = function(t, e, r, o) {
    this.salt = (t || "").split("");
    var alphaBase = r || "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    var sepsBase = o || "cfhistuCFHISTU";
    var self = this;
    this.alphabet = shuffle(alphaBase.split("").filter(function(x) { return sepsBase.indexOf(x) === -1; }), this.salt);
    this.seps = shuffle(sepsBase.split("").filter(function(x) { return alphaBase.indexOf(x) !== -1; }), this.salt);
};

Hashids.prototype.encode = function(r) {
    if (!Array.isArray(r)) r = [parseInt(r)];
    var alpha = [];
    for (var k = 0; k < this.alphabet.length; k++) alpha.push(this.alphabet[k]);
    var sSum = 0;
    for (var i = 0; i < r.length; i++) {
        var val = r[i];
        if (typeof BigInt !== 'undefined' && typeof val === 'bigint') {
            sSum += Number(val % BigInt(i + 100));
        } else {
            sSum += val % (i + 100);
        }
    }
    var sArr = [alpha[sSum % alpha.length]];
    var nArr = [sArr[0]];
    var self = this;
    
    for (var i = 0; i < r.length; i++) {
        var v = r[i];
        var aVal = nArr.concat(self.salt, alpha);
        alpha = shuffle(alpha, aVal);
        var temp = v;
        var h = [];
        if (typeof BigInt !== 'undefined' && typeof temp === "bigint") {
            var tv = BigInt(alpha.length);
            do { h.unshift(alpha[Number(temp % tv)]); temp = temp / tv; } while (temp > BigInt(0));
        } else {
            do { h.unshift(alpha[temp % alpha.length]); temp = Math.floor(temp / alpha.length); } while (temp > 0);
        }
        for (var j = 0; j < h.length; j++) sArr.push(h[j]);
        if (i + 1 < r.length) {
            var tV = h[0].charCodeAt(0) + i;
            var modV = (typeof BigInt !== 'undefined' && typeof v === 'bigint' ? Number(v % BigInt(tV)) : v % tV);
            sArr.push(self.seps[modV % self.seps.length]);
        }
    }
    return sArr.join("");
};

async function decryptAES(ciphertext, password) {
  try {
    var decrypted = CryptoJS.AES.decrypt(ciphertext, password);
    var res = decrypted.toString(CryptoJS.enc.Utf8);
    if (res && (res.trim().charAt(0) === '{' || res.trim().charAt(0) === '[')) return res;
    return null;
  } catch (e) { return null; }
}

exports.handler = async function(event) {
    var corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: corsHeaders, body: '' };
    }

    try {
        var body = JSON.parse(event.body);
        var text = body.text;
        var id = body.id;
        
        if (!text || !id) {
            throw new Error("Missing required params: text and id");
        }

        // WASM Setup
        var possiblePaths = [
            path.join(__dirname, '../wasm/module.wasm'),
            '/var/task/netlify/wasm/module.wasm'
        ];
        
        var wasmBytes = null;
        for (var pIdx = 0; pIdx < possiblePaths.length; pIdx++) {
            try {
                if (fs.existsSync(possiblePaths[pIdx])) {
                    wasmBytes = fs.readFileSync(possiblePaths[pIdx]);
                    break;
                }
            } catch(we) {}
        }

        if (!wasmBytes) throw new Error("WASM module.wasm not found");
        
        var wasm;
        var readStr = function(ptr) {
          if (!ptr) return "";
          var buf = wasm.memory.buffer;
          var dv = new DataView(buf);
          var len = dv.getUint32(ptr - 4, true);
          var u16 = new Uint16Array(buf);
          var s = "";
          var start = ptr >>> 1;
          for (var k = 0; k < (len >>> 1); k++) s += String.fromCharCode(u16[start + k]);
          return s;
        };
        var writeStr = function(s) {
          var ptr = wasm.__new(s.length << 1, 2) >>> 0;
          var u16 = new Uint16Array(wasm.memory.buffer);
          for (var i = 0; i < s.length; i++) u16[(ptr >>> 1) + i] = s.charCodeAt(i);
          return ptr;
        };

        var result = await WebAssembly.instantiate(wasmBytes, {
          env: { seed: function() { return Math.random(); }, abort: function() {} }
        });
        wasm = result.instance.exports;

        var servePtr = wasm.serve();
        var wasmCode = readStr(servePtr);
        
        var context = { 
          hash: null, 
          mediaId: id.toString(),
          location: { href: 'https://player.videasy.net/', hostname: 'player.videasy.net', origin: 'https://player.videasy.net' },
          atob: function(s) { return Buffer.from(s, 'base64').toString('binary'); },
          btoa: function(s) { return Buffer.from(s, 'binary').toString('base64'); },
          setTimeout: function(fn, ms) { return setTimeout(fn, ms); },
          console: { log: function() {} }
        };

        var bridgeFn = new Function('window', "with(window) { " + wasmCode + " }");
        bridgeFn(context);
        
        var attempts = 0;
        while (!context.hash && attempts++ < 60) {
          await new Promise(function(r) { setTimeout(r, 50); });
        }

        if (!context.hash) throw new Error("WASM Bridge timeout");
        
        wasm.verify(writeStr(context.hash));

        var midPtr = wasm.decrypt(writeStr(text), parseFloat(id));
        var mid = readStr(midPtr);
        
        if (!mid) throw new Error("WASM decryption failed");

        var salt_c = "8c465aa8af6cbfd4c1f91bf0c8d678ba";
        var xor = 0;
        for (var k = 0; k < salt_c.length; k++) xor ^= salt_c.charCodeAt(k);
        
        var hexRaw = id + "d486ae1ce6fdbe63b60bd1704541fcf0";
        var hex = "";
        for (var k = 0; k < hexRaw.length; k++) {
            var c = (hexRaw.charCodeAt(k) ^ xor).toString(16);
            hex += ("0" + c).slice(-2);
        }
        
        var nums = [];
        for (var k = 0; k < hex.length; k += 12) {
            nums.push(parseInt("1" + hex.slice(k, k + 12), 16));
        }
        
        var hids = new Hashids();
        var derivedKey = hids.encode(nums);

        var trials = ["4VqE3#N7z9*8H1k", derivedKey, "", hex, id];
        var finalResult = null;
        for (var tIdx = 0; tIdx < trials.length; tIdx++) {
          var resAES = await decryptAES(mid, trials[tIdx]);
          if (resAES) { 
            try { 
                finalResult = JSON.parse(resAES); 
                if (finalResult) break;
            } catch(e) {} 
          }
        }
        
        if (!finalResult && mid.trim().charAt(0) === '{') {
            try { finalResult = JSON.parse(mid); } catch(e) {}
        }
        
        if (!finalResult) throw new Error("AES decryption failed");

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 200, result: finalResult })
        };
    } catch (e) {
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ status: 500, error: e.message })
        };
    }
};
