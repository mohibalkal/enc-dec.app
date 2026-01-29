/* eslint-disable */
// @ts-nocheck
var fs = require('fs');
var path = require('path');

// --- Hahoy Key System (ES5 Strict) ---
var wa_array = ["ChjVChm", "nJe1ota2mhf2tuXKAq", "ChvZAa", "C29YDa", "C3rYzwfTCW", "C2LNBMfS", "zMv0y2G", "ndH3u2vLvNG", "zMLSDgvY", "cIaGicbYzxr1CM4GCgfYC2uOzgf0ysWGChjVChmPoWOGia", "mJe1mZK1mKPYz0TeCa", "ntu2mtqWyLzuzhLj", "B2jQzwn0", "DhjPyNv0zxm", "BMfTzq", "CgfZC3DVCMq", "mtCYmJe5nMLKDMLlCa", "ntiYnZy1s2Tgt0jA", "odqZodyZne11ww91sq", "CgfYC2u", "C3vIDgL0BgvZ", "zgf0yq", "l3rPDgXLlW", "twLZC2LUzYbXDwvYEtOGDg1KyKLKlcbPBwrIswqSig9YihrPDgXLihjLCxvPCMvK", "mJrSy2jprgy", "BgfUz0nVzgu", "C3rYAw5N", "l3yWlW", "CMfUAW", "CgfYC2uY", "u291CMnLig5VDcbMB3vUzdOG", "zMLUza", "mtm5nta2rfLeuwjt", "zM9YrwfJAa", "zhvICW", "CM91Dgu", "zw5HyMXLza", "BgvUz3rO", "y29UzMLN", "BwfW"];
var ma_state = { rPXUJF: {}, XCyMsS: false, UTlsOe: null };
function ma(e, t) {
    e -= 327;
    var a = wa_array;
    var l = a[e];
    if (!ma_state.XCyMsS) {
        ma_state.UTlsOe = function (e) {
            var t = "", a = "";
            for (var lVal, nVal, cVal = 0, sVal = 0; nVal = e.charAt(sVal++); ~"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=".indexOf(nVal) && (lVal = cVal % 4 ? 64 * Number(lVal) + "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=".indexOf(nVal) : "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=".indexOf(nVal), cVal++ % 4) ? t += String.fromCharCode(255 & Number(lVal) >> (-2 * cVal & 6)) : 0);
            for (var i = 0, n = t.length; i < n; i++) a += "%" + ("00" + t.charCodeAt(i).toString(16)).slice(-2);
            return decodeURIComponent(a);
        };
        ma_state.XCyMsS = true;
    }
    var key = e + a[0];
    if (ma_state.rPXUJF[key]) return ma_state.rPXUJF[key];
    l = ma_state.UTlsOe(l);
    ma_state.rPXUJF[key] = l;
    return l;
}
(function () {
    var e = ma;
    var t = wa_array;
    try {
        var iterations = 0;
        for (; ;) {
            if (iterations++ > 1000) break;
            var checksum = -parseInt(e(336)) / 1 + -parseInt(e(351)) / 2 * (-parseInt(e(366)) / 3) + parseInt(e(330)) / 4 + parseInt(e(360)) / 5 + parseInt(e(329)) / 6 + parseInt(e(335)) / 7 * (-parseInt(e(343)) / 8) + -parseInt(e(337)) / 9;
            if (647412 === checksum) break;
            t.push(t.shift());
        }
    } catch (err) { t.push(t.shift()); }
})();

function processOutput(wasmOutput) {
    var l = wasmOutput;
    if (l.length > 2) {
        var a = l.slice(0, -2);
        l = l.slice(-2) + a.split("").reverse().join("");
        var n = l.length % 4;
        if (n === 2) l += "=="; else if (n === 3) l += "=";
    }
    var aAlt = l.replace(/-/g, "+").replace(/_/g, "/");
    var len = aAlt.length % 4;
    if (len !== 0) aAlt += "=".repeat(4 - len);
    var c = Buffer.from(aAlt, 'base64').toString('binary');
    var s = "";
    for (var r = 0; r < c.length; r++) s += String.fromCharCode(c.charCodeAt(r));
    try { return decodeURIComponent(escape(s)); } catch (e) { return s; }
}

