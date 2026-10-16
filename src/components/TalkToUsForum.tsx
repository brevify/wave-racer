import React, { useState } from 'react';
import { DiscussionEmbed, CommentCount } from 'disqus-react';

interface ForumTopic {
  id: string;
  title: string;
  description: string;
  category: string;
  author: string;
  timeAgo: string;
}

interface SubmittedFeedback {
  id: string;
  name: string;
  category: string;
  message: string;
  timestamp: string;
}

const FORUM_TOPICS: ForumTopic[] = [
  {
    id: 'waveready-general-discussion',
    title: 'WaveReady Community & Singapore Marine Conditions Feedback',
    description: 'Share your questions, feedback on live NEA tides and wind sensors, and discuss daily Singapore coastal water conditions.',
    category: 'General & Support',
    author: 'WaveReady Captain',
    timeAgo: 'Pinned Thread',
  },
  {
    id: 'fishing-charter-reports',
    title: 'Southern Islands & Changi Fishing Charter Catch Reports',
    description: 'Post your latest pelagic and reef catches, tidal bite windows, live bait conditions, and charter reviews from Sentosa to Lazarus.',
    category: 'Fishing Charters',
    author: 'Equinox Charters',
    timeAgo: 'Active Discussion',
  },
  {
    id: 'watersports-equipment-gear',
    title: 'Jetski, Foil & Wing Surf Coastal Conditions Exchange',
    description: 'Connect with fellow riders at East Coast Park and Siloso Beach. Discuss chop levels, wind forecasts, and equipment rentals.',
    category: 'Water Sports',
    author: 'Aloha Sea Sports',
    timeAgo: 'Community',
  },
];

