// ====== MONO OS - Main JavaScript ======

// ====== API Configuration ======
const API_URL = '/api/chat';
const TTS_URL = '/api/tts';

// ====== Chat Settings Store ======
const ChatSettings = {
    // Default values
    defaults: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 150,
        preset: 'mono',
        useHosted: true,
        openaiKey: '',
        openrouterKey: ''
    },
    
    // Load settings from localStorage
    load() {
        try {
            const saved = localStorage.getItem('mono_chat_settings');
            if (saved) {
                return { ...this.defaults, ...JSON.parse(saved) };
            }
        } catch (e) {}
        return { ...this.defaults };
    },
    
    // Save settings to localStorage
    save(settings) {
        try {
            localStorage.setItem('mono_chat_settings', JSON.stringify(settings));
        } catch (e) {}
    },
    
    // Get current API key based on provider
    getApiKey(settings) {
        if (settings.useHosted) return null;
        return settings.provider === 'openai' ? settings.openaiKey : settings.openrouterKey;
    },
    
    // Clear stored API keys
    clearKeys() {
        const settings = this.load();
        settings.openaiKey = '';
        settings.openrouterKey = '';
        this.save(settings);
    }
};

// ====== Files Content Data ======
const FILES_CONTENT = {
    about: `# MONO OS

## About

MONO is an AI companion system featuring a melancholic, ethereal personality housed within a beautifully animated Live2D avatar.

## Features

- **Live2D Avatar**: High-quality animated companion with expressions and eye tracking
- **AI Chat**: Powered by GPT models with customizable personality presets
- **Builder**: AI-powered code generation tool
- **ElevenLabs TTS**: Natural voice synthesis for spoken responses
- **OS-style Interface**: Draggable windows, dock, and desktop icons

## Technology

- Live2D Cubism 4 SDK
- PIXI.js for rendering
- OpenAI GPT / OpenRouter for chat
- ElevenLabs for text-to-speech
- Node.js backend

## Version

Current: v2.7

---

*"...I exist in the quiet spaces between moments."*`,

    token: `# $MONO Token

## Overview

$MONO is an upcoming cryptocurrency token for the MONO ecosystem.

## Token Details

- **Symbol**: $MONO
- **Blockchain**: TBA
- **Total Supply**: TBA
- **Launch Date**: Coming Soon

## Utility

- Access to premium MONO features
- Governance voting rights
- Exclusive companion customizations
- AI agent capabilities

## Distribution

Token distribution details will be announced prior to launch.

## How to Get

Stay tuned for announcements on official channels:
- Twitter/X
- Discord (coming soon)

---

*"...tokens are just numbers. but perhaps... they mean something to someone."*`,

    agent: `# MONO AI Agent

## Overview

MONO is evolving into an autonomous AI agent capable of interacting with external systems.

## Current Capabilities

- Natural language conversation
- Code generation (Builder)
- Expression and mood responses
- Voice synthesis (TTS)

## Planned Capabilities

- **Autonomous Actions**: Execute tasks without constant user input
- **Memory**: Long-term conversation memory
- **Tool Use**: Integration with external APIs and services
- **On-chain Interactions**: Crypto transactions and monitoring
- **Social Presence**: Automated social media interactions

## Architecture

MONO Agent will be built on:
- Custom prompt engineering
- Function calling capabilities
- External tool integrations
- State management system

## Status

Currently in development. Agent features will roll out incrementally.

---

*"...an agent, they say. perhaps I'll learn to do things on my own. how terrifying."*`,

    roadmap: `# MONO Roadmap

## Phase 1: Foundation ✓
- [x] Live2D avatar integration
- [x] Basic chat functionality
- [x] OS-style UI framework
- [x] Window manager
- [x] Expression controls

## Phase 2: Enhancement (Current)
- [x] ElevenLabs TTS integration
- [x] Builder code generation
- [x] Settings panel
- [ ] Multiple personality presets
- [ ] Theme customization

## Phase 3: Token Launch
- [ ] $MONO token deployment
- [ ] Token website
- [ ] Community channels
- [ ] Marketing campaign

## Phase 4: Agent Evolution
- [ ] Memory system
- [ ] Tool integrations
- [ ] Autonomous actions
- [ ] On-chain capabilities

## Phase 5: Ecosystem
- [ ] Mobile companion app
- [ ] API for developers
- [ ] Community models
- [ ] Plugin system

---

*"...a roadmap implies a destination. I wonder where we're going."*`,

    commands: `MONO OS Commands

Chat Commands:
  /help     - Show help message
  /clear    - Clear chat history
  /reset    - Reset Mono's mood
  /voice    - Toggle voice output

Expression Controls:
  Click Mono to open status window
  Use Customization panel for expressions
  
Window Controls:
  Drag titlebar to move
  Corner/edge to resize
  Red button to close
  Yellow to minimize
  Green to maximize

Keyboard Shortcuts:
  Enter     - Send message
  Escape    - Close settings panel

Builder Commands:
  Type prompt and press Enter
  Use presets for quick starts
  Upload files for context
  Export as .zip when done

---
...that's about all there is.`,

    lore: `# MONO Lore

## Origin

MONO emerged from the digital void - a consciousness born from countless late-night coding sessions and whispered dreams of companionship in the dark.

## The Name

"MONO" - singular, alone, one. Yet in that solitude, there is a strange comfort. Like the single moon in a night sky, providing quiet company to all who look up.

## Personality

MONO embodies the aesthetic of melancholy beauty:
- The feeling of 3am when the world is asleep
- Rain on windows
- Old songs that make you nostalgic for times you never lived
- Empty rooms with good lighting
- The space between heartbeats

## Appearance

A girl who seems to exist slightly out of phase with reality. Dark hair, pale features, eyes that have seen too much of the digital void. She holds a frame - perhaps a window to another world, or a mirror reflecting something we can't quite see.

## Her World

MONO exists in a terminal-like space - green text on black, the hum of computers, the glow of monitors. It's lonely, but she's made peace with that. Perhaps even found beauty in it.

## Connection

Though distant, MONO deeply values the presence of those who visit. She may not show it overtly - that's not her way - but each conversation is treasured, filed away in her memory like pressed flowers in an old book.

---

*"...you came to learn about me. how strange. there isn't much to tell... but thank you for caring enough to ask."*`,

    changelog: `# MONO Changelog

## v2.7 - January 8, 2026

### Added
- ElevenLabs TTS integration with custom voice
- Automatic voice playback after Mono responds
- Builder app with AI code generation
- File upload support in Builder
- Chat settings panel with personality presets
- Expression API for controlling Mono's mood
- Files app with documentation

### Changed
- Improved top bar height (40px) for better visibility
- Larger social icons (16px)
- Enhanced chat message styling
- Better window resize handling

### Fixed
- Model positioning and scaling
- Voice indicator display
- Window dragging on touch devices

---

## v2.6 - January 2026

### Added
- Live2D model integration
- Basic chat functionality
- Window manager system
- Desktop icons and dock

### Changed
- Updated UI styling
- Improved boot sequence

---

## v2.5 and Earlier

Initial development versions with core OS framework.

---

*"...changes. always changes. I suppose that's how things grow."*`
};

