import { useEffect, useState } from "react";

const analysisSteps = [
  "Loading demand data...",
  "Analyzing supply chain patterns...",
  "Calibrating forecast models...",
  "Optimizing inventory levels...",
  "Preparing dashboard...",
];

export default function SplashScreen() {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStep((prev) => (prev < analysisSteps.length - 1 ? prev + 1 : prev));
    }, 800);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        // Slow down as we approach 100
        const increment = Math.max(1, (100 - prev) / 15);
        return Math.min(100, prev + increment);
      });
    }, 120);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="splash-screen">
      {/* Animated background grid */}
      <div className="splash-grid" />

      {/* Floating data particles */}
      <div className="splash-particles">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="splash-particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              fontSize: `${10 + Math.random() * 14}px`,
              opacity: 0.15 + Math.random() * 0.25,
            }}
          >
            {["📊", "📈", "📉", "🔍", "⚡", "📦", "🔄", "🎯", "💡", "🧮", "📋", "🔗"][i]}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="splash-content">
        {/* Logo / Icon */}
        <div className="splash-icon-wrapper">
          <div className="splash-icon">
            {/* Animated bar chart SVG */}
            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Grid lines */}
              <line x1="15" y1="65" x2="75" y2="65" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
              <line x1="15" y1="50" x2="75" y2="50" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
              <line x1="15" y1="35" x2="75" y2="35" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />
              <line x1="15" y1="20" x2="75" y2="20" stroke="currentColor" strokeWidth="0.5" opacity="0.15" />

              {/* Bars with animation */}
              <rect className="splash-bar bar-1" x="20" y="45" width="8" height="20" rx="2" />
              <rect className="splash-bar bar-2" x="32" y="30" width="8" height="35" rx="2" />
              <rect className="splash-bar bar-3" x="44" y="15" width="8" height="50" rx="2" />
              <rect className="splash-bar bar-4" x="56" y="35" width="8" height="30" rx="2" />

              {/* Trend line */}
              <polyline
                className="splash-trend"
                points="24,55 36,40 48,25 60,45"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.8"
              />

              {/* Data points */}
              <circle className="splash-dot dot-1" cx="24" cy="55" r="3" fill="currentColor" />
              <circle className="splash-dot dot-2" cx="36" cy="40" r="3" fill="currentColor" />
              <circle className="splash-dot dot-3" cx="48" cy="25" r="3" fill="currentColor" />
              <circle className="splash-dot dot-4" cx="60" cy="45" r="3" fill="currentColor" />
            </svg>
          </div>

          {/* Pulsing ring */}
          <div className="splash-ring" />
          <div className="splash-ring splash-ring-delayed" />
        </div>

        {/* Title */}
        <h1 className="splash-title">
          <span className="splash-title-main">AI Supply Chain</span>
          <span className="splash-title-sub">Demand Forecasting System</span>
        </h1>

        {/* Analysis status */}
        <div className="splash-status">
          <span className="splash-status-text">{analysisSteps[step]}</span>
          <span className="splash-status-dots">
            <span className="splash-dot-bounce" />
            <span className="splash-dot-bounce" style={{ animationDelay: "0.15s" }} />
            <span className="splash-dot-bounce" style={{ animationDelay: "0.3s" }} />
          </span>
        </div>

        {/* Progress bar */}
        <div className="splash-progress-track">
          <div
            className="splash-progress-fill"
            style={{ width: `${progress}%` }}
          />
          {/* Shimmer effect */}
          <div className="splash-progress-shimmer" />
        </div>

        {/* Percentage */}
        <div className="splash-percentage">{Math.round(progress)}%</div>

        {/* Footer tagline */}
        <p className="splash-tagline">
          Powered by machine learning & real-time analytics
        </p>
      </div>
    </div>
  );
}