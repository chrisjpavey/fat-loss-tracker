# Fat Loss Tracker

A mobile-first PWA for daily fat loss tracking — weight, calories, protein, hunger, energy, training quality, and snack control. Generates a weekly check-in report ready to paste to your AI coach.

---

## Getting it live on your phone (step by step)

### Step 1 — Create a GitHub account (if you don't have one)
Go to [github.com](https://github.com) and sign up. It's free.

---

### Step 2 — Create a new repository
1. Click the **+** button (top right) → **New repository**
2. Name it: `fat-loss-tracker`
3. Set it to **Public** (required for free GitHub Pages)
4. Leave everything else as default
5. Click **Create repository**

---

### Step 3 — Upload the files
You have two options:

**Option A — GitHub web interface (no coding required)**
1. On your new repo page, click **uploading an existing file**
2. Drag the entire `flt-app` folder contents in — you need to maintain the folder structure:
   - Upload `package.json`, `vite.config.js`, `index.html`, `.gitignore` to the root
   - Upload `src/main.jsx` and `src/App.jsx` into a folder called `src`
   - Upload `public/icon-192.png`, `public/icon-512.png`, `public/apple-touch-icon.png` into a folder called `public`
   - Upload `.github/workflows/deploy.yml` into `.github/workflows/`
3. Click **Commit changes**

**Option B — Git command line (faster)**
```bash
cd flt-app
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/fat-loss-tracker.git
git push -u origin main
```
Replace `YOUR_USERNAME` with your GitHub username.

---

### Step 4 — Enable GitHub Pages
1. Go to your repo → **Settings** tab
2. In the left sidebar, click **Pages**
3. Under **Source**, select **GitHub Actions**
4. That's it — the workflow will run automatically on every push

---

### Step 5 — Wait for deployment (~2 minutes)
1. Go to the **Actions** tab in your repo
2. You'll see a workflow running called "Deploy to GitHub Pages"
3. Wait for the green tick ✓
4. Your app URL will be: `https://YOUR_USERNAME.github.io/fat-loss-tracker/`

---

### Step 6 — Add to your iPhone home screen
1. Open Safari on your iPhone (must be Safari, not Chrome)
2. Go to your app URL: `https://YOUR_USERNAME.github.io/fat-loss-tracker/`
3. Tap the **Share** button (the box with an arrow pointing up)
4. Scroll down and tap **Add to Home Screen**
5. Name it **FLT** or **Fat Loss Tracker**
6. Tap **Add**

It will now appear on your home screen as a full-screen app with no browser chrome. Data is stored locally on your device.

---

## Making changes

If you ever want to update the app (e.g. change your calorie target):

1. Open `src/App.jsx` in GitHub (click the file, then the pencil icon to edit)
2. Change `const CALORIE_TARGET = 2150` or `const PROTEIN_TARGET = 140` at the top
3. Click **Commit changes**
4. The app will auto-rebuild and deploy within ~2 minutes
5. Pull down to refresh on your phone and it will update

---

## Data & privacy

All your data is stored locally in your phone's browser storage (`localStorage`). Nothing is sent anywhere. If you delete Safari's data or uninstall, your logs will be lost — so occasionally screenshot your week view as a backup.