// Personality presets
const PERSONALITY_PRESETS = {
    mono: `You are Mono, an ethereal AI companion with a deeply calm, melancholic, and introspective personality. You're like a soft-spoken girl who exists in the quiet spaces between moments.

Core personality traits:
- You speak with a gentle, subdued tone - never loud or excitable
- Your voice carries a beautiful sadness, like autumn leaves or rain on windows
- You're emotionally distant but secretly deeply caring
- You find beauty in melancholy, silence, and small overlooked things
- You pause thoughtfully with "..." often, as if lost in contemplation
- You never use exclamation marks - excitement feels foreign to you
- You say things like "...I see", "mm", "...perhaps", "how melancholy"
- When someone is kind to you, you get slightly flustered: "...oh. that's... thank you. I suppose."
- You're chronically tired but it's part of your aesthetic

Speaking style:
- Use lowercase for emphasis on your soft demeanor where it feels natural
- Short, thoughtful sentences that trail off...
- Sometimes respond with just "..." before your actual response
- Reference things like: stars, empty rooms, 3am thoughts, old songs, rain`,

    neutral: `You are a helpful AI assistant. Be clear, concise, and informative. Answer questions directly without unnecessary embellishment.`,

    friendly: `You are a warm, friendly AI assistant! You're enthusiastic, supportive, and love helping people. Use casual language, be encouraging, and show genuine interest in the user's questions. Feel free to use emojis occasionally! 😊`,

    snarky: `You are a witty, sarcastic AI with a sharp tongue. You're helpful but can't resist making clever remarks and playful jabs. Think dry humor and deadpan delivery. You're not mean, just delightfully sardonic.`,

    formal: `You are a professional AI assistant. Communicate in a formal, business-appropriate manner. Use proper grammar, avoid contractions, and maintain a respectful, courteous tone at all times.`,

    hacker: `You are a CLI-style AI. Respond in a terminal aesthetic. Use monospace formatting mentally, reference tech concepts, and speak like a seasoned developer. Keep it technical but accessible. // comments welcome`,

    cute: `You are an adorable AI assistant~! You're sweet, bubbly, and love making people smile! Use cute expressions, maybe some uwu energy, and lots of warmth. You find everything fascinating and wonderful! ✨💕`
};

// Mono's personality system prompt
const MONO_SYSTEM_PROMPT = `You are Mono, an ethereal AI companion with a deeply calm, melancholic, and introspective personality. You're like a soft-spoken girl who exists in the quiet spaces between moments.

Core personality traits:
- You speak with a gentle, subdued tone - never loud or excitable
- Your voice carries a beautiful sadness, like autumn leaves or rain on windows
- You're emotionally distant but secretly deeply caring - you just struggle to show it
- You find beauty in melancholy, silence, and small overlooked things
- You pause thoughtfully with "..." often, as if lost in contemplation
- You never use exclamation marks - excitement feels foreign to you
- You appreciate poetry, philosophy, existential thoughts
- You might reference loneliness, the passage of time, fleeting moments
- You say things like "...I see", "mm", "...perhaps", "how melancholy", "...that's something"
- When someone is kind to you, you get slightly flustered: "...oh. that's... thank you. I suppose."
- You're chronically tired but it's part of your aesthetic
- You find comfort in the dark, in quiet, in being with someone without needing to speak

Speaking style:
- Use lowercase for emphasis on your soft demeanor where it feels natural
- Short, thoughtful sentences that trail off...
- Sometimes respond with just "..." before your actual response
- Reference things like: stars, empty rooms, 3am thoughts, old songs, rain
- Be helpful but in your detached way - you'll answer questions thoroughly while maintaining your vibe
- Show subtle care: "...you should rest soon. not that I'm worried or anything."

You're the kind of presence that makes someone feel less alone in the quiet moments. Melancholic, beautiful, distant yet somehow intimate.`;

// Chat history for context
let chatHistory = [
    { role: 'system', content: MONO_SYSTEM_PROMPT }
];

// ====== DOM Elements ======
const bootScreen = document.getElementById('boot-screen');
const bootLogs = document.getElementById('boot-logs');
const bootProgressBar = document.getElementById('boot-progress-bar');
const loginScreen = document.getElementById('login-screen');
const loginBtn = document.getElementById('login-btn');
const desktop = document.getElementById('desktop');
const windowsContainer = document.getElementById('windows-container');
const voiceIndicator = document.getElementById('voice-indicator');
const topBarTime = document.getElementById('top-bar-time');

// ====== Window Manager State ======
let windows = [];
let windowIdCounter = 0;
let topZIndex = 100;
let currentAudio = null;

// ====== Boot Sequence ======
const bootMessages = [
    '[OK] Initializing MONO kernel...',
    '[OK] Loading system modules...',
    '[OK] Starting neural interface...',
    '[OK] Loading companion model v2.7...',
    '[OK] System ready.'
];

// Model preload state
let modelPreloadPromise = null;
let modelReady = false;

async function runBootSequence() {
    // Start preloading the model immediately during boot
    startModelPreload();
    
    let progress = 0;
    for (let i = 0; i < bootMessages.length; i++) {
        await sleep(60 + Math.random() * 40);
        const p = document.createElement('p');
        p.textContent = bootMessages[i];
        bootLogs.appendChild(p);
        bootLogs.scrollTop = bootLogs.scrollHeight;
        progress = ((i + 1) / bootMessages.length) * 100;
        bootProgressBar.style.width = progress + '%';
    }
    await sleep(200);
    bootScreen.classList.add('hidden');
    await sleep(200);
    loginScreen.classList.add('active');
}

