/**
 * Fixed full-page ambient: default teal / cyan / violet mesh + animated orbs (not tied to company theme).
 */
export function BackgroundGlow() {
  return (
    <div className="bg-glow" aria-hidden="true">
      <div className="bg-glow__mesh" />
      <div className="bg-glow__orbs">
        <div className="bg-glow__orb bg-glow__orb--teal" />
        <div className="bg-glow__orb bg-glow__orb--cyan" />
        <div className="bg-glow__orb bg-glow__orb--violet" />
        <div className="bg-glow__orb bg-glow__orb--blue" />
        <div className="bg-glow__orb bg-glow__orb--purple" />
      </div>
    </div>
  );
}