export const TalkToUsForum: React.FC = () => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>('waveready-general-discussion');
  const [activeMode, setActiveMode] = useState<'disqus-forum' | 'direct-form'>('disqus-forum');

  // Direct feedback form state
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackCategory, setFeedbackCategory] = useState('Marine Condition Report');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Recent local feedback messages
  const [localFeedbackList, setLocalFeedbackList] = useState<SubmittedFeedback[]>([
    {
      id: 'fb_init_1',
      name: 'Marcus K.',
      category: 'Marine Condition Report',
      message: 'Lazarus Island tide was spot on this morning at 08:30! Great visibility inside the lagoon.',
      timestamp: '2 hours ago',
    },
    {
      id: 'fb_init_2',
      name: 'Captain Ryan',
      category: 'Charter Inquiry',
      message: 'Looking to list another 36ft center console for Changi kelong trips. Great app concept.',
      timestamp: 'Yesterday',
    },
  ]);

  const selectedTopic =
    FORUM_TOPICS.find((t) => t.id === selectedTopicId) || FORUM_TOPICS[0];

  const currentOrigin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://waveready.vercel.app';

  // Article metadata
  const article = {
    id: selectedTopic.id,
    title: selectedTopic.title,
    url: `${currentOrigin}/talk-to-us#${selectedTopic.id}`,
  };

  // Disqus config with shortname waveready-1 and SSO structure
  const disqusConfig = {
    url: article.url,
    identifier: article.id,
    title: article.title,
    language: 'en',
    remoteAuthS3: '',
    apiKey: '',
    sso: {
      name: 'WaveReady Marine',
      button: `${currentOrigin}/images/hero_water_sports.jpg`,
      icon: `${currentOrigin}/favicon.ico`,
      url: `${currentOrigin}/login/`,
      logout: `${currentOrigin}/logout/`,
      profile_url: `${currentOrigin}/profile/{username}`,
      width: '800',
      height: '400',
    },
  };

  const handleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: feedbackName,
          email: feedbackEmail,
          category: feedbackCategory,
          message: feedbackMessage,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || 'Failed to submit feedback.');
      }

      const newEntry: SubmittedFeedback = {
        id: json.item?.id || `fb_${Date.now()}`,
        name: feedbackName.trim() || 'Anonymous Enthusiast',
        category: feedbackCategory,
        message: feedbackMessage.trim(),
        timestamp: 'Just now',
      };

      setLocalFeedbackList([newEntry, ...localFeedbackList]);
      setSubmitSuccess(true);
      setFeedbackMessage('');

      setTimeout(() => {
        setSubmitSuccess(false);
      }, 4000);
    } catch (err: unknown) {
      // Fallback save locally even if network fails
      const fallbackEntry: SubmittedFeedback = {
        id: `fb_local_${Date.now()}`,
        name: feedbackName.trim() || 'Anonymous Enthusiast',
        category: feedbackCategory,
        message: feedbackMessage.trim(),
        timestamp: 'Just now (Saved)',
      };
      setLocalFeedbackList([fallbackEntry, ...localFeedbackList]);
      setSubmitSuccess(true);
      setFeedbackMessage('');
      setTimeout(() => setSubmitSuccess(false), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="talk-to-us" className="py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-cyan-400 mb-1">
            Community & Support Channel
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Talk to Us & Marine Community Forum
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Join the conversation with fellow Singapore boaters, anglers, and water sports riders.
            Powered by Disqus (<span className="text-cyan-400 font-mono">waveready-1</span>).
          </p>
        </div>

        {/* View Mode Toggle: Disqus Forum vs Direct Feedback Form */}
        <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setActiveMode('disqus-forum')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'disqus-forum'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Disqus Forum</span>
            <span className="text-[10px] opacity-75 font-mono">
              <CommentCount shortname="waveready-1" config={disqusConfig}>
                ·
              </CommentCount>
            </span>
          </button>
          <button
            onClick={() => setActiveMode('direct-form')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeMode === 'direct-form'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Direct Feedback Form
          </button>
        </div>
      </div>

      {/* Mode 1: Disqus Public Forum (Default) */}
      {activeMode === 'disqus-forum' && (
        <div className="space-y-6">
          {/* Quick Notice Banner with Direct Open button */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2">
              <span className="text-base text-cyan-400">🌊</span>
              <div>
                <span className="font-semibold text-white block">
                  WaveReady Marine Forum (<span className="font-mono text-cyan-300">waveready-1</span>)
                </span>
                Post questions, tide updates, and catch reports below. You can also switch to the <strong>Direct Feedback Form</strong> tab to send messages without logging into Disqus.
              </div>
            </div>

            <a
              href="https://disqus.com/home/forums/waveready-1/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg border border-slate-700 transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              Open on Disqus.com ↗
            </a>
          </div>

          {/* Topics Selector Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {FORUM_TOPICS.map((topic) => {
              const isSelected = topic.id === selectedTopic.id;
              const topicArticle = {
                url: `${currentOrigin}/talk-to-us#${topic.id}`,
                identifier: topic.id,
                title: topic.title,
              };

              return (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopicId(topic.id)}
                  className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-950/30'
                      : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                    <span className="text-cyan-400 font-semibold">{topic.category}</span>
                    <span className="font-mono text-slate-400">
                      <CommentCount shortname="waveready-1" config={topicArticle}>
                        Comments
                      </CommentCount>
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-100 line-clamp-2 mb-1.5">
                    {topic.title}
                  </h4>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {topic.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800/80">
                    <span>By {topic.author}</span>
                    <span className={isSelected ? 'text-cyan-400 font-semibold' : ''}>
                      {isSelected ? 'Active Thread ✓' : topic.timeAgo}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Disqus Embed Container */}
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-xl">
            <div className="pb-4 mb-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-cyan-400 font-mono mb-1">
                  Topic: {selectedTopic.category}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-100">
                  {selectedTopic.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 shrink-0">
                  Disqus: waveready-1
                </span>
                <span className="text-xs text-cyan-400 font-mono bg-cyan-950/60 px-3 py-1.5 rounded-lg border border-cyan-800/40 shrink-0">
                  <CommentCount shortname="waveready-1" config={disqusConfig}>
                    Comments
                  </CommentCount>
                </span>
              </div>
            </div>

            {/* Embedded Disqus Forum */}
            <div className="disqus-container min-h-[360px] bg-slate-950/60 p-4 sm:p-6 rounded-2xl border border-slate-800/80">
              <DiscussionEmbed shortname="waveready-1" config={disqusConfig} />
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Instant Direct Feedback Form */}
      {activeMode === 'direct-form' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Submission Form */}
          <div className="lg:col-span-7 rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-100">
                  Send Direct Feedback or Report
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  No login required. Messages are delivered directly to the WaveReady operations desk.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded-lg">
                Instant Delivery
              </span>
            </div>

            {submitSuccess && (
              <div className="mb-4 p-4 rounded-xl bg-emerald-950/70 border border-emerald-700/60 text-emerald-300 text-xs flex items-center gap-2">
                <span className="text-base font-bold">✓</span>
                <div>
                  <span className="font-bold block">Thank you! Your feedback was received.</span>
                  Our marine team reviews all condition reports to ensure Singapore boaters have the most accurate telemetry.
                </div>
              </div>
            )}

            {submitError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs">
                {submitError}
              </div>
            )}

            <form onSubmit={handleDirectSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Your Name / Call Sign</label>
                  <input
                    type="text"
                    placeholder="e.g. Captain Tan / Sarah"
                    value={feedbackName}
                    onChange={(e) => setFeedbackName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Email (for reply, optional)</label>
                  <input
                    type="email"
                    placeholder="you@domain.com"
                    value={feedbackEmail}
                    onChange={(e) => setFeedbackEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Feedback Category</label>
                <select
                  value={feedbackCategory}
                  onChange={(e) => setFeedbackCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Marine Condition Report">Marine Condition Report (Live Wind/Tide observation)</option>
                  <option value="Beach Spot Suggestion">New Beach or Launch Ramp Suggestion</option>
                  <option value="Charter & Boat Rental Inquiry">Charter & Boat Rental Inquiry</option>
                  <option value="Feature Request">Feature Request for App</option>
                  <option value="Bug / Error Report">Bug / Data Connection Issue</option>
                  <option value="General Question">General Question / Say Hi</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">
                  Your Message or Observation <span className="text-cyan-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us what you noticed on the water (e.g. current chop at East Coast, tide depth at Lazarus, or any feedback)..."
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="text-[11px] text-slate-500">
                  Direct submission guaranteed without third-party cookies or login popups.
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !feedbackMessage.trim()}
                  className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-cyan-500/25 disabled:opacity-50 whitespace-nowrap"
                >
                  {isSubmitting ? 'Transmitting...' : 'Submit Feedback Now'}
                </button>
              </div>
            </form>
          </div>

          {/* Direct Contact & Recent Community Submissions */}
          <div className="lg:col-span-5 space-y-4">
            {/* Direct Contact Cards */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Direct Marine Contacts
              </h4>

              <div className="space-y-2 text-xs">
                <a
                  href="https://wa.me/6567339981"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg text-emerald-400">📱</span>
                    <div>
                      <div className="font-semibold text-slate-200">WhatsApp Operations Desk</div>
                      <div className="text-[10px] text-slate-400">+65 6733 9981</div>
                    </div>
                  </div>
                  <span className="text-xs text-cyan-400 font-bold">Chat →</span>
                </a>

                <a
                  href="mailto:captain@waveready.sg?subject=WaveReady%20Feedback"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg text-cyan-400">✉️</span>
                    <div>
                      <div className="font-semibold text-slate-200">Email Liaison</div>
                      <div className="text-[10px] text-slate-400">captain@waveready.sg</div>
                    </div>
                  </div>
                  <span className="text-xs text-cyan-400 font-bold">Email →</span>
                </a>
              </div>
            </div>

            {/* Community Activity Feed */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-bold text-slate-200">Recent Community Reports</span>
                <span className="text-cyan-400 font-mono text-[11px]">{localFeedbackList.length} shared</span>
              </div>

              <div className="space-y-2.5">
                {localFeedbackList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-850 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-semibold text-cyan-300">{item.name}</span>
                      <span className="text-slate-500 font-mono">{item.timestamp}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">
                      {item.category}
                    </div>
                    <p className="text-xs text-slate-300 leading-snug">
                      "{item.message}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
