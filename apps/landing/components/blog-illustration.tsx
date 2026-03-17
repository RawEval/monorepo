'use client';

interface BlogIllustrationProps {
  type: string;
  className?: string;
}

export function BlogIllustration({ type, className }: BlogIllustrationProps) {
  const illustrations: Record<string, React.ReactNode> = {
    'data-flow': (
      <svg viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="400" fill="#0d0d0d" rx="8" />
        {/* Grid lines */}
        {Array.from({ length: 20 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="400" stroke="rgba(245,242,236,0.04)" strokeWidth="1" />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 40} x2="800" y2={i * 40} stroke="rgba(245,242,236,0.04)" strokeWidth="1" />
        ))}
        {/* Data flow paths */}
        <path d="M100 200 C200 100, 300 300, 400 200 S600 100, 700 200" stroke="#d4440c" strokeWidth="2" strokeDasharray="8 4" opacity="0.6">
          <animate attributeName="stroke-dashoffset" values="0;-24" dur="2s" repeatCount="indefinite" />
        </path>
        <path d="M100 220 C200 320, 300 120, 400 220 S600 320, 700 220" stroke="rgba(245,242,236,0.2)" strokeWidth="1.5" strokeDasharray="6 6">
          <animate attributeName="stroke-dashoffset" values="0;-24" dur="3s" repeatCount="indefinite" />
        </path>
        {/* Nodes */}
        {[100, 250, 400, 550, 700].map((x, i) => (
          <g key={`n${i}`}>
            <circle cx={x} cy={200} r={i === 2 ? 16 : 10} fill={i === 2 ? '#d4440c' : 'none'} stroke={i === 2 ? '#d4440c' : 'rgba(245,242,236,0.3)'} strokeWidth="1.5" />
            {i === 2 && <circle cx={x} cy={200} r="24" fill="none" stroke="#d4440c" strokeWidth="0.5" opacity="0.4" />}
          </g>
        ))}
        {/* Dollar signs floating */}
        <text x="200" y="140" fill="rgba(212,68,12,0.3)" fontFamily="monospace" fontSize="24" fontWeight="bold">$</text>
        <text x="500" y="280" fill="rgba(212,68,12,0.2)" fontFamily="monospace" fontSize="32" fontWeight="bold">$</text>
        <text x="350" y="100" fill="rgba(212,68,12,0.15)" fontFamily="monospace" fontSize="18" fontWeight="bold">$</text>
        {/* Label */}
        <text x="400" y="360" fill="rgba(245,242,236,0.4)" fontFamily="monospace" fontSize="11" textAnchor="middle" letterSpacing="0.12em">DATA FLOW — UNAUDITED</text>
      </svg>
    ),
    'collapse': (
      <svg viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="400" fill="#0d0d0d" rx="8" />
        {/* Degradation visualization - concentric shapes losing resolution */}
        {Array.from({ length: 8 }).map((_, i) => {
          const size = 160 - i * 18;
          const opacity = 0.8 - i * 0.08;
          const distortion = i * 3;
          return (
            <rect
              key={`r${i}`}
              x={400 - size / 2 + (i % 2 ? distortion : -distortion)}
              y={200 - size / 2 + (i % 3 ? distortion / 2 : 0)}
              width={size}
              height={size}
              fill="none"
              stroke={i < 3 ? `rgba(212,68,12,${opacity})` : `rgba(245,242,236,${opacity * 0.3})`}
              strokeWidth={i === 0 ? 2 : 1}
              rx={i * 2}
              transform={`rotate(${i * 5}, 400, 200)`}
            />
          );
        })}
        {/* Generation markers */}
        {Array.from({ length: 6 }).map((_, i) => (
          <g key={`g${i}`}>
            <text x={120 + i * 110} y="370" fill={i < 2 ? 'rgba(212,68,12,0.6)' : 'rgba(245,242,236,0.2)'} fontFamily="monospace" fontSize="10" textAnchor="middle">
              GEN {i + 1}
            </text>
            <line x1={120 + i * 110} y1="355" x2={120 + i * 110} y2="340" stroke={i < 2 ? 'rgba(212,68,12,0.3)' : 'rgba(245,242,236,0.1)'} strokeWidth="1" />
          </g>
        ))}
        {/* Collapse arrow */}
        <path d="M650 120 L680 200 L650 280" stroke="rgba(212,68,12,0.4)" strokeWidth="1.5" fill="none" />
        <text x="700" y="205" fill="rgba(212,68,12,0.5)" fontFamily="monospace" fontSize="10" letterSpacing="0.1em">COLLAPSE</text>
      </svg>
    ),
    'shield': (
      <svg viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="400" fill="#0d0d0d" rx="8" />
        {/* Shield shape */}
        <path d="M400 60 L520 110 L520 240 C520 300, 460 350, 400 370 C340 350, 280 300, 280 240 L280 110 Z" fill="none" stroke="#d4440c" strokeWidth="2" />
        <path d="M400 80 L500 120 L500 235 C500 285, 450 330, 400 348 C350 330, 300 285, 300 235 L300 120 Z" fill="rgba(212,68,12,0.06)" stroke="none" />
        {/* Scan lines inside shield */}
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={`s${i}`} x1="310" y1={140 + i * 28} x2="490" y2={140 + i * 28} stroke="rgba(212,68,12,0.15)" strokeWidth="0.5">
            <animate attributeName="opacity" values="0.15;0.4;0.15" dur={`${1.5 + i * 0.2}s`} repeatCount="indefinite" />
          </line>
        ))}
        {/* Check mark */}
        <path d="M370 220 L392 245 L435 185" stroke="#d4440c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* Blocked items on sides */}
        {[{ x: 140, y: 160 }, { x: 160, y: 260 }, { x: 640, y: 180 }, { x: 660, y: 280 }].map((pos, i) => (
          <g key={`b${i}`}>
            <circle cx={pos.x} cy={pos.y} r="8" fill="none" stroke="rgba(245,242,236,0.15)" strokeWidth="1" />
            <line x1={pos.x - 4} y1={pos.y - 4} x2={pos.x + 4} y2={pos.y + 4} stroke="rgba(192,57,43,0.5)" strokeWidth="1.5" />
            <line x1={pos.x + 4} y1={pos.y - 4} x2={pos.x - 4} y2={pos.y + 4} stroke="rgba(192,57,43,0.5)" strokeWidth="1.5" />
          </g>
        ))}
        <text x="400" y="380" fill="rgba(245,242,236,0.3)" fontFamily="monospace" fontSize="10" textAnchor="middle" letterSpacing="0.15em">IRON DOME — ACTIVE</text>
      </svg>
    ),
    'network': (
      <svg viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="400" fill="#0d0d0d" rx="8" />
        {/* Network nodes */}
        {[
          { x: 400, y: 200, r: 20, main: true },
          { x: 250, y: 120, r: 8 }, { x: 550, y: 120, r: 8 },
          { x: 200, y: 220, r: 6 }, { x: 600, y: 220, r: 6 },
          { x: 280, y: 300, r: 7 }, { x: 520, y: 300, r: 7 },
          { x: 150, y: 160, r: 4 }, { x: 650, y: 160, r: 4 },
          { x: 350, y: 80, r: 5 }, { x: 450, y: 80, r: 5 },
          { x: 160, y: 300, r: 3 }, { x: 640, y: 300, r: 3 },
          { x: 340, y: 320, r: 4 }, { x: 460, y: 320, r: 4 },
        ].map((node, i) => (
          <g key={`nn${i}`}>
            {i > 0 && <line x1={400} y1={200} x2={node.x} y2={node.y} stroke="rgba(245,242,236,0.06)" strokeWidth="0.5" />}
            <circle cx={node.x} cy={node.y} r={node.r} fill={node.main ? '#d4440c' : 'none'} stroke={node.main ? '#d4440c' : 'rgba(245,242,236,0.25)'} strokeWidth={node.main ? 2 : 1} />
          </g>
        ))}
        {/* Pulse from center */}
        <circle cx="400" cy="200" r="40" fill="none" stroke="rgba(212,68,12,0.2)" strokeWidth="0.5">
          <animate attributeName="r" values="25;80;25" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" />
        </circle>
      </svg>
    ),
    'scale': (
      <svg viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="400" fill="#0d0d0d" rx="8" />
        {/* Balance scale */}
        <line x1="400" y1="80" x2="400" y2="320" stroke="rgba(245,242,236,0.15)" strokeWidth="1.5" />
        <circle cx="400" cy="80" r="6" fill="rgba(245,242,236,0.2)" />
        {/* Beam - tilted */}
        <line x1="200" y1="180" x2="600" y2="140" stroke="rgba(245,242,236,0.3)" strokeWidth="2" />
        {/* Left pan (heavy - aligned) */}
        <path d="M160 180 L240 180 L230 230 L170 230 Z" fill="rgba(212,68,12,0.15)" stroke="#d4440c" strokeWidth="1" />
        <text x="200" y="212" fill="rgba(212,68,12,0.7)" fontFamily="monospace" fontSize="9" textAnchor="middle">ALIGNED</text>
        {/* Right pan (light - neutral) */}
        <path d="M560 140 L640 140 L630 190 L570 190 Z" fill="rgba(245,242,236,0.05)" stroke="rgba(245,242,236,0.2)" strokeWidth="1" />
        <text x="600" y="172" fill="rgba(245,242,236,0.4)" fontFamily="monospace" fontSize="9" textAnchor="middle">NEUTRAL</text>
        {/* Gap indicator */}
        <path d="M400 300 L380 340 L420 340 Z" fill="none" stroke="rgba(212,68,12,0.3)" strokeWidth="1" />
        <text x="400" y="375" fill="rgba(245,242,236,0.3)" fontFamily="monospace" fontSize="10" textAnchor="middle" letterSpacing="0.1em">MARKET IMBALANCE</text>
      </svg>
    ),
    'compliance': (
      <svg viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="400" fill="#0d0d0d" rx="8" />
        {/* Document stack */}
        {[0, 1, 2].map((i) => (
          <rect key={`d${i}`} x={320 + i * 8} y={80 + i * 8} width="180" height="240" fill="none" stroke={i === 2 ? '#d4440c' : 'rgba(245,242,236,0.1)'} strokeWidth={i === 2 ? 1.5 : 0.5} rx="2" />
        ))}
        {/* Document lines */}
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={`l${i}`} x1="356" y1={125 + i * 25} x2={i < 5 ? 476 : 440} y2={125 + i * 25} stroke={i < 3 ? 'rgba(212,68,12,0.3)' : 'rgba(245,242,236,0.1)'} strokeWidth="1" />
        ))}
        {/* Seal / stamp */}
        <circle cx="465" cy="275" r="22" fill="none" stroke="#d4440c" strokeWidth="1.5" />
        <circle cx="465" cy="275" r="16" fill="none" stroke="#d4440c" strokeWidth="0.5" />
        <text x="465" y="279" fill="#d4440c" fontFamily="monospace" fontSize="9" textAnchor="middle" fontWeight="bold">EU</text>
        {/* EU stars hint */}
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = (i * 60 - 90) * Math.PI / 180;
          return <circle key={`s${i}`} cx={465 + Math.cos(angle) * 19} cy={275 + Math.sin(angle) * 19} r="1.5" fill="#d4440c" opacity="0.5" />;
        })}
        <text x="400" y="375" fill="rgba(245,242,236,0.3)" fontFamily="monospace" fontSize="10" textAnchor="middle" letterSpacing="0.1em">ARTICLE 10 — PROVENANCE REQUIRED</text>
      </svg>
    ),
    'funding': (
      <svg viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="400" fill="#0d0d0d" rx="8" />
        {/* Growth chart */}
        <path d="M120 320 L200 280 L300 260 L400 220 L500 160 L600 100 L680 60" stroke="#d4440c" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Area fill */}
        <path d="M120 320 L200 280 L300 260 L400 220 L500 160 L600 100 L680 60 L680 320 Z" fill="url(#grad)" />
        <defs>
          <linearGradient id="grad" x1="400" y1="60" x2="400" y2="320">
            <stop offset="0%" stopColor="#d4440c" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#d4440c" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Data points */}
        {[{ x: 120, y: 320 }, { x: 200, y: 280 }, { x: 300, y: 260 }, { x: 400, y: 220 }, { x: 500, y: 160 }, { x: 600, y: 100 }, { x: 680, y: 60 }].map((p, i) => (
          <circle key={`p${i}`} cx={p.x} cy={p.y} r={i === 6 ? 5 : 3} fill={i >= 5 ? '#d4440c' : 'rgba(245,242,236,0.3)'} />
        ))}
        {/* Year labels */}
        {['2024', '2025', '2026', '2027', '2028', '2029', '2030'].map((year, i) => (
          <text key={`y${i}`} x={120 + i * 93.3} y="350" fill="rgba(245,242,236,0.2)" fontFamily="monospace" fontSize="10" textAnchor="middle">{year}</text>
        ))}
        {/* $50B label */}
        <text x="680" y="50" fill="#d4440c" fontFamily="monospace" fontSize="12" textAnchor="middle" fontWeight="bold">$50B</text>
        <text x="400" y="385" fill="rgba(245,242,236,0.3)" fontFamily="monospace" fontSize="10" textAnchor="middle" letterSpacing="0.1em">TAM PROJECTION — DATA QUALITY INFRASTRUCTURE</text>
      </svg>
    ),
    'pipeline': (
      <svg viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="400" fill="#0d0d0d" rx="8" />
        {/* Pipeline stages */}
        {['CAPTURE', 'ROUTE', 'VERIFY', 'DELIVER'].map((stage, i) => {
          const x = 140 + i * 160;
          return (
            <g key={`st${i}`}>
              <rect x={x} y="160" width="100" height="80" fill="none" stroke={i === 2 ? '#d4440c' : 'rgba(245,242,236,0.15)'} strokeWidth={i === 2 ? 1.5 : 1} rx="4" />
              <text x={x + 50} y="205" fill={i === 2 ? '#d4440c' : 'rgba(245,242,236,0.4)'} fontFamily="monospace" fontSize="10" textAnchor="middle" letterSpacing="0.08em">{stage}</text>
              {/* Connector arrow */}
              {i < 3 && (
                <path d={`M${x + 100} 200 L${x + 140} 200`} stroke="rgba(245,242,236,0.15)" strokeWidth="1" markerEnd="url(#arrowhead)">
                  <animate attributeName="stroke-dashoffset" values="0;-12" dur="1.5s" repeatCount="indefinite" />
                </path>
              )}
              {/* Stage number */}
              <text x={x + 50} y="150" fill="rgba(245,242,236,0.15)" fontFamily="monospace" fontSize="9" textAnchor="middle">0{i + 1}</text>
            </g>
          );
        })}
        <defs>
          <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="rgba(245,242,236,0.2)" />
          </marker>
        </defs>
        {/* Quality gate indicators */}
        {[0, 1, 2].map((i) => {
          const x = 240 + i * 160;
          return (
            <g key={`gate${i}`}>
              <line x1={x + 20} y1="165" x2={x + 20} y2="235" stroke="rgba(212,68,12,0.3)" strokeWidth="0.5" strokeDasharray="3 3" />
              <circle cx={x + 20} cy="200" r="3" fill="#d4440c" opacity="0.4" />
            </g>
          );
        })}
        <text x="400" y="310" fill="rgba(245,242,236,0.3)" fontFamily="monospace" fontSize="10" textAnchor="middle" letterSpacing="0.1em">END-TO-END EVALUATION PIPELINE</text>
      </svg>
    ),
    'globe': (
      <svg viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="400" fill="#0d0d0d" rx="8" />
        {/* Globe */}
        <circle cx="400" cy="200" r="130" fill="none" stroke="rgba(245,242,236,0.1)" strokeWidth="1" />
        {/* Latitude lines */}
        {[-60, -30, 0, 30, 60].map((lat, i) => {
          const y = 200 - (lat / 90) * 130;
          const rx = Math.cos((lat * Math.PI) / 180) * 130;
          return <ellipse key={`lat${i}`} cx="400" cy={y} rx={rx} ry={rx * 0.15} fill="none" stroke="rgba(245,242,236,0.06)" strokeWidth="0.5" />;
        })}
        {/* Longitude lines */}
        {[-45, 0, 45].map((lng, i) => (
          <ellipse key={`lng${i}`} cx={400 + (lng / 90) * 60} cy="200" rx={50 + Math.abs(lng) * 0.5} ry="130" fill="none" stroke="rgba(245,242,236,0.06)" strokeWidth="0.5" />
        ))}
        {/* Expert dots scattered on globe */}
        {[
          { x: 360, y: 140 }, { x: 430, y: 155 }, { x: 380, y: 180 },
          { x: 450, y: 200 }, { x: 340, y: 210 }, { x: 420, y: 230 },
          { x: 370, y: 250 }, { x: 460, y: 170 }, { x: 350, y: 170 },
          { x: 410, y: 260 }, { x: 440, y: 140 }, { x: 330, y: 240 },
          { x: 470, y: 220 }, { x: 390, y: 130 }, { x: 415, y: 190 },
        ].map((p, i) => (
          <circle key={`e${i}`} cx={p.x} cy={p.y} r={i < 5 ? 3 : 2} fill="#d4440c" opacity={0.3 + (i % 3) * 0.2}>
            <animate attributeName="opacity" values={`${0.3 + (i % 3) * 0.2};${0.6 + (i % 3) * 0.15};${0.3 + (i % 3) * 0.2}`} dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
          </circle>
        ))}
        <text x="400" y="365" fill="rgba(245,242,236,0.3)" fontFamily="monospace" fontSize="10" textAnchor="middle" letterSpacing="0.1em">45 COUNTRIES — 2,400+ VERIFIED EXPERTS</text>
      </svg>
    ),
    'detector': (
      <svg viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="400" fill="#0d0d0d" rx="8" />
        {/* Waveform - human typing pattern (irregular) */}
        <text x="120" y="115" fill="rgba(245,242,236,0.25)" fontFamily="monospace" fontSize="9">HUMAN PATTERN</text>
        <path d="M120 150 L140 140 L145 155 L160 130 L170 160 L185 125 L190 150 L210 135 L220 155 L240 128 L248 148 L270 132 L280 158 L300 138 L315 152 L340 130 L350 155 L380 135 L400 150 L420 128 L440 155 L460 140 L480 148 L500 132 L520 155 L540 138 L560 150 L580 135 L600 152 L620 140 L650 148 L680 138" stroke="rgba(45,122,78,0.6)" strokeWidth="1.5" fill="none" />
        {/* Waveform - AI paste pattern (flat then spike) */}
        <text x="120" y="245" fill="rgba(245,242,236,0.25)" fontFamily="monospace" fontSize="9">AI-GENERATED PATTERN</text>
        <path d="M120 280 L200 280 L202 260 L204 300 L206 260 L250 280 L350 280 L352 258 L354 302 L356 258 L400 280 L500 280 L502 262 L504 298 L506 262 L550 280 L680 280" stroke="rgba(192,57,43,0.6)" strokeWidth="1.5" fill="none" />
        {/* Detection marker */}
        <rect x="190" y="252" width="80" height="40" fill="none" stroke="rgba(192,57,43,0.4)" strokeWidth="1" rx="2" strokeDasharray="4 2" />
        <text x="230" y="310" fill="rgba(192,57,43,0.6)" fontFamily="monospace" fontSize="8" textAnchor="middle">PASTE DETECTED</text>
        <rect x="340" y="252" width="80" height="40" fill="none" stroke="rgba(192,57,43,0.4)" strokeWidth="1" rx="2" strokeDasharray="4 2" />
        <rect x="490" y="252" width="80" height="40" fill="none" stroke="rgba(192,57,43,0.4)" strokeWidth="1" rx="2" strokeDasharray="4 2" />
      </svg>
    ),
    'picks-shovels': (
      <svg viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="400" fill="#0d0d0d" rx="8" />
        {/* Stack layers */}
        {[
          { y: 280, label: 'INFRASTRUCTURE', color: '#d4440c', opacity: 0.2 },
          { y: 220, label: 'DATA QUALITY', color: '#d4440c', opacity: 0.12 },
          { y: 160, label: 'MODELS', color: 'rgba(245,242,236,1)', opacity: 0.04 },
          { y: 100, label: 'APPLICATIONS', color: 'rgba(245,242,236,1)', opacity: 0.02 },
        ].map((layer, i) => (
          <g key={`layer${i}`}>
            <rect x="200" y={layer.y} width="400" height="50" fill={layer.color} fillOpacity={layer.opacity} stroke={i < 2 ? '#d4440c' : 'rgba(245,242,236,0.1)'} strokeWidth={i === 0 ? 1.5 : 0.5} rx="3" />
            <text x="400" y={layer.y + 30} fill={i < 2 ? 'rgba(212,68,12,0.7)' : 'rgba(245,242,236,0.25)'} fontFamily="monospace" fontSize="10" textAnchor="middle" letterSpacing="0.1em">{layer.label}</text>
          </g>
        ))}
        {/* Arrow pointing to infrastructure */}
        <path d="M640 305 L620 305" stroke="#d4440c" strokeWidth="1.5" markerEnd="url(#arrowOrange)" />
        <text x="650" y="309" fill="rgba(212,68,12,0.6)" fontFamily="monospace" fontSize="9">WE ARE HERE</text>
        <defs>
          <marker id="arrowOrange" markerWidth="6" markerHeight="4" refX="0" refY="2" orient="auto">
            <polygon points="6 0, 0 2, 6 4" fill="#d4440c" />
          </marker>
        </defs>
        <text x="400" y="375" fill="rgba(245,242,236,0.3)" fontFamily="monospace" fontSize="10" textAnchor="middle" letterSpacing="0.1em">THE AI STACK — PICKS AND SHOVELS</text>
      </svg>
    ),
    'feedback-loop': (
      <svg viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="400" fill="#0d0d0d" rx="8" />
        {/* Circular loop */}
        <circle cx="400" cy="200" r="120" fill="none" stroke="rgba(245,242,236,0.08)" strokeWidth="1" />
        {/* Loop segments with labels */}
        {[
          { angle: -90, label: 'MODEL OUTPUT' },
          { angle: 0, label: 'BECOMES DATA' },
          { angle: 90, label: '"HUMAN" FEEDBACK' },
          { angle: 180, label: 'TRAIN NEXT MODEL' },
        ].map((seg, i) => {
          const rad = (seg.angle * Math.PI) / 180;
          const x = 400 + Math.cos(rad) * 120;
          const y = 200 + Math.sin(rad) * 120;
          const tx = 400 + Math.cos(rad) * 165;
          const ty = 200 + Math.sin(rad) * 165;
          return (
            <g key={`seg${i}`}>
              <circle cx={x} cy={y} r="8" fill={i === 2 ? 'rgba(192,57,43,0.3)' : 'rgba(212,68,12,0.2)'} stroke={i === 2 ? 'rgba(192,57,43,0.6)' : '#d4440c'} strokeWidth="1" />
              <text x={tx} y={ty + 4} fill={i === 2 ? 'rgba(192,57,43,0.7)' : 'rgba(245,242,236,0.35)'} fontFamily="monospace" fontSize="9" textAnchor="middle" letterSpacing="0.05em">{seg.label}</text>
            </g>
          );
        })}
        {/* Rotating arrow on the circle */}
        <path d="M400 80 C460 80, 520 130, 520 200" stroke="rgba(212,68,12,0.4)" strokeWidth="1.5" fill="none" strokeDasharray="6 4">
          <animate attributeName="stroke-dashoffset" values="0;-20" dur="2s" repeatCount="indefinite" />
        </path>
        <path d="M520 200 C520 270, 460 320, 400 320" stroke="rgba(212,68,12,0.3)" strokeWidth="1.5" fill="none" strokeDasharray="6 4">
          <animate attributeName="stroke-dashoffset" values="0;-20" dur="2s" repeatCount="indefinite" />
        </path>
        <path d="M400 320 C340 320, 280 270, 280 200" stroke="rgba(212,68,12,0.2)" strokeWidth="1.5" fill="none" strokeDasharray="6 4">
          <animate attributeName="stroke-dashoffset" values="0;-20" dur="2s" repeatCount="indefinite" />
        </path>
        <path d="M280 200 C280 130, 340 80, 400 80" stroke="rgba(212,68,12,0.15)" strokeWidth="1.5" fill="none" strokeDasharray="6 4">
          <animate attributeName="stroke-dashoffset" values="0;-20" dur="2s" repeatCount="indefinite" />
        </path>
        {/* Warning in center */}
        <text x="400" y="195" fill="rgba(192,57,43,0.5)" fontFamily="monospace" fontSize="11" textAnchor="middle" fontWeight="bold">RECURSIVE</text>
        <text x="400" y="210" fill="rgba(192,57,43,0.3)" fontFamily="monospace" fontSize="9" textAnchor="middle">CONTAMINATION</text>
      </svg>
    ),
  };

  return (
    <div className={className} style={{ width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', lineHeight: 0 }}>
      {illustrations[type] ?? illustrations['data-flow']}
    </div>
  );
}
