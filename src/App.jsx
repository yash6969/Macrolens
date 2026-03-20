import { useState, useMemo } from 'react';
import './App.css';

const MACRO_MATRIX = {
  weak_low: {
    environment: 'Deflation / Recession',
    strategy: 'Defensive / Capital Preservation',
    regime: 'Earnings-driven / Low Beta',
    baseSectors: ['FMCG', 'Pharma', 'Bonds', 'Utilities'],
    x: 25,
    y: 75
  },
  weak_high: {
    environment: 'Stagflation',
    strategy: 'Real Assets / Pricing Power',
    regime: 'Value / Dividend Yield',
    baseSectors: ['Gold', 'Commodities', 'Staples', 'Energy'],
    x: 25,
    y: 25
  },
  strong_low: {
    environment: 'Goldilocks / Expansion',
    strategy: 'Risk-On / Growth',
    regime: 'Liquidity-driven / High Beta',
    baseSectors: ['Tech', 'Consumer Discretionary', 'Real Estate', 'Financials'],
    x: 75,
    y: 75
  },
  strong_high: {
    environment: 'Overheating / Reflation',
    strategy: 'Cyclical / Momentum',
    regime: 'Earnings-driven / Mid-to-Late Cycle',
    baseSectors: ['Capital Goods', 'Industrials', 'PSU Banks', 'Energy'],
    x: 75,
    y: 25
  }
};

