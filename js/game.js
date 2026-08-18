// ===== SOUND MANAGER =====
class SoundManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.musicGain = null;
        this.isPlayingMusic = false;
        this.chords = [
            [220, 261.63, 329.63, 392],       // Am
            [174.61, 220, 261.63, 329.63],    // F
            [261.63, 329.63, 392, 493.88],    // C
            [196, 246.94, 293.66, 392]        // G
        ];
        this.currentChord = 0;
        this.chordInterval = null;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.connect(this.ctx.destination);
            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = 0.06;
            this.musicGain.connect(this.masterGain);
        }
        if (this.ctx.state === 'suspended') this.ctx.resume();
    }

    playBubblePop() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    playCorrect() {
        if (!this.ctx) return;
        const freqs = [523.25, 659.25, 783.99, 1046.50];
        freqs.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            const startTime = this.ctx.currentTime + i * 0.08;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
            gain.gain.linearRampToValueAtTime(0, startTime + 0.08);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(startTime);
            osc.stop(startTime + 0.1);
        });
    }

    playWrong() {
        if (!this.ctx) return;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
        filter.connect(this.masterGain);
        const freqs = [329.63, 261.63];
        freqs.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            const startTime = this.ctx.currentTime + i * 0.15;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.4, startTime + 0.02);
            gain.gain.linearRampToValueAtTime(0, startTime + 0.15);
            osc.connect(gain);
            gain.connect(filter);
            osc.start(startTime);
            osc.stop(startTime + 0.15);
        });
    }

    playTimeUp() {
        if (!this.ctx) return;
        for (let i=0; i<3; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = 440;
            const startTime = this.ctx.currentTime + i * 0.15;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
            gain.gain.linearRampToValueAtTime(0, startTime + 0.1);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(startTime);
            osc.stop(startTime + 0.1);
        }
    }

    playChord(chordFreqs) {
        if (!this.ctx) return;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 600;
        filter.connect(this.musicGain);
        chordFreqs.forEach(freq => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + 0.5);
            gain.gain.setValueAtTime(0.25, this.ctx.currentTime + 3.5);
            gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 4.0);
            osc.connect(gain);
            gain.connect(filter);
            osc.start();
            osc.stop(this.ctx.currentTime + 4.0);
        });
    }

    startMusic() {
        if (this.isPlayingMusic) return;
        this.isPlayingMusic = true;
        const nextChord = () => {
            if (!this.isPlayingMusic) return;
            this.playChord(this.chords[this.currentChord]);
            this.currentChord = (this.currentChord + 1) % this.chords.length;
        };
        nextChord();
        this.chordInterval = setInterval(nextChord, 4000);
    }
}
const sounds = new SoundManager();

// ===== CONFETTI =====
class ConfettiManager {
    constructor() {
        this.canvas = document.getElementById('confetti-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.colors = ['#7c3aed', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    start() {
        this.particles = [];
        for (let i = 0; i < 150; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height - this.canvas.height,
                size: Math.random() * 10 + 5,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                speedY: Math.random() * 3 + 2,
                speedX: Math.random() * 2 - 1,
                rotation: Math.random() * 360,
                rotationSpeed: Math.random() * 10 - 5,
                wavePhase: Math.random() * Math.PI * 2
            });
        }
        if (this.animFrame) cancelAnimationFrame(this.animFrame);
        this.loop();
        setTimeout(() => {
            cancelAnimationFrame(this.animFrame);
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }, 5000);
    }
    loop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles.forEach(p => {
            p.y += p.speedY;
            p.x += Math.sin(p.wavePhase) * 2 + p.speedX;
            p.wavePhase += 0.05;
            p.rotation += p.rotationSpeed;
            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate((p.rotation * Math.PI) / 180);
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
            this.ctx.restore();
        });
        this.animFrame = requestAnimationFrame(() => this.loop());
    }
}
const confetti = new ConfettiManager();


// ===== GLOBAL STATE & UI HELPERS =====
const state = {
    roomCode: '',
    name: '',
    isHost: false,
    timerInterval: null,
    myPeerId: null,
    hostPeerId: null
};