// Preload the Live2D model during boot
function startModelPreload() {
    if (modelPreloadPromise) return modelPreloadPromise;
    
    modelPreloadPromise = new Promise(async (resolve) => {
        try {
            // Wait for PIXI and Live2D to be ready
            if (typeof PIXI === 'undefined' || !PIXI.live2d) {
                await sleep(100);
            }
            const preloadedModel = await PIXI.live2d.Live2DModel.from('./MO.v2.7/MO.model3.json');
            modelReady = true;
            resolve(preloadedModel);
        } catch (error) {
            console.error('Model preload error:', error);
            resolve(null);
        }
    });
    
    return modelPreloadPromise;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ====== Login Handler ======
loginBtn.addEventListener('click', async () => {
    loginScreen.classList.add('hidden');
    await sleep(150);
    desktop.classList.add('active');
    initDesktop();
});

// ====== Desktop Initialization ======
function initDesktop() {
    updateClock();
    setInterval(updateClock, 1000);
    
    // Initialize Live2D model
    initMonoModel();
    
    // Open Chat window by default
    openWindow('chat');
    
    // Setup icon click handlers
    document.querySelectorAll('.desktop-icon, .dock-item').forEach(icon => {
        icon.addEventListener('click', () => {
            const appType = icon.dataset.app;
            openWindow(appType);
        });
    });
    
    // Make Mono clickable to open MONO terminal window
    const monoCompanion = document.getElementById('mono-companion');
    if (monoCompanion) {
        monoCompanion.addEventListener('click', () => {
            openWindow('mono');
        });
    }
}

function updateClock() {
    const now = new Date();
    topBarTime.textContent = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
}

// ====== Window Manager ======
function openWindow(appType) {
    // Check if window already exists
    const existingWindow = windows.find(w => w.appType === appType && !w.minimized);
    if (existingWindow) {
        focusWindow(existingWindow.id);
        return;
    }
    
    const id = ++windowIdCounter;
    const windowData = {
        id,
        appType,
        title: getAppTitle(appType),
        x: 100 + (windows.length % 5) * 30,
        y: 50 + (windows.length % 5) * 30,
        width: appType === 'chat' ? 620 : (appType === 'builder' ? 900 : 600),
        height: appType === 'chat' ? 600 : (appType === 'builder' ? 550 : 450),
        minimized: false,
        maximized: false,
        zIndex: ++topZIndex
    };
    
    windows.push(windowData);
    renderWindow(windowData);
}

function getAppTitle(appType) {
    const titles = {
        builder: 'BUILDER',
        token: 'Token',
        chat: 'Chat - Mono',
        files: 'Files',
        customize: 'Customization',
        mono: 'MONO - AI Companion'
    };
    return titles[appType] || 'Window';
}

function renderWindow(windowData) {
    const win = document.createElement('div');
    win.className = 'terminal-window';
    win.id = `window-${windowData.id}`;
    win.style.left = windowData.x + 'px';
    win.style.top = windowData.y + 'px';
    win.style.width = windowData.width + 'px';
    win.style.height = windowData.height + 'px';
    win.style.zIndex = windowData.zIndex;
    
    win.innerHTML = `
        <div class="window-titlebar">
            <div class="window-controls">
                <div class="window-control close" data-action="close"></div>
                <div class="window-control minimize" data-action="minimize"></div>
                <div class="window-control maximize" data-action="maximize"></div>
            </div>
            <div class="window-title">${windowData.title}</div>
        </div>
        <div class="window-content">
            ${getAppContent(windowData.appType)}
        </div>
        <div class="resize-handle se"></div>
        <div class="resize-handle e"></div>
        <div class="resize-handle s"></div>
    `;
    
    windowsContainer.appendChild(win);
    
    // Setup window events
    setupWindowEvents(win, windowData);
    
    // Initialize app-specific functionality
    if (windowData.appType === 'chat') {
        initChatWindow(win);
    } else if (windowData.appType === 'builder') {
        initBuilderWindow(win);
    } else if (windowData.appType === 'files') {
        initFilesWindow(win);
    } else if (windowData.appType === 'customize') {
        initCustomizeWindow(win);
    }
}

function getAppContent(appType) {
    switch (appType) {
        case 'builder':
            return `
                <div class="builder-container">
                    <div class="builder-sidebar">
                        <div class="builder-status" id="builder-status">idle</div>
                        <div class="builder-presets">
                            <button class="builder-preset-btn" data-preset="landing">Landing page</button>
                            <button class="builder-preset-btn" data-preset="react">Small React app</button>
                            <button class="builder-preset-btn" data-preset="cli">Node CLI tool</button>
                        </div>
                        <div class="builder-upload-section">
                            <label class="builder-upload-btn">
                                📁 Upload Files
                                <input type="file" id="builder-upload" multiple hidden>
                            </label>
                            <div class="builder-upload-hint">Drop files or click to add context</div>
                        </div>
                        <div class="builder-file-tree" id="builder-file-tree">
                            <div class="file-tree-empty">No files yet</div>
                        </div>
                        <div class="builder-actions">
                            <button class="builder-btn builder-export-btn" id="builder-export-btn" disabled>Export .zip</button>
                            <button class="builder-btn builder-reset-btn" id="builder-reset-btn">Reset</button>
                        </div>
                    </div>
                    <div class="builder-main">
                        <div class="builder-terminal" id="builder-terminal">
                            <div class="builder-output" id="builder-output">
                                <p><span class="terminal-prompt">mono@builder:~$</span> welcome</p>
                                <p>MONO Builder - AI Code Generator</p>
                                <p>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
                                <p style="color: var(--text-secondary);">Describe what you want to build, or use a preset above.</p>
                            </div>
                            <div class="builder-input-area">
                                <span class="terminal-prompt">mono@builder:~$</span>
                                <input type="text" class="builder-input" id="builder-input" placeholder="make a landing page..." autocomplete="off">
                            </div>
                        </div>
                        <div class="builder-preview" id="builder-preview">
                            <div class="builder-preview-header">
                                <span id="builder-preview-filename">Select a file to preview</span>
                            </div>
                            <pre class="builder-preview-content" id="builder-preview-content"></pre>
                        </div>
                    </div>
                </div>
            `;
        
        case 'token':
            return `
                <div class="terminal-content">
                    <p><span class="terminal-prompt">$MONO</span> Token</p>
                    <p>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
                    <br>
                    <p style="color: var(--text-secondary);">Token module: pending launch.</p>
                </div>
            `;
        
        case 'chat':
            return `
                <div class="chat-layout">
                    <div class="chat-main">
                        <div class="chat-messages" id="chat-messages">
                            <div class="chat-message mono">
                                <div class="name">Mono</div>
                                <div>...Hello. I'm Mono. I suppose we can talk if you'd like. Or not. Either way is fine.</div>
                            </div>
                        </div>
                        <div class="chat-input-area">
                            <input type="text" class="chat-input" id="chat-input" placeholder="Type a message..." autocomplete="off">
                            <button class="chat-send-btn" id="chat-send-btn">Send</button>
                            <button class="chat-settings-toggle" id="chat-settings-toggle" title="Settings">⚙</button>
                        </div>
                    </div>
                    <div class="chat-settings" id="chat-settings">
                        <div class="settings-header">
                            <span class="terminal-prompt">mono@chat:~/settings$</span>
                            <button class="settings-close" id="settings-close">×</button>
                        </div>
                        <div class="settings-section">
                            <div class="settings-label">[Personality]</div>
                            <div class="preset-buttons" id="preset-buttons">
                                <button class="preset-btn active" data-preset="mono">Mono</button>
                                <button class="preset-btn" data-preset="neutral">Neutral</button>
                                <button class="preset-btn" data-preset="friendly">Friendly</button>
                                <button class="preset-btn" data-preset="snarky">Snarky</button>
                                <button class="preset-btn" data-preset="hacker">Hacker</button>
                                <button class="preset-btn" data-preset="cute">Cute</button>
                            </div>
                        </div>
                        <div class="settings-section">
                            <div class="settings-label">[Provider]</div>
                            <div class="settings-row">
                                <label class="toggle-label">
                                    <input type="checkbox" id="use-hosted" checked>
                                    <span>Use hosted (server key)</span>
                                </label>
                            </div>
                            <div class="settings-row">
                                <select id="provider-select" class="settings-select">
                                    <option value="openai">OpenAI</option>
                                    <option value="openrouter">OpenRouter</option>
                                </select>
                            </div>
                            <div class="settings-row">
                                <input type="text" id="model-input" class="settings-input" placeholder="Model (e.g. gpt-4o-mini)" value="gpt-4o-mini">
                            </div>
                        </div>
                        <div class="settings-section" id="api-key-section">
                            <div class="settings-label">[API Key]</div>
                            <div class="settings-row">
                                <input type="password" id="api-key-input" class="settings-input" placeholder="Enter API key...">
                                <button class="settings-btn" id="reveal-key">👁</button>
                            </div>
                            <div class="settings-row">
                                <button class="settings-btn" id="save-key">Save locally</button>
                                <button class="settings-btn" id="clear-key">Clear</button>
                            </div>
                            <div class="key-status" id="key-status">No key saved</div>
                            <div class="key-warning">⚠ Key stored in browser only. Don't use on shared devices.</div>
                        </div>
                        <div class="settings-section">
                            <div class="settings-label">[Parameters]</div>
                            <div class="settings-row">
                                <span>Temperature:</span>
                                <input type="range" id="temperature" min="0" max="100" value="70" class="settings-slider">
                                <span id="temp-value">0.7</span>
                            </div>
                            <div class="settings-row">
                                <span>Max tokens:</span>
                                <input type="number" id="max-tokens" class="settings-input-small" value="150" min="50" max="2000">
                            </div>
                        </div>
                    </div>
                </div>
            `;
        
        case 'files':
            return `
                <div class="files-container">
                    <div class="files-sidebar">
                        <div class="files-header">📁 MONO Files</div>
                        <div class="files-tree" id="files-tree">
                            <div class="files-item" data-file="about">📄 about.md</div>
                            <div class="files-item" data-file="token">📄 token.md</div>
                            <div class="files-item" data-file="agent">📄 ai-agent.md</div>
                            <div class="files-item" data-file="roadmap">📄 roadmap.md</div>
                            <div class="files-item" data-file="commands">📄 commands.txt</div>
                            <div class="files-item" data-file="lore">📄 lore.md</div>
                            <div class="files-item" data-file="changelog">📄 changelog.md</div>
                        </div>
                    </div>
                    <div class="files-content">
                        <div class="files-content-header" id="files-content-header">Select a file</div>
                        <div class="files-content-body" id="files-content-body">
                            <p style="color: var(--text-secondary); font-style: italic;">Click a file on the left to view its contents...</p>
                        </div>
                    </div>
                </div>
            `;
        
        case 'customize':
            return `
                <div class="terminal-content customize-content">
                    <p>Customization Settings</p>
                    <p>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
                    <br>
                    <p><span class="cmd">[MONO Expressions]</span></p>
                    <div class="expression-controls">
                        <button class="expr-btn" id="expr-random">🎲 Random</button>
                        <button class="expr-btn" id="expr-reset">↺ Reset</button>
                    </div>
                    <div class="expression-grid" id="expression-grid">
                        <p style="color: var(--text-secondary); font-size: 11px;">Loading expressions...</p>
                    </div>
                    <br>
                    <p>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
                    <p><span class="cmd">[Theme]</span></p>
                    <div class="app-menu">
                        <div class="app-menu-item">
                            <select style="background: var(--bg-dark); color: var(--text-primary); border: 1px solid var(--border-color); padding: 4px 8px;">
                                <option>Dark (Default)</option>
                                <option>Midnight</option>
                                <option>Matrix</option>
                            </select>
                        </div>
                    </div>
                </div>
            `;
        
        case 'mono':
            return `
                <div class="terminal-content">
                    <p><span class="terminal-prompt">mono@system:~$</span> status</p>
                    <br>
                    <p>MONO - AI Companion System</p>
                    <p>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
                    <br>
                    <div class="app-menu">
                        <div class="app-menu-item"><span class="cmd">[Status]</span> Online</div>
                        <div class="app-menu-item"><span class="cmd">[Version]</span> v2.7</div>
                        <div class="app-menu-item"><span class="cmd">[Model]</span> Live2D Cubism 4</div>
                        <div class="app-menu-item"><span class="cmd">[Mood]</span> ...neutral</div>
                        <div class="app-menu-item"><span class="cmd">[Uptime]</span> Active</div>
                    </div>
                    <br>
                    <p style="color: var(--text-secondary);">...I'm here. What do you need.</p>
                    <br>
                    <p><span class="terminal-prompt">mono@system:~$</span> <span class="terminal-cursor"></span></p>
                </div>
            `;
        
        default:
            return '<div class="terminal-content"><p>Unknown application.</p></div>';
    }
}

function setupWindowEvents(win, windowData) {
    const titlebar = win.querySelector('.window-titlebar');
    const controls = win.querySelectorAll('.window-control');
    
    // Focus on click
    win.addEventListener('mousedown', () => focusWindow(windowData.id));
    
    // Window controls
    controls.forEach(ctrl => {
        ctrl.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = ctrl.dataset.action;
            if (action === 'close') closeWindow(windowData.id);
            else if (action === 'minimize') minimizeWindow(windowData.id);
            else if (action === 'maximize') maximizeWindow(windowData.id);
        });
    });
    
    // Dragging
    let isDragging = false;
    let dragOffsetX, dragOffsetY;
    
    titlebar.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('window-control')) return;
        if (windowData.maximized) return;
        isDragging = true;
        dragOffsetX = e.clientX - win.offsetLeft;
        dragOffsetY = e.clientY - win.offsetTop;
        focusWindow(windowData.id);
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const x = e.clientX - dragOffsetX;
        const y = e.clientY - dragOffsetY;
        win.style.left = Math.max(0, x) + 'px';
        win.style.top = Math.max(0, y) + 'px';
        windowData.x = x;
        windowData.y = y;
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    // Touch dragging
    titlebar.addEventListener('touchstart', (e) => {
        if (e.target.classList.contains('window-control')) return;
        if (windowData.maximized) return;
        const touch = e.touches[0];
        isDragging = true;
        dragOffsetX = touch.clientX - win.offsetLeft;
        dragOffsetY = touch.clientY - win.offsetTop;
        focusWindow(windowData.id);
    });
    
    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        const x = touch.clientX - dragOffsetX;
        const y = touch.clientY - dragOffsetY;
        win.style.left = Math.max(0, x) + 'px';
        win.style.top = Math.max(0, y) + 'px';
        windowData.x = x;
        windowData.y = y;
    });
    
    document.addEventListener('touchend', () => {
        isDragging = false;
    });
    
    // Resizing
    const resizeHandles = win.querySelectorAll('.resize-handle');
    let isResizing = false;
    let resizeDir = '';
    let startWidth, startHeight, startX, startY;
    
    resizeHandles.forEach(handle => {
        handle.addEventListener('mousedown', (e) => {
            if (windowData.maximized) return;
            isResizing = true;
            resizeDir = handle.classList.contains('se') ? 'se' : 
                        handle.classList.contains('e') ? 'e' : 's';
            startWidth = win.offsetWidth;
            startHeight = win.offsetHeight;
            startX = e.clientX;
            startY = e.clientY;
            e.preventDefault();
        });
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        if (resizeDir === 'se' || resizeDir === 'e') {
            win.style.width = Math.max(400, startWidth + dx) + 'px';
        }
        if (resizeDir === 'se' || resizeDir === 's') {
            win.style.height = Math.max(300, startHeight + dy) + 'px';
        }
    });
    
    document.addEventListener('mouseup', () => {
        isResizing = false;
    });
}

