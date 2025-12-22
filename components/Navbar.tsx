import Image from 'next/image';
import Link from 'next/link';
import AuthButton from './AuthButton';

export default function Navbar() {
  return (
    <nav className="bg-primary text-white py-2.5 px-4 shadow-md sticky top-0 z-50">
      <div className="w-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1">
          <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
             <Image
              src="/logo-flame.png"
              alt="BBQ Buddy Icon"
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
          <span className="text-lg font-bold tracking-tight">BBQ Buddy</span>
        </Link>
        <div className="flex items-center gap-2">
          <AuthButton />
        </div>
      </div>
    </nav>
  );
}
