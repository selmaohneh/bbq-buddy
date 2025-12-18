import Image from 'next/image';
import Link from 'next/link';
import AuthButton from './AuthButton';

export default function Navbar() {
  return (
    <nav className="bg-primary text-white p-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
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
        <AuthButton />
      </div>
    </nav>
  );
}