document.addEventListener('click', (e) => {
    sounds.init();
    if (!sounds.isPlayingMusic) sounds.startMusic();
    if (e.target.tagName.toLowerCase() === 'button' || e.target.closest('button')) {
        sounds.playBubblePop();
    }
});

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function updateLives(containerId, lives) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    for(let i = 0; i < 5; i++) {
        container.innerHTML += i < lives ? '❤️' : '🤍';
    }
}

function setTimer(seconds, onExpire = null) {
    const timerText = document.getElementById('timer-text');
    const path = document.querySelector('.timer-path');
    const totalTime = seconds;
    const perimeter = 2 * Math.PI * 45;
    path.style.strokeDasharray = perimeter;
    
    clearInterval(state.timerInterval);
    let current = seconds;
    
    const update = () => {
        timerText.textContent = current;
        const progress = current / totalTime;
        path.style.strokeDashoffset = perimeter * (1 - progress);
        
        if (progress > 0.5) path.style.stroke = 'var(--accent)';
        else if (progress > 0.2) path.style.stroke = '#f59e0b';
        else path.style.stroke = 'var(--error)';
        
        if (current <= 0) {
            clearInterval(state.timerInterval);
            if(onExpire) onExpire();
        }
        current--;
    };
    update();
    state.timerInterval = setInterval(update, 1000);
}

// ===== GEMINI API =====
async function callGemini(prompt, base64Image = null) {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) throw new Error("Missing Gemini API Key");

    const contents = [{ role: "user", parts: [{ text: prompt }] }];
    if (base64Image) {
        const base64Data = base64Image.split(',')[1];
        const mimeType = base64Image.split(';')[0].split(':')[1];
        contents[0].parts.unshift({ inlineData: { data: base64Data, mimeType: mimeType } });
    }

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
    });

    const data = await res.json();
    if (!res.ok) {
        if (res.status === 400) throw new Error("API Error 400: API Key might be invalid or lacks permissions.");
        if (res.status === 429) throw new Error("API Error 429: Too Many Requests. (Free tier limit reached).");
        throw new Error(data.error?.message || `API Error ${res.status}`);
    }
    if (!data.candidates || data.candidates.length === 0) throw new Error("Gemini returned no response (possibly blocked by safety filters).");
    return data.candidates[0].content.parts[0].text;
}

function parseGeminiJson(text) {
    let clean = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    try {
        return JSON.parse(clean);
    } catch(e) {
        // Fallback: extract substring between brackets if there's text around it
        const start = clean.indexOf('[');
        const end = clean.lastIndexOf(']');
        if(start !== -1 && end !== -1) {
            return JSON.parse(clean.substring(start, end + 1));
        }
        throw new Error("Failed to parse AI response: " + clean.substring(0, 50));
    }
}

