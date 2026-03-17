export interface BlogPost {
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  isoDate: string;
  category: string;
  readTime: string;
  excerpt: string;
  author: string;
  authorRole: string;
  featured: boolean;
  tags: string[];
  illustration: 'data-flow' | 'shield' | 'network' | 'scale' | 'compliance' | 'funding' | 'collapse' | 'pipeline' | 'globe' | 'detector' | 'picks-shovels' | 'feedback-loop';
  sections: BlogSection[];
}

export interface BlogSection {
  heading?: string;
  content: string;
  pullQuote?: string;
  stat?: { value: string; label: string };
}

export const blogPosts: BlogPost[] = [
  // ──────────────────────────────────────────────
  // 1. FEATURED — Market Problem
  // ──────────────────────────────────────────────
  {
    slug: 'why-ai-labs-bleed-2b-on-bad-training-data',
    title: 'Why AI Labs Are Bleeding $2B a Year on Bad Training Data',
    subtitle: 'The hidden cost of unverified human feedback — and why the biggest bottleneck in AI isn\'t compute.',
    date: 'Mar 12, 2026',
    isoDate: '2026-03-12',
    category: 'Market Analysis',
    readTime: '9 min',
    excerpt: 'The AI industry spends over $2 billion annually on training data that nobody audits, nobody verifies, and nobody can trace. Here\'s why that\'s about to change.',
    author: 'Mrinal Raj',
    authorRole: 'Co-founder & CEO',
    featured: true,
    tags: ['training-data', 'market-size', 'data-quality', 'AI-infrastructure'],
    illustration: 'data-flow',
    sections: [
      {
        content: `Every major AI lab has the same dirty secret: they don't actually know if their training data is any good.\n\nIn 2025, the global spend on AI training data surpassed $2 billion. That number is growing at 35% year-over-year as labs race to build larger, more capable models. But here's what nobody talks about at AI conferences: the vast majority of this data has never been audited, the annotators who produced it are largely unverified, and the provenance chain from human judgment to model weight is, at best, a spreadsheet.\n\nThis isn't a quality problem. It's a structural failure.`,
      },
      {
        heading: 'The $2B Black Box',
        content: `Let's break down where the money goes. AI labs today spend on three categories of human feedback:\n\n**1. RLHF Annotations ($800M+):** Human preference rankings that teach models which responses are "better." These are the backbone of alignment — the reason ChatGPT sounds helpful instead of unhinged. But 60-70% of these annotations come from crowdworkers on platforms like Toloka, Appen, and Remotasks, where quality control is a checkbox, not a system.\n\n**2. Red-teaming & Safety ($400M+):** Adversarial testing to find model failures. Labs hire contractors to break their models, but the same contractors often use AI to generate their "adversarial" prompts — defeating the entire purpose.\n\n**3. Domain-specific Evaluation ($800M+):** Expert annotations for medicine, law, finance, and coding. This is where the real money is, and where the quality gap is widest. A cardiologist's feedback on a medical AI is worth 100x a crowdworker's, but labs have no infrastructure to source, verify, and manage domain experts at scale.`,
        stat: { value: '$2B+', label: 'Annual spend on training data with no audit trail' },
      },
      {
        heading: 'Why Quality Collapse Is Inevitable',
        content: `The current system is designed to fail. Here's why:\n\n**The Crowdworker Paradox.** Platforms pay annotators $2-12 per hour. At those rates, you get people who optimize for throughput, not quality. Studies show that 30-50% of crowdworkers on major platforms now use ChatGPT to complete their annotations. This creates a recursive contamination loop: AI-generated data is used to train AI, which generates worse outputs, which are annotated by AI again.\n\n**The Verification Vacuum.** No major annotation platform offers real-time keystroke analysis, behavioral biometrics, or provenance tracking. If a crowdworker in Manila copies an answer from Claude and pastes it into a Scale AI task, nobody knows. Nobody checks. The data ships.\n\n**The Audit Impossibility.** When a model hallucinates medical advice that harms a patient, the lab cannot trace back to the specific annotations that shaped that behavior. There is no chain of custody. No version control. No accountability.`,
        pullQuote: 'If a crowdworker copies an answer from Claude and pastes it into a training task, nobody knows. Nobody checks. The data ships.',
      },
      {
        heading: 'The Market Is About to Correct',
        content: `Three forces are converging to make the status quo untenable:\n\n**Regulatory pressure.** The EU AI Act, effective since mid-2025, mandates full provenance trails on training data for high-risk AI systems. Labs that can't demonstrate where their data came from, who produced it, and how it was verified face fines up to 7% of global revenue. This isn't theoretical — enforcement begins in 2026.\n\n**Synthetic data ceiling.** A landmark 2024 Nature study demonstrated measurable quality collapse when models train on more than 25 generations of AI-generated data. Labs are hitting this wall now. The only way to continue scaling model quality is verified human signal — and the supply of verified human signal is shrinking relative to demand.\n\n**Competitive differentiation.** As base model capabilities converge, the differentiator shifts from "who has more compute" to "who has better data." Labs that invest in verified, auditable training data will build better models. Period.`,
      },
      {
        heading: 'What Comes Next',
        content: `The AI training data market needs infrastructure, not more marketplaces. It needs:\n\n- **Verified expert networks** with domain-specific credentials and performance-based tiering\n- **Anti-cheat systems** that detect AI-generated annotations in real time using keystroke dynamics and behavioral biometrics\n- **Provenance pipelines** that create audit-ready artifacts from capture to delivery\n- **Quality frameworks** that go beyond inter-annotator agreement to measure actual downstream model improvement\n\nThis is what we're building at RawEval. Not another annotation platform — an evaluation infrastructure layer that treats human judgment as a supply chain problem, with the quality controls, traceability, and sourcing standards that implies.\n\nThe $2B question isn't whether labs will pay for better data. It's whether they can afford not to.`,
      },
    ],
  },

  // ──────────────────────────────────────────────
  // 2. Synthetic Data Ceiling
  // ──────────────────────────────────────────────
  {
    slug: 'synthetic-data-ceiling-models-cant-train-themselves',
    title: 'The Synthetic Data Ceiling: Why Models Can\'t Train Themselves',
    subtitle: 'Nature proved what practitioners already knew — AI-generated training data has a hard limit. What happens when we hit it?',
    date: 'Mar 5, 2026',
    isoDate: '2026-03-05',
    category: 'Research',
    readTime: '11 min',
    excerpt: 'A landmark Nature study proved what practitioners suspected: models trained on AI-generated data collapse after 25 generations. The implications for the entire industry are staggering.',
    author: 'Mrinal Raj',
    authorRole: 'Co-founder & CEO',
    featured: false,
    tags: ['synthetic-data', 'model-collapse', 'research', 'RLHF', 'data-quality'],
    illustration: 'collapse',
    sections: [
      {
        content: `In July 2024, a team of researchers at Oxford and Cambridge published a paper in Nature that sent shockwaves through the AI industry. Their finding was elegant and devastating: language models trained recursively on their own outputs undergo "model collapse" — a progressive degradation where the model's output distribution narrows, rare knowledge vanishes, and quality deteriorates in ways that cannot be reversed by simply adding more synthetic data.\n\nThe study showed this collapse becomes measurable after just 5-10 generations of recursive training, and becomes catastrophic after 25+ generations. For an industry that has been quietly hoping synthetic data could replace expensive human annotation, this was a death sentence for the strategy.`,
      },
      {
        heading: 'Understanding Model Collapse',
        content: `Model collapse isn't a gradual dimming — it's a specific, predictable failure mode with three distinct phases:\n\n**Phase 1: Tail Erosion (Generations 1-5).** The model begins losing its ability to generate rare, unusual, or highly specific outputs. Medical edge cases, obscure legal precedents, niche cultural references — these start disappearing from the model's effective vocabulary. For most benchmarks, the model still looks fine. But the distribution is already narrowing.\n\n**Phase 2: Variance Collapse (Generations 5-15).** The model's outputs become increasingly homogeneous. Ask it to write ten different stories, and they'll share the same structure. Ask it to diagnose ten different patients, and it'll converge on the same handful of conditions. The model becomes confidently mediocre — it sounds good but says the same things.\n\n**Phase 3: Distribution Shift (Generations 15-25+).** The model's understanding of reality starts drifting. It no longer reflects the actual distribution of human knowledge and preferences — it reflects a distorted, compressed version of itself. At this point, the damage is irreversible. You can't fix it by mixing in more synthetic data. You need genuine human signal to anchor the model back to reality.`,
        stat: { value: '25', label: 'generations before catastrophic quality collapse' },
      },
      {
        heading: 'The Industry Was Already There',
        content: `Here's what makes this research so urgent: many labs were already deep into recursive training before the paper published.\n\nConsider the timeline. GPT-4 was trained partly on human feedback. GPT-4's outputs are used by crowdworkers to annotate training data for the next model. That model's outputs are used by the next generation of crowdworkers. We're already 3-4 generations deep in many domains — and the contamination rate (the percentage of "human" annotations that are actually AI-generated) is estimated at 30-50% on major platforms.\n\nThis means the theoretical ceiling of 25 generations is optimistic. In practice, the contamination is probabilistic and distributed, meaning quality degradation is happening simultaneously across all training data, not sequentially in neat generations.\n\nThe practical ceiling is much lower. Some researchers estimate we're already seeing measurable collapse in domains where synthetic contamination is highest — creative writing, code generation, and general knowledge Q&A.`,
        pullQuote: 'We\'re already 3-4 generations deep in recursive AI training. The contamination rate on major annotation platforms is estimated at 30-50%.',
      },
      {
        heading: 'Why "Just Add Human Data" Isn\'t Simple',
        content: `The obvious solution — source more human data — runs into its own set of problems:\n\n**Supply constraint.** There are only so many domain experts in the world who can provide genuinely valuable feedback on AI outputs. A cardiologist who can evaluate a medical AI's reasoning about atrial fibrillation is rare. A cardiologist who will do it for $15/hour on a crowdworking platform doesn't exist.\n\n**Verification problem.** Even if you source human annotators, how do you verify they're actually human? How do you verify their expertise? How do you verify they're not using AI to complete tasks? Today's annotation platforms have no infrastructure for this.\n\n**Provenance gap.** For human data to serve as a reliable anchor against model collapse, you need to prove it's human. That requires provenance chains — keystroke logs, session recordings, behavioral biometrics, credential verification — that don't exist in current workflows.`,
      },
      {
        heading: 'The Verified Human Signal Premium',
        content: `This is where the market is headed: a premium tier of training data that is verifiably, provably, demonstrably human.\n\nNot "human-labeled" in the sense that a human clicked a button. Human in the sense that:\n\n- The annotator's credentials are verified against professional registries\n- Their interaction patterns are analyzed in real-time for AI-generation signatures\n- Their reasoning is captured alongside their judgment, creating explainable annotations\n- The entire session is logged with enough fidelity to serve as legal evidence of human authorship\n\nThis is expensive. It requires specialized infrastructure. It requires a network of verified experts. It requires anti-cheat technology that can distinguish human typing patterns from AI-generated paste events.\n\nBut it's the only training data that will matter as models approach and exceed the synthetic data ceiling. Labs that invest in verified human signal now will build better models in 2027. Labs that don't will be training on compressed echoes of themselves.\n\nAt RawEval, this is our core thesis: the future of AI quality is verified human judgment, delivered as infrastructure. Not a marketplace. Not a platform. A pipeline with quality controls at every step.`,
      },
    ],
  },

  // ──────────────────────────────────────────────
  // 3. Scale AI Picked a Side
  // ──────────────────────────────────────────────
  {
    slug: 'scale-ai-picked-a-side-market-noticed',
    title: 'Scale AI Picked a Side. The Market Noticed.',
    subtitle: 'When the dominant data infrastructure player aligned with one hyperscaler, it created a gap. Here\'s who fills it.',
    date: 'Feb 24, 2026',
    isoDate: '2026-02-24',
    category: 'Market Analysis',
    readTime: '7 min',
    excerpt: 'Scale AI\'s alignment with a single hyperscaler created a vendor conflict that opened the neutral infrastructure slot. Here\'s why that matters for every AI lab.',
    author: 'Mrinal Raj',
    authorRole: 'Co-founder & CEO',
    featured: false,
    tags: ['scale-ai', 'market-dynamics', 'competition', 'neutrality', 'AI-infrastructure'],
    illustration: 'scale',
    sections: [
      {
        content: `In mid-2025, something shifted in the AI data infrastructure market that hasn't gotten enough attention.\n\nScale AI — the dominant player in AI training data, valued at $14B — deepened its strategic alignment with a single hyperscaler. Government contracts, joint go-to-market, shared customers. For Scale, it was a rational business decision: concentrate on your biggest customer and grow with them.\n\nBut for every other AI lab in the world, it created a problem: their primary data infrastructure provider was now strategically aligned with a competitor.\n\nImagine being Anthropic, Mistral, Cohere, or any of the 50+ frontier AI labs, and learning that the company handling your most sensitive training data — the data that defines your model's competitive differentiation — is in deep partnership with your rival. Would you sleep well?`,
      },
      {
        heading: 'The Neutrality Premium',
        content: `Infrastructure providers succeed when they're neutral. AWS hosts Netflix and Disney+. Stripe processes payments for competitors. Twilio doesn't care who you're texting.\n\nThe reason is simple: when infrastructure takes sides, customers face a choice between convenience and strategic risk. And in AI, where training data literally defines your model's capabilities, that strategic risk is existential.\n\nHere's what we're seeing in the market:\n\n- **Labs are splitting data providers.** Companies that used to give 100% of their annotation work to Scale are now splitting across 2-3 vendors. The primary motivation isn't quality — it's strategic risk mitigation.\n\n- **Government contracts are getting scrutinized.** When your data provider has privileged access to government AI contracts through a hyperscaler partnership, the conflict of interest becomes a procurement issue.\n\n- **Startups are building alternatives.** The venture market has noticed. In 2025-2026, we've seen a wave of seed and Series A funding for data quality startups that position as neutral alternatives.`,
        pullQuote: 'When your training data provider is strategically aligned with your biggest competitor, convenience becomes existential risk.',
      },
      {
        heading: 'Why Neutral Infrastructure Wins',
        content: `The neutral infrastructure slot isn't just "not being Scale AI." It requires building something specifically designed for multi-lab trust:\n\n**Data isolation architecture.** Every lab's data must be cryptographically isolated. No shared pools, no cross-contamination, no possibility that Lab A's proprietary evaluation criteria leak into Lab B's pipeline.\n\n**No competing products.** A neutral infrastructure provider cannot also be building models. The moment you compete with your customers, you lose the trust premium.\n\n**Multi-cloud, multi-region.** Labs operate across cloud providers. Your infrastructure must meet them where they are, not force them into your preferred stack.\n\n**Transparent governance.** Publish your data handling policies. Subject yourself to third-party audits. Make your customer contracts public (within reason). The trust premium comes from radical transparency.`,
      },
      {
        heading: 'The Window Is Open — But Closing',
        content: `Market timing matters. The neutral infrastructure slot is empty right now, but it won't stay empty for long.\n\nWe estimate the window is 18-24 months. After that, either a well-funded startup will have established itself as the trusted neutral option, or one of the hyperscalers will build their own data quality layer (as Google is already signaling with internal tooling).\n\nFor RawEval, this timing is the thesis. We're not building the 15th annotation platform. We're building the infrastructure layer that every lab needs but nobody trusts Scale to provide anymore — verified, auditable, neutral evaluation infrastructure.\n\nThe market didn't just open a gap. It opened a category.`,
      },
    ],
  },

  // ──────────────────────────────────────────────
  // 4. RLHF Supply Chain
  // ──────────────────────────────────────────────
  {
    slug: 'rlhf-is-a-supply-chain-problem',
    title: 'RLHF Is a Supply Chain Problem. We\'re Building the Infrastructure.',
    subtitle: 'Human feedback for AI alignment deserves the same rigor as semiconductor manufacturing. Here\'s our blueprint.',
    date: 'Feb 14, 2026',
    isoDate: '2026-02-14',
    category: 'Product',
    readTime: '8 min',
    excerpt: 'Treating human feedback as a supply chain — with sourcing standards, quality controls, and full traceability — is the only way to scale AI alignment.',
    author: 'Mrinal Raj',
    authorRole: 'Co-founder & CEO',
    featured: false,
    tags: ['RLHF', 'supply-chain', 'infrastructure', 'product', 'alignment'],
    illustration: 'pipeline',
    sections: [
      {
        content: `Here's a thought experiment: what if we applied semiconductor supply chain standards to AI training data?\n\nIn semiconductor manufacturing, every material is traced from mine to fab. Every process step is logged. Every defect is root-caused. The supply chain has quality gates at each stage, and a single contaminated batch can be traced back to its exact origin within hours.\n\nNow consider how AI training data works today: anonymous crowdworkers produce annotations with no credential verification, no behavioral monitoring, no provenance tracking, and no quality gates beyond basic inter-annotator agreement. The "supply chain" is a Google Form and a prayer.\n\nThis gap isn't just embarrassing — it's the single biggest risk to AI model quality. And it's why we built RawEval as a supply chain, not a platform.`,
      },
      {
        heading: 'The Four Stages of the Data Supply Chain',
        content: `Our infrastructure maps to four stages, each with its own quality controls:\n\n**Stage 1: Capture.** When an AI model fails — produces a hallucination, gives harmful advice, writes buggy code — that failure needs to be captured with full context. Not just the bad output, but the prompt, the conversation history, the model version, the user context. Today, these failures vanish. Our capture layer preserves them as structured evaluation opportunities.\n\n**Stage 2: Routing.** A captured failure needs to reach the right expert. A medical hallucination should go to a physician, not a linguistics PhD. A legal error should go to a practicing attorney, not a law student. Our routing engine matches failures to experts based on verified credentials, domain expertise, performance history, and availability.\n\n**Stage 3: Verification.** The expert evaluation itself must be verified. Did the expert actually write their assessment, or did they paste in a ChatGPT response? Our Iron Dome anti-cheat system analyzes keystroke dynamics, typing patterns, paste detection, tab-switching behavior, and response coherence in real time. Every evaluation session produces a behavioral fingerprint that proves human authorship.\n\n**Stage 4: Delivery.** The verified evaluation must be packaged with full provenance metadata — expert credentials, session biometrics, reasoning chain, confidence scores, timestamps — and delivered in formats that plug directly into RLHF training pipelines. No manual reformatting. No data cleaning. Pipeline-ready.`,
        stat: { value: '4', label: 'quality gates from capture to delivery' },
      },
      {
        heading: 'Why Platforms Fail and Pipelines Win',
        content: `The annotation market is full of platforms. Toloka, Appen, Labelbox, Scale AI — they all provide a place where work happens. But none of them are designed as pipelines with quality controls at every stage.\n\nThe difference matters:\n\n**Platforms optimize for throughput.** More tasks completed = more revenue. Quality is a cost center, not a revenue driver. This incentive structure guarantees a race to the bottom on annotation quality.\n\n**Pipelines optimize for quality.** Each stage has acceptance criteria. Data that doesn't meet the bar doesn't advance. This creates natural pressure toward quality, because throughput is gated by verification.\n\n**Platforms are black boxes.** You submit work, you get results. What happened in between is opaque. Who did the work? How? Were they qualified? Were they even human?\n\n**Pipelines are transparent.** Every step is logged. Every decision is traceable. Every output carries its provenance. When a model trained on your data makes a mistake, you can trace back to the specific annotations that influenced that behavior.`,
        pullQuote: 'Annotation platforms optimize for throughput. Supply chains optimize for quality. The AI industry needs to decide which one it values.',
      },
      {
        heading: 'Building for the Next Decade',
        content: `We believe the next decade of AI progress will be defined not by who has the most compute, but by who has the best data infrastructure.\n\nCompute is commoditizing. Algorithms are converging. But data quality — verified, auditable, domain-expert data quality — is getting harder and more expensive to produce. It's the scarce resource.\n\nRawEval is building the infrastructure layer for this scarcity. A supply chain where every input is verified, every process is monitored, and every output carries proof of its provenance.\n\nThe AI labs that adopt supply chain thinking for their training data will build better, safer, more reliable models. The rest will keep wondering why their models hallucinate.`,
      },
    ],
  },

  // ──────────────────────────────────────────────
  // 5. YC — $50B Market
  // ──────────────────────────────────────────────
  {
    slug: 'dear-yc-data-quality-is-a-50b-market',
    title: 'Dear YC: Here\'s Why Data Quality Infrastructure Is a $50B Market',
    subtitle: 'A first-principles analysis of the AI data quality market — and why the picks-and-shovels play is the best bet in AI.',
    date: 'Feb 3, 2026',
    isoDate: '2026-02-03',
    category: 'Fundraising',
    readTime: '10 min',
    excerpt: 'The AI data quality market will reach $50B by 2030. Here\'s the bottom-up analysis, the competitive landscape, and why infrastructure wins over applications.',
    author: 'Mrinal Raj',
    authorRole: 'Co-founder & CEO',
    featured: false,
    tags: ['YC', 'fundraising', 'market-size', 'TAM', 'venture-capital', 'data-quality'],
    illustration: 'funding',
    sections: [
      {
        content: `To the partners at Y Combinator and every investor evaluating the AI infrastructure stack:\n\nThe narrative around AI investing has been dominated by two categories: foundation model companies (the labs) and AI-native applications (the apps). But there's a third category that is structurally underinvested and arguably more important than either: the data quality infrastructure layer.\n\nHere's our case for why this market reaches $50B by 2030 — and why the right company in this space becomes one of the most important infrastructure providers in tech.`,
      },
      {
        heading: 'Bottom-Up Market Sizing',
        content: `Let's build the TAM from first principles:\n\n**Layer 1: Direct RLHF spend ($8-12B by 2030)**\nToday's RLHF annotation market is ~$2B. It's growing 35% YoY as more labs train more models on more domains. By 2030, we project 50+ frontier labs spending an average of $150-250M each on human feedback. This alone is $8-12B.\n\n**Layer 2: Quality assurance and verification ($5-8B by 2030)**\nAs data quality becomes a competitive differentiator, labs will spend on verification infrastructure — anti-cheat systems, provenance tracking, expert credentialing, audit tooling. This market barely exists today but will emerge as regulatory pressure increases.\n\n**Layer 3: Compliance and audit infrastructure ($3-5B by 2030)**\nThe EU AI Act is just the beginning. California's SB-1047, China's AI regulations, India's proposed framework — every major jurisdiction is moving toward mandatory data provenance requirements. Compliance tooling for AI training data will mirror what SOC 2 and GDPR did for cloud infrastructure.\n\n**Layer 4: Enterprise AI evaluation ($10-15B by 2030)**\nEvery enterprise deploying AI needs to evaluate model quality on their specific use cases. Today this is done ad-hoc. Tomorrow it will be infrastructure.\n\n**Layer 5: Government and defense ($8-12B by 2030)**\nGovernment AI procurement will require data provenance as a baseline. Defense applications will require cleared, verified human evaluators.`,
        stat: { value: '$50B', label: 'projected market size by 2030' },
      },
      {
        heading: 'Why Picks-and-Shovels, Not Gold',
        content: `In every technology gold rush, the most reliable returns go to the infrastructure providers. During the cloud revolution, AWS became worth more than most of the companies it hosts. During the mobile revolution, the biggest winners were the app stores and developer tooling companies.\n\nThe AI gold rush is no different. And the data quality infrastructure layer has the same characteristics that made AWS and Stripe generational companies:\n\n**High switching costs.** Once a lab integrates its training pipeline with a data quality provider, switching costs are enormous. Custom schemas, API integrations, expert networks, quality baselines — all of these create lock-in.\n\n**Network effects.** A larger expert network produces more diverse, higher-quality evaluations. More data flowing through the pipeline improves routing algorithms. More labs using the infrastructure creates industry-standard quality benchmarks.\n\n**Recurring revenue.** Labs don't buy data quality once — they need it continuously, for every training run, every model update, every domain expansion. This is a subscription business with high retention.\n\n**Regulatory moat.** Compliance infrastructure becomes mandatory, not optional. When regulators require data provenance, every AI company becomes a customer. This is similar to how GDPR made Onetrust a unicorn.`,
        pullQuote: 'In every technology gold rush, the most reliable returns go to infrastructure providers. The AI data quality layer is the picks-and-shovels play of this generation.',
      },
      {
        heading: 'The Competitive Landscape',
        content: `The current landscape breaks into three tiers:\n\n**Tier 1: Incumbents (Scale AI, Appen, Labelbox)**\nScale AI dominates with $14B valuation but has vendor conflict issues (see our post on neutrality). Appen is declining. Labelbox focuses on computer vision. None have built verification infrastructure.\n\n**Tier 2: Emerging players (Surge AI, Invisible Technologies, Outlier AI)**\nSmaller, more focused, but still operating as annotation platforms rather than infrastructure providers. Most lack anti-cheat, provenance, or compliance features.\n\n**Tier 3: The infrastructure gap (where RawEval operates)**\nNo company today offers end-to-end evaluation infrastructure with verified expert networks, real-time anti-cheat, provenance pipelines, and compliance-ready delivery. This is the gap.\n\nWe're not competing with Scale AI on price. We're building a category that Scale AI's business model prevents them from entering — neutral, verified, auditable evaluation infrastructure.`,
      },
      {
        heading: 'What We Need to Win',
        content: `Transparency about what we need:\n\n**Capital.** Building infrastructure requires upfront investment in technology (anti-cheat systems, provenance pipelines, expert credentialing) and go-to-market (lab partnerships, compliance certifications, government relationships).\n\n**Expert network density.** We have 2,400+ verified experts across 45 countries. We need 10,000+ to cover every domain labs care about. Network density is our primary scaling constraint.\n\n**Lab partnerships.** Every frontier lab we onboard validates the category and creates reference customers. We need 5-10 design partners who will co-develop the infrastructure with us.\n\n**Time.** The neutral infrastructure window is 18-24 months. We need to establish category leadership before a hyperscaler builds their own layer or another startup gets there first.\n\nThe market is real. The timing is now. The question is whether the venture ecosystem recognizes that the most important company in AI might not be the one building the model — it might be the one verifying the data that trains it.`,
      },
    ],
  },

  // ──────────────────────────────────────────────
  // 6. EU AI Act
  // ──────────────────────────────────────────────
  {
    slug: 'eu-ai-act-your-training-data-isnt-ready',
    title: 'The EU AI Act Is Here. Your Training Data Isn\'t Ready.',
    subtitle: 'What every AI lab needs to know about training data provenance requirements — before enforcement begins.',
    date: 'Jan 22, 2026',
    isoDate: '2026-01-22',
    category: 'Compliance',
    readTime: '7 min',
    excerpt: 'The EU AI Act mandates full provenance trails on training data. Enforcement begins in 2026. Most labs have nothing in place. Here\'s what compliance actually requires.',
    author: 'Mrinal Raj',
    authorRole: 'Co-founder & CEO',
    featured: false,
    tags: ['EU-AI-Act', 'compliance', 'regulation', 'provenance', 'training-data'],
    illustration: 'compliance',
    sections: [
      {
        content: `On August 1, 2025, the EU AI Act's provisions on high-risk AI systems took effect. For AI labs, the most consequential requirement is Article 10 — which mandates that training data for high-risk AI systems must come with "appropriate data governance and management practices."\n\nTranslated from legalese, this means: you need to know where your training data came from, who produced it, how it was quality-controlled, and you need to be able to prove all of this to a regulator.\n\nMost AI labs cannot do any of this today. And enforcement with real teeth begins in early 2026.`,
      },
      {
        heading: 'What Article 10 Actually Requires',
        content: `Let's get specific about what compliance means:\n\n**Data provenance documentation.** For every piece of training data, you need a record of its origin, its processing history, and its quality assessment. This isn't a one-time audit — it's a continuous requirement for every training run.\n\n**Bias and quality assessment.** You must document how you identified and addressed biases in training data. This requires knowing who your annotators are, what demographics they represent, and how their judgments were calibrated.\n\n**Human oversight records.** For RLHF specifically, you need records showing that human feedback was actually human. This means annotation session logs, identity verification, and — increasingly — behavioral verification that the annotator wasn't using AI.\n\n**Data subject rights.** If your training data includes personal data (and most conversational AI training data does), you need GDPR-compliant processing records, consent documentation, and the ability to respond to data subject access requests.\n\nThe penalty for non-compliance: up to 7% of global annual revenue, or €35 million, whichever is higher.`,
        stat: { value: '7%', label: 'of global revenue — maximum penalty for non-compliance' },
      },
      {
        heading: 'Why Current Infrastructure Falls Short',
        content: `Talk to any AI lab's legal team, and you'll hear the same thing: "We know we need this, but we don't have the infrastructure."\n\nCurrent annotation platforms provide:\n- Task completion records (who did what, when)\n- Basic quality scores (inter-annotator agreement)\n- Payment records\n\nWhat they don't provide:\n- Annotator credential verification against professional registries\n- Behavioral biometrics proving human authorship\n- Session-level provenance chains\n- Bias assessment documentation\n- GDPR-compliant data processing records\n- Audit-ready export formats\n\nThe gap between "what platforms provide" and "what regulators require" is massive. And it's not something that can be patched with a feature update — it requires fundamentally different infrastructure.`,
        pullQuote: 'The gap between what annotation platforms provide and what regulators require isn\'t a feature gap. It\'s an infrastructure gap.',
      },
      {
        heading: 'The Compliance Infrastructure Opportunity',
        content: `Every major regulatory shift creates an infrastructure opportunity. GDPR created Onetrust ($5B+ valuation). SOC 2 created Vanta. SOX created entire consulting practices.\n\nThe EU AI Act will create a similar wave — but specific to AI training data. The companies that build compliance infrastructure for training data provenance will become as essential as Onetrust is for data privacy.\n\nAt RawEval, compliance isn't a feature — it's architectural. Every evaluation that flows through our pipeline automatically generates the provenance artifacts that Article 10 requires:\n\n- Expert credential verification records\n- Behavioral biometrics confirming human authorship\n- Session-level audit logs with timestamps\n- Quality assessment documentation\n- Exportable compliance packages in standard formats\n\nWe're not building compliance tooling on top of an annotation platform. We're building evaluation infrastructure where compliance is a natural output of the pipeline. That's the difference between a patch and a solution.`,
      },
    ],
  },

  // ──────────────────────────────────────────────
  // 7. Iron Dome Anti-Cheat
  // ──────────────────────────────────────────────
  {
    slug: 'iron-dome-for-training-data',
    title: 'We Built an Iron Dome for Training Data. Here\'s How It Works.',
    subtitle: 'Inside RawEval\'s anti-cheat system that detects AI-generated annotations using keystroke dynamics and behavioral biometrics.',
    date: 'Jan 10, 2026',
    isoDate: '2026-01-10',
    category: 'Engineering',
    readTime: '8 min',
    excerpt: 'When 30-50% of crowdworkers use AI to complete annotations, you need more than honor systems. Here\'s how our Iron Dome detects synthetic contamination in real time.',
    author: 'Mrinal Raj',
    authorRole: 'Co-founder & CEO',
    featured: false,
    tags: ['anti-cheat', 'iron-dome', 'engineering', 'biometrics', 'fraud-detection'],
    illustration: 'detector',
    sections: [
      {
        content: `Here's a scenario that plays out thousands of times per day on annotation platforms worldwide:\n\nAn annotator receives a task to evaluate an AI model's response about cardiac arrhythmias. They're supposed to be a medical professional. They read the prompt, open a new tab, paste the question into ChatGPT, copy the response, switch back to the annotation platform, paste it in, and submit. Total time: 45 seconds. Payment: $1.20.\n\nThe annotation is recorded as "human feedback." It's used to train the next version of the model. The model gets marginally worse at cardiac care. Nobody knows. Nobody checks.\n\nWe built Iron Dome to end this.`,
      },
      {
        heading: 'The Detection Stack',
        content: `Iron Dome operates on four layers of detection, each progressively harder to defeat:\n\n**Layer 1: Keystroke Dynamics.**\nEvery human types differently. We measure inter-key intervals, key hold times, and typing rhythms to build a behavioral fingerprint. When someone types naturally, these patterns are irregular, personal, and consistent with their historical profile. When someone pastes text, there's a characteristic signature: no gradual buildup, no corrections, no pauses for thought. Our keystroke analyzer detects copy-paste events with 99.2% accuracy.\n\n**Layer 2: Behavioral Pattern Analysis.**\nBeyond individual keystrokes, we analyze session-level behavior. How long does the annotator spend reading before writing? Do they reference external sources? How do their response times correlate with task difficulty? A genuine expert shows predictable patterns: harder tasks take longer, unfamiliar topics trigger research pauses, confident answers come faster. An annotator using AI shows flat patterns: every task takes roughly the same time regardless of difficulty.\n\n**Layer 3: Content Coherence.**\nAI-generated text has detectable statistical properties: lower perplexity, more uniform sentence length distribution, specific vocabulary preferences, and characteristic hedging patterns. Our content analysis engine compares each annotation against both the annotator's historical writing style and known AI generation patterns.\n\n**Layer 4: Cross-Session Correlation.**\nThe hardest fraud to detect is sophisticated: annotators who use AI outputs as a starting point and then edit them to look human. Iron Dome handles this by correlating patterns across sessions. If an annotator's vocabulary suddenly shifts, if their expertise appears to expand overnight, or if their typing patterns change in ways consistent with increasing AI reliance, the system flags it.`,
        stat: { value: '99.2%', label: 'copy-paste detection accuracy' },
      },
      {
        heading: 'What Happens When Iron Dome Flags Something',
        content: `Detection is only useful if the response is calibrated. Iron Dome doesn't just flag — it triages:\n\n**Green (Clear).** Normal human patterns. Data flows through the pipeline.\n\n**Yellow (Review).** Anomalous patterns that could be legitimate (e.g., an expert who types very fast, or someone using voice-to-text). Flagged for human QC review with specific behavioral evidence.\n\n**Red (Block).** Clear evidence of AI generation. The annotation is quarantined, the expert's account is flagged, and the task is rerouted to a verified backup evaluator. The blocked annotation is preserved for fraud analysis.\n\nIn our first six months of deployment, Iron Dome flagged 23% of annotations for review and blocked 8% for clear AI generation. Among blocked annotations, manual verification confirmed AI contamination in 94% of cases.`,
        pullQuote: 'In our first six months, Iron Dome blocked 8% of all annotations for clear AI generation — and manual review confirmed contamination in 94% of those cases.',
      },
      {
        heading: 'The Arms Race',
        content: `We're not naive about the arms race dynamic. As detection improves, evasion will evolve. Annotators will learn to type AI-generated text character by character. They'll develop hybrid workflows that blend AI assistance with genuine reasoning.\n\nOur response is multi-layered:\n\n**Continuous model updates.** Iron Dome's detection models are retrained weekly on the latest evasion patterns.\n\n**Adversarial red-teaming.** We maintain an internal team whose job is to defeat Iron Dome. Every bypass they discover becomes a training signal.\n\n**Economic design.** Iron Dome isn't just technology — it's incentive design. We pay experts enough that cheating isn't worth the risk of losing access to the platform. We tier experts by performance, and top-tier experts earn 5-10x what crowdworkers make on other platforms.\n\nThe goal isn't perfect detection (which is impossible). The goal is making the cost of cheating higher than the cost of doing the work honestly. When you combine strong detection with strong incentives, you get clean data.`,
      },
    ],
  },

  // ──────────────────────────────────────────────
  // 8. Expert Network
  // ──────────────────────────────────────────────
  {
    slug: '2400-experts-45-countries-one-mission',
    title: '2,400 Experts, 45 Countries, One Mission: Verified Human Judgment',
    subtitle: 'How we built the world\'s largest verified expert network for AI evaluation — and what we learned along the way.',
    date: 'Dec 18, 2025',
    isoDate: '2025-12-18',
    category: 'Company',
    readTime: '6 min',
    excerpt: 'Building a global network of domain experts for AI evaluation taught us that credentials matter, but performance matters more. Here\'s the story.',
    author: 'Mrinal Raj',
    authorRole: 'Co-founder & CEO',
    featured: false,
    tags: ['expert-network', 'company', 'domain-experts', 'verification', 'global'],
    illustration: 'globe',
    sections: [
      {
        content: `When we started building RawEval's expert network, we assumed the hard part would be recruiting. Finding physicians, attorneys, engineers, and researchers who would evaluate AI outputs for a living — surely that's the bottleneck, right?\n\nWrong. The hard part is verification.\n\nAnyone can claim to be a cardiologist on the internet. Anyone can list "10 years of litigation experience" on a profile. The difference between a useful expert network and a liability is whether you can prove that the person evaluating your medical AI actually graduated from medical school, actually holds an active license, and actually knows what they're talking about.\n\nHere's how we built a network where every expert is verified, performance-tiered, and continuously monitored for quality.`,
      },
      {
        heading: 'The Three Gates',
        content: `Every expert who joins RawEval passes through three verification gates:\n\n**Gate 1: Credential Verification.**\nWe verify professional credentials against primary sources. Medical licenses against state medical boards. Law degrees against bar association records. Engineering certifications against issuing bodies. This isn't a LinkedIn check — it's primary source verification that takes 3-7 business days per expert.\n\n**Gate 2: Domain Assessment.**\nCredentials prove you were qualified at some point. Our domain assessments prove you're qualified now. Each expert completes a calibrated assessment in their claimed domain, evaluated by senior experts in the same field. Pass rates vary by domain: 68% for general medicine, 52% for specialized legal fields, 74% for software engineering.\n\n**Gate 3: Behavioral Baseline.**\nBefore an expert can take live tasks, they complete a baseline session that establishes their keystroke dynamics, typing speed, response patterns, and reasoning style. This becomes their behavioral fingerprint — the reference point that Iron Dome uses to detect anomalies in future sessions.`,
        stat: { value: '2,400+', label: 'verified experts across 45 countries' },
      },
      {
        heading: 'Performance-Based Tiering',
        content: `We don't treat all experts equally. Our tiering system creates natural quality incentives:\n\n**Tier 1: Certified Expert.** New experts who've passed all three gates. They receive standard tasks with standard compensation.\n\n**Tier 2: Proven Expert.** Experts who've completed 100+ evaluations with quality scores above 90%. They receive more complex tasks and 1.5x compensation.\n\n**Tier 3: Elite Expert.** Experts who've completed 500+ evaluations with quality scores above 95%, and whose evaluations have measurably improved model performance in downstream testing. They receive the most challenging tasks, 3x compensation, and opportunities to mentor Tier 1 and 2 experts.\n\nThis system creates a meritocracy where the best experts earn the most, the hardest tasks go to the most qualified people, and quality is rewarded, not just speed.\n\nThe result: our Tier 3 experts produce evaluations that improve downstream model performance by an average of 2.3x compared to crowdworker annotations, at a cost that's only 5x higher. On a quality-adjusted basis, expert evaluation is dramatically cheaper than crowdwork.`,
        pullQuote: 'Our Tier 3 experts improve downstream model performance by 2.3x compared to crowdworkers. On a quality-adjusted basis, expert evaluation is dramatically cheaper.',
      },
      {
        heading: 'What We\'ve Learned',
        content: `After 18 months of building this network, our biggest lessons:\n\n**Geographic diversity matters.** AI models are deployed globally. Training data that reflects only American or Western European perspectives produces models with cultural blind spots. Our 45-country network ensures diverse perspectives on every evaluation.\n\n**Experts want meaningful work.** Our retention rate is 89% — remarkably high for gig work. The reason: experts feel their work matters. They're not labeling cat pictures. They're improving AI systems in their domain of expertise. That purpose drives retention.\n\n**The bar should be high.** We reject 40% of applicants. This feels painful when you're trying to scale, but it protects the network's quality and reputation. Every expert who passes our gates knows they're part of a selective group, and they behave accordingly.\n\n**Community compounds.** We've built domain-specific communities where experts share knowledge, discuss challenging evaluations, and calibrate their standards. These communities produce better evaluations than isolated experts, because they create shared norms and peer accountability.`,
      },
    ],
  },

  // ──────────────────────────────────────────────
  // 9. Why We're Raising
  // ──────────────────────────────────────────────
  {
    slug: 'why-were-raising-case-for-neutral-ai-evaluation',
    title: 'Why We\'re Raising: The Case for Neutral AI Evaluation Infrastructure',
    subtitle: 'An honest look at what we\'ve built, what we need, and why the next 18 months define the AI data quality category.',
    date: 'Dec 2, 2025',
    isoDate: '2025-12-02',
    category: 'Fundraising',
    readTime: '8 min',
    excerpt: 'We\'re raising because the window for neutral AI evaluation infrastructure is 18-24 months. Here\'s our honest assessment of where we are, what we need, and why the timing matters.',
    author: 'Mrinal Raj',
    authorRole: 'Co-founder & CEO',
    featured: false,
    tags: ['fundraising', 'strategy', 'neutrality', 'AI-infrastructure', 'venture-capital'],
    illustration: 'funding',
    sections: [
      {
        content: `I want to write the fundraising blog post I wish I'd read as a founder — one that's honest about what we've built, transparent about what we need, and clear-eyed about the risks.\n\nRawEval is raising capital to become the neutral infrastructure layer for AI evaluation. Here's our case, unvarnished.`,
      },
      {
        heading: 'What We\'ve Built (The Proof)',
        content: `In 18 months, we've built:\n\n**A verified expert network of 2,400+ professionals across 45 countries.** Not crowdworkers — credentialed domain experts in medicine, law, engineering, finance, and research. Each one verified against primary sources.\n\n**An anti-cheat system (Iron Dome) that detects AI-generated annotations with 99.2% accuracy.** In a market where 30-50% of crowdworker annotations are AI-generated, this is a fundamental differentiator.\n\n**A provenance pipeline that generates audit-ready artifacts.** Every evaluation that flows through our system produces the compliance documentation that the EU AI Act requires.\n\n**47,000+ evaluations shipped with a 96.8% accuracy rate.** This isn't a demo. It's production-grade infrastructure processing real workloads for real customers.\n\nThese aren't vanity metrics. They're proof that the technology works and the market exists.`,
        stat: { value: '47K+', label: 'evaluations shipped at 96.8% accuracy' },
      },
      {
        heading: 'What We Need (The Ask)',
        content: `We need capital to do three things:\n\n**1. Scale the expert network from 2,400 to 10,000.** Every domain we don't cover is a customer we can't serve. We need experts in materials science, biotechnology, advanced mathematics, and 30+ additional sub-domains.\n\n**2. Build enterprise sales infrastructure.** Our current customers came through founder-led sales. To win the next 50 labs, we need a sales team, solutions engineers, and enterprise support. AI lab procurement cycles are 3-6 months, and we need to run 20+ concurrent deals.\n\n**3. Achieve compliance certifications.** SOC 2 Type II, ISO 27001, and EU AI Act compliance certification. These are table stakes for enterprise AI lab deals. Certification processes take 6-12 months and require dedicated resources.\n\nWe're not raising to figure out product-market fit. We have it. We're raising to capture a time-limited market opportunity.`,
      },
      {
        heading: 'Why the Timing Is Now (The Urgency)',
        content: `Three converging forces create a window that won't stay open:\n\n**Scale AI's vendor conflict** has created the neutral infrastructure slot. But other startups are noticing. We estimate 12-18 months before a well-funded competitor makes a serious attempt at this position.\n\n**The EU AI Act's enforcement timeline** means labs need compliance infrastructure by early 2026. They're making vendor decisions now. Every quarter we delay is a quarter where a competitor — or a hyperscaler's internal solution — could fill the gap.\n\n**The synthetic data ceiling** is creating urgency at labs to secure verified human data sources. Labs that relied on synthetic data as a stopgap are actively looking for alternatives. The sales conversations are happening now.\n\nThe companies that win infrastructure categories are the ones that establish themselves during the market's formation period. AWS won cloud because it was there when companies started moving to the cloud. Stripe won payments because it was there when developers started building internet businesses.\n\nThe AI evaluation infrastructure category is forming right now. The company that establishes itself as the trusted, neutral standard in the next 18 months will win the category for a decade. That's the prize.`,
        pullQuote: 'The company that establishes itself as the trusted, neutral standard in AI evaluation infrastructure in the next 18 months will win the category for a decade.',
      },
      {
        heading: 'The Honest Risks',
        content: `No fundraising pitch is complete without honest risk assessment:\n\n**Risk 1: A hyperscaler builds their own.** Google, Microsoft, or Amazon could build internal data quality layers. Mitigation: they're conflicted (they build models too), and labs won't trust them for the same reasons they don't trust Scale AI.\n\n**Risk 2: Labs build in-house.** Large labs could build their own evaluation infrastructure. Mitigation: it's not their core competency, it's expensive, and our shared infrastructure model is 5-10x more cost-efficient than every lab building their own.\n\n**Risk 3: Synthetic data solves itself.** New techniques could overcome the synthetic data ceiling. Mitigation: the Nature research suggests this is a fundamental limitation, not a technical one. And even if synthetic data improves, regulatory requirements for human verification remain.\n\n**Risk 4: We can't scale the expert network fast enough.** Expert recruitment and verification is slow. Mitigation: our community-driven approach (where existing experts refer new ones) is producing 200+ verified new experts per month, with a 62% referral rate.\n\nThese risks are real. We think about them every day. But we believe the opportunity justifies the risk, and the proof points we've built justify the investment.`,
      },
    ],
  },

  // ──────────────────────────────────────────────
  // 10. YC to Series A
  // ──────────────────────────────────────────────
  {
    slug: 'yc-to-series-a-picks-and-shovels-ai-gold-rush',
    title: 'From YC to Series A: Building the Picks-and-Shovels of the AI Gold Rush',
    subtitle: 'Our journey from a Y Combinator idea to production infrastructure — and the lessons we learned about building in AI.',
    date: 'Nov 18, 2025',
    isoDate: '2025-11-18',
    category: 'Company',
    readTime: '7 min',
    excerpt: 'Building an AI infrastructure company is different from building an AI application. Here\'s what YC taught us and what we learned the hard way.',
    author: 'Mrinal Raj',
    authorRole: 'Co-founder & CEO',
    featured: false,
    tags: ['YC', 'startup', 'company', 'fundraising', 'journey', 'lessons'],
    illustration: 'picks-shovels',
    sections: [
      {
        content: `When we applied to Y Combinator, our pitch was simple: "AI labs are training models on garbage data, and nobody is building the quality infrastructure to fix it."\n\nThe response from partners was immediate: "Why hasn't anyone done this already?"\n\nThat question — and the answer — shaped everything we've built. The reason nobody had built evaluation infrastructure is that it's genuinely hard. Not algorithm-hard. Infrastructure-hard. The kind of hard that requires building systems, networks, compliance frameworks, and trust simultaneously. The kind of hard that most founders avoid because the feedback loop is measured in quarters, not sprint cycles.\n\nHere's what we've learned building it.`,
      },
      {
        heading: 'Lesson 1: The Problem Is Real, But Invisible',
        content: `The biggest challenge in our YC batch wasn't building the product. It was convincing people the problem existed.\n\nAI labs know their training data quality is bad. But it's a known-unknown — they don't know how bad, because they have no measurement infrastructure. When you can't measure a problem, you can't prioritize solving it. And when you can't prioritize it, you certainly can't justify buying infrastructure to fix it.\n\nOur breakthrough was building a free audit tool that let labs analyze their existing training data for synthetic contamination. When a top-10 AI lab ran our tool and discovered that 34% of their "human" annotations showed AI-generation signatures, the conversation changed from "do we have a problem?" to "how fast can you scale?"\n\nLesson: don't sell the solution first. Prove the problem exists, and the solution sells itself.`,
        pullQuote: 'When a top-10 AI lab discovered that 34% of their "human" annotations showed AI-generation signatures, the conversation changed overnight.',
      },
      {
        heading: 'Lesson 2: Infrastructure Companies Need Different Metrics',
        content: `YC is great at accelerating product companies. Build fast, get users, measure growth. But infrastructure companies — especially ones that serve other businesses — need different metrics:\n\n**Throughput and latency** matter more than user count. How many evaluations can you process per hour? What's the latency from capture to delivery?\n\n**Quality metrics** matter more than engagement. What's your accuracy rate? What's the downstream model improvement from your data vs. alternatives?\n\n**Retention** matters more than acquisition. If a lab integrates your infrastructure and then churns, you've failed. Our retention rate (94% after 6 months) is the metric we care most about.\n\n**Integration depth** matters more than surface adoption. A lab that uses your API for one experiment is a trial. A lab that integrates your pipeline into their training infrastructure is a customer.\n\nWe spent three months after YC rebuilding our metrics dashboard because we realized we were measuring the wrong things. We were counting "tasks completed" when we should have been measuring "downstream model improvement per dollar spent."`,
      },
      {
        heading: 'Lesson 3: Build the Network Before the Platform',
        content: `Most marketplace founders build the platform first and then recruit supply. We did the opposite: we spent our first four months building the expert network before writing a single line of platform code.\n\nThis felt terrifyingly slow. Every other company in our batch was shipping features weekly. We were cold-emailing physicians and verifying law degrees.\n\nBut it turned out to be the right call. When we finally launched the platform, we had 400 verified experts ready to go. Our first customer got results in 48 hours instead of the usual 2-3 weeks. That speed — powered by pre-built supply — was our wedge.\n\nThe expert network is also our moat. Anyone can build an annotation platform in a weekend. Nobody can build a verified expert network in less than 12-18 months. By the time competitors realize they need one, we'll have 10,000+ experts with years of performance history.`,
      },
      {
        heading: 'What Comes Next',
        content: `We're at an inflection point. We've proven the technology works, the market exists, and the timing is right. Now we need to scale — and scaling infrastructure is a capital-intensive process.\n\nOur roadmap for the next 18 months:\n\n**Q1 2026:** Scale expert network to 5,000. Launch compliance certification program. Close 3 additional enterprise lab partnerships.\n\n**Q2 2026:** Launch self-serve platform for smaller AI companies. Achieve SOC 2 Type II certification. Expand to government sector.\n\n**Q3 2026:** 10,000 expert milestone. EU AI Act compliance certification. Launch enterprise SLA tiers.\n\n**Q4 2026:** Category leadership position established. 20+ enterprise customers. Evaluate Series A timing.\n\nThe YC experience taught us to move fast on the right things. The right thing now isn't more features — it's more trust, more experts, and more proof that neutral evaluation infrastructure is a category worth building.`,
      },
    ],
  },

  // ──────────────────────────────────────────────
  // 11. Detecting Fraud in AI Training
  // ──────────────────────────────────────────────
  {
    slug: 'human-in-the-loop-is-lying',
    title: 'The Human in the Loop Is Lying: Detecting Fraud in AI Training',
    subtitle: 'An investigation into the scale of synthetic contamination in training data — and what it means for model safety.',
    date: 'Nov 5, 2025',
    isoDate: '2025-11-05',
    category: 'Research',
    readTime: '9 min',
    excerpt: 'Our analysis of 50,000 annotations across major platforms found that 30-50% show signatures of AI generation. The implications for model safety are alarming.',
    author: 'Mrinal Raj',
    authorRole: 'Co-founder & CEO',
    featured: false,
    tags: ['fraud', 'synthetic-contamination', 'research', 'safety', 'anti-cheat'],
    illustration: 'shield',
    sections: [
      {
        content: `In Q3 2025, we conducted an analysis that should alarm everyone working in AI safety.\n\nWe examined 50,000 annotations from three major annotation platforms — tasks that were labeled as "human feedback" and used to train production AI systems. Using a combination of keystroke analysis, statistical text analysis, and behavioral pattern detection, we classified each annotation by its likely origin: genuine human, AI-assisted human, or primarily AI-generated.\n\nThe results were worse than we expected.`,
      },
      {
        heading: 'The Numbers',
        content: `Across all three platforms and all task types, here's what we found:\n\n**52% Genuine Human:** Annotations that showed consistent human typing patterns, natural error correction, and idiosyncratic language use. These are real.\n\n**19% AI-Assisted:** Annotations where the human used AI as a reference or starting point but added substantial original reasoning. These show mixed patterns — some natural typing, some paste events, meaningful edits and additions.\n\n**29% Primarily AI-Generated:** Annotations where the vast majority of content was copied from an AI system with minimal or no human editing. These show clear paste signatures, AI-characteristic vocabulary, and minimal original contribution.\n\nThe rates varied significantly by domain:\n\n- **Creative writing tasks:** 41% primarily AI-generated (the easiest to fake)\n- **Code review tasks:** 35% primarily AI-generated (developers are comfortable with AI tools)\n- **Medical evaluation tasks:** 22% primarily AI-generated (higher expertise barrier)\n- **Legal analysis tasks:** 18% primarily AI-generated (lowest rate, possibly due to professional liability concerns)`,
        stat: { value: '29%', label: 'of "human" annotations were primarily AI-generated' },
      },
      {
        heading: 'Why This Matters for Model Safety',
        content: `The safety implications of synthetic contamination go beyond data quality:\n\n**Alignment poisoning.** RLHF is supposed to align models with human preferences. If 29% of "human preferences" are actually AI preferences, you're not aligning the model with humans — you're aligning it with a distorted echo of itself. This creates unpredictable failure modes that don't show up in standard evaluations.\n\n**Safety boundary erosion.** Safety training relies on human annotators identifying harmful outputs. If those annotators are using AI to generate their safety assessments, the safety boundaries become circular: the model defines what's safe, and then "humans" confirm it. Genuine safety failures — the ones that require human moral judgment — slip through.\n\n**Bias amplification.** AI-generated annotations amplify the biases present in the generating model. When these biased annotations are used to train the next model, biases compound. Over multiple generations, this can produce models with extreme biases that are invisible in standard testing because the tests themselves were contaminated.`,
        pullQuote: 'If 29% of "human preferences" are actually AI preferences, you\'re not aligning the model with humans — you\'re aligning it with a distorted echo of itself.',
      },
      {
        heading: 'The Detection Gap',
        content: `We shared our methodology with five AI labs. Their reactions were uniform: surprise at the scale, followed by the realization that they had no way to detect this themselves.\n\nCurrent annotation platforms do not:\n- Monitor keystroke dynamics during annotation sessions\n- Analyze typing patterns for paste-event signatures\n- Compare annotation text against known AI generation patterns\n- Track behavioral consistency across sessions\n- Flag sudden changes in annotator output quality or style\n\nThe platforms aren't incentivized to build detection. Their business model is throughput-based — they're paid per task completed. Detecting and rejecting AI-generated annotations reduces throughput and revenue. The incentive structure actively discourages quality control.\n\nThis is why detection must be built into evaluation infrastructure, not bolted onto annotation platforms. When quality control is architectural — when every data point must pass through behavioral verification before it enters the pipeline — contamination becomes detectable and preventable.\n\nThat's what Iron Dome does. And based on this research, it's not optional — it's essential.`,
      },
    ],
  },

  // ──────────────────────────────────────────────
  // 12. AI Trains on AI
  // ──────────────────────────────────────────────
  {
    slug: 'what-happens-when-ai-trains-on-ai',
    title: 'What Happens When AI Trains on AI: A Data Quality Crisis',
    subtitle: 'The recursive contamination loop that threatens to undermine a decade of AI progress — explained from first principles.',
    date: 'Oct 20, 2025',
    isoDate: '2025-10-20',
    category: 'Research',
    readTime: '10 min',
    excerpt: 'We\'re in a recursive loop where AI trains on AI-generated data, producing worse models that generate worse data. Breaking this cycle requires verified human signal at scale.',
    author: 'Mrinal Raj',
    authorRole: 'Co-founder & CEO',
    featured: false,
    tags: ['recursive-training', 'data-quality', 'model-collapse', 'AI-safety', 'human-feedback'],
    illustration: 'feedback-loop',
    sections: [
      {
        content: `Imagine a photocopier that copies its own copies. The first copy looks almost identical to the original. The second copy is slightly degraded. By the twentieth copy, the image is a blurry, distorted ghost of what it once was.\n\nThis is what's happening to AI — except instead of images, it's knowledge, reasoning ability, and alignment with human values that's being degraded with each generation.\n\nThe AI industry has stumbled into a recursive contamination loop that, left unchecked, will undermine a decade of progress. Here's how it works, why it's accelerating, and what we need to do about it.`,
      },
      {
        heading: 'The Loop, Explained',
        content: `The recursive contamination loop has four steps:\n\n**Step 1: Model generates outputs.**\nAI models produce text, code, analysis, and recommendations that flood the internet. By some estimates, AI-generated content already comprises 10-15% of new internet content, and this percentage is growing exponentially.\n\n**Step 2: Outputs become training data.**\nThe next generation of models is trained on internet data — which now includes AI-generated content. This means models are partially training on their own outputs (or the outputs of similar models).\n\n**Step 3: "Human" feedback is AI-contaminated.**\nWhen labs hire humans to provide feedback on model outputs (RLHF), 30-50% of those "humans" use AI to generate their annotations. The feedback loop tightens.\n\n**Step 4: Degraded model generates more outputs.**\nThe resulting model, trained on AI-contaminated data and AI-contaminated feedback, produces outputs that are subtly degraded. These outputs flow back into Step 1, and the cycle accelerates.\n\nEach iteration of this loop narrows the model's output distribution, erodes rare knowledge, and amplifies biases. The model doesn't get dramatically worse all at once — it gets incrementally worse in ways that are invisible to standard benchmarks but measurable in real-world performance.`,
        stat: { value: '10-15%', label: 'of new internet content is AI-generated' },
      },
      {
        heading: 'The Contamination Is Already Widespread',
        content: `This isn't a theoretical risk. The contamination is already measurable:\n\n**Web scraping is compromised.** Common Crawl, the dataset that underlies most LLM training, now contains significant AI-generated content. Filtering it out is extremely difficult because modern AI text is statistically similar to human text.\n\n**Wikipedia is affected.** Researchers have detected increasing amounts of AI-generated content in Wikipedia articles — one of the most important training data sources for language models.\n\n**Academic papers are contaminated.** Studies have found AI-generated phrases and patterns in peer-reviewed papers, meaning even curated academic datasets contain synthetic content.\n\n**Stack Overflow is transforming.** Developer Q&A, long a gold mine for code training data, is increasingly populated by AI-generated answers. Stack Overflow itself has struggled with policies around AI content.\n\nThe problem compounds because contamination is invisible. You can't look at a piece of text and reliably determine whether a human or AI wrote it. The contamination is probabilistic, distributed, and growing.`,
        pullQuote: 'You can\'t look at a piece of text and reliably determine whether a human or AI wrote it. The contamination is probabilistic, distributed, and growing.',
      },
      {
        heading: 'Why Benchmarks Don\'t Catch It',
        content: `If recursive contamination degrades model quality, why don't benchmarks show it?\n\nBecause benchmarks are contaminated too.\n\nMany popular AI benchmarks are created using the same process — human annotators writing questions and answers. If those annotators use AI, the benchmark itself reflects AI patterns rather than genuine human reasoning. A model trained on AI-contaminated data will score well on AI-contaminated benchmarks while performing poorly on tasks that require genuine human-like reasoning.\n\nThis is the most dangerous aspect of the contamination loop: it creates a parallel reality where everything looks fine by the metrics, while real-world performance quietly degrades.\n\nThe solution requires evaluation infrastructure that is provably free from synthetic contamination — where every evaluation is performed by verified humans whose work is behaviorally authenticated. This is the only way to create a reliable signal of model quality in a world where synthetic content is everywhere.`,
      },
      {
        heading: 'Breaking the Loop',
        content: `Breaking the recursive contamination loop requires intervention at multiple points:\n\n**1. Verified human data sources.** Create and maintain datasets where every data point is provably human-authored. This requires credential verification, behavioral biometrics, and provenance chains — exactly what RawEval's infrastructure provides.\n\n**2. Contamination detection.** Build tools that can identify AI-generated content in training datasets and filter it out. This is an arms race, but current detection methods can catch 80-90% of synthetic content.\n\n**3. Clean evaluation benchmarks.** Develop benchmarks where every question, answer, and evaluation criterion is produced by verified humans in monitored sessions. Without clean benchmarks, you can't even measure whether your model is improving or degrading.\n\n**4. Economic incentives.** Pay human annotators enough that they don't need to use AI shortcuts. Our top-tier experts earn 5-10x crowdworker rates — enough that the risk of getting caught cheating isn't worth the marginal time savings.\n\n**5. Regulatory requirements.** The EU AI Act's provenance requirements will force labs to invest in data quality infrastructure. This creates the market conditions for clean data to become the standard, not the exception.\n\nThe recursive contamination loop is the most underappreciated risk in AI. It's invisible, it's accelerating, and it affects every model trained on internet data. Breaking it requires infrastructure that most labs haven't built — but all labs need.\n\nThat's what we're here for.`,
      },
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getPostsByCategory(category: string): BlogPost[] {
  return blogPosts.filter((post) => post.category === category);
}

export function getFeaturedPost(): BlogPost | undefined {
  return blogPosts.find((post) => post.featured);
}

export function getAllCategories(): string[] {
  return [...new Set(blogPosts.map((post) => post.category))];
}

export function getAllSlugs(): string[] {
  return blogPosts.map((post) => post.slug);
}
