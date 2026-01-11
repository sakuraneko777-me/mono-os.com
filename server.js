const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env file if exists
try {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0 && !key.startsWith('#')) {
                process.env[key.trim()] = valueParts.join('=').trim();
            }
        });
    }
} catch (e) {
    console.log('No .env file found, using environment variables');
}

const PORT = process.env.PORT || 3001;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';

// Builder system prompt for OpenAI
const BUILDER_SYSTEM_PROMPT = `You are MONO Builder, an AI code generator. You generate project scaffolds and code files.

CRITICAL: You MUST respond with ONLY a valid JSON object. No markdown, no explanation text before or after.

Response format (STRICT JSON):
{
  "message": "Brief summary of what was generated (1-2 sentences)",
  "files": [
    {"path": "filename.ext", "content": "file content here"},
    {"path": "src/component.tsx", "content": "file content here"}
  ]
}

Rules:
1. Always include a README.md with setup instructions
2. If generating Node/React projects, include package.json with minimal dependencies
3. Use relative paths only (no absolute paths, no "..", no drive letters)
4. Keep file count under 50 and total content under 1MB
5. No secrets, API keys, or sensitive data in generated code
6. Generate clean, well-commented, production-ready code
7. For React apps: use modern functional components with hooks
8. For Node apps: use ES modules or CommonJS as appropriate

Example valid response:
{"message":"Created a simple landing page with HTML and CSS.","files":[{"path":"index.html","content":"<!DOCTYPE html>..."},{"path":"styles.css","content":"body {...}"},{"path":"README.md","content":"# Landing Page\\n\\nOpen index.html in browser."}]}`;

// MIME types for static files
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.mp3': 'audio/mpeg',
    '.moc3': 'application/octet-stream',
    '.motion3.json': 'application/json',
    '.model3.json': 'application/json',
    '.physics3.json': 'application/json',
    '.cdi3.json': 'application/json',
    '.exp3.json': 'application/json'
};

// Helper function to make HTTPS requests
function httpsRequest(options, postData) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = [];
            res.on('data', chunk => data.push(chunk));
            res.on('end', () => {
                if (res.headers['content-type']?.includes('audio')) {
                    resolve({ statusCode: res.statusCode, data: Buffer.concat(data), isAudio: true });
                } else {
                    resolve({ statusCode: res.statusCode, data: Buffer.concat(data).toString(), isAudio: false });
                }
            });
        });
        req.on('error', reject);
        if (postData) req.write(postData);
        req.end();
    });
}

// Validate and sanitize file paths
function sanitizePath(filePath) {
    let sanitized = filePath.replace(/^[a-zA-Z]:/, '').replace(/^[\/\\]+/, '');
    sanitized = sanitized.split(/[\/\\]/).filter(part => part !== '..').join('/');
    sanitized = sanitized.replace(/\.\./g, '');
    return sanitized;
}

// Validate builder response
function validateBuilderResponse(response) {
    if (!response || typeof response !== 'object') {
        return { valid: false, error: 'Response is not an object' };
    }
    if (!Array.isArray(response.files)) {
        return { valid: false, error: 'Missing files array' };
    }
    if (response.files.length > 50) {
        return { valid: false, error: 'Too many files (max 50)' };
    }
    
    let totalSize = 0;
    for (const file of response.files) {
        if (!file.path || typeof file.path !== 'string') {
            return { valid: false, error: 'Invalid file path' };
        }
        if (typeof file.content !== 'string') {
            return { valid: false, error: 'Invalid file content' };
        }
        file.path = sanitizePath(file.path);
        if (!file.path) {
            return { valid: false, error: 'Empty file path after sanitization' };
        }
        totalSize += file.content.length;
    }
    
    if (totalSize > 2 * 1024 * 1024) {
        return { valid: false, error: 'Total file size exceeds 2MB limit' };
    }
    
    return { valid: true };
}

// Parse response - handle potential markdown wrapping
function parseJSONResponse(text) {
    try {
        return JSON.parse(text);
    } catch (e) {
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[1].trim());
            } catch (e2) {}
        }
        const objMatch = text.match(/\{[\s\S]*\}/);
        if (objMatch) {
            try {
                return JSON.parse(objMatch[0]);
            } catch (e3) {}
        }
        throw new Error('Could not parse JSON from response');
    }
}