async function createWasmInstance() {
    var possiblePaths = [
        path.join(__dirname, '../wasm/decryptor.wasm'),
        '/var/task/netlify/wasm/decryptor.wasm'
    ];
    var buffer = null;
    for (var i = 0; i < possiblePaths.length; i++) {
        try { if (fs.existsSync(possiblePaths[i])) { 
            buffer = fs.readFileSync(possiblePaths[i]); 
            break; 
        } } catch(we) {}
    }
    if (!buffer) throw new Error("WASM file not found");
    
    var wasm;
    var getMem = function() { return new Uint8Array(wasm.memory.buffer); };
    var getDV = function() { return new DataView(wasm.memory.buffer); };
    
    var imports = {
        wbg: {
            __wbg_atob_6fb33d1246c05dea: function(resPtr, ref, strPtr, strLen) {
                var str = new TextDecoder('utf-8').decode(getMem().subarray(strPtr, strPtr + strLen));
                var decoded = Buffer.from(str, 'base64');
                var outPtr = wasm.__wbindgen_malloc(decoded.length, 1) >>> 0;
                getMem().set(decoded, outPtr);
                var dv = getDV();
                dv.setInt32(resPtr + 4, decoded.length, true); dv.setInt32(resPtr + 0, outPtr, true);
            },
            __wbg_call_13410aac570ffff7: function() { },
            __wbg_instanceof_Window_12d20d558ef92592: function() { return false; },
            __wbg_log_6c7b5f4f00b8ce3f: function() { },
            __wbg_log_7917fde260a8fd39: function() { },
            __wbg_newnoargs_254190557c45b4ec: function() { return 0; },
            __wbg_static_accessor_GLOBAL_8921f820c2ce3f12: function() { return 0; },
            __wbg_static_accessor_GLOBAL_THIS_f0a4409105898184: function() { return 0; },
            __wbg_static_accessor_SELF_995b214ae681ff99: function() { return 0; },
            __wbg_static_accessor_WINDOW_cde3890479c675ea: function() { return 0; },
            __wbg_wbindgenisundefined_c4b71d073b92f3c5: function() { return true; },
            __wbg_wbindgenthrow_451ec1a8469d7eb6: function(e, t) { throw new Error("WASM Throw"); },
            __wbindgen_cast_2241b6af4c4b2941: function(e, t) { return ""; },
            __wbindgen_init_externref_table: function() { }
        }
    };
    
    var result = await WebAssembly.instantiate(buffer, imports);
    wasm = result.instance.exports;
    return result.instance;
}

function passStringToWasm0(instance, arg) {
    var malloc = instance.exports.__wbindgen_malloc;
    var buf = Buffer.from(arg, 'utf-8');
    var ptr = malloc(buf.length, 1) >>> 0;
    var mem = new Uint8Array(instance.exports.memory.buffer);
    mem.subarray(ptr, ptr + buf.length).set(buf);
    return { ptr: ptr, len: buf.length };
}

function getStringFromWasm0(instance, ptr, len) {
    var u8 = new Uint8Array(instance.exports.memory.buffer).subarray(ptr, ptr + len);
    return new TextDecoder('utf-8').decode(u8);
}

exports.handler = async function(event) {
    var corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
    if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };
    
    try {
        var body = JSON.parse(event.body);
        var text = body.text;
        
        if (!text) {
            throw new Error("Missing required param: text");
        }

        var encryptedData = text.trim();
        try { if (encryptedData.startsWith('{')) { var j = JSON.parse(encryptedData); encryptedData = j.encryptedData || j.data || encryptedData; } } catch(e) {}
        if (typeof encryptedData === 'string') encryptedData = encryptedData.replace(/^"|"$/g, '');

        var instance = await createWasmInstance();
        var key = ma(334);
        
        var p1 = passStringToWasm0(instance, encryptedData);
        var p2 = passStringToWasm0(instance, key);
        
        var result = instance.exports.parser(p1.ptr, p1.len, p2.ptr, p2.len);
        
        var mem32 = new Int32Array(instance.exports.memory.buffer);
        var outPtr = mem32[result >>> 2];
        var outLen = mem32[(result >>> 2) + 1];
        
        if (!outPtr || outLen <= 0) throw new Error("WASM Parser output error");

        var wasmOutput = getStringFromWasm0(instance, outPtr, outLen);
        var finalJson = processOutput(wasmOutput);
        
        return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 200, result: JSON.parse(finalJson) }) };
    } catch (e) {
        return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ status: 500, error: e.message }) };
    }
};
