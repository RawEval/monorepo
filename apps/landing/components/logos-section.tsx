'use client';

// Placeholder company logos - in production these would be real client logos
const logos = [
  { name: 'OpenAI', initial: 'O' },
  { name: 'Meta AI', initial: 'M' },
  { name: 'Anthropic', initial: 'A' },
  { name: 'Google DeepMind', initial: 'G' },
  { name: 'Microsoft', initial: 'MS' },
  { name: 'Amazon', initial: 'AM' },
  { name: 'Cohere', initial: 'C' },
  { name: 'Mistral', initial: 'MI' },
];

export function LogosSection() {
  return (
    <section className="border-border bg-muted/30 border-y py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="text-muted-foreground mb-8 text-center text-sm font-medium">
          Trusted by leading AI research teams
        </p>

        {/* Logos marquee */}
        <div className="relative overflow-hidden">
          <div className="animate-marquee flex gap-12">
            {[...logos, ...logos].map((logo, index) => (
              <div
                key={`${logo.name}-${index}`}
                className="text-muted-foreground/60 hover:text-muted-foreground flex shrink-0 items-center gap-2 transition-colors"
              >
                <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold">
                  {logo.initial}
                </div>
                <span className="text-sm font-medium whitespace-nowrap">
                  {logo.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
