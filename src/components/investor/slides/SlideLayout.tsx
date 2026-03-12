import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

export function SlideLayout({ children, className = '' }: Props) {
  return (
    <div className={`w-[1920px] h-[1080px] p-[80px] flex flex-col ${className}`}>
      {children}
    </div>
  );
}

export function SlideTitle({ children }: { children: ReactNode }) {
  return <h1 className="text-[72px] font-bold text-foreground leading-tight">{children}</h1>;
}

export function SlideSubtitle({ children }: { children: ReactNode }) {
  return <p className="text-[32px] text-muted-foreground mt-4 leading-relaxed">{children}</p>;
}

export function SlideLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-[18px] font-semibold tracking-[0.2em] uppercase text-primary mb-6 block">
      {children}
    </span>
  );
}
