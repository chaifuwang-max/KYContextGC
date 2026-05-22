# PowerShell script to create project folder structure
# Usage: .\setup-project.ps1

param(
    [string]$ProjectName = "kappa-psi-context-builder",
    [string]$ProjectPath = (Get-Location)
)

Write-Host "🔧 Creating project structure for: $ProjectName`n" -ForegroundColor Cyan

# Create root directory
$rootDir = Join-Path $ProjectPath $ProjectName
if (Test-Path $rootDir) {
    Write-Host "❌ Directory already exists: $rootDir" -ForegroundColor Red
    exit 1
}

New-Item -ItemType Directory -Path $rootDir | Out-Null
Write-Host "✓ Created root directory: $rootDir" -ForegroundColor Green

# Create subdirectories
$dirs = @(
    'netlify/functions',
    'src',
    'public'
)

foreach ($dir in $dirs) {
    $fullPath = Join-Path $rootDir $dir
    New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
    Write-Host "✓ Created directory: $dir" -ForegroundColor Green
}

# Create package.json
$packageJson = @'
{
  "name": "kappa-psi-context-builder",
  "type": "module",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.38.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  }
}
'@

Set-Content -Path (Join-Path $rootDir "package.json") -Value $packageJson
Write-Host "✓ Created: package.json" -ForegroundColor Green

# Create vite.config.js
$viteConfig = @'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  }
});
'@

Set-Content -Path (Join-Path $rootDir "vite.config.js") -Value $viteConfig
Write-Host "✓ Created: vite.config.js" -ForegroundColor Green

# Create netlify.toml
$netlifyToml = @'
[build]
  command = "npm run build"
  functions = "netlify/functions"
  publish = "dist"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
'@

Set-Content -Path (Join-Path $rootDir "netlify.toml") -Value $netlifyToml
Write-Host "✓ Created: netlify.toml" -ForegroundColor Green

# Create public/index.html
$indexHtml = @'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kappa Psi Context Rule Builder</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
'@

Set-Content -Path (Join-Path $rootDir "public" "index.html") -Value $indexHtml
Write-Host "✓ Created: public/index.html" -ForegroundColor Green

# Create src/main.jsx
$mainJsx = @'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
'@

Set-Content -Path (Join-Path $rootDir "src" "main.jsx") -Value $mainJsx
Write-Host "✓ Created: src/main.jsx" -ForegroundColor Green

# Create src/index.css
$indexCss = @'
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --scarlet: #CC2200;
  --scarlet-light: #FFF0EE;
  --scarlet-border: #F5C4B3;
  --gray: #6B7280;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #f9f9f7;
  color: #1a1a1a;
  line-height: 1.6;
}

button {
  font-family: inherit;
  font-size: 13px;
  padding: 8px 16px;
  background: white;
  border: 0.5px solid #d5d5d0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

button:hover:not(:disabled) {
  background: #f5f5f2;
  border-color: #aaa;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

input, select, textarea {
  font-family: inherit;
  font-size: 13px;
  padding: 8px;
  border: 0.5px solid #d5d5d0;
  border-radius: 6px;
  background: white;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--scarlet);
  box-shadow: 0 0 0 2px rgba(204, 34, 0, 0.1);
}

.container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 280px;
  border-right: 0.5px solid #d5d5d0;
  overflow-y: auto;
  background: #fafaf9;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  padding: 16px;
  border-bottom: 0.5px solid #d5d5d0;
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  height: 3px;
  background: #d5d5d0;
}

.progress-bar-fill {
  height: 100%;
  background: var(--scarlet);
  transition: width 0.3s ease;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.section-header {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 6px;
  background: var(--scarlet-light);
  color: var(--scarlet);
  border: 0.5px solid var(--scarlet-border);
}

.section-text {
  background: white;
  border: 0.5px solid #d5d5d0;
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 20px;
  font-size: 13px;
  line-height: 1.75;
  color: #666;
}

.form-card {
  background: white;
  border: 0.5px solid #d5d5d0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.form-card h4 {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 11px;
  font-weight: 500;
  color: #666;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
  font-family: 'Segoe UI', sans-serif;
}

.save-btn {
  background: var(--scarlet);
  color: white;
  border: none;
  font-weight: 500;
}

.save-btn:hover:not(:disabled) {
  background: #aa1a00;
}

.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  font-size: 18px;
  margin-bottom: 12px;
}

