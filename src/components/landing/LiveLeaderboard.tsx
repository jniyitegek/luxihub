'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Building2, UtensilsCrossed, Compass, Crown, TrendingUp, Minus, Quote, ShieldCheck } from 'lucide-react';
import { Text } from '@/components/ui/Text';
import { LeaderboardBoardsDto, LeaderboardEntryDto } from '@/lib/types';

const POLL_INTERVAL_MS = 45000;

type FilterKey = 'ALL' | 'HOTEL' | 'RESTAURANT' | 'TOUR';

const FILTERS: { key: FilterKey; label: string; icon: React.ElementType }[] = [
  { key: 'ALL', label: 'All Categories', icon: Crown },
  { key: 'HOTEL', label: 'Lodges & Hotels', icon: Building2 },
  { key: 'RESTAURANT', label: 'Fine Dining', icon: UtensilsCrossed },
  { key: 'TOUR', label: 'Safari & Tours', icon: Compass },
];

const PODIUM_RING = ['ring-amber-400', 'ring-slate-300', 'ring-amber-700/70'];
const PODIUM_SIZE = ['w-28 h-28 sm:w-32 sm:h-32', 'w-20 h-20 sm:w-24 sm:h-24', 'w-20 h-20 sm:w-24 sm:h-24'];
const PODIUM_LIFT = ['-translate-y-3 sm:-translate-y-5', 'translate-y-0', 'translate-y-0'];
const PODIUM_BADGE = ['bg-amber-400 text-slate-950 font-black', 'bg-slate-300 text-slate-900 font-bold', 'bg-amber-700/80 text-white font-bold'];

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
    <section className="w-full bg-[#FAF9F6] text-slate-900 py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <Text variant="h2" as="h1" color="dark" className="text-2xl sm:text-3xl lg:text-4xl">
            Hospitality <span className="text-sky-600">Service</span> Leaderboard
          </Text>

          <Text variant="body" color="muted" className="max-w-2xl mx-auto leading-relaxed">
            Ranked purely by verified guest reviews — rating, review volume, and recent sentiment. No business can buy its way onto this board.
          </Text>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {FILTERS.map((f) => {
            const Icon = f.icon;
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${active
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
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
            <div className="inline-block w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 text-sm font-medium text-slate-500 bg-white rounded-2xl border border-slate-200">
            No verified reviews yet in this category.
          </div>
        ) : (
          <>
            {/* Podium: top 3 */}
            <div className="flex items-end justify-center gap-4 sm:gap-8 pt-4 pb-4">
              {podiumOrdered.map((entry, i) => (
                <PodiumCard key={entry.id} entry={entry} rank={podiumRanks[i]} />
              ))}
            </div>

            {/* Ranked list: #4 onward */}
            {rest.length > 0 && (
              <div className="space-y-3 pt-2">
                {rest.map((entry, idx) => (
                  <ListRow key={entry.id} entry={entry} rank={idx + 4} />
                ))}
              </div>
            )}
          </>
        )}

        {data && (
          <p className="text-xs text-slate-400 text-center block pt-2">
            Board refreshed {formatDistanceToNow(new Date(data.updatedAt), { addSuffix: true })}
          </p>
        )}

      </div>
    </section>
  );
}

function PodiumCard({ entry, rank }: { entry: LeaderboardEntryDto; rank: number }) {
  const idx = rank - 1;
  return (
    <Link
      href={`/listings/${entry.slug}`}
      className={`flex flex-col items-center gap-2 group transition-transform hover:-translate-y-1 ${PODIUM_LIFT[idx]}`}
    >
      <div className="flex flex-col items-center gap-1">
        {rank === 1 && <Crown className="w-6 h-6 text-amber-500 fill-amber-400" />}
        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${PODIUM_BADGE[idx]}`}>
          {rank}
        </span>
      </div>

      <div className={`relative rounded-full overflow-hidden ring-4 ${PODIUM_RING[idx]} shadow-lg ${PODIUM_SIZE[idx]}`}>
        <Image src={entry.image} alt={entry.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
      </div>

      <div className="text-center max-w-[110px] sm:max-w-[140px]">
        <Text variant="h4" color="dark" className="text-xs sm:text-sm font-medium group-hover:text-sky-600 transition-colors line-clamp-1">
          {entry.name}
        </Text>
        <Text variant="price" color="sky" className="text-base sm:text-lg font-medium">{entry.liveScore}</Text>
        <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px]">
          {entry.trend === 'rising' ? (
            <TrendingUp className="w-3 h-3 text-sky-600" />
          ) : (
            <Minus className="w-3 h-3 text-slate-400" />
          )}
        </div>
      </div>
    </Link>
  );
}

function ListRow({ entry, rank }: { entry: LeaderboardEntryDto; rank: number }) {
  return (
    <Link
      href={`/listings/${entry.slug}`}
      className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-sky-300 hover:shadow-md transition-all group"
    >
      <div className="flex flex-col items-center gap-0.5 w-6 shrink-0">
        <Text variant="caption" className="text-sm font-medium text-slate-400">{rank}</Text>
        {entry.trend === 'rising' ? (
          <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
        ) : (
          <Minus className="w-3.5 h-3.5 text-slate-300" />
        )}
      </div>

      <div className="shrink-0">
        <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
          <Image src={entry.image} alt={entry.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Text variant="h4" color="dark" className="text-xs sm:text-sm font-medium group-hover:text-sky-600 transition-colors line-clamp-1">
            {entry.name}
          </Text>
          <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-normal">
          <Quote className="w-3 h-3 shrink-0 text-slate-400" />
          <span className="line-clamp-1">&ldquo;{entry.highlight.quote}&rdquo;</span>
        </div>
      </div>

      <div className="text-right shrink-0">
        <Text variant="price" color="dark" className="text-base sm:text-lg font-medium">{entry.liveScore}</Text>
        <div className="text-[10px] font-normal text-slate-400">
          {entry.reviewCount > 0 ? `${entry.ratingAvg.toFixed(1)}★ (${entry.reviewCount})` : 'Awaiting reviews'}
        </div>
      </div>
    </Link>
  );
}