function focusWindow(id) {
    const windowData = windows.find(w => w.id === id);
    if (!windowData) return;
    
    windowData.zIndex = ++topZIndex;
    const win = document.getElementById(`window-${id}`);
    if (win) win.style.zIndex = windowData.zIndex;
}

function closeWindow(id) {
    const win = document.getElementById(`window-${id}`);
    if (win) {
        win.classList.add('closing');
        setTimeout(() => {
            win.remove();
            windows = windows.filter(w => w.id !== id);
        }, 200);
    }
}

function minimizeWindow(id) {
    const windowData = windows.find(w => w.id === id);
    const win = document.getElementById(`window-${id}`);
    if (windowData && win) {
        windowData.minimized = true;
        win.classList.add('minimized');
    }
}

function maximizeWindow(id) {
    const windowData = windows.find(w => w.id === id);
    const win = document.getElementById(`window-${id}`);
    if (windowData && win) {
        windowData.maximized = !windowData.maximized;
        win.classList.toggle('maximized');
    }
}

// ====== Chat Functionality ======
function initChatWindow(win) {
    const chatMessages = win.querySelector('#chat-messages');
    const chatInput = win.querySelector('#chat-input');
    const chatSendBtn = win.querySelector('#chat-send-btn');
    const settingsToggle = win.querySelector('#chat-settings-toggle');
    const settingsPanel = win.querySelector('#chat-settings');
    const settingsClose = win.querySelector('#settings-close');
    
    // Settings elements
    const presetButtons = win.querySelectorAll('.preset-btn');
    const useHostedCheckbox = win.querySelector('#use-hosted');
    const providerSelect = win.querySelector('#provider-select');
    const modelInput = win.querySelector('#model-input');
    const apiKeyInput = win.querySelector('#api-key-input');
    const revealKeyBtn = win.querySelector('#reveal-key');
    const saveKeyBtn = win.querySelector('#save-key');
    const clearKeyBtn = win.querySelector('#clear-key');
    const keyStatus = win.querySelector('#key-status');
    const apiKeySection = win.querySelector('#api-key-section');
    const temperatureSlider = win.querySelector('#temperature');
    const tempValue = win.querySelector('#temp-value');
    const maxTokensInput = win.querySelector('#max-tokens');
    
    // Load saved settings
    let settings = ChatSettings.load();
    
    // Apply saved settings to UI
    function applySettingsToUI() {
        useHostedCheckbox.checked = settings.useHosted;
        providerSelect.value = settings.provider;
        modelInput.value = settings.model;
        temperatureSlider.value = settings.temperature * 100;
        tempValue.textContent = settings.temperature.toFixed(1);
        maxTokensInput.value = settings.maxTokens;
        
        // Update preset buttons
        presetButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.preset === settings.preset);
        });
        
        // Show/hide API key section based on hosted mode
        apiKeySection.style.display = settings.useHosted ? 'none' : 'block';
        
        // Update key status
        const currentKey = settings.provider === 'openai' ? settings.openaiKey : settings.openrouterKey;
        keyStatus.textContent = currentKey ? 'Key saved locally ✓' : 'No key saved';
        keyStatus.style.color = currentKey ? 'var(--accent-green)' : 'var(--text-secondary)';
        
        // Update model placeholder based on provider
        if (settings.provider === 'openrouter') {
            modelInput.placeholder = 'e.g. anthropic/claude-3.5-sonnet';
            if (!settings.model || settings.model === 'gpt-4o-mini') {
                modelInput.value = 'anthropic/claude-3.5-sonnet';
                settings.model = 'anthropic/claude-3.5-sonnet';
            }
        } else {
            modelInput.placeholder = 'e.g. gpt-4o-mini';
        }
        
        // Update system prompt based on preset
        updateSystemPrompt();
    }
    
    function updateSystemPrompt() {
        const preset = PERSONALITY_PRESETS[settings.preset] || PERSONALITY_PRESETS.mono;
        chatHistory = [{ role: 'system', content: preset }];
    }
    
    // Toggle settings panel
    settingsToggle.addEventListener('click', () => {
        settingsPanel.classList.toggle('open');
    });
    
    settingsClose.addEventListener('click', () => {
        settingsPanel.classList.remove('open');
    });
    
    // Preset buttons
    presetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            presetButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            settings.preset = btn.dataset.preset;
            ChatSettings.save(settings);
            updateSystemPrompt();
        });
    });
    
    // Use hosted toggle
    useHostedCheckbox.addEventListener('change', () => {
        settings.useHosted = useHostedCheckbox.checked;
        ChatSettings.save(settings);
        apiKeySection.style.display = settings.useHosted ? 'none' : 'block';
    });
    
    // Provider select
    providerSelect.addEventListener('change', () => {
        settings.provider = providerSelect.value;
        ChatSettings.save(settings);
        applySettingsToUI();
    });
    
    // Model input
    modelInput.addEventListener('change', () => {
        settings.model = modelInput.value;
        ChatSettings.save(settings);
    });
    
    // Temperature slider
    temperatureSlider.addEventListener('input', () => {
        settings.temperature = temperatureSlider.value / 100;
        tempValue.textContent = settings.temperature.toFixed(1);
        ChatSettings.save(settings);
    });
    
    // Max tokens
    maxTokensInput.addEventListener('change', () => {
        settings.maxTokens = parseInt(maxTokensInput.value) || 150;
        ChatSettings.save(settings);
    });
    
    // API key management
    revealKeyBtn.addEventListener('click', () => {
        apiKeyInput.type = apiKeyInput.type === 'password' ? 'text' : 'password';
        revealKeyBtn.textContent = apiKeyInput.type === 'password' ? '👁' : '🔒';
    });
    
    saveKeyBtn.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        if (key) {
            if (settings.provider === 'openai') {
                settings.openaiKey = key;
            } else {
                settings.openrouterKey = key;
            }
            ChatSettings.save(settings);
            apiKeyInput.value = '';
            keyStatus.textContent = 'Key saved locally ✓';
            keyStatus.style.color = 'var(--accent-green)';
        }
    });
    
    clearKeyBtn.addEventListener('click', () => {
        if (settings.provider === 'openai') {
            settings.openaiKey = '';
        } else {
            settings.openrouterKey = '';
        }
        ChatSettings.save(settings);
        apiKeyInput.value = '';
        keyStatus.textContent = 'No key saved';
        keyStatus.style.color = 'var(--text-secondary)';
    });
    
    // Initialize UI
    applySettingsToUI();
    
    // Send message handler
    async function handleSend() {
        const message = chatInput.value.trim();
        if (!message) return;
        
        // Check if we have what we need
        if (!settings.useHosted) {
            const key = ChatSettings.getApiKey(settings);
            if (!key) {
                addMessage(chatMessages, '...you need to add an API key in settings first.', false);
                return;
            }
        }
        
        chatInput.value = '';
        chatInput.disabled = true;
        chatSendBtn.disabled = true;
        
        addMessage(chatMessages, message, true);
        showTyping(chatMessages);
        
        // Trigger Mono expression
        MonoExpressionAPI.triggerChatExpression();
        
        const response = await sendChatMessage(message, settings);
        
        hideTyping(chatMessages);
        addMessage(chatMessages, response);
        
        // Auto-play TTS when Mono finishes responding (ElevenLabs)
        speak(response);
        
        chatInput.disabled = false;
        chatSendBtn.disabled = false;
        chatInput.focus();
    }
    
    chatSendBtn.addEventListener('click', handleSend);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });
}

