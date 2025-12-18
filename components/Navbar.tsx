import Image from 'next/image';
import Link from 'next/link';
import AuthButton from './AuthButton';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  return (
    <nav className="bg-primary text-white p-4 shadow-md sticky top-0 z-50">
      <div className="w-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-0">
          <div className="relative w-10 h-10 rounded-full overflow-hidden">
             <Image
              src="/logo-flame.png"
              alt="BBQ Buddy Icon"
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
          <span className="text-xl font-bold tracking-tight">BBQ Buddy</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AuthButton />
        </div>
      </div>
    </nav>
  );
}
