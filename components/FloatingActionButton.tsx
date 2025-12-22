import Link from 'next/link';

export default function FloatingActionButton() {
  return (
    <div className="fixed bottom-6 left-0 right-0 flex justify-center pointer-events-none z-50">
      <div className="w-full max-w-lg px-4 relative pointer-events-auto">
        <Link
          href="/sessions/new"
          className="absolute bottom-0 right-4 md:right-6 bg-primary hover:brightness-90 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
          aria-label="Add new session"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-8 h-8"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