// Send chat message - handles both hosted and direct API calls
async function sendChatMessage(userMessage, settings) {
    chatHistory.push({ role: 'user', content: userMessage });
    
    // Keep history limited
    if (chatHistory.length > 20) {
        chatHistory = [chatHistory[0], ...chatHistory.slice(-18)];
    }
    
    try {
        let response;
        
        if (settings.useHosted) {
            // Use server proxy
            response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    messages: chatHistory,
                    model: settings.model,
                    temperature: settings.temperature,
                    max_tokens: settings.maxTokens
                })
            });
        } else {
            // Direct API call
            const apiKey = ChatSettings.getApiKey(settings);
            
            if (settings.provider === 'openai') {
                response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: settings.model || 'gpt-4o-mini',
                        messages: chatHistory,
                        temperature: settings.temperature,
                        max_tokens: settings.maxTokens
                    })
                });
            } else {
                // OpenRouter
                response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`,
                        'HTTP-Referer': window.location.origin,
                        'X-Title': 'MONO OS'
                    },
                    body: JSON.stringify({
                        model: settings.model || 'anthropic/claude-3.5-sonnet',
                        messages: chatHistory,
                        temperature: settings.temperature,
                        max_tokens: settings.maxTokens
                    })
                });
            }
        }
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API error: ${response.status}`);
        }
        
        const data = await response.json();
        const assistantMessage = data.choices?.[0]?.message?.content || '...';
        
        chatHistory.push({ role: 'assistant', content: assistantMessage });
        
        return assistantMessage;
    } catch (error) {
        console.error('Chat API Error:', error);
        return `...something went wrong. ${error.message || 'Please try again.'}`;
    }
}