.modal-content p {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
  line-height: 1.6;
}

.warning-box {
  background: var(--scarlet-light);
  border: 0.5px solid var(--scarlet-border);
  border-radius: 6px;
  padding: 12px;
  margin: 12px 0;
  font-size: 12px;
  color: var(--scarlet);
  font-weight: 500;
}

.modal-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 16px;
}
'@

Set-Content -Path (Join-Path $rootDir "src" "index.css") -Value $indexCss
Write-Host "✓ Created: src/index.css" -ForegroundColor Green

# Create placeholder for App.jsx
$appJsxPlaceholder = @'
// TODO: Copy App.jsx content here
// See DEPLOYMENT_GUIDE.md for the complete App.jsx code
import React from 'react';

export default function App() {
  return (
    <div>
      <h1>Kappa Psi Context Rule Builder</h1>
      <p>Replace this with the full App.jsx code from the deployment guide.</p>
    </div>
  );
}
'@

Set-Content -Path (Join-Path $rootDir "src" "App.jsx") -Value $appJsxPlaceholder
Write-Host "✓ Created: src/App.jsx (placeholder - see below)" -ForegroundColor Yellow

# Create placeholder for generate-schema.js
$generateSchemaPlaceholder = @'
// TODO: Copy generate-schema.js content here
// See DEPLOYMENT_GUIDE.md for the complete Netlify Function code

exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Replace with full generate-schema.js code' })
  };
};
'@

Set-Content -Path (Join-Path $rootDir "netlify" "functions" "generate-schema.js") -Value $generateSchemaPlaceholder
Write-Host "✓ Created: netlify/functions/generate-schema.js (placeholder - see below)" -ForegroundColor Yellow

# Create .gitignore
$gitignore = @'
node_modules/
dist/
.env
.env.local
.DS_Store
*.log
.netlify
'@

Set-Content -Path (Join-Path $rootDir ".gitignore") -Value $gitignore
Write-Host "✓ Created: .gitignore" -ForegroundColor Green

# Create .env.example
$envExample = @'
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Anthropic (Netlify Functions only)
ANTHROPIC_API_KEY=sk-ant-your-key-here
'@

Set-Content -Path (Join-Path $rootDir ".env.example") -Value $envExample
Write-Host "✓ Created: .env.example" -ForegroundColor Green

# Create README with next steps
$readme = @'
# Kappa Psi Context Rule Builder

Collaborative annotation tool for building context rules from the Kappa Psi Constitution.

## Setup

1. **Install dependencies:**
   ```
   npm install
   ```

2. **Copy files from deployment guide:**
   - Replace `src/App.jsx` with the full App.jsx code from DEPLOYMENT_GUIDE.md
   - Replace `netlify/functions/generate-schema.js` with the full code from DEPLOYMENT_GUIDE.md

3. **Set up Supabase (see DEPLOYMENT_GUIDE.md Part 1):**
   - Create a new project at supabase.com
   - Run the SQL setup queries
   - Copy your Project URL and anon key

4. **Create `.env.local`:**
   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ANTHROPIC_API_KEY=sk-ant-your-key
   ```

5. **Start dev server:**
   ```
   npm run dev
   ```

6. **Deploy to Netlify:**
   - Connect your GitHub repo
   - Add the environment variables to Netlify
   - Netlify will auto-deploy on push

## Next Steps

See DEPLOYMENT_GUIDE.md for complete setup instructions.
'@

Set-Content -Path (Join-Path $rootDir "README.md") -Value $readme
Write-Host "✓ Created: README.md" -ForegroundColor Green

Write-Host "`n✅ Project structure created successfully!`n" -ForegroundColor Green

Write-Host "📋 Next steps:`n" -ForegroundColor Cyan
Write-Host "1. cd $ProjectName" -ForegroundColor White
Write-Host "2. Copy the complete App.jsx code to: src/App.jsx" -ForegroundColor White
Write-Host "3. Copy the complete generate-schema.js code to: netlify/functions/generate-schema.js" -ForegroundColor White
Write-Host "4. Follow Part 1 of DEPLOYMENT_GUIDE.md to set up Supabase" -ForegroundColor White
Write-Host "5. Create .env.local with your Supabase + Anthropic credentials" -ForegroundColor White
Write-Host "6. Run: npm install" -ForegroundColor White
Write-Host "7. Run: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "📚 Full setup guide: DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan
