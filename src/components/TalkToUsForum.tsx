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

  const selectedTopic =
    FORUM_TOPICS.find((t) => t.id === selectedTopicId) || FORUM_TOPICS[0];

  const currentOrigin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://waveready.vercel.app';

  const disqusConfig = {
    url: `${currentOrigin}/talk-to-us#${selectedTopic.id}`,
    identifier: selectedTopic.id,
    title: selectedTopic.title,
    language: 'en',
  };

  return (
    <div id="talk-to-us" className="py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-cyan-400 mb-1">
            Community & Inquiries
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Talk to Us & Marine Community Forum
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Have questions about coastal tides, charter bookings, or want to discuss water conditions with fellow enthusiasts?
            Join the conversation below powered by Disqus.
          </p>
        </div>

        {/* Live Active Comments Pill */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 self-start md:self-auto font-mono">
          <span className="text-cyan-400">💬</span>
          <CommentCount shortname="wav3" config={disqusConfig}>
            Comments
          </CommentCount>
        </div>
      </div>

      {/* Topics Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {FORUM_TOPICS.map((topic) => {
          const isSelected = topic.id === selectedTopic.id;
          const topicConfig = {
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
                <span className="font-mono text-slate-500">
                  <CommentCount shortname="wav3" config={topicConfig}>
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

          <div className="text-xs text-slate-400 font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 shrink-0 self-start sm:self-auto">
            Disqus Forum: wav3
          </div>
        </div>

        {/* Embedded Disqus Forum */}
        <div className="disqus-container min-h-[320px] bg-slate-950/60 p-4 sm:p-6 rounded-2xl border border-slate-800/80">
          <DiscussionEmbed shortname="wav3" config={disqusConfig} />
        </div>
      </div>
    </div>
  );
};