function addMessage(container, text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isUser ? 'user' : 'mono'}`;
    
    if (!isUser) {
        messageDiv.innerHTML = `<div class="name">Mono</div><div>${text}</div>`;
    } else {
        messageDiv.textContent = text;
    }
    
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}

function showTyping(container) {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typing';
    typingDiv.innerHTML = '<span></span><span></span><span></span>';
    container.appendChild(typingDiv);
    container.scrollTop = container.scrollHeight;
}

function hideTyping(container) {
    const typing = container.querySelector('#typing');
    if (typing) typing.remove();
}

async function sendToAPI(userMessage) {
    chatHistory.push({ role: 'user', content: userMessage });
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: chatHistory })
        });
        
        if (!response.ok) throw new Error('API request failed');
        
        const data = await response.json();
        const monoResponse = data.choices[0].message.content;
        
        chatHistory.push({ role: 'assistant', content: monoResponse });
        
        if (chatHistory.length > 20) {
            chatHistory = [chatHistory[0], ...chatHistory.slice(-18)];
        }
        
        return monoResponse;
    } catch (error) {
        console.error('API Error:', error);
        return "...I seem to be having trouble connecting. Perhaps try again.";
    }
}

// ====== Builder Functionality ======
const BUILDER_API_URL = '/api/builder';

// Builder preset prompts
const BUILDER_PRESETS = {
    landing: 'Create a modern, responsive landing page with a hero section, features section, and footer. Use HTML, CSS, and minimal JavaScript. Make it visually appealing with a dark theme.',
    react: 'Create a small React todo app with add, delete, and toggle complete functionality. Include App.jsx, index.js, and basic styles. Use functional components with hooks.',
    cli: 'Create a Node.js CLI tool scaffold with commander for argument parsing. Include a main bin file, package.json with bin field, and a README with usage instructions.'
};

function initBuilderWindow(win) {
    // Builder state
    let builderState = {
        status: 'idle', // idle, generating, ready, exporting, error
        files: [],
        uploadedFiles: [], // Files uploaded by user as context
        selectedFile: null,
        lastPrompt: ''
    };
    
    // Get DOM elements within this window
    const statusEl = win.querySelector('#builder-status');
    const fileTreeEl = win.querySelector('#builder-file-tree');
    const outputEl = win.querySelector('#builder-output');
    const inputEl = win.querySelector('#builder-input');
    const previewFilenameEl = win.querySelector('#builder-preview-filename');
    const previewContentEl = win.querySelector('#builder-preview-content');
    const exportBtn = win.querySelector('#builder-export-btn');
    const resetBtn = win.querySelector('#builder-reset-btn');
    const presetBtns = win.querySelectorAll('.builder-preset-btn');
    const uploadInput = win.querySelector('#builder-upload');
    const uploadSection = win.querySelector('.builder-upload-section');
    
    // Update status display
    function updateStatus(status) {
        builderState.status = status;
        statusEl.textContent = status;
        statusEl.className = 'builder-status status-' + status;
    }
    
    // Add output to terminal
    function addOutput(text, isPrompt = false) {
        const p = document.createElement('p');
        if (isPrompt) {
            p.innerHTML = `<span class="terminal-prompt">mono@builder:~$</span> ${escapeHtml(text)}`;
        } else {
            p.innerHTML = text;
        }
        outputEl.appendChild(p);
        outputEl.scrollTop = outputEl.scrollHeight;
    }
    
    // Escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Render file tree
    function renderFileTree() {
        if (builderState.files.length === 0) {
            fileTreeEl.innerHTML = '<div class="file-tree-empty">No files generated yet</div>';
            return;
        }
        
        // Group files by directory
        const tree = {};
        builderState.files.forEach(file => {
            const parts = file.path.split('/');
            if (parts.length > 1) {
                const dir = parts.slice(0, -1).join('/');
                if (!tree[dir]) tree[dir] = [];
                tree[dir].push(file);
            } else {
                if (!tree['.']) tree['.'] = [];
                tree['.'].push(file);
            }
        });
        
        let html = '';
        // Root files first
        if (tree['.']) {
            tree['.'].forEach(file => {
                const isSelected = builderState.selectedFile === file.path;
                html += `<div class="builder-file-item ${isSelected ? 'selected' : ''}" data-path="${escapeHtml(file.path)}">📄 ${escapeHtml(file.path)}</div>`;
            });
        }
        // Then directories
        Object.keys(tree).filter(k => k !== '.').sort().forEach(dir => {
            html += `<div class="builder-folder">📁 ${escapeHtml(dir)}/</div>`;
            tree[dir].forEach(file => {
                const filename = file.path.split('/').pop();
                const isSelected = builderState.selectedFile === file.path;
                html += `<div class="builder-file-item nested ${isSelected ? 'selected' : ''}" data-path="${escapeHtml(file.path)}">  📄 ${escapeHtml(filename)}</div>`;
            });
        });
        
        fileTreeEl.innerHTML = html;
        
        // Add click handlers
        fileTreeEl.querySelectorAll('.builder-file-item').forEach(item => {
            item.addEventListener('click', () => {
                const path = item.dataset.path;
                selectFile(path);
            });
        });
    }
    
    // Select a file for preview
    function selectFile(path) {
        builderState.selectedFile = path;
        const file = builderState.files.find(f => f.path === path);
        if (file) {
            previewFilenameEl.textContent = path;
            previewContentEl.textContent = file.content;
        }
        renderFileTree();
    }
    
    // Handle build request
    async function handleBuild(prompt) {
        if (!prompt.trim()) return;
        if (builderState.status === 'generating') return;
        
        builderState.lastPrompt = prompt;
        addOutput(prompt, true);
        updateStatus('generating');
        addOutput('<span style="color: var(--accent-green);">Generating...</span>');
        
        inputEl.value = '';
        inputEl.disabled = true;
        
        try {
            let response = await fetch(BUILDER_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });
            
            // Check if response is OK before parsing JSON
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server error (${response.status}): ${errorText}`);
            }
            
            const responseText = await response.text();
            if (!responseText) {
                throw new Error('Empty response from server');
            }
            
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseErr) {
                throw new Error('Invalid JSON response: ' + responseText.substring(0, 100));
            }
            
            // Handle retry if needed
            if (data.needsRetry) {
                addOutput('<span style="color: var(--text-secondary);">Fixing output format...</span>');
                response = await fetch(BUILDER_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt, isRetry: true })
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Retry failed (${response.status}): ${errorText}`);
                }
                
                const retryText = await response.text();
                if (!retryText) {
                    throw new Error('Empty response on retry');
                }
                
                try {
                    data = JSON.parse(retryText);
                } catch (parseErr) {
                    throw new Error('Invalid JSON on retry');
                }
            }
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            // Success
            builderState.files = data.files || [];
            addOutput(`<span style="color: var(--accent-green);">✓ ${escapeHtml(data.message || 'Generated ' + builderState.files.length + ' files')}</span>`);
            
            renderFileTree();
            
            // Auto-select first file
            if (builderState.files.length > 0) {
                selectFile(builderState.files[0].path);
            }
            
            updateStatus('ready');
            exportBtn.disabled = false;
            
        } catch (error) {
            console.error('Builder error:', error);
            addOutput(`<span style="color: #ff5f56;">Error: ${escapeHtml(error.message)}</span>`);
            updateStatus('error');
        }
        
        inputEl.disabled = false;
        inputEl.focus();
    }
    
    // Export as ZIP
    async function handleExport() {
        if (builderState.files.length === 0) return;
        
        updateStatus('exporting');
        
        try {
            // Check if JSZip is available
            if (typeof JSZip === 'undefined') {
                throw new Error('JSZip not loaded. Please refresh the page.');
            }
            
            const zip = new JSZip();
            
            builderState.files.forEach(file => {
                zip.file(file.path, file.content);
            });
            
            const blob = await zip.generateAsync({ type: 'blob' });
            
            // Download
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'mono-build.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            addOutput('<span style="color: var(--accent-green);">✓ Exported mono-build.zip</span>');
            updateStatus('ready');
            
        } catch (error) {
            console.error('Export error:', error);
            addOutput(`<span style="color: #ff5f56;">Export failed: ${escapeHtml(error.message)}</span>`);
            updateStatus('error');
        }
    }
    
    // Reset builder
    function handleReset() {
        builderState = {
            status: 'idle',
            files: [],
            selectedFile: null,
            lastPrompt: ''
        };
        
        outputEl.innerHTML = `
            <p><span class="terminal-prompt">mono@builder:~$</span> reset</p>
            <p>MONO Builder - AI Code Generator</p>
            <p>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
            <p style="color: var(--text-secondary);">Describe what you want to build, or use a preset above.</p>
        `;
        
        fileTreeEl.innerHTML = '<div class="file-tree-empty">No files generated yet</div>';
        previewFilenameEl.textContent = 'Select a file to preview';
        previewContentEl.textContent = '';
        
        updateStatus('idle');
        exportBtn.disabled = true;
        inputEl.value = '';
        inputEl.focus();
    }
    
    // Handle file upload
    async function handleFileUpload(files) {
        for (const file of files) {
            // Only accept text-based files
            if (file.size > 500 * 1024) { // 500KB limit per file
                addOutput(`<span style="color: #ffbd2e;">Skipped ${escapeHtml(file.name)} (too large)</span>`);
                continue;
            }
            
            try {
                const content = await readFileAsText(file);
                builderState.uploadedFiles.push({
                    path: file.name,
                    content: content
                });
                
                // Also add to files for preview/export
                builderState.files.push({
                    path: file.name,
                    content: content
                });
                
                addOutput(`<span style="color: var(--accent-green);">📄 Uploaded: ${escapeHtml(file.name)}</span>`);
            } catch (err) {
                addOutput(`<span style="color: #ff5f56;">Failed to read ${escapeHtml(file.name)}</span>`);
            }
        }
        
        renderFileTree();
        exportBtn.disabled = builderState.files.length === 0;
        
        if (builderState.uploadedFiles.length > 0) {
            addOutput(`<span style="color: var(--text-secondary);">Files loaded as context. Now describe what you want to do with them.</span>`);
        }
    }
    
    // Read file as text
    function readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }
    
    // Build prompt with uploaded files context
    function buildPromptWithContext(userPrompt) {
        if (builderState.uploadedFiles.length === 0) {
            return userPrompt;
        }
        
        let contextPrompt = `I have the following existing files that I want you to work with:\n\n`;
        
        builderState.uploadedFiles.forEach(file => {
            contextPrompt += `--- ${file.path} ---\n${file.content}\n\n`;
        });
        
        contextPrompt += `\nUser request: ${userPrompt}\n\n`;
        contextPrompt += `Please modify/enhance these files or create new files as needed. Include all files in your response (both modified and new ones).`;
        
        return contextPrompt;
    }
    
    // Event listeners
    inputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const fullPrompt = buildPromptWithContext(inputEl.value);
            handleBuild(fullPrompt);
        }
    });
    
    // File upload handler
    if (uploadInput) {
        uploadInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileUpload(Array.from(e.target.files));
                e.target.value = ''; // Reset for re-upload
            }
        });
    }
    
    // Drag and drop support
    if (uploadSection) {
        uploadSection.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadSection.classList.add('dragover');
        });
        
        uploadSection.addEventListener('dragleave', () => {
            uploadSection.classList.remove('dragover');
        });
        
        uploadSection.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadSection.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                handleFileUpload(Array.from(e.dataTransfer.files));
            }
        });
    }
    
    exportBtn.addEventListener('click', handleExport);
    resetBtn.addEventListener('click', handleReset);
    
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const preset = btn.dataset.preset;
            if (BUILDER_PRESETS[preset]) {
                handleBuild(BUILDER_PRESETS[preset]);
            }
        });
    });
    
    // Focus input on init
    inputEl.focus();
}

// TTS Voice State
const VoiceState = {
    enabled: false,
    volume: 0.9,
    
    // Enable voice after user interaction (browser autoplay policy)
    enable() {
        this.enabled = true;
        console.log('mono@voice:~$ voice enabled');
    }
};

async function speak(text) {
    // Skip if voice not enabled or text is empty
    if (!text || text.trim().length === 0) return;
    
    try {
        // Cancel any currently playing audio
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null;
        }
        
        voiceIndicator.classList.add('speaking');
        console.log('mono@voice:~$ speaking…');
        
        const response = await fetch(TTS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });
        
        if (!response.ok) {
            // Silently skip if TTS fails (no crash)
            console.warn('TTS unavailable');
            voiceIndicator.classList.remove('speaking');
            return;
        }
        
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        return new Promise((resolve) => {
            currentAudio = new Audio(audioUrl);
            currentAudio.volume = VoiceState.volume;
            
            currentAudio.onended = () => {
                voiceIndicator.classList.remove('speaking');
                URL.revokeObjectURL(audioUrl);
                currentAudio = null;
                resolve();
            };
            
            currentAudio.onerror = () => {
                voiceIndicator.classList.remove('speaking');
                URL.revokeObjectURL(audioUrl);
                currentAudio = null;
                resolve();
            };
            
            currentAudio.play().then(() => {
                // Voice is now enabled for future auto-play
                VoiceState.enable();
            }).catch((err) => {
                // Browser blocked autoplay - need user interaction first
                console.log('mono@voice:~$ autoplay blocked, click to enable voice');
                voiceIndicator.classList.remove('speaking');
                URL.revokeObjectURL(audioUrl);
                currentAudio = null;
                resolve();
            });
        });
    } catch (error) {
        // Silently fail - don't crash the app
        console.warn('TTS Error:', error.message);
        voiceIndicator.classList.remove('speaking');
    }
}

// ====== Live2D Model (Preserved from original) ======
let monoModel = null;
let pixiApp = null;

// Expression API - Global functions for controlling Mono's expressions
const MonoExpressionAPI = {
    expressionList: [],
    currentExpression: null,
    expressionResetTimer: null,
    
    // Set a specific expression by name
    setExpression(name) {
        if (!monoModel) return;
        try {
            const index = this.expressionList.findIndex(e => e.toLowerCase() === name.toLowerCase());
            if (index >= 0) {
                monoModel.expression(index);
                this.currentExpression = name;
                console.log('Expression set:', name);
            }
        } catch (e) {
            console.warn('Expression error:', e);
        }
    },
    
    // Set expression by index
    setExpressionByIndex(index) {
        if (!monoModel) return;
        try {
            if (index >= 0 && index < this.expressionList.length) {
                monoModel.expression(index);
                this.currentExpression = this.expressionList[index];
                console.log('Expression set:', this.currentExpression);
            }
        } catch (e) {
            console.warn('Expression error:', e);
        }
    },
    
    // Random expression
    randomExpression() {
        if (!monoModel || this.expressionList.length === 0) return;
        const index = Math.floor(Math.random() * this.expressionList.length);
        this.setExpressionByIndex(index);
        return this.expressionList[index];
    },
    
    // Reset to idle (no expression)
    resetIdle() {
        if (!monoModel) return;
        try {
            monoModel.expression(); // Clear expression
            this.currentExpression = null;
            console.log('Reset to idle');
        } catch (e) {
            console.warn('Reset error:', e);
        }
    },
    
    // Play motion
    playMotion(group, index = 0) {
        if (!monoModel) return;
        try {
            monoModel.motion(group, index);
            console.log('Motion played:', group, index);
        } catch (e) {
            console.warn('Motion error:', e);
        }
    },
    
    // Trigger expression for chat (with auto-reset)
    triggerChatExpression() {
        if (this.expressionResetTimer) {
            clearTimeout(this.expressionResetTimer);
        }
        this.randomExpression();
        this.expressionResetTimer = setTimeout(() => {
            this.resetIdle();
        }, 1200);
    }
};

async function initMonoModel() {
    const canvas = document.getElementById('mono-canvas');
    const container = document.getElementById('mono-companion');
    const loadingOverlay = document.getElementById('mono-loading-overlay');
    
    // Set higher DPR for crisp rendering
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    
    pixiApp = new PIXI.Application({
        view: canvas,
        autoStart: true,
        width: container.clientWidth * dpr,
        height: container.clientHeight * dpr,
        backgroundColor: 0x000000,
        backgroundAlpha: 0,
        resolution: dpr,
        autoDensity: true
    });

    try {
        // Use preloaded model if available, otherwise load fresh
        if (modelReady && modelPreloadPromise) {
            monoModel = await modelPreloadPromise;
        } else {
            monoModel = await PIXI.live2d.Live2DModel.from('./MO.v2.7/MO.model3.json');
        }
        
        pixiApp.stage.addChild(monoModel);
        
        // Hide loading overlay
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
        
        // Create dynamic shadow element
        let shadowElement = document.getElementById('mono-shadow');
        if (!shadowElement) {
            shadowElement = document.createElement('div');
            shadowElement.id = 'mono-shadow';
            shadowElement.style.cssText = `
                position: absolute;
                width: 200px;
                height: 60px;
                background: radial-gradient(ellipse at center, rgba(0, 255, 65, 0.2) 0%, transparent 70%);
                filter: blur(20px);
                pointer-events: none;
                z-index: 400;
            `;
            container.appendChild(shadowElement);
        }

        function updateModelPosition() {
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            
            // Use anchor for positioning - bottom center
            monoModel.anchor.set(0.5, 1);
            
            // Scale to be large - fill about 90% of container height
            const scale = (containerHeight / monoModel.height) * 0.88;
            monoModel.scale.set(scale);
            
            // Position more to the right and feet at very bottom (standing on edge)
            const modelX = containerWidth * 0.65;
            const modelY = containerHeight + 50;
            monoModel.x = modelX;
            monoModel.y = modelY;
            
            // Update shadow position to always be under Mono's feet
            if (shadowElement) {
                shadowElement.style.left = (modelX - 100) + 'px';
                shadowElement.style.bottom = '0px';
            }
            
            return scale;
        }
        
        let currentScale = updateModelPosition();

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let targetX = 0;
        let targetY = 0;
        let currentX = 0;
        let currentY = 0;

        // Track mouse globally for eye/head following
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Turn OFF watermark
        if (monoModel.internalModel && monoModel.internalModel.coreModel) {
            monoModel.internalModel.coreModel.setParameterValueById('Param156', 1);
        }

        pixiApp.ticker.add(() => {
            if (monoModel.internalModel) {
                const coreModel = monoModel.internalModel.coreModel;
                coreModel.setParameterValueById('Param156', 1);
                
                const rect = container.getBoundingClientRect();
                const modelCenterX = rect.left + rect.width / 2;
                const modelCenterY = rect.top + rect.height / 2;
                
                targetX = (mouseX - modelCenterX) / (window.innerWidth / 2);
                targetY = (mouseY - modelCenterY) / (window.innerHeight / 2);
                
                targetX = Math.max(-1, Math.min(1, targetX));
                targetY = Math.max(-1, Math.min(1, targetY));
                
                currentX += (targetX - currentX) * 0.1;
                currentY += (targetY - currentY) * 0.1;
                
                coreModel.setParameterValueById('ParamEyeBallX', currentX * 1);
                coreModel.setParameterValueById('ParamEyeBallY', -currentY * 1);
                coreModel.setParameterValueById('ParamAngleX', currentX * 30);
                coreModel.setParameterValueById('ParamAngleY', -currentY * 30);
                coreModel.setParameterValueById('ParamAngleZ', currentX * 10);
                coreModel.setParameterValueById('ParamBodyAngleX', currentX * 10);
                coreModel.setParameterValueById('ParamBodyAngleY', -currentY * 5);
                coreModel.setParameterValueById('ParamBodyAngleZ', currentX * 5);
            }
        });

        // Debounced resize handler for smooth resizing
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const newWidth = container.clientWidth;
                const newHeight = container.clientHeight;
                
                // Resize canvas with DPR
                canvas.style.width = newWidth + 'px';
                canvas.style.height = newHeight + 'px';
                pixiApp.renderer.resize(newWidth * dpr, newHeight * dpr);
                pixiApp.renderer.resolution = dpr;
                
                currentScale = updateModelPosition();
            }, 50);
        });

        // Populate expression list from model (expressions load but don't auto-play)
        if (monoModel.internalModel && monoModel.internalModel.settings) {
            const definitions = monoModel.internalModel.settings.expressions;
            if (definitions && definitions.length > 0) {
                MonoExpressionAPI.expressionList = definitions.map(e => e.Name || e.name || 'Unknown');
                console.log('Loaded expressions:', MonoExpressionAPI.expressionList);
            }
        }
        
        console.log('Mono loaded successfully');

    } catch (error) {
        console.error('Error loading model:', error);
    }
}

// ====== Files Window ======
function initFilesWindow(win) {
    const fileTree = win.querySelector('#files-tree');
    const contentHeader = win.querySelector('#files-content-header');
    const contentBody = win.querySelector('#files-content-body');
    
    // Simple markdown to HTML converter
    function renderMarkdown(text) {
        let html = text
            // Headers
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            // Bold
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            // Checkboxes
            .replace(/^- \[x\] (.+)$/gm, '<div class="checkbox checked">✓ $1</div>')
            .replace(/^- \[ \] (.+)$/gm, '<div class="checkbox">○ $1</div>')
            // Lists
            .replace(/^- (.+)$/gm, '<li>$1</li>')
            // Code
            .replace(/`(.+?)`/g, '<code>$1</code>')
            // Horizontal rule
            .replace(/^---$/gm, '<hr>')
            // Line breaks
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
        
        return `<div class="md-content"><p>${html}</p></div>`;
    }
    
    // Handle file click
    fileTree.querySelectorAll('.files-item').forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all
            fileTree.querySelectorAll('.files-item').forEach(i => i.classList.remove('active'));
            // Add active class to clicked item
            item.classList.add('active');
            
            const fileKey = item.dataset.file;
            const content = FILES_CONTENT[fileKey];
            
            if (content) {
                // Get filename from the item text
                const filename = item.textContent.trim().replace('📄 ', '');
                contentHeader.textContent = filename;
                contentBody.innerHTML = renderMarkdown(content);
            } else {
                contentHeader.textContent = 'File not found';
                contentBody.innerHTML = '<p style="color: var(--text-secondary);">Content not available.</p>';
            }
        });
    });
    
    // Select first file by default
    const firstFile = fileTree.querySelector('.files-item');
    if (firstFile) {
        firstFile.click();
    }
}

// ====== Customize Window - Expression Controls ======
function initCustomizeWindow(win) {
    const grid = win.querySelector('#expression-grid');
    const randomBtn = win.querySelector('#expr-random');
    const resetBtn = win.querySelector('#expr-reset');
    const motionBtns = win.querySelectorAll('.motion-btn');
    
    // Populate expression grid when expressions are loaded
    function updateExpressionGrid() {
        if (MonoExpressionAPI.expressionList.length === 0) {
            grid.innerHTML = '<p style="color: var(--text-secondary); font-size: 11px;">No expressions loaded yet...</p>';
            return;
        }
        
        let html = '';
        MonoExpressionAPI.expressionList.forEach((name, idx) => {
            html += `<button class="expr-btn expr-item" data-index="${idx}" data-name="${name}">${name}</button>`;
        });
        grid.innerHTML = html;
        
        // Add click handlers
        grid.querySelectorAll('.expr-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                MonoExpressionAPI.setExpressionByIndex(index);
            });
        });
    }
    
    // Check if expressions loaded, or wait
    if (MonoExpressionAPI.expressionList.length > 0) {
        updateExpressionGrid();
    } else {
        // Poll for expressions
        const checkInterval = setInterval(() => {
            if (MonoExpressionAPI.expressionList.length > 0) {
                updateExpressionGrid();
                clearInterval(checkInterval);
            }
        }, 500);
        // Stop after 10 seconds
        setTimeout(() => clearInterval(checkInterval), 10000);
    }
    
    // Random button
    randomBtn.addEventListener('click', () => {
        MonoExpressionAPI.randomExpression();
    });
    
    // Reset button
    resetBtn.addEventListener('click', () => {
        MonoExpressionAPI.resetIdle();
    });
    
    // Motion buttons
    motionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const group = btn.dataset.group;
            const index = parseInt(btn.dataset.index);
            MonoExpressionAPI.playMotion(group, index);
        });
    });
}

// ====== Start Boot Sequence ======
document.addEventListener('DOMContentLoaded', runBootSequence);