// ===== PDF.js PROCESSING =====
async function processPDF(file) {
    document.getElementById('upload-status-text').textContent = "Extracting pages...";
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
    
    let pageImages = [];
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport: viewport }).promise;
        pageImages.push({
            dataUrl: canvas.toDataURL('image/jpeg', 0.8),
            canvas: canvas
        });
    }

    document.getElementById('upload-status-text').textContent = "AI analyzing questions...";
    const questions = [];
    let apiErrorEncountered = null;
    
    const prompt = `You are analyzing exam paper pages. Identify all individual questions on this page.
For each question, extract:
1. "question_number": The number or letter of the question (e.g. 1, 2a, etc.)
2. "marks": The integer number of marks the question is worth (e.g., look for "[3 marks]", "(3)", etc.). If not found, use 2.
3. "text": The full text of the question.
4. "bbox": The bounding box of the question as percentage coordinates from 0 to 100: {"top": X, "left": Y, "bottom": Z, "right": W}.

CRITICAL: You MUST return a valid JSON array of these objects. If there are no questions on the page, return an empty array: []
Do NOT return anything other than the JSON array.`;

    for (let i = 0; i < pageImages.length; i++) {
        document.getElementById('upload-detail-text').textContent = `Page ${i+1}/${pageImages.length}`;
        try {
            const result = await callGemini(prompt, pageImages[i].dataUrl);
            let parsed = [];
            try {
                 parsed = parseGeminiJson(result);
            } catch (jsonErr) {
                 console.warn("Failed to parse Gemini output for page " + (i+1) + ":", result);
                 continue; 
            }
            if (!Array.isArray(parsed)) parsed = [parsed];
            
            for (let q of parsed) {
                document.getElementById('upload-status-text').textContent = `Solving Q${q.question_number}...`;
                
                const canvas = pageImages[i].canvas;
                const cropCanvas = document.createElement('canvas');
                const ctx = cropCanvas.getContext('2d');
                
                // Safety check for bbox
                if (!q.bbox) q.bbox = {top: 0, left: 0, bottom: 100, right: 100};
                let top = Math.max(0, (q.bbox.top / 100) - 0.05) * canvas.height;
                let left = Math.max(0, (q.bbox.left / 100) - 0.05) * canvas.width;
                let bottom = Math.min(1, (q.bbox.bottom / 100) + 0.05) * canvas.height;
                let right = Math.min(1, (q.bbox.right / 100) + 0.05) * canvas.width;
                
                cropCanvas.width = right - left;
                cropCanvas.height = bottom - top;
                ctx.drawImage(canvas, left, top, cropCanvas.width, cropCanvas.height, 0, 0, cropCanvas.width, cropCanvas.height);
                
                const qImage = cropCanvas.toDataURL('image/jpeg', 0.8);
                
                const solvePrompt = `You are an expert tutor. Solve this step by step.\nQuestion: ${q.text}\nProvide your FINAL ANSWER on the last line, preceded by "FINAL ANSWER: ". Keep it concise.`;
                const solveResult = await callGemini(solvePrompt, qImage);
                const lines = solveResult.split('\n');
                let solution = "Unknown";
                for (let line of [...lines].reverse()) {
                    if (line.includes("FINAL ANSWER:")) {
                        solution = line.replace("FINAL ANSWER:", "").trim();
                        break;
                    }
                }
                
                questions.push({
                    text: q.text || "Unknown question",
                    marks: q.marks || 2,
                    image: qImage,
                    solution: solution,
                    number: q.question_number || "?"
                });
            }
        } catch(e) {
            console.error("Failed page", i, e);
            apiErrorEncountered = e.message;
            // Stop processing if it's an API error (e.g., 400 Bad Request, 429 Rate Limit)
            if (e.message.includes("API Error") || e.message.includes("Missing")) {
                break; 
            }
        }
    }
    
    if (questions.length === 0 && apiErrorEncountered) {
        throw new Error("AI Error: " + apiErrorEncountered);
    }
    
    return questions;
}

// ===== PEERJS NETWORKING & HOST STATE =====
let peer = null;
let hostConn = null; // Used by clients to talk to host
let clientConns = []; // Used by host to talk to clients

const hostGameState = {
    players: {}, // id -> {name, score, lives, locked_out, answered, round_points}
    questions: [],
    currentQIndex: -1,
    qStartTime: 0
};

function generateRoomCode() {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
}

// HOST LOGIC
function initHost() {
    const code = generateRoomCode();
    peer = new Peer(`quizclash-${code}`);
    
    peer.on('open', id => {
        state.roomCode = code;
        state.isHost = true;
        state.myPeerId = id;
        hostGameState.players[id] = { name: "Host", score: 0, lives: 5, isHost: true };
        showScreen('screen-host-setup');
    });

    peer.on('connection', conn => {
        clientConns.push(conn);
        conn.on('data', data => handleClientMessage(conn.peer, data));
        conn.on('close', () => {
            clientConns = clientConns.filter(c => c !== conn);
            delete hostGameState.players[conn.peer];
            broadcastPlayerList();
        });
    });

    peer.on('error', err => showToast("Peer error: " + err.message));
}

function broadcast(type, data) {
    // Send to clients
    clientConns.forEach(c => c.send({type, data}));
    // Send to self (Host plays too)
    handleServerMessage({type, data});
}

function sendToClient(peerId, type, data) {
    if (peerId === state.myPeerId) {
        handleServerMessage({type, data});
    } else {
        const c = clientConns.find(c => c.peer === peerId);
        if (c) c.send({type, data});
    }
}

