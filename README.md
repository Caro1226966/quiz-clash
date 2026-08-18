# 📝 Quiz Clash!

A 100% browser-based multiplayer quiz game where you upload past paper PDFs and compete with friends to answer questions fastest. 

**No servers, no installations, no ngrok.** Just pure Peer-to-Peer web magic!

## 🚀 How to Play

Because this game uses WebRTC (PeerJS) to connect players directly to each other, you can literally just open the `index.html` file in your browser, or host it on GitHub Pages for free!

1. Open `index.html` in your web browser.
2. Click **Host Game**.
3. *First time only:* You'll be prompted to enter a **Google Gemini API Key**.
   - Get one for free at [Google AI Studio](https://aistudio.google.com/apikey).
   - This key is saved locally in your browser and is only used to read your PDFs.
4. Upload a past paper PDF. The game uses **PDF.js** to render it, and Gemini AI to extract and solve the questions automatically.
5. Get your **Room Code**.
6. Send the website link and your room code to your friends! They just click **Join Game** and enter the code to play.

## 🎮 Game Flow
1. **Host** uploads a PDF of past paper questions.
2. The Host's browser asks Gemini to read each question, identify marks, and solve them.
3. Questions are shown one at a time to all players.
4. Timer is based on marks: **1 minute per mark**.
5. Players type their answers. The Host's browser silently validates them.
6. Points awarded based on speed, lives prevent answer spamming!

### Scoring
For a question worth **M marks**, the timer is **M minutes**:

| Speed | Points |
|-------|--------|
| Answered in first minute | M points (maximum) |
| Each additional minute | −1 point |
| Time runs out | 0 points |

### Lives
- **5 lives per question** (reset each round)
- Each **wrong answer costs 1 life**
- At **0 lives**, you're locked out for that question.

## 🔧 Architecture

- **Static Website:** No backend! Can be hosted anywhere (GitHub Pages, Vercel, Netlify).
- **Networking:** `PeerJS` (WebRTC) connects players directly to the host's browser.
- **PDF Processing:** `PDF.js` processes the file into images locally.
- **AI AI AI:** Direct `fetch` calls to the Gemini REST API.
