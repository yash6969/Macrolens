# Macrolens (Macro Regime Simulator)

🌐 **Live Demo:** [https://yash6969.github.io/Macrolens/](https://yash6969.github.io/Macrolens/)

Macrolens is a React-based visual dashboard designed to model macroeconomic environments and highlight sector-specific investment regimes. By adjusting global economic levers (Growth, Inflation, Rates, and Liquidity), users can simulate top-down market conditions and watch the simulator dynamically assign the current market strategy (e.g., Goldilocks, Stagflation, Overheating, or Deflation).

## ✨ Features
- **Dynamic 2x2 Grid Visualization:** Watch real-time quadrant shifts between Deflation, Stagflation, Overheating, and Goldilocks regimes.
- **Interactive Macro Levers:** Manual toggles for Growth, Inflation, Interest Rates, and System Liquidity.
- **Sector Output:** Instant dynamic adjustments of expected outperforming sectors (e.g., Small Caps, Value/Large Caps, Cash Rich Cos) depending on monetary policy.
- **Live AI Integration:** Built-in connection to the **Gemini 2.5 Flash API** using `googleSearch` grounding. You can optionally securely enter a Gemini API key to allow the dashboard to autonomously scrape live news for current Indian economic numbers (GDP %, CPI %, RBI Repo rate) and lock the simulator to the exact real-world scenario.

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yash6969/Macrolens.git
   cd "Macro Simulator"
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the localhost URL provided (usually `http://localhost:5173`).

---

## 🧠 How to Use

### Manual Simulation
1. Use the toggle buttons on the left panel to change individual metrics.
2. The grid dot will animate to the resulting economic quadrant. 
3. Observe the `Environment`, `Strategy`, and `Regime` outputs at the top.

### AI Live Load (Live Data Fetching)
1. Get a **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Paste the key into the input field at the bottom left of the application.
3. Click **"AI Live Load (Gemini Search)"**.
4. The dashboard will trigger the LLM to search the live internet for India's exact current GDP, Inflation, and monetary policy constraints.
5. The specific values will render directly above the levers (e.g., `Live: 8.4%`), and the simulation will automatically map itself to real life!

---

*Built with React & Vite. Styled entirely with vanilla CSS for an ultra-premium glassmorphic aesthetic.*
