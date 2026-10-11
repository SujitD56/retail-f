import Link from "next/link";
import Image from "next/image";

export function MinimalNavbar() {
  return (
    <header className="flex h-[88px] w-full items-center justify-center border-b border-cream-300 bg-white px-20">
      <Link href="/" className="flex items-center">
        <Image src="/images/brand/kaushaya-logo-sm.png" alt="Kaushaya" width={160} height={90} className="h-20 w-auto object-contain" />
      </Link>
    </header>
  );
}
