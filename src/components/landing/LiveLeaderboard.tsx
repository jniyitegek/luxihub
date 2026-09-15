'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Building2, UtensilsCrossed, Compass, Sparkles, Crown, TrendingUp, Minus, Quote, ShieldCheck } from 'lucide-react';
import { Text } from '@/components/ui/Text';
import { LeaderboardBoardsDto, LeaderboardEntryDto } from '@/lib/types';

const POLL_INTERVAL_MS = 45000;

type FilterKey = 'ALL' | 'HOTEL' | 'RESTAURANT' | 'TOUR';

const FILTERS: { key: FilterKey; label: string; icon: React.ElementType }[] = [
  { key: 'ALL', label: 'All Categories', icon: Sparkles },
  { key: 'HOTEL', label: 'Lodges & Hotels', icon: Building2 },
  { key: 'RESTAURANT', label: 'Fine Dining', icon: UtensilsCrossed },
  { key: 'TOUR', label: 'Safari & Tours', icon: Compass },
];

const PODIUM_RING = ['ring-amber-400', 'ring-slate-300', 'ring-amber-700/70'];
const PODIUM_SIZE = ['w-28 h-28 sm:w-32 sm:h-32', 'w-20 h-20 sm:w-24 sm:h-24', 'w-20 h-20 sm:w-24 sm:h-24'];
const PODIUM_LIFT = ['-translate-y-4 sm:-translate-y-6', 'translate-y-0', 'translate-y-0'];
const PODIUM_BADGE = ['bg-amber-400 text-slate-950', 'bg-slate-300 text-slate-900', 'bg-amber-700/80 text-white'];

interface LiveLeaderboardProps {
  variant?: 'hero' | 'section';
}

export function LiveLeaderboard({ variant = 'section' }: LiveLeaderboardProps) {
  const [data, setData] = useState<LeaderboardBoardsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>('ALL');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchBoards = useCallback(async () => {
    try {
      const res = await fetch('/api/leaderboard');
      const json = await res.json();
      if (res.ok) {
        setData(json);
      }
    } catch (e) {
      console.error('Failed to load live leaderboard:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoards();
    pollRef.current = setInterval(fetchBoards, POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchBoards]);

  const isHero = variant === 'hero';
  const entries = data?.boards?.[filter] || [];
  const podium = entries.slice(0, 3);
  const rest = entries.slice(3);
  const podiumOrdered = podium.length === 3 ? [podium[1], podium[0], podium[2]] : podium;
  const podiumRanks = podium.length === 3 ? [2, 1, 3] : podium.map((_, i) => i + 1);

  return (
    <section
      className={
        isHero
          ? 'relative w-full bg-gradient-to-b from-sky-600 via-sky-700 to-sky-800 text-white pt-28 lg:pt-36 pb-20 overflow-hidden'
          : 'w-full bg-slate-50 py-16 px-4 sm:px-6 lg:px-8'
      }
    >
      {isHero && (
        <>
          <div className="absolute top-0 left-1/4 w-[800px] h-[400px] bg-white/10 rounded-full blur-[140px] pointer-events-none -z-10" />
          <div className="absolute bottom-0 right-10 w-[600px] h-[350px] bg-sky-300/15 rounded-full blur-[120px] pointer-events-none -z-10" />
        </>
      )}

      <div className={isHero ? 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10' : 'max-w-4xl mx-auto'}>
        {/* Header */}
        <div className="text-center space-y-3 mb-8">
          <Text as="h1" variant="h1" color={isHero ? 'white' : 'dark'} className={isHero ? '' : 'text-3xl sm:text-4xl'}>
            Service Provider Leaderboard
          </Text>

          <Text variant="body" color={isHero ? 'white' : 'muted'} className={`max-w-2xl mx-auto ${isHero ? 'text-white/80 text-base' : 'text-base'}`}>
            Ranked purely by verified guest reviews &mdash; rating, review volume, and how recently guests have been raving. No
            business can buy its way onto this board; every place moves up only when real travelers say so.
          </Text>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
          {FILTERS.map((f) => {
            const Icon = f.icon;
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  active
                    ? 'bg-white text-sky-700 shadow-md'
                    : isHero
                      ? 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/15'
                      : 'bg-white text-slate-500 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div
              className={`inline-block w-8 h-8 border-2 border-t-transparent rounded-full animate-spin ${
                isHero ? 'border-white' : 'border-sky-600'
              }`}
            />
          </div>
        ) : entries.length === 0 ? (
          <div className={`text-center py-12 text-sm font-medium ${isHero ? 'text-white/60' : 'text-slate-400'}`}>
            No verified reviews yet in this category.
          </div>
        ) : (
          <>
            {/* Podium: top 3 */}
            <div className="flex items-end justify-center gap-4 sm:gap-8 mb-12">
              {podiumOrdered.map((entry, i) => (
                <PodiumCard key={entry.id} entry={entry} rank={podiumRanks[i]} isHero={isHero} />
              ))}
            </div>

            {/* Ranked list: #4 onward */}
            {rest.length > 0 && (
              <div className="space-y-3">
                {rest.map((entry, idx) => (
                  <ListRow key={entry.id} entry={entry} rank={idx + 4} isHero={isHero} />
                ))}
              </div>
            )}
          </>
        )}

        {data && (
          <Text variant="caption" color={isHero ? 'white' : 'muted'} className={`mt-8 block text-center ${isHero ? 'text-white/50' : ''}`}>
            Board last refreshed {formatDistanceToNow(new Date(data.updatedAt), { addSuffix: true })}
          </Text>
        )}
      </div>
    </section>
  );
}

function PodiumCard({ entry, rank, isHero }: { entry: LeaderboardEntryDto; rank: number; isHero: boolean }) {
  const idx = rank - 1;
  return (
    <Link
      href={`/listings/${entry.slug}`}
      className={`flex flex-col items-center gap-2 group transition-transform hover:-translate-y-1 ${PODIUM_LIFT[idx]}`}
    >
      <div className="flex flex-col items-center gap-1">
        {rank === 1 && <Crown className="w-6 h-6 text-amber-400 fill-amber-400" />}
        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold ${PODIUM_BADGE[idx]}`}>
          {rank}
        </span>
      </div>

      <div className={`relative rounded-full overflow-hidden ring-4 ${PODIUM_RING[idx]} shadow-xl ${PODIUM_SIZE[idx]}`}>
        <Image src={entry.image} alt={entry.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
      </div>

      <div className="text-center max-w-[110px] sm:max-w-[140px]">
        <Text variant="h4" color={isHero ? 'white' : 'dark'} className="line-clamp-1 group-hover:text-sky-400 transition-colors">
          {entry.name}
        </Text>
        <div className={`text-lg font-extrabold ${isHero ? 'text-white' : 'text-slate-900'}`}>{entry.liveScore}</div>
        <div className={`flex items-center justify-center gap-1 ${isHero ? 'text-white/50' : 'text-slate-400'}`}>
          {entry.trend === 'rising' ? (
            <TrendingUp className={`w-3 h-3 ${isHero ? 'text-white' : 'text-sky-600'}`} />
          ) : (
            <Minus className="w-3 h-3" />
          )}
        </div>
      </div>
    </Link>
  );
}

function ListRow({ entry, rank, isHero }: { entry: LeaderboardEntryDto; rank: number; isHero: boolean }) {
  return (
    <Link
      href={`/listings/${entry.slug}`}
      className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl transition-colors group ${
        isHero ? 'bg-white/[0.07] border border-white/15 hover:bg-white/[0.12]' : 'bg-white border border-slate-200 hover:bg-slate-50'
      }`}
    >
      <div className="flex flex-col items-center gap-0.5 w-6 shrink-0">
        <span className={`text-sm font-extrabold ${isHero ? 'text-white/70' : 'text-slate-400'}`}>{rank}</span>
        {entry.trend === 'rising' ? (
          <TrendingUp className={`w-3 h-3 ${isHero ? 'text-white' : 'text-sky-600'}`} />
        ) : (
          <Minus className={`w-3 h-3 ${isHero ? 'text-white/30' : 'text-slate-300'}`} />
        )}
      </div>

      <div className="shrink-0" style={{ perspective: '500px' }}>
        <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-slate-200 transition-transform duration-500 ease-out [@media(hover:hover)]:group-hover:[transform:rotateY(25deg)]">
          <Image src={entry.image} alt={entry.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Text variant="h4" color={isHero ? 'white' : 'dark'} className="line-clamp-1 group-hover:text-sky-400 transition-colors">
            {entry.name}
          </Text>
          <ShieldCheck className={`w-4 h-4 shrink-0 ${isHero ? 'text-white' : 'text-sky-600'}`} />
        </div>
        <div className={`flex items-center gap-1.5 text-[11px] not-italic ${isHero ? 'text-white/60' : 'text-slate-500'}`}>
          <Quote className="w-3 h-3 shrink-0 opacity-60" />
          <span className="line-clamp-1">&ldquo;{entry.highlight.quote}&rdquo;</span>
        </div>
      </div>

      <div className="text-right shrink-0">
        <div className={`text-lg font-extrabold ${isHero ? 'text-white' : 'text-slate-900'}`}>{entry.liveScore}</div>
        <div className={`text-[10px] font-semibold ${isHero ? 'text-white/50' : 'text-slate-400'}`}>
          {entry.reviewCount > 0 ? `${entry.ratingAvg.toFixed(1)}★ (${entry.reviewCount})` : 'Awaiting reviews'}
        </div>
      </div>
    </Link>
  );
}
