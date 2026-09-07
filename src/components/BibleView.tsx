import React, { useState, useMemo } from 'react';
import {
  BIBLE_BOOKS,
  BibleBookItem,
  BibleChapterItem,
  BibleVerseItem,
} from '../data/bibleData';
import { HunterUser, InventoryItem } from '../types';
import {
  BookOpen,
  Search,
  CheckCircle2,
  BookmarkPlus,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Flame,
  ArrowRight,
  Compass,
  Bookmark,
  Sun,
  Moon,
  Music,
} from 'lucide-react';
import { playSystemSound } from '../utils/audio';
import { worshipAudio, WorshipTrack, WORSHIP_TRACKS } from '../utils/worshipAudio';

interface BibleViewProps {
  user: HunterUser;
  onIncrementBibleChapter: () => void;
  onAddInventoryVerse: (item: Omit<InventoryItem, 'id' | 'createdAt'>) => void;
}

export const BibleView: React.FC<BibleViewProps> = ({
  user,
  onIncrementBibleChapter,
  onAddInventoryVerse,
}) => {
  // Navigation & selection state
  const [selectedBookId, setSelectedBookId] = useState<string>('jean');
  const [selectedChapterNumber, setSelectedChapterNumber] = useState<number>(1);
  const [testamentFilter, setTestamentFilter] = useState<'ALL' | 'AT' | 'NT'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Reader styling & customization
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [readerTheme, setReaderTheme] = useState<'dark' | 'parchment'>('dark');

  // Interaction feedbacks
  const [copiedVerseNum, setCopiedVerseNum] = useState<number | null>(null);
  const [savedVerseNum, setSavedVerseNum] = useState<number | null>(null);
  const [chapterCompleted, setChapterCompleted] = useState<boolean>(false);

  // Soft Worship Audio integration in Bible
  const [isWorshipPlaying, setIsWorshipPlaying] = useState<boolean>(
    worshipAudio.getState().isPlaying
  );

  React.useEffect(() => {
    const unsub = worshipAudio.subscribe((state) => {
      setIsWorshipPlaying(state.isPlaying);
    });
    return unsub;
  }, []);

  // Filtered books
  const filteredBooks = useMemo(() => {
    return BIBLE_BOOKS.filter((book) => {
      if (testamentFilter === 'AT' && book.testament !== 'AT') return false;
      if (testamentFilter === 'NT' && book.testament !== 'NT') return false;
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const matchName = book.name.toLowerCase().includes(query);
      const matchDesc = book.description.toLowerCase().includes(query);
      const matchVerse = book.chapters.some((ch) =>
        ch.verses.some((v) => v.text.toLowerCase().includes(query))
      );
      return matchName || matchDesc || matchVerse;
    });
  }, [testamentFilter, searchQuery]);

  // Current active book & chapter
  const currentBook = useMemo(() => {
    return BIBLE_BOOKS.find((b) => b.id === selectedBookId) || BIBLE_BOOKS[0];
  }, [selectedBookId]);

  const currentChapter = useMemo(() => {
    return (
      currentBook.chapters.find((ch) => ch.chapterNumber === selectedChapterNumber) ||
      currentBook.chapters[0] || { chapterNumber: 1, verses: [] }
    );
  }, [currentBook, selectedChapterNumber]);

  // Instant Verse Search across all scriptures
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return [];
    const query = searchQuery.toLowerCase();
    const results: {
      book: BibleBookItem;
      chapter: BibleChapterItem;
      verse: BibleVerseItem;
    }[] = [];

    for (const book of BIBLE_BOOKS) {
      for (const chapter of book.chapters) {
        for (const verse of chapter.verses) {
          if (verse.text.toLowerCase().includes(query)) {
            results.push({ book, chapter, verse });
            if (results.length >= 25) return results; // Cap at 25 results
          }
        }
      }
    }
    return results;
  }, [searchQuery]);

  // Handle Mark Chapter as Read / Meditated
  const handleCompleteChapter = () => {
    playSystemSound('quest_complete');
    setChapterCompleted(true);
    onIncrementBibleChapter();
    setTimeout(() => {
      setChapterCompleted(false);
    }, 4000);
  };

  // Copy verse to clipboard
  const handleCopyVerse = (verse: BibleVerseItem) => {
    const text = `« ${verse.text} » — ${currentBook.name} ${currentChapter.chapterNumber}:${verse.verseNumber} (Louis Segond)`;
    navigator.clipboard.writeText(text);
    setCopiedVerseNum(verse.verseNumber);
    playSystemSound('click');
    setTimeout(() => setCopiedVerseNum(null), 2000);
  };

  // Save verse to spiritual inventory
  const handleSaveVerseToInventory = (verse: BibleVerseItem) => {
    onAddInventoryVerse({
      type: 'verset',
      title: `${currentBook.name} ${currentChapter.chapterNumber}:${verse.verseNumber}`,
      content: verse.text,
      reference: `${currentBook.name} ${currentChapter.chapterNumber}:${verse.verseNumber}`,
      category: currentBook.categoryLabel,
    });
    setSavedVerseNum(verse.verseNumber);
    playSystemSound('level_up');
    setTimeout(() => setSavedVerseNum(null), 2500);
  };

  // Toggle background worship melody
  const handleToggleWorship = () => {
    playSystemSound('click');
    if (isWorshipPlaying) {
      worshipAudio.pause();
    } else {
      worshipAudio.play('presence');
    }
  };

  // Chapter Navigation (Previous / Next)
  const currentChapterIdx = currentBook.chapters.findIndex(
    (ch) => ch.chapterNumber === selectedChapterNumber
  );

  const goToPrevChapter = () => {
    if (currentChapterIdx > 0) {
      setSelectedChapterNumber(currentBook.chapters[currentChapterIdx - 1].chapterNumber);
      playSystemSound('click');
    }
  };

  const goToNextChapter = () => {
    if (currentChapterIdx < currentBook.chapters.length - 1) {
      setSelectedChapterNumber(currentBook.chapters[currentChapterIdx + 1].chapterNumber);
      playSystemSound('click');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Bible Banner & Worship Control Bar */}
      <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900/90 via-[#0a101d] to-sky-950/40 border border-sky-500/30 shadow-[0_0_40px_rgba(56,189,248,0.1)] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-400/40 text-sky-300 text-xs font-hud font-bold tracking-widest uppercase">
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
              <span>LA SAINTE BIBLE • PAROLE ÉTERNELLE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-hud font-black tracking-wide text-white flex items-center gap-2.5">
              <span>Méditation & Écriture Sainte</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              « Ta parole est une lampe à mes pieds, et une lumière sur mon sentier. » (Psaume 119:105)
              Chaque chapitre médité nourrit votre esprit et fait progresser votre sanctification (+30 XP).
            </p>
          </div>

          {/* Quick Worship Melody Toggle directly inside Bible Reader */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleToggleWorship}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-hud font-bold tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                isWorshipPlaying
                  ? 'bg-amber-500/20 border-amber-400/60 text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.3)] animate-pulse'
                  : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white hover:border-sky-500/50'
              }`}
              title={
                isWorshipPlaying
                  ? 'Mettre en pause la mélodie d’adoration'
                  : 'Lancer une mélodie douce d’adoration pour accompagner votre lecture'
              }
            >
              <Music className="w-4 h-4 text-amber-400" />
              <span>
                {isWorshipPlaying ? 'Mélodie d’Adoration : Active' : 'Mélodie d’Adoration (Prière)'}
              </span>
            </button>

            {/* Daily Chapters Read Badge */}
            <div className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-hud flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Aujourd’hui :</span>
              <strong className="text-amber-300 font-bold">
                {user.bibleChaptersToday} chap. lus
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column Book Explorer / Right Column Chapter Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Book Picker & Search (4 Cols on desktop) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Search Box */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher (ex: amour, paix, foi, Jean 3)..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400 transition-colors placeholder:text-slate-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Effacer
                </button>
              )}
            </div>

            {/* Testament Toggle Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-hud font-bold">
              <button
                type="button"
                onClick={() => setTestamentFilter('ALL')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  testamentFilter === 'ALL'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tous
              </button>
              <button
                type="button"
                onClick={() => setTestamentFilter('AT')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  testamentFilter === 'AT'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Ancien Test.
              </button>
              <button
                type="button"
                onClick={() => setTestamentFilter('NT')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  testamentFilter === 'NT'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Nouveau Test.
              </button>
            </div>
          </div>

          {/* If Search Query is active, show matching verses directly */}
          {searchResults.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/40 space-y-3 max-h-[380px] overflow-y-auto">
              <div className="flex items-center justify-between text-xs font-hud font-bold text-amber-300">
                <span>{searchResults.length} RÉSULTATS TROUVÉS</span>
                <span className="text-slate-400 text-[10px]">Cliquez pour ouvrir</span>
              </div>
              <div className="space-y-2">
                {searchResults.map((res, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSelectedBookId(res.book.id);
                      setSelectedChapterNumber(res.chapter.chapterNumber);
                      setSearchQuery('');
                      playSystemSound('click');
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-950/80 hover:bg-sky-950/40 border border-slate-800/80 hover:border-sky-500/40 transition-all cursor-pointer group"
                  >
                    <div className="text-xs font-hud font-bold text-sky-400 group-hover:text-sky-300 flex items-center justify-between">
                      <span>
                        {res.book.name} {res.chapter.chapterNumber}:{res.verse.verseNumber}
                      </span>
                      <span className="text-[10px] text-slate-500">{res.book.categoryLabel}</span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2 mt-1">« {res.verse.text} »</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Book List Carousel / Cards */}
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 max-h-[520px] overflow-y-auto">
            <div className="px-2 py-1 text-xs font-hud font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Livres Disponibles ({filteredBooks.length})</span>
            </div>

            <div className="space-y-1">
              {filteredBooks.map((book) => {
                const isSelected = book.id === selectedBookId;
                return (
                  <button
                    key={book.id}
                    type="button"
                    onClick={() => {
                      setSelectedBookId(book.id);
                      setSelectedChapterNumber(book.chapters[0]?.chapterNumber || 1);
                      playSystemSound('click');
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer border ${
                      isSelected
                        ? 'bg-gradient-to-r from-sky-950/80 to-slate-900 border-sky-500/50 text-white shadow-md shadow-sky-900/20'
                        : 'bg-slate-950/50 hover:bg-slate-900/80 border-transparent text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-hud font-bold text-sm ${
                            isSelected ? 'text-sky-300' : 'text-slate-200'
                          }`}
                        >
                          {book.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 font-mono">
                          {book.abbreviation}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                            book.testament === 'NT'
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                              : 'bg-blue-950/80 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {book.testament}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{book.description}</p>
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isSelected ? 'text-sky-400 translate-x-0.5' : 'text-slate-600'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Chapter Reader & Text View (8 Cols on desktop) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Chapter Selector & Reader Controls Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-md">
            {/* Book Name & Chapter selection pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <h2 className="font-hud text-lg sm:text-xl font-bold text-white shrink-0 flex items-center gap-1.5">
                <span>{currentBook.name}</span>
                <span className="text-sky-400 text-sm">Ch. {currentChapter.chapterNumber}</span>
              </h2>

              <div className="flex items-center gap-1 ml-2">
                {currentBook.chapters.map((ch) => {
                  const isCur = ch.chapterNumber === selectedChapterNumber;
                  return (
                    <button
                      key={ch.chapterNumber}
                      type="button"
                      onClick={() => {
                        setSelectedChapterNumber(ch.chapterNumber);
                        playSystemSound('click');
                      }}
                      className={`w-8 h-8 rounded-lg text-xs font-hud font-bold flex items-center justify-center transition-all cursor-pointer ${
                        isCur
                          ? 'bg-sky-600 text-white shadow-md shadow-sky-500/30 font-black scale-105'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {ch.chapterNumber}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reader Font Size & Appearance Controls */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Theme Toggle (Dark vs Parchment) */}
              <button
                type="button"
                onClick={() => setReaderTheme(readerTheme === 'dark' ? 'parchment' : 'dark')}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title={readerTheme === 'dark' ? 'Passer en thème Parchemin' : 'Passer en thème Nuit'}
              >
                {readerTheme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-sky-400" />
                )}
              </button>

              {/* Font Size Adjusters */}
              <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 p-0.5">
                <button
                  type="button"
                  onClick={() => setFontSize('sm')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold ${
                    fontSize === 'sm' ? 'bg-slate-800 text-white' : 'text-slate-500'
                  }`}
                  title="Police compacte"
                >
                  A-
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('md')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold ${
                    fontSize === 'md' ? 'bg-slate-800 text-white' : 'text-slate-500'
                  }`}
                  title="Police normale"
                >
                  A
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize('lg')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold ${
                    fontSize === 'lg' ? 'bg-slate-800 text-white' : 'text-slate-500'
                  }`}
                  title="Grande police"
                >
                  A+
                </button>
              </div>
            </div>
          </div>

          {/* Actual Chapter Reading Card */}
          <div
            className={`p-6 sm:p-8 rounded-3xl border transition-colors relative shadow-xl ${
              readerTheme === 'parchment'
                ? 'bg-[#181512] text-[#f2e8dc] border-[#5e4b3c]/50'
                : 'bg-[#090d18] text-slate-200 border-sky-950/80 shadow-[0_0_50px_rgba(15,23,42,0.6)]'
            }`}
          >
            {/* Chapter Header / Theme description */}
            <div className="border-b pb-4 mb-6 space-y-1.5 border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-hud font-bold uppercase tracking-widest text-sky-400">
                  {currentBook.categoryLabel} • {currentBook.testament === 'AT' ? 'Ancien Testament' : 'Nouveau Testament'}
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Traduction Louis Segond 1910
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-white">
                {currentChapter.title || `${currentBook.name} — Chapitre ${currentChapter.chapterNumber}`}
              </h3>
            </div>

            {/* Verses List with rich readable layout */}
            <div
              className={`space-y-4 font-serif leading-relaxed ${
                fontSize === 'sm'
                  ? 'text-sm'
                  : fontSize === 'md'
                  ? 'text-base sm:text-lg'
                  : fontSize === 'lg'
                  ? 'text-lg sm:text-xl'
                  : 'text-xl sm:text-2xl'
              }`}
            >
              {currentChapter.verses.map((verse) => {
                const isCopied = copiedVerseNum === verse.verseNumber;
                const isSaved = savedVerseNum === verse.verseNumber;

                return (
                  <div
                    key={verse.verseNumber}
                    className="group relative flex items-start gap-3 p-2 -mx-2 rounded-xl hover:bg-sky-500/5 transition-colors"
                  >
                    {/* Verse Number */}
                    <span className="font-mono text-xs font-bold text-sky-400 shrink-0 select-none pt-1">
                      {verse.verseNumber}
                    </span>

                    {/* Verse Text */}
                    <p className="flex-1 select-text text-slate-100/95">{verse.text}</p>

                    {/* Quick Verse Actions: Copy & Save as Sword into Inventory */}
                    <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center gap-1 shrink-0 select-none">
                      {/* Copy */}
                      <button
                        type="button"
                        onClick={() => handleCopyVerse(verse)}
                        className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-700 hover:border-sky-400 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Copier le verset"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Bookmark / Save to Spiritual Inventory */}
                      <button
                        type="button"
                        onClick={() => handleSaveVerseToInventory(verse)}
                        className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
                        title="Garder comme Épée de l'Esprit dans mon inventaire"
                      >
                        {isSaved ? (
                          <Check className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <BookmarkPlus className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chapter Footer Actions: Mark Read & Next/Prev */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Prev Chapter */}
              <button
                type="button"
                onClick={goToPrevChapter}
                disabled={currentChapterIdx === 0}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-hud font-bold tracking-wider flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Chapitre Précédent</span>
              </button>

              {/* Central Spiritual Action: Mark As Meditated / Sanctification Reward (+30 XP) */}
              <button
                type="button"
                onClick={handleCompleteChapter}
                className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-hud font-black text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                  chapterCompleted
                    ? 'bg-emerald-600 text-white shadow-emerald-500/30'
                    : 'bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.35)] active:scale-98'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {chapterCompleted
                    ? 'CHAPITRE MÉDITÉ ! (+30 XP & SYNCHRO)'
                    : 'MARQUER CE CHAPITRE COMME MÉDITÉ (+30 XP)'}
                </span>
              </button>

              {/* Next Chapter */}
              <button
                type="button"
                onClick={goToNextChapter}
                disabled={currentChapterIdx >= currentBook.chapters.length - 1}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-hud font-bold tracking-wider flex items-center justify-center gap-1.5 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
              >
                <span>Chapitre Suivant</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