// CLIENT LOGIC
function initClient(code) {
    peer = new Peer();
    peer.on('open', id => {
        state.myPeerId = id;
        state.roomCode = code;
        document.getElementById('join-status').classList.remove('hidden');
        document.getElementById('btn-submit-join').disabled = true;
        
        hostConn = peer.connect(`quizclash-${code}`);
        
        hostConn.on('open', () => {
            document.getElementById('join-status').classList.add('hidden');
            state.isHost = false;
            showScreen('screen-name');
        });
        
        hostConn.on('data', data => handleServerMessage(data));
        
        hostConn.on('error', err => {
            document.getElementById('join-status').classList.add('hidden');
            document.getElementById('btn-submit-join').disabled = false;
            showToast("Connection error!");
        });
    });
    peer.on('error', err => {
        document.getElementById('join-status').classList.add('hidden');
        document.getElementById('btn-submit-join').disabled = false;
        showToast("Invalid room or network error");
    });
}

function sendToServer(type, data) {
    if (state.isHost) {
        handleClientMessage(state.myPeerId, {type, data});
    } else {
        if (hostConn) hostConn.send({type, data});
    }
}

// ===== GAME LOGIC HANDLING =====

// Host handles messages from clients
async function handleClientMessage(peerId, msg) {
    const {type, data} = msg;
    
    if (type === 'set_name') {
        if (!hostGameState.players[peerId]) {
            hostGameState.players[peerId] = { score: 0, lives: 5, isHost: false };
        }
        hostGameState.players[peerId].name = data.name;
        sendToClient(peerId, 'name_set', {name: data.name});
        broadcastPlayerList();
    }
    
    if (type === 'submit_answer') {
        const p = hostGameState.players[peerId];
        const q = hostGameState.questions[hostGameState.currentQIndex];
        if (!p || p.answered || p.locked_out || !q) return;
        
        sendToClient(peerId, 'grading_start', {});
        
        // Use Gemini to validate
        const prompt = `You are marking an exam. Compare the student answer to the correct answer.
Question: ${q.text}
Correct answer: ${q.solution}
Student answer: ${data.answer}
Consider equivalent notations, units, rounding, etc.
Reply EXACTLY format:
VERDICT: CORRECT or INCORRECT
REASON: brief reason`;
        
        try {
            const res = await callGemini(prompt);
            const isCorrect = res.includes('VERDICT: CORRECT');
            
            const timeTaken = (Date.now() - hostGameState.qStartTime) / 1000;
            
            if (isCorrect) {
                const minutes = Math.floor(timeTaken / 60);
                const points = Math.max(0, q.marks - minutes);
                p.score += points;
                p.round_points = points;
                p.answered = true;
                sendToClient(peerId, 'answer_result', {correct: true, points_earned: points, lives: p.lives});
            } else {
                p.lives--;
                if (p.lives <= 0) p.locked_out = true;
                sendToClient(peerId, 'answer_result', {correct: false, lives: p.lives, locked_out: p.locked_out});
            }
            
            // Check if everyone is done
            const allDone = Object.values(hostGameState.players).every(pl => pl.answered || pl.locked_out);
            const answeredCount = Object.values(hostGameState.players).filter(pl => pl.answered || pl.locked_out).length;
            
            broadcast('player_answered', {answered: answeredCount, total: Object.keys(hostGameState.players).length});
            
            if (allDone) endRound();
            
        } catch(e) {
            sendToClient(peerId, 'error', {message: "Failed to grade answer"});
            sendToClient(peerId, 'grading_end', {});
        }
    }
}

function broadcastPlayerList() {
    const list = Object.values(hostGameState.players).map(p => ({
        name: p.name, score: p.score, is_host: p.isHost
    }));
    broadcast('player_list', {players: list});
}

function nextQuestion() {
    hostGameState.currentQIndex++;
    if (hostGameState.currentQIndex >= hostGameState.questions.length) {
        // Game Over
        const scores = Object.values(hostGameState.players).sort((a,b) => b.score - a.score);
        broadcast('game_over', {scores, winner: scores[0].name});
        return;
    }
    
    // Reset round state
    Object.values(hostGameState.players).forEach(p => {
        p.lives = 5; p.answered = false; p.locked_out = false; p.round_points = 0;
    });
    
    const q = hostGameState.questions[hostGameState.currentQIndex];
    hostGameState.qStartTime = Date.now();
    
    broadcast('show_question', {
        question_number: hostGameState.currentQIndex + 1,
        total_questions: hostGameState.questions.length,
        marks: q.marks,
        timer_seconds: q.marks * 60,
        image_url: q.image,
        question_text: q.text
    });
}

