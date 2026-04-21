import { User, Settings, Shield } from 'lucide-react';

export default function Profile() {
  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Operative Profile</h1>
        <div className="text-sm text-sb-text-muted">Manage your secure credentials and preferences.</div>
      </div>

      <div className="max-w-3xl space-y-6">
        <div className="bg-sb-surface rounded-2xl p-8 border border-sb-border flex items-center gap-6">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-sb-primary">
            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200&h=200" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">Sentinel 01</h2>
            <div className="text-xs text-sb-primary tracking-widest uppercase font-bold mb-3">Active Link</div>
            <div className="text-sm text-sb-text-muted">email@streamboat.io</div>
          </div>
          <button className="ml-auto px-6 py-2 bg-[#111113] border border-sb-border rounded-lg text-sm font-bold hover:border-sb-text transition-colors">
            Edit Dossier
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-sb-surface rounded-2xl p-6 border border-sb-border">
            <div className="flex items-center gap-2 text-xs font-bold text-sb-purple uppercase tracking-wider mb-6">
              <Shield className="w-4 h-4" /> Security Settings
            </div>
            <div className="space-y-4">
              <button className="w-full text-left py-3 border-b border-sb-border text-sm font-medium hover:text-sb-primary transition-colors flex justify-between items-center">
                Change Access Key
                <span className="text-xs text-sb-text-muted">Updated 30d ago</span>
              </button>
              <button className="w-full text-left py-3 border-b border-sb-border text-sm font-medium hover:text-sb-primary transition-colors flex justify-between items-center">
                Two-Factor Authentication
                <span className="text-xs text-sb-primary font-bold">Enabled</span>
              </button>
              <button className="w-full text-left py-3 text-sm font-medium hover:text-sb-primary transition-colors flex justify-between items-center">
                Active Sessions
                <span className="text-xs text-sb-text-muted">2 Devices</span>
              </button>
            </div>
          </div>

          <div className="bg-sb-surface rounded-2xl p-6 border border-sb-border">
            <div className="flex items-center gap-2 text-xs font-bold text-[#00f2fe] uppercase tracking-wider mb-6">
              <Settings className="w-4 h-4" /> Preferences
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-sb-border">
                <span className="text-sm font-medium">Email Notifications</span>
                <div className="w-10 h-5 bg-sb-primary rounded-full relative">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-sb-border">
                <span className="text-sm font-medium">Auto-Ingest Backup</span>
                <div className="w-10 h-5 bg-sb-border rounded-full relative">
                  <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full opacity-50"></div>
                </div>
              </div>
              <button className="w-full text-left py-3 text-sm font-medium text-red-500 hover:text-red-400 transition-colors">
                Deactivate Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