function ToggleControl({ label, options, value, onChange, liveValue }) {
  return (
    <div className="control-group">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4px' }}>
        <div className="control-label">{label}</div>
        {liveValue && liveValue !== '--' && (
          <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
            Live: {liveValue}
          </div>
        )}
      </div>
      <div className="toggle-switch">
        <div 
          className="toggle-slider" 
          style={{ transform: value === options[1] ? 'translateX(100%)' : 'translateX(0)' }}
        />
        {options.map((opt) => (
          <div 
            key={opt}
            className={`toggle-option ${value === opt ? 'active' : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt}
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [growth, setGrowth] = useState('weak');
  const [inflation, setInflation] = useState('low');
  const [rates, setRates] = useState('falling');
  const [liquidity, setLiquidity] = useState('strong');

  const [gdpValue, setGdpValue] = useState('--');
  const [cpiValue, setCpiValue] = useState('--');
  const [repoValue, setRepoValue] = useState('--');
  const [liqValue, setLiqValue] = useState('--');

  const scenarioKey = `${growth}_${inflation}`;
  const currentScenario = MACRO_MATRIX[scenarioKey] || MACRO_MATRIX.weak_low;

  const sectors = useMemo(() => {
    let s = [...currentScenario.baseSectors];
    if (rates === 'rising' && !s.includes('Value/Large Caps')) s.push('Value/Large Caps');
    if (liquidity === 'tight' && !s.includes('Cash Rich Cos')) s.push('Cash Rich Cos');
    if (rates === 'falling' && liquidity === 'strong' && !s.includes('Small Caps')) s.push('Small Caps');
    return s.slice(0, 5);
  }, [currentScenario, rates, liquidity]);

  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchFromGemini = async () => {
    if (!apiKey) {
      alert("Please enter a Gemini API Key to fetch live data.");
      return;
    }
    setIsLoading(true);
    try {
      const prompt = `You are an automated macroeconomic data extractor API. Use the googleSearch tool to find the exact latest live values for the Indian Economy:
1. Current annual GDP Growth %
2. Current CPI Inflation %
3. Current RBI Repo Rate %
4. Current Banking System Liquidity status

Classify them strictly using these rules:
"growth": If GDP is >= 6.0%, "strong". Else "weak".
"inflation": If CPI is >= 4.5%, "high". Else "low".
"rates": If Repo Rate is >= 6.0% or recently paused at peak, "rising". Else "falling".
"liquidity": If liquidity is tight or in deficit, "tight". Else "strong".

CRITICAL INSTRUCTION: You MUST respond ONLY with a raw JSON object exactly matching this format. Do NOT use markdown code blocks (\`\`\`json). Do NOT add conversational text. Failure to output raw JSON will crash the system. 
{"gdp_val": "X.X%", "cpi_val": "X.X%", "repo_val": "X.X%", "liq_val": "Deficit/Surplus", "growth": "strong", "inflation": "high", "rates": "rising", "liquidity": "tight"}`;
      
      const payload = {
        systemInstruction: { parts: [{ text: "You are a backend API module. Your sole purpose is to output valid JSON without any markdown formatting or human conversational text." }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        tools: [{ googleSearch: {} }],
        generationConfig: { temperature: 0.1 }
      };

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      
      let textResponse = data.candidates[0].content.parts[0].text;
      console.log("Raw Gemini Output:", textResponse);
      
      let parsed = {};
      try {
        const jsonMatch = textResponse.match(/\{[\s\S]*?\}/);
        if (!jsonMatch) throw new Error("No JSON object found");
        parsed = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.warn("Fallback Text Parser activated because Gemini produced non-JSON:", parseError);
        const lower = textResponse.toLowerCase();
        
        parsed.growth = (lower.includes("weak") && !lower.includes("strong")) ? "weak" : "strong";
        parsed.inflation = (lower.includes("low") && !lower.includes("high")) ? "low" : "high";
        parsed.rates = (lower.includes("falling") && !lower.includes("rising")) ? "falling" : "rising";
        parsed.liquidity = (lower.includes("strong") && !lower.includes("tight")) ? "strong" : "tight";
        parsed.gdp_val = "Parsed Text";
        parsed.cpi_val = "Parsed Text";
        parsed.repo_val = "Parsed Text";
        parsed.liq_val = "Parsed Text";
      }
      
      if (parsed.growth) setGrowth(parsed.growth.toLowerCase());
      if (parsed.inflation) setInflation(parsed.inflation.toLowerCase());
      if (parsed.rates) setRates(parsed.rates.toLowerCase());
      if (parsed.liquidity) setLiquidity(parsed.liquidity.toLowerCase());
      
      if (parsed.gdp_val) setGdpValue(parsed.gdp_val);
      if (parsed.cpi_val) setCpiValue(parsed.cpi_val);
      if (parsed.repo_val) setRepoValue(parsed.repo_val);
      if (parsed.liq_val) setLiqValue(parsed.liq_val);
      
    } catch (err) {
      console.error(err);
      alert("Error fetching from Gemini: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-title">Macro Regime Simulator</div>
        <div className="outputs">
          <div className="output-item">
            <span className="output-label">Environment</span>
            <span className="output-value">{currentScenario.environment}</span>
          </div>
          <div className="output-item">
            <span className="output-label">Strategy</span>
            <span className="output-value">{currentScenario.strategy}</span>
          </div>
          <div className="output-item">
            <span className="output-label">Regime</span>
            <span className="output-value">{currentScenario.regime}</span>
          </div>
        </div>
      </header>

      <div className="main-content">
        <div className="controls-container">
          <ToggleControl 
            label="Growth" 
            options={['weak', 'strong']} 
            value={growth} 
            onChange={setGrowth} 
            liveValue={gdpValue}
          />
          <ToggleControl 
            label="Inflation" 
            options={['low', 'high']} 
            value={inflation} 
            onChange={setInflation} 
            liveValue={cpiValue}
          />
          <ToggleControl 
            label="Interest Rates" 
            options={['falling', 'rising']} 
            value={rates} 
            onChange={setRates} 
            liveValue={repoValue}
          />
          <ToggleControl 
            label="Liquidity" 
            options={['strong', 'tight']} 
            value={liquidity} 
            onChange={setLiquidity} 
            liveValue={liqValue}
          />
          
          <div style={{flexGrow: 1}}></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <input 
              type="password" 
              placeholder="Enter Gemini API Key" 
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)}
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(0,0,0,0.3)',
                color: 'white',
                fontSize: '0.8rem'
              }}
            />
            <button className="scenario-button" onClick={fetchFromGemini} disabled={isLoading}>
              {isLoading ? 'AI Analyzing India...' : 'AI Live Load (Gemini Search)'}
            </button>
          </div>
        </div>

        <div className="visual-area">
          <div className="grid-container">
            <div className={`quadrant q2 ${scenarioKey === 'weak_high' ? 'active' : ''}`}>
              <span className="quadrant-label">STAGFLATION</span>
            </div>
            <div className={`quadrant q1 ${scenarioKey === 'strong_high' ? 'active' : ''}`}>
              <span className="quadrant-label">OVERHEATING</span>
            </div>
            <div className={`quadrant q3 ${scenarioKey === 'weak_low' ? 'active' : ''}`}>
              <span className="quadrant-label">DEFLATION</span>
            </div>
            <div className={`quadrant q4 ${scenarioKey === 'strong_low' ? 'active' : ''}`}>
              <span className="quadrant-label">GOLDILOCKS</span>
            </div>

            <span className="axis-label y-axis-high">High Inflation</span>
            <span className="axis-label y-axis-low">Low Inflation</span>
            <span className="axis-label x-axis-weak" style={{ bottom: '1rem' }}>Weak Growth</span>
            <span className="axis-label x-axis-strong" style={{ bottom: '1rem' }}>Strong Growth</span>

            <div 
              className="target-dot"
              style={{ top: `${currentScenario.y}%`, left: `${currentScenario.x}%` }}
            ></div>
          </div>

          <div className="sectors-panel">
            <div className="sectors-title">Sector Focus</div>
            <div className="sectors-list">
              {sectors.map(sector => (
                <div key={sector} className="sector-chip">{sector}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
