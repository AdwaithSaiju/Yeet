# YEET – Task Scheduler App

YEET is a cross-platform task scheduler built with Rust and Tauri, featuring a modern React frontend. It focuses on fast performance, offline-first usage, and a clean, distraction-free user interface.

---

## 🖼️ Screenshot

![YEET App Screenshot](assets/screenshot.png)

---

## ✨ Features

- Create, edit, and delete tasks with due dates and priorities.
- Organize tasks into projects or categories.
- Store data locally using SQLite for reliable offline persistence.
- Run on all major desktop platforms via Tauri (Windows, macOS, and Linux).

---

## 🧩 Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Rust
- **Runtime:** Tauri
- **Database:** SQLite

---

## 🚀 Getting Started

### ✅ Prerequisites

Make sure you have the following installed:

- Node.js and npm (or pnpm/yarn)
- Rust toolchain (via `rustup`)
- Tauri prerequisites for your operating system (see the official Tauri documentation)

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/AdwaithSaiju/Yeet.git
cd Yeet

# Install frontend dependencies
npm install
# or
pnpm install
```

---

## 🛠️ Development

```bash
# Run in development mode
npm run tauri dev
```

This command starts the React development server and launches the Tauri shell in development mode.

---

## 🏗️ Build

```bash
# Build production bundle and desktop app
npm run tauri build
```

This generates a production build and packages the desktop application.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the repository.
2. Create your feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add amazing feature"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the **MIT License**. See the `LICENSE` file for more details.
