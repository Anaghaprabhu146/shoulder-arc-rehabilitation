=# 🦾 Shoulder Arc – Interactive Shoulder Rehabilitation System

## 📌 Project Overview

Shoulder Arc is a camera-based shoulder rehabilitation application designed to make shoulder exercises more interactive, engaging, and accessible.

The application uses real-time body tracking to monitor shoulder movements, calculate shoulder angles, and track exercise repetitions.

It combines rehabilitation exercises with a cartoon-style **Magical Adventure** game, where users control a magical hero through their arm movements, complete exercise stages, and collect magical stars.

## ✨ Key Features

- **Real-Time Body Tracking:** Tracks body movements using camera-based pose detection.
- **Shoulder Angle Calculation:** Calculates shoulder movement angles using body landmarks.
- **Exercise Repetition Tracking:** Automatically tracks completed repetitions.
- **Hold Duration Tracking:** Monitors how long users maintain the required shoulder positions.
- **90° Cloud Gate:** Guides users through the first shoulder movement stage.
- **120° Star Canopy:** Guides users through the second shoulder movement stage.
- **Magical Adventure Game:** Connects shoulder movements to an interactive cartoon fantasy environment.
- **Character Selection:** Allows users to choose their preferred magical hero.
- **Shoulder Selection:** Supports left and right shoulder exercise selection.
- **Magical Star Collection:** Rewards users with a star after completing a full repetition.
- **Interactive Feedback:** Displays exercise instructions, progress, and achievement messages.
- **Pause and Reset Controls:** Allows users to manage their exercise session.
- **Performance Optimization:** Uses optimized canvas rendering and reduced unnecessary React updates for smoother gameplay.

## 🎮 How the Game Works

1. Select a magical character and the shoulder you want to exercise.
2. Allow camera access and start the adventure.
3. Raise your selected arm to guide the hero upwards.
4. Reach the 90° Cloud Gate and hold the position for 3 seconds.
5. Continue raising your arm to the 120° Star Canopy and hold for 3 seconds.
6. Lower your arm below 90° to complete the repetition.
7. Collect a magical star and continue your adventure!

The game uses the existing shoulder tracking and repetition logic to determine when a repetition is completed.

## 🛠️ Technologies Used

- React
- TypeScript
- JavaScript
- HTML5
- CSS3
- Vite
- MediaPipe Pose Landmarker
- Canvas API
- Browser Camera API
- React Hooks

## 📂 Project Structure

```text
Shoulder-Arc/
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── magicalWorld/
│   │   │   ├── types.ts
│   │   │   ├── worldRenderer.ts
│   │   │   ├── heroRenderer.ts
│   │   │   └── collectiblesRenderer.ts
│   │   │
│   │   ├── ShoulderArcModule.tsx
│   │   ├── MagicalAdventureGame.tsx
│   │   ├── MagicalWorldCanvas.tsx
│   │   ├── CharacterSelection.tsx
│   │   ├── AdventureHud.tsx
│   │   ├── CameraPip.tsx
│   │   ├── analytics.ts
│   │   ├── types.ts
│   │   └── magicalAdventure.css
│   │
│   ├── hooks/
│   │   ├── useCamera.ts
│   │   └── useTracker.ts
│   │
│   ├── services/
│   │   ├── camera/
│   │   └── tracking/
│   │
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
│
├── package.json
├── package-lock.json
├── README.md
└── vite.config.ts
```

*Note: This structure represents the main project files. Adjust it if your final folder structure changes.*

## 🚀 Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Navigate to the project folder

```bash
cd Shoulder-Arc
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

### 5. Open in browser

Open the local URL provided by Vite, usually:

```text
http://localhost:5173
```

**Note:** Allow camera permission when starting an exercise. Camera access may require HTTPS when running outside localhost.

## 🌐 Live Demo

[Shoulder Arc – Live Application]

## 🔮 Future Improvements

- Exercise performance history.
- Therapist dashboard with detailed analytics.
- Additional rehabilitation exercises.
- More interactive game environments.
- Improved movement tracking and accuracy.
- Personalized exercise goals and progress monitoring.

## ⚠️ Important Note

Shoulder Arc is a technology-based rehabilitation support project. It is not a replacement for professional medical advice, diagnosis, or supervision. Users should perform exercises according to guidance from a qualified healthcare professional.

## 👩‍💻 Author

**Anagha Prabhu**

- GitHub: https://github.com/Anaghaprabhu146
- LinkedIn: https://linkedin.com/in/anagha-prabhu

---

⭐ If you find this project interesting, feel free to explore the repository!