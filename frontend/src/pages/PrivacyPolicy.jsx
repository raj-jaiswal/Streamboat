export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-sb-bg text-sb-text relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-sb-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sb-purple/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="border-b-4 border-sb-border pb-8 mb-12">
          <h1 className="text-4xl font-extrabold text-white mb-4 tracking-wide">
            PRIVACY POLICY
          </h1>
          <p className="text-xs text-sb-text-muted italic">
            Last Updated: April 22, 2026
          </p>
        </div>

        <section className="mb-12">
          <p className="text-sm leading-relaxed text-sb-text-muted mb-8 text-justify">
            This Privacy Policy explains how Streamboat collects, uses, and protects your data when you use our platform. Our anti-piracy architecture requires specific telemetry and file processing to maintain security.
          </p>

          <div className="space-y-10">
            <div>
              <h2 className="text-lg font-bold uppercase tracking-widest text-white border-l-4 border-sb-primary pl-4 mb-4">
                1. Information We Collect
              </h2>
              <p className="text-sm leading-relaxed text-sb-text-muted text-justify">
                We collect information you provide such as name, email, and uploaded content. We may also collect usage data like activity logs, device information, and viewing patterns to ensure DRM compliance.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold uppercase tracking-widest text-white border-l-4 border-sb-primary pl-4 mb-4">
                2. How We Use Your Data
              </h2>
              <p className="text-sm leading-relaxed text-sb-text-muted text-justify">
                We use your data to provide services, improve user experience, and ensure platform security. Telemetry is used exclusively to detect anomalous retrieval patterns or unauthorized scraping.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold uppercase tracking-widest text-white border-l-4 border-sb-primary pl-4 mb-4">
                3. File Uploads & AI Processing
              </h2>
              <p className="text-sm leading-relaxed text-sb-text-muted text-justify">
                Uploaded files may be processed for storage, search, and AI-based features. This includes generating deep vector embeddings via Google Gemini and storing them in Pinecone for algorithmic similarity matching.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold uppercase tracking-widest text-white border-l-4 border-sb-primary pl-4 mb-4">
                4. Data Sharing
              </h2>
              <p className="text-sm leading-relaxed text-sb-text-muted text-justify">
                We do not sell your data. Data may be shared only with trusted third-party services like cloud storage or AI APIs required for core platform functionality.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold uppercase tracking-widest text-white border-l-4 border-sb-primary pl-4 mb-4">
                5. Security Infrastructure
              </h2>
              <p className="text-sm leading-relaxed text-sb-text-muted text-justify">
                We use military-grade security practices to protect your data, including hostile devtools blocking, UI event suppression, and encrypted transmissions.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}