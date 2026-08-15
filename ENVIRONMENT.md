# بيئة التطوير | Environment

## نظرة عامة

يحتوي هذا الملف على إعدادات بيئة التطوير لمشروع مرشد أذكار.

---

## المتطلبات الأساسية

### البرامج المطلوبة

| البرنامج | الإصدار | الرابط | ملاحظات |
|----------|---------|--------|---------|
| Node.js | >= 18.x | https://nodejs.org | runtime |
| npm | >= 9.x | يتضمنه Node.js | package manager |
| Git | >= 2.x | https://git-scm.com | version control |
| Python | >= 3.x | https://python.org | TTS only |
| VS Code | آخر إصدار | https://code.visualstudio.com | IDE |

### إضافات VS Code المطلوبة

| الإضافة | الرابط |
|---------|--------|
| ESLint | `dbaeumer.vscode-eslint` |
| Prettier | `esbenp.prettier-vscode` |
| Tailwind CSS | `bradlc.vscode-tailwindcss` |
| ES7+ Snippets | `dsznajder.es7-react-js-snippets` |
| GitLens | `eamodio.gitlens` |

---

## إعدادات Node.js

### .nvmrc
```
18
```

### .node-version
```
18
```

---

## متغيرات البيئة

### ملف .env.example

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Aladhan API
VITE_ALADHAN_API_URL=https://api.aladhan.com/v1

# Application
VITE_APP_NAME=مرشد أذكار
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development

# Edge TTS (Python)
EDGE_TTS_VOICE=ar-SA-HamedNeural
EDGE_TTS_RATE=+0%
EDGE_TTS_VOLUME=+0%
```

### متغيرات Electron

```bash
# Electron
ELECTRON_IS_DEV=1
ELECTRON_NO_ATTACH_CONSOLE=0
```

---

## إعدادات النظام

### Windows
```powershell
# Set execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Install Windows Build Tools
npm install -g windows-build-tools

# Set Python path
$env:PYTHONPath="C:\Python3x"
```

### macOS
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Python
brew install python
```

### Linux
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y nodejs npm python3 python3-pip git

# Fedora
sudo dnf install -y nodejs npm python3 python3-pip git
```

---

## إعدادات Git

### .gitattributes
```
* text=auto
*.js text eol=lf
*.jsx text eol=lf
*.ts text eol=lf
*.tsx text eol=lf
*.json text eol=lf
*.md text eol=lf
*.css text eol=lf
*.html text eol=lf
*.cjs text eol=crlf
*.exe binary
*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.ico binary
*.woff binary
*.woff2 binary
*.ttf binary
*.mp3 binary
*.m4a binary
*.wav binary
```

### .editorconfig
```ini
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false

[*.{cjs,ps1}]
end_of_line = crlf
```

---

## إعدادات ESLint

### .eslintrc.json
```json
{
  "env": {
    "browser": true,
    "es2024": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended"
  ],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "plugins": ["react", "react-hooks"],
  "rules": {
    "react/prop-types": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
```

---

## إعدادات Prettier

### .prettierrc
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "jsxBracketSameLine": false,
  "arrowParens": "always"
}
```

### .prettierignore
```
node_modules
dist
release
build
coverage
*.md
*.json
package-lock.json
```

---

## إعدادات Tailwind CSS

### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'cairo': ['Cairo', 'sans-serif'],
        'amiri': ['Amiri Quran', 'serif'],
      },
      colors: {
        'primary': '#1a1a2e',
        'secondary': '#16213e',
        'accent': '#0f3460',
        'gold': '#e94560',
      },
    },
  },
  plugins: [],
}
```

---

## إعدادات Vite

### vite.config.js
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          animation: ['framer-motion'],
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  preview: {
    port: 4173,
  },
});
```

---

## ملاحظات

1. **Python:** مطلوب فقط لتوليد الصوت (TTS)
2. **Node.js:** الإصدار 18+ مطلوب لتشغيل المشروع
3. **Git:** مطلوب لإدارة الإصدارات
4. **VS Code:** IDE مقترح للتطوير

---

**المرجع:** [README.md](README.md) | [CONTRIBUTING.md](CONTRIBUTING.md)
