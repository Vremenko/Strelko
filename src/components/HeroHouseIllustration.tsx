export function HeroHouseIllustration() {
  return (
    <div className="hero-mascot hero-mascot--house" role="img" aria-label="Hiša in udarna strela">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 95 150"
        overflow="visible"
        aria-hidden="true"
      >
        <image
          className="hero-house"
          xlinkHref="/assets/strelko-hero-house.png"
          href="/assets/strelko-hero-house.png"
          width="95"
          height="150"
        />
        <image
          className="hero-bolt"
          xlinkHref="/assets/strelko-hero-bolt.png"
          href="/assets/strelko-hero-bolt.png"
          width="95"
          height="150"
        />
      </svg>
    </div>
  );
}
