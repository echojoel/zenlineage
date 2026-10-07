interface EncounterBlock {
  cue: string;
  quote: string | null;
}

// The source records are prose, not structured speaker turns. Split only at
// sentence-ending quotation marks, then lift a clearly introduced quotation
// into its own turn. Everything else remains narration in its original order.
export function encounterBlocks(content: string): EncounterBlock[] {
  return content
    .trim()
    .split(/\n\s*\n|(?<=[.!?]["”])\s+(?=[A-Z])/u)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const quotes = [...part.matchAll(/"([^"]+)"/g)];
      const lastQuote = quotes.at(-1);
      if (!lastQuote || lastQuote.index === undefined) return { cue: part, quote: null };

      const before = part.slice(0, lastQuote.index).trim();
      const after = part.slice(lastQuote.index + lastQuote[0].length).trim();
      // Preserve unusual records as prose instead of guessing at speakers.
      if (after || !/(?:asked|said|replied|answered|called out|told|inquired|responded|shouted)[^.!?]{0,80},\s*$/i.test(before)) {
        return { cue: part, quote: null };
      }
      return { cue: before.replace(/,\s*$/, ""), quote: lastQuote[1] };
    });
}

export default function EncounterText({ content, maxBlocks }: { content: string; maxBlocks?: number }) {
  const blocks = encounterBlocks(content);
  const visible = maxBlocks ? blocks.slice(0, maxBlocks) : blocks;

  return (
    <div className="encounter-text">
      {visible.map((block, index) =>
        block.quote ? (
          <div className="encounter-turn" key={index}>
            <p className="encounter-cue">{block.cue}</p>
            <blockquote className="encounter-quote">“{block.quote}”</blockquote>
          </div>
        ) : (
          <p className="encounter-narration" key={index}>{block.cue}</p>
        )
      )}
    </div>
  );
}
