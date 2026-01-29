# KalStream Decryption API

خدمة API مستقلة لفك تشفير Videasy و Hahoy - **Cloudflare Workers**

## 🚀 Deployment

### Cloudflare Pages/Workers

1. **Install Wrangler:**
```bash
npm install
```

2. **Login to Cloudflare:**
```bash
npx wrangler login
```

3. **Deploy:**
```bash
npx wrangler deploy
```

## 📡 API Endpoints

### Videasy Decryption
```
POST https://your-worker.workers.dev/api/dec-videasy
Content-Type: application/json

{
  "text": "encrypted_string",
  "id": "tmdb_id"
}
```

### Hahoy Decryption
```
POST https://your-worker.workers.dev/api/dec-hahoy
Content-Type: application/json

{
  "text": "encrypted_string"
}
```

## 📦 Response Format
```json
{
  "status": 200,
  "result": {
    "sources": [...],
    "subtitles": [...]
  }
}
```

## 🧪 Testing

Visit: `https://your-worker.workers.dev/test.html`

## 📁 Project Structure
```
├── src/
│   ├── index.js              # Main Worker entry
│   ├── videasy-decrypt.js    # Videasy decryption
│   └── hahoy-decrypt.js      # Hahoy decryption
├── public/
│   ├── index.html            # Documentation
│   └── test.html             # Testing page
├── netlify/wasm/             # WASM files (for reference)
├── wrangler.toml             # Cloudflare config
└── package.json
```

## 🔧 Local Development
```bash
npm run dev
```

## 📝 Notes
- WASM files are loaded from GitHub raw URLs
- No server-side file system access needed
- Fully serverless on Cloudflare's edge network