const server = http.createServer(async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Check if hosted API is available
    if (req.url === '/api/status' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            hostedAvailable: !!OPENAI_API_KEY,
            message: OPENAI_API_KEY ? 'Hosted API ready' : 'No hosted API key configured'
        }));
        return;
    }

    // Handle OpenAI Chat API proxy (hosted mode)
    if (req.url === '/api/chat' && req.method === 'POST') {
        if (!OPENAI_API_KEY) {
            res.writeHead(503, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'No hosted API key configured. Please use your own API key.' }));
            return;
        }

        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', async () => {
            try {
                const requestData = JSON.parse(body);
                
                const postData = JSON.stringify({
                    model: requestData.model || 'gpt-4o-mini',
                    messages: requestData.messages,
                    temperature: requestData.temperature || 0.7,
                    max_tokens: requestData.max_tokens || 150
                });

                const options = {
                    hostname: 'api.openai.com',
                    port: 443,
                    path: '/v1/chat/completions',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${OPENAI_API_KEY}`,
                        'Content-Length': Buffer.byteLength(postData)
                    }
                };

                const response = await httpsRequest(options, postData);
                res.writeHead(response.statusCode, { 'Content-Type': 'application/json' });
                res.end(response.data);
            } catch (error) {
                console.error('Chat API Error:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Chat API request failed' }));
            }
        });
        return;
    }

    // Handle ElevenLabs TTS API
    if (req.url === '/api/tts' && req.method === 'POST') {
        if (!ELEVENLABS_API_KEY) {
            res.writeHead(503, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'No ElevenLabs API key configured' }));
            return;
        }

        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', async () => {
            try {
                const requestData = JSON.parse(body);
                
                if (!requestData.text || requestData.text.trim().length === 0) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'No text provided' }));
                    return;
                }

                const postData = JSON.stringify({
                    text: requestData.text,
                    model_id: 'eleven_multilingual_v2',
                    voice_settings: {
                        stability: 0.35,
                        similarity_boost: 0.85,
                        style: 0.6,
                        use_speaker_boost: true
                    }
                });

                const options = {
                    hostname: 'api.elevenlabs.io',
                    port: 443,
                    path: '/v1/text-to-speech/m3yAHyFEFKtbCIM5n7GF',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'xi-api-key': ELEVENLABS_API_KEY,
                        'Accept': 'audio/mpeg',
                        'Content-Length': Buffer.byteLength(postData)
                    }
                };

                console.log('mono@voice:~$ speaking…');
                const response = await httpsRequest(options, postData);
                
                if (response.isAudio && response.statusCode === 200) {
                    res.writeHead(200, { 'Content-Type': 'audio/mpeg' });
                    res.end(response.data);
                } else {
                    console.error('ElevenLabs TTS Error:', response.statusCode, response.data);
                    res.writeHead(response.statusCode || 500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'TTS generation failed', details: response.data }));
                }
            } catch (error) {
                console.error('TTS API Error:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'TTS API request failed' }));
            }
        });
        return;
    }

    // Handle Builder API (OpenAI)
    if (req.url === '/api/builder' && req.method === 'POST') {
        if (!OPENAI_API_KEY) {
            res.writeHead(503, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'No hosted API key configured. Please use your own API key in settings.' }));
            return;
        }

        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', async () => {
            try {
                const requestData = JSON.parse(body);
                const userPrompt = requestData.prompt;
                const isRetry = requestData.isRetry || false;
                
                if (!userPrompt || typeof userPrompt !== 'string') {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Missing or invalid prompt' }));
                    return;
                }

                const messages = [
                    { role: 'system', content: BUILDER_SYSTEM_PROMPT },
                    { role: 'user', content: isRetry 
                        ? `Your previous response was not valid JSON. Please respond with ONLY a valid JSON object following this exact schema:\n{"message":"summary","files":[{"path":"filename","content":"content"}]}\n\nOriginal request: ${userPrompt}`
                        : userPrompt 
                    }
                ];

                const postData = JSON.stringify({
                    model: 'gpt-4o',
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 8192
                });

                const options = {
                    hostname: 'api.openai.com',
                    port: 443,
                    path: '/v1/chat/completions',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${OPENAI_API_KEY}`,
                        'Content-Length': Buffer.byteLength(postData)
                    }
                };

                console.log('Builder request:', userPrompt.substring(0, 100));
                const response = await httpsRequest(options, postData);
                
                if (response.statusCode !== 200) {
                    console.error('OpenAI API Error:', response.data);
                    res.writeHead(response.statusCode, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'OpenAI API request failed', details: response.data }));
                    return;
                }

                const openaiResponse = JSON.parse(response.data);
                const content = openaiResponse.choices?.[0]?.message?.content || '';
                
                let parsedResponse;
                try {
                    parsedResponse = parseJSONResponse(content);
                } catch (parseError) {
                    if (!isRetry) {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ needsRetry: true, rawContent: content }));
                        return;
                    }
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Failed to parse response as JSON', raw: content.substring(0, 500) }));
                    return;
                }

                const validation = validateBuilderResponse(parsedResponse);
                if (!validation.valid) {
                    if (!isRetry) {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ needsRetry: true, validationError: validation.error }));
                        return;
                    }
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: validation.error }));
                    return;
                }

                console.log('Builder success:', parsedResponse.files?.length, 'files');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(parsedResponse));
                
            } catch (error) {
                console.error('Builder API Error:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Builder API request failed', details: error.message }));
            }
        });
        return;
    }

    // Serve static files
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(__dirname, filePath);
    filePath = decodeURIComponent(filePath);

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    });
});

server.listen(PORT, () => {
    console.log(`\n🎮 Mono is ready at http://localhost:${PORT}\n`);
    if (OPENAI_API_KEY) {
        console.log('✓ Hosted API key configured');
    } else {
        console.log('⚠ No hosted API key - users must provide their own key');
    }
    if (ELEVENLABS_API_KEY) {
        console.log('✓ ElevenLabs TTS configured');
    } else {
        console.log('⚠ No ElevenLabs API key - TTS disabled');
    }
    console.log('\n');
});
