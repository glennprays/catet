/**
 * Streaming fallback for every (app) route: the shell paints this the
 * instant a tab switch starts, instead of holding the previous page on
 * screen (or worse, a blank frame) until the server responds.
 */
export default function AppLoading() {
  return (
    <>
      <div className="sticky top-0 z-20 -mx-4 flex h-12 shrink-0 items-center border-b border-border bg-canvas px-4 lg:-mx-5 lg:px-5">
        <div className="catet-shimmer h-5 w-32 rounded-md" />
      </div>
      <div className="grid gap-2.5 py-2.5">
        <div className="catet-shimmer h-[88px] rounded-md" />
        <div className="rounded-lg bg-surface p-0 shadow-card">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="catet-shimmer m-2 h-10 rounded-md" />
          ))}
        </div>
      </div>
    </>
  );
}