function endRound() {
    const scores = Object.values(hostGameState.players).sort((a,b) => b.score - a.score);
    broadcast('round_results', {
        scores: scores.map(s => ({name: s.name, score: s.score, round_points: s.round_points || 0})),
        question_number: hostGameState.currentQIndex + 1,
        total_questions: hostGameState.questions.length
    });
}

// Client handles messages from host
function handleServerMessage(msg) {
    const {type, data} = msg;
    
    if (type === 'name_set') {
        state.name = data.name;
        document.getElementById('lobby-room-code').textContent = state.roomCode;
        if (state.isHost) {
            document.getElementById('host-controls').classList.remove('hidden');
            document.getElementById('waiting-host-msg').classList.add('hidden');
        }
        showScreen('screen-lobby');
    }
    
    if (type === 'player_list') {
        const list = document.getElementById('player-list');
        list.innerHTML = '';
        data.players.forEach(p => {
            const card = document.createElement('li');
            card.innerHTML = `<span class="player-name">${p.is_host ? '<span class="host-badge">Host</span>' : '👤'} ${p.name}</span> <span style="font-weight:bold">${p.score} pts</span>`;
            list.appendChild(card);
        });
    }
    
    if (type === 'show_question') {
        document.getElementById('current-q').textContent = data.question_number;
        document.getElementById('total-q').textContent = data.total_questions;
        document.getElementById('q-marks').textContent = data.marks + (data.marks===1?' mark':' marks');
        
        document.getElementById('question-image').src = data.image_url;
        document.getElementById('question-image').style.display = 'block';
        
        const input = document.getElementById('answer-input');
        input.disabled = false; input.value = ''; input.placeholder = "Type your answer...";
        document.getElementById('btn-submit-answer').disabled = false;
        document.getElementById('grading-spinner').classList.add('hidden');
        
        updateLives('lives-container', 5);
        
        setTimer(data.timer_seconds, () => {
            sounds.playTimeUp();
            input.disabled = true;
            document.getElementById('btn-submit-answer').disabled = true;
        });
        
        showScreen('screen-question');
    }
    
    if (type === 'player_answered') {
        document.getElementById('players-answered').textContent = data.answered;
        document.getElementById('total-players-q').textContent = data.total;
    }
    
    if (type === 'grading_start') {
        document.getElementById('answer-input').disabled = true;
        document.getElementById('btn-submit-answer').disabled = true;
        document.getElementById('grading-spinner').classList.remove('hidden');
    }
    if (type === 'grading_end') {
        document.getElementById('answer-input').disabled = false;
        document.getElementById('btn-submit-answer').disabled = false;
        document.getElementById('grading-spinner').classList.add('hidden');
    }
    
    if (type === 'answer_result') {
        document.getElementById('grading-spinner').classList.add('hidden');
        if (data.correct) {
            sounds.playCorrect();
            document.getElementById('points-earned-display').textContent = `+${data.points_earned} points`;
            showScreen('screen-correct');
        } else {
            sounds.playWrong();
            updateLives('wrong-lives', data.lives);
            if (data.locked_out) {
                document.getElementById('wrong-message').textContent = 'No lives left! Waiting for others...';
                document.getElementById('answer-input').placeholder = "Locked out!";
                showScreen('screen-wrong');
            } else {
                document.getElementById('wrong-message').textContent = 'Try again!';
                showScreen('screen-wrong');
                setTimeout(() => {
                    if (document.getElementById('screen-wrong').classList.contains('active')) {
                        showScreen('screen-question');
                        document.getElementById('answer-input').disabled = false;
                        document.getElementById('btn-submit-answer').disabled = false;
                        document.getElementById('answer-input').focus();
                    }
                }, 1500);
            }
        }
    }
    
    if (type === 'round_results') {
        clearInterval(state.timerInterval);
        document.getElementById('scoreboard-title').textContent = `Round ${data.question_number} Results 📊`;
        const list = document.getElementById('scoreboard-list');
        list.innerHTML = '';
        data.scores.forEach((s, idx) => {
            const row = document.createElement('div');
            row.className = 'score-entry';
            row.innerHTML = `<div class="score-rank">${idx === 0 ? '👑' : idx+1}</div>
                             <div class="score-name">${s.name}</div>
                             <div class="score-round">+${s.round_points}</div>
                             <div class="score-total">${s.score}</div>`;
            list.appendChild(row);
        });
        
        if (state.isHost) {
            document.getElementById('host-next-btn-container').classList.remove('hidden');
            document.getElementById('waiting-next-msg').classList.add('hidden');
            document.getElementById('btn-next-question').textContent = 
                (data.question_number === data.total_questions) ? 'Finish Game 🏁' : 'Next Question ➡️';
        }
        showScreen('screen-scoreboard');
    }
    
    if (type === 'game_over') {
        document.getElementById('winner-name').textContent = data.winner;
        const list = document.getElementById('final-scoreboard-list');
        list.innerHTML = '';
        data.scores.forEach((s, idx) => {
            const row = document.createElement('div');
            row.className = 'score-entry';
            row.innerHTML = `<div class="score-rank">${idx === 0 ? '👑' : idx+1}</div>
                             <div class="score-name">${s.name}</div>
                             <div class="score-total">${s.score} pts</div>`;
            list.appendChild(row);
        });
        showScreen('screen-final');
        confetti.start();
    }
    
    if (type === 'error') {
        showToast(data.message);
    }
}

