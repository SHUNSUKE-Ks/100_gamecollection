import http from 'http';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const PORT = 3000;

// Path Setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_PROJECT_ROOT = path.resolve(__dirname, '../../');

// Allow overriding via CLI argument
const argPath = process.argv[2];
let PROJECT_ROOT = argPath ? path.resolve(argPath) : DEFAULT_PROJECT_ROOT;

let DATA_DIR = path.join(PROJECT_ROOT, 'src/data/collection');
let ASSETS_DIR = path.join(PROJECT_ROOT, 'src/assets');
let DELIVERY_DIR = path.join(PROJECT_ROOT, '_delivery');

// Helper: Parse JSON Body
const parseBody = async (req) => {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                reject(e);
            }
        });
    });
};

// Helper: CORS Headers
const setCorsConfig = (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

const server = http.createServer(async (req, res) => {
    setCorsConfig(res);
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    try {
        // --- API Endpoints ---
        try {
            const parsed = new URL(req.url, `http://${req.headers.host}`);
            const pathname = parsed.pathname;

            // ① GET /api/db?file={filename}
            if (req.method === 'GET' && pathname === '/api/db') {
                const filename = parsed.searchParams.get('file');
                console.log(`[API] GET /api/db ${filename}`);
                if (!filename) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ status: "error", message: "file parameter required" }));
                }
                const filePath = path.join(DATA_DIR, `${filename}.json`);
                try {
                    const content = await fs.readFile(filePath, 'utf-8');
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: "ok", data: JSON.parse(content) }));
                } catch (e) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: "error", message: "file not found" }));
                }
                return;
            }

            // ② POST /api/db/save
            if (req.method === 'POST' && pathname === '/api/db/save') {
                const body = await parseBody(req);
                console.log(`[API] POST /api/db/save ${body.file}`);
                if (!body.file || !body.data) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ status: "error", message: "file and data parameters required" }));
                }
                const filePath = path.join(DATA_DIR, `${body.file}.json`);
                try {
                    await fs.writeFile(filePath, JSON.stringify(body.data, null, 2), 'utf-8');
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: "ok" }));
                } catch (e) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: "error", message: e.message }));
                }
                return;
            }

            // ③ GET /api/delivery
            if (req.method === 'GET' && pathname === '/api/delivery') {
                console.log(`[API] GET /api/delivery`);
                if (!existsSync(DELIVERY_DIR)) await fs.mkdir(DELIVERY_DIR);
                const files = await fs.readdir(DELIVERY_DIR);
                const visibleFiles = files.filter(f => !f.startsWith('.'));
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: "ok", files: visibleFiles }));
                return;
            }

            // ④ GET /api/status?file={filename}
            if (req.method === 'GET' && pathname === '/api/status') {
                const filename = parsed.searchParams.get('file');
                console.log(`[API] GET /api/status ${filename}`);
                if (!filename) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ status: "error", message: "file parameter required" }));
                }

                const filePath = path.join(DATA_DIR, `${filename}.json`);
                try {
                    const content = await fs.readFile(filePath, 'utf-8');
                    const data = JSON.parse(content);

                    let allAssets = [];
                    if (filename === 'characters') {
                        (data.characters || []).forEach(c => {
                            if (c.image) allAssets.push(c.image);
                            (c.standing || []).forEach(s => allAssets.push(s));
                            (c.cgs || []).forEach(cg => allAssets.push(cg));
                        });
                    } else if (filename === 'enemies') {
                        (data.enemies || []).forEach(e => {
                            if (e.image) allAssets.push(e.image);
                        });
                    } else if (filename === 'items') {
                        (data.items || []).forEach(item => {
                            if (item.icon) allAssets.push(item.icon);
                        });
                    } else if (filename === 'npcs') {
                        (data.npcs || []).forEach(npc => {
                            if (npc.image) allAssets.push(npc.image);
                            (npc.standing || []).forEach(s => allAssets.push(s));
                        });
                    } else if (filename === 'gallery') {
                        (data.images || []).forEach(img => {
                            if (img.filename) allAssets.push(img.filename);
                        });
                    } else if (filename === 'bgm') {
                        (data.bgm || []).forEach(track => {
                            if (track.filename) allAssets.push(`sound/bgm/${track.filename}`);
                        });
                    } else if (filename === 'se') {
                        (data.se || []).forEach(sound => {
                            if (sound.filename) allAssets.push(`sound/se/${sound.filename}`);
                        });
                    } else if (filename === 'skills') {
                        (data.skills || []).forEach(sk => {
                            allAssets.push(`skill/${sk.id}.png`);
                        });
                    } else if (filename === 'events') {
                        const bgSet = new Set();
                        (data.events || []).forEach(ev => {
                            const bg = ev.relatedAssets?.background;
                            if (bg && !bgSet.has(bg)) {
                                bgSet.add(bg);
                                allAssets.push(`bg/${bg}.png`);
                            }
                        });
                    }

                    if (!existsSync(DELIVERY_DIR)) await fs.mkdir(DELIVERY_DIR);
                    const deliveryFiles = await fs.readdir(DELIVERY_DIR);

                    let checked = 0;
                    let delivered = 0;

                    await Promise.all(allAssets.map(async p => {
                        const fname = p.split('/').pop();
                        try {
                            await fs.access(path.join(ASSETS_DIR, p));
                            checked++;
                        } catch {
                            if (deliveryFiles.includes(fname)) {
                                delivered++;
                            }
                        }
                    }));

                    let total = allAssets.length;
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        total,
                        delivered,
                        checked,
                        missing: total - (delivered + checked)
                    }));
                } catch (e) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: "error", message: "file not found or parse error" }));
                }
                return;
            }
        } catch (e) {
            // Fallthrough to existing endpoints if parsing URL fails
        }
        // 0. GET /api/config - Get current configuration
        if (req.method === 'GET' && req.url === '/api/config') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                projectRoot: PROJECT_ROOT,
                dataDir: DATA_DIR,
                assetsDir: ASSETS_DIR,
                deliveryDir: DELIVERY_DIR
            }));
            return;
        }

        // 1. GET /api/files - List JSON files in src/data/collection
        if (req.method === 'GET' && req.url === '/api/files') {
            const files = await fs.readdir(DATA_DIR);
            const jsonFiles = files.filter(f => f.endsWith('.json'));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(jsonFiles));
            return;
        }

        // 2. GET /api/delivery - List files in _delivery
        if (req.method === 'GET' && req.url === '/api/delivery') {
            // Ensure delivery dir exists
            if (!existsSync(DELIVERY_DIR)) await fs.mkdir(DELIVERY_DIR);

            const files = await fs.readdir(DELIVERY_DIR);
            // Filter out system files like .DS_Store or Thumbs.db if needed
            const visibleFiles = files.filter(f => !f.startsWith('.'));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(visibleFiles));
            return;
        }

        // 3. GET /api/json/:filename - Read JSON content
        if (req.method === 'GET' && req.url.startsWith('/api/json/')) {
            const filename = req.url.split('/').pop();
            const filePath = path.join(DATA_DIR, filename);

            try {
                const content = await fs.readFile(filePath, 'utf-8');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(content);
            } catch (e) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'File not found' }));
            }
            return;
        }

        // 4. POST /api/json/:filename - Save JSON content
        if (req.method === 'POST' && req.url.startsWith('/api/json/')) {
            const filename = req.url.split('/').pop();
            const filePath = path.join(DATA_DIR, filename);
            const newData = await parseBody(req);

            // Backup before save (Optional, but good practice)
            // const backupPath = filePath + '.bak';
            // await fs.copyFile(filePath, backupPath);

            await fs.writeFile(filePath, JSON.stringify(newData, null, 2), 'utf-8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
            return;
        }

        // 5. POST /api/execute - Move/Rename Assets
        if (req.method === 'POST' && req.url === '/api/execute') {
            const { operations } = await parseBody(req);
            // operations: [{ from: 'file.png', toDir: 'chara/hero', newName: 'hero_stand.png' }, ...]

            const results = [];
            for (const op of operations) {
                try {
                    const sourcePath = path.join(DELIVERY_DIR, op.from);
                    const destDir = path.join(ASSETS_DIR, op.toDir);
                    const destPath = path.join(destDir, op.newName);

                    // Ensure dest dir exists
                    await fs.mkdir(destDir, { recursive: true });

                    // Move file (rename)
                    // Note: fs.rename fails across partitions, so use copy + unlink if rename fails? 
                    // For now assume same drive.
                    try {
                        await fs.rename(sourcePath, destPath);
                    } catch (renameErr) {
                        // Fallback: Copy and Delete
                        await fs.copyFile(sourcePath, destPath);
                        await fs.unlink(sourcePath);
                    }

                    results.push({ file: op.from, status: 'success' });
                } catch (e) {
                    console.error(e);
                    results.push({ file: op.from, status: 'error', error: e.message });
                }
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ results }));
            return;
        }


        // 6. POST /api/asset-check - Check if assets exist in src/assets/
        if (req.method === 'POST' && req.url === '/api/asset-check') {
            const { paths } = await parseBody(req);
            const exists = await Promise.all(
                (paths || []).map(async (p) => {
                    try {
                        await fs.access(path.join(ASSETS_DIR, p));
                        return true;
                    } catch {
                        return false;
                    }
                })
            );
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ exists }));
            return;
        }

        // 7. GET /dashboard - Delivery Dashboard
        if (req.method === 'GET' && req.url === '/dashboard') {
            const dashPath = path.join(__dirname, 'public', 'delivery_dashboard.html');
            try {
                const content = await fs.readFile(dashPath);
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content);
            } catch (e) {
                res.writeHead(404);
                res.end('Dashboard not found');
            }
            return;
        }

        // --- Static File Serving ---
        let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);

        // Prevent directory traversal
        if (!filePath.startsWith(path.join(__dirname, 'public'))) {
            res.writeHead(403);
            res.end('Forbidden');
            return;
        }

        // Check if file exists
        try {
            await fs.access(filePath);
            const extname = path.extname(filePath);
            let contentType = 'text/html';
            switch (extname) {
                case '.js': contentType = 'text/javascript'; break;
                case '.css': contentType = 'text/css'; break;
                case '.json': contentType = 'application/json'; break;
                case '.png': contentType = 'image/png'; break;
                case '.jpg': contentType = 'image/jpg'; break;
            }

            const content = await fs.readFile(filePath);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        } catch (e) {
            // 404 for API calls not caught above, or missing static files
            res.writeHead(404);
            res.end(`File not found: ${req.url}`);
        }

    } catch (err) {
        console.error('Server Logic Error:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
    }
});

server.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`🚀 Asset Manager Server Running!`);
    console.log(`👉 http://localhost:${PORT}`);
    console.log(`==================================================\n`);
    console.log(`Data Dir: ${DATA_DIR}`);
    console.log(`Delivery Dir: ${DELIVERY_DIR}`);
});
