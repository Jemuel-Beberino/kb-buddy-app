<div align="center">
  <img src="assets/images/logo.png" alt="KB Buddy Logo" width="300" />
  <h1>KB Buddy: Klaro Basa</h1>
  <p><strong>An offline-first, bilingual EdTech app built on React Native and Expo.</strong></p>
  
  <!-- Badges -->
  <p>
    <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
    <img src="https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
    <img src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
    <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  </p>
</div>

---

## Overview

**KB Buddy** is a mobile educational application designed to improve reading comprehension and vocabulary for elementary learners. It features a dual-language (English & Bisaya) interactive reading experience and includes a dedicated Teacher Portal for monitoring progress and authoring custom lessons.

Built with an **offline-first architecture**, learners can continue reading, answering quizzes, and tracking their streaks even without an internet connection—perfect for schools with limited connectivity.

## Key Features

### For Learners
- **Bilingual Story Reader:** Read stories side-by-side in English and Bisaya.
- **Interactive Vocabulary:** Tap highlighted words to see their definitions.
- **Text-to-Speech:** Listen to the story read aloud.
- **Dynamic Quizzes:** Test comprehension with Multiple Choice and Fill-in-the-Blank questions.
- **Progress Tracking:** Earn streaks, track vocabulary learned, and view overall progress.
- **Peer Tutoring Rules:** A guided onboarding screen to promote a positive learning environment.

### For Teachers
- **Live Analytics Dashboard:** Monitor learner averages, stories completed, and active streaks.
- **Performance Tiers:** Quickly identify learners who need help based on score thresholds (High, Medium, Low).
- **Story Authoring Tool:** Create and edit custom bilingual stories, vocabulary words, and quizzes directly within the app.

## Tech Stack

- **Frontend:** React Native (Expo)
- **Navigation:** React Navigation (Bottom Tabs & Native Stack)
- **Database:** `expo-sqlite` (Local offline storage)
- **State/Context:** React Context API + `AsyncStorage` for user preferences
- **Animations:** React Native Animated API & `expo-linear-gradient`
- **Audio:** `expo-speech` (Text-to-Speech)
- **Icons & Typography:** `@expo/vector-icons` & `@expo-google-fonts/fredoka`

## Getting Started

### Prerequisites
Make sure you have Node.js and Expo CLI installed on your machine.

### Installation & Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Jemuel-Beberino/kb-buddy-app.git
   cd kb-buddy-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npx expo start
   ```

4. **Run the app:**
   - Scan the QR code with the **Expo Go** app on your physical device.
   - Or press `a` to open in an Android Emulator.

## Demo Credentials

To make testing easier for reviewers, use these pre-configured accounts:

| Role | ID / Email | PIN / Password |
| :--- | :--- | :--- |
| **Learner** | `KS-12345` | `1234` |
| **Teacher** | `teacher@demo` | `admin123` |

*(Note: The teacher login is currently hardcoded for demo purposes. The learner login is backed by the local SQLite database).*

## Screenshots

| Student Login | Welcome Screen | Teacher Login|
| :---: | :---: | :---: |
| <img src="screenshots/Student%20Login.jpe" width="220" /> | <img src="screenshots/Welcome%20Screen.jpe" width="220" /> | <img src="screenshots/TeacherLogin.jpe" width="220" /> |

| Story Library | Reader Screen | Vocabulary Popup |
| :---: | :---: | :---: |
| <img src="screenshots/Student%20Stories.jpe" width="220" /> | <img src="screenshots/Reader%20Screen.jpe" width="220" /> | <img src="screenshots/Vocabulary.jpe" width="220" /> |

| Student Progress | Student Profile | Teacher Analytics |
| :---: | :---: | :---: |
| <img src="screenshots/Student%20Progress.jpe" width="220" /> | <img src="screenshots/Student%20Profile.jpe" width="220" /> | <img src="screenshots/Teachers%20Dashboard.jpe" width="220" /> | 


## Author

**Jemuel Beberino**
- Project Context: Software Engineering 2 & Mobile Computing 2
- GitHub: [@Jemuel-Beberino](https://github.com/Jemuel-Beberino)

---
<div align="center">
  <p>Built with love for Bisaya learners.</p>
</div>