// ===== UI BINDINGS =====

document.getElementById('btn-host-game').addEventListener('click', () => {
    if (!localStorage.getItem('gemini_api_key')) {
        document.getElementById('api-key-modal').style.display = 'flex';
    } else {
        initHost();
    }
});

function closeApiModal() {
    document.getElementById('api-key-modal').style.display = 'none';
}

function saveApiKey() {
    const key = document.getElementById('api-key-input').value.trim();
    if (key) {
        localStorage.setItem('gemini_api_key', key);
        closeApiModal();
        initHost();
    }
}

document.getElementById('btn-join-game').addEventListener('click', () => showScreen('screen-join'));

document.getElementById('btn-submit-join').addEventListener('click', () => {
    const code = document.getElementById('room-code-input').value.toUpperCase();
    if (code.length === 4) initClient(code);
    else showToast('Enter a 4-letter code');
});

document.getElementById('btn-submit-name').addEventListener('click', () => {
    const name = document.getElementById('player-name-input').value.trim();
    if (name) {
        hostGameState.players[state.myPeerId] = {name}; // For host local reference
        sendToServer('set_name', {name});
    }
});

// PDF Upload
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('pdf-upload');
dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', async (e) => {
    if (fileInput.files.length) {
        document.getElementById('upload-status').classList.remove('hidden');
        dropZone.classList.add('hidden');
        try {
            const qs = await processPDF(fileInput.files[0]);
            hostGameState.questions = qs;
            
            // HOST UI UPDATES FOR LOBBY
            document.getElementById('lobby-room-code').textContent = state.roomCode;
            document.getElementById('host-controls').classList.remove('hidden');
            document.getElementById('waiting-host-msg').classList.add('hidden');
            
            const badge = document.getElementById('question-count-badge');
            badge.textContent = `${qs.length} questions ready!`;
            badge.classList.remove('hidden');
            
            if (qs.length > 0) {
                document.getElementById('btn-start-game').disabled = false;
            } else {
                showToast("No questions were extracted. Check PDF or API key.");
            }
            
            showScreen('screen-lobby');
            broadcastPlayerList(); // Update the UI with the host's name
            
        } catch (err) {
            console.error(err);
            showToast("Failed processing PDF: " + err.message);
            document.getElementById('upload-status').classList.add('hidden');
            dropZone.classList.remove('hidden');
        }
    }
});

document.getElementById('btn-start-game').addEventListener('click', () => {
    nextQuestion();
});

document.getElementById('btn-next-question').addEventListener('click', () => {
    nextQuestion();
});

const submitAnswer = () => {
    const answer = document.getElementById('answer-input').value.trim();
    if (answer) {
        sendToServer('submit_answer', {answer});
    }
};
document.getElementById('btn-submit-answer').addEventListener('click', submitAnswer);
document.getElementById('answer-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitAnswer();
});

document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if(peer) peer.destroy();
        showScreen('screen-menu');
    });
});
document.getElementById('btn-return-home').addEventListener('click', () => window.location.reload());
document.getElementById('room-code-box').addEventListener('click', () => {
    navigator.clipboard.writeText(state.roomCode);
    const tooltip = document.querySelector('.tooltip');
    if(tooltip) {
        tooltip.classList.add('show');
        setTimeout(() => tooltip.classList.remove('show'), 2000);
    }
});
