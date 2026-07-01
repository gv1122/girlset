'use client';

const SIZE = 50;

function Bracket({ corner }: { corner: 'tl' | 'tr' | 'bl' | 'br' }) {
  const classes: Record<string, string> = {
    tl: 'absolute top-6 left-6 border-t border-l border-chat',
    tr: 'absolute top-6 right-6 border-t border-r border-chat',
    bl: 'absolute bottom-6 left-6 border-b border-l border-chat',
    br: 'absolute bottom-6 right-6 border-b border-r border-chat'
  };
  return (
    <div className={classes[corner]} style={{ width: SIZE, height: SIZE }} />
  );
}

export default function CornerBrackets() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10"
      data-html2canvas-ignore
    >
      <Bracket corner="tl" />
      <Bracket corner="tr" />
      <Bracket corner="bl" />
      <Bracket corner="br" />
    </div>
  );
}
