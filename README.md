# 👻 Project Ghost (Ghost Browser)

**The Ultimate Gaming Overlay Browser**

Project Ghost is a transparent, always-on-top overlay browser designed for gamers and multitaskers. It allows you to watch content (YouTube, Netflix, etc.) or browse the web while playing games, without Alt-Tabbing. It supports "click-through" (Ghost Mode) so it doesn't interfere with your gameplay.

---

## ⚡ Shortcuts (Memorize These!)

Since the browser is an overlay, keyboard shortcuts are the primary way to control it while gaming.

| Shortcut | Function | Description |
| :--- | :--- | :--- |
| **`Ctrl + Shift + X`** | **Open Command Center** | Wakes up the browser. Shows the search bar and enables mouse interaction. Use this to change URL, adjust opacity, or change settings. |
| **`Ctrl + Shift + Z`** | **Toggle Stealth Mode** | Hides the UI and enables "Click-Through". You can see the video, but your mouse clicks will go `through` the browser window to your game. |
| **`Ctrl + Shift + H`** | **Hide / Unhide All** | Completely hides the entire overlay (video and all). Useful for boss keys or needed screen real estate. |

---

## 🚀 How to Use

### 1. Installation
Ensure you have Node.js installed, then run:
```bash
npm install
```

### 2. Running the App
To start the Ghost Browser:
```bash
npm start
```

### 3. Basic Navigation
1. Press `Ctrl + Shift + X` to open the Command Center.
2. Type a URL (e.g., `youtube.com`) and hit Enter.
3. Use the **Opacity Slider** to adjust how transparent the window is.
4. Press `Ctrl + Shift + Z` to lock it in "Stealth Mode" and go back to your game.

---

## 📽️ Projector Mode (Netflix, Prime Video, Disney+)
Streaming services like Netflix use DRM (HDCP) which normally prevents screen capture. Project Ghost bypasses this with **Projector Mode**.

1. **Enter URL:** Type `netflix.com` (or Prime/Disney+) in the Command Center.
2. **Auto-Launch:** Ghost will automatically launch a special "External Chrome" window.
3. **Play Video:** Log in and start playing your video in that new Chrome window.
4. **Project It:** Go back to the Ghost Overlay and click **"START PROJECTOR"**.
5. **Select Window:** Ghost will scan for the window and "project" it onto your overlay.

---

## ✨ Features

- **Ghost Mode (Default):** The window is visible but mostly transparent to mouse events until you activate Command Mode.
- **Glass FX:** A button in the Command Center that attempts to make the background of web pages (like YouTube) transparent, leaving only the video/content visible.
- **Stealth Mode:** Disables all UI elements and allows full click-through to your game.
- **Opacity Control:** Fine-tune visibility to blend perfectly with your game HUD.

---

## 🔧 Troubleshooting

- **"Source Window Not Found":** Make sure the external window (Chrome/Netflix) is open and not minimized when you click "Start Projector".
- **Shortcuts not working:** Ensure the app is running (check your taskbar). Some anti-cheat software might block global shortcuts, though this is rare.
