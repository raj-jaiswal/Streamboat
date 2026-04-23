export default function TechDetails() {
  return (
    <div className="min-h-screen bg-sb-bg text-sb-text relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-sb-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sb-purple/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <h1 className="text-4xl font-extrabold text-white mb-8 border-b-4 border-sb-border pb-8 tracking-wide">
          SYSTEM ARCHITECTURE
        </h1>
        <div className="space-y-8">
          <div className="bg-sb-surface border border-sb-border p-8 rounded-2xl transition-all hover:border-sb-primary">
            <h2 className="text-2xl font-bold text-white mb-6">Frontend Layer</h2>
            <ul className="space-y-4 text-sb-text-muted">
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-sb-primary"/> react.js orchestrated with vite</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-sb-primary"/> tailwind css v4 for utility-first styling</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-sb-primary"/> react router dom for single page navigation</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-sb-primary"/> context api handling global authentication state</li>
            </ul>
          </div>

          <div className="bg-sb-surface border border-sb-border p-8 rounded-2xl transition-all hover:border-sb-primary">
            <h2 className="text-2xl font-bold text-white mb-6">Backend Infrastructure</h2>
            <ul className="space-y-4 text-sb-text-muted">
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-sb-primary"/> node.js runtime with express frameworks</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-sb-primary"/> mongodb for nosql document storage</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-sb-primary"/> json web tokens and bcrypt for secure auth</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-sb-primary"/> cloudinary integration for media asset delivery</li>
            </ul>
          </div>

          <div className="bg-sb-surface border border-sb-border p-8 rounded-2xl transition-all hover:border-sb-primary">
            <h2 className="text-2xl font-bold text-white mb-6">Anti-Piracy & AI Systems</h2>
            <ul className="space-y-4 text-sb-text-muted">
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-sb-primary"/> google gemini generating deep vector embeddings</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-sb-primary"/> pinecone database for algorithmic similarity matching</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-sb-primary"/> hostile devtools blocking and ui event suppression</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}