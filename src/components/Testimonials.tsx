import styles from "./Testimonials.module.css";

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  photo: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Varun Shyam",
    role: "Associate Director Experience Design, Bizongo",
    quote:
      "He quickly became a star performer of the team, with appreciation flowing in from all quarters including the design team, his dev and product colleagues, and senior leadership. He showed exemplary drive, proactivity, critical thinking and an insatiable thirst to learn and grow. He will certainly be an invaluable asset to any team.",
    photo: "/images/testimonials/varun.png",
  },
  {
    name: "Abbas Dawood",
    role: "Product & Design Head, Bizongo",
    quote:
      "Midhun has an innate capability of going beyond product specifications and thinking like an end user. His speed, eye for user pain points, detail orientedness, lateral thinking and creativity has impressed me the most. He has the correct motivation to see through unobvious user pain points, and that makes him a champion and advocate for any user he is designing solutions for.",
    photo: "/images/testimonials/abbas.png",
  },
  {
    name: "Roshni Vaya",
    role: "Leading Impactful Experiences, ZS",
    quote:
      "I have worked with Midhun directly for a good amount of time and I must say he is a great thinker and critical problem solver. He is always on his toes to provide best/alternate solution for each problem. I admire his approach towards problems and deep analytical skills. I wish him very best for the future!",
    photo: "/images/testimonials/roshni.png",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className={styles.section}>
      <h2 className={styles.sectionTitle}>From my team</h2>
      <p className={styles.subtitle}>What colleagues and mentors say about working with me</p>
      <div className={styles.grid}>
        {TESTIMONIALS.map((t) => (
          <div key={t.name} className={styles.card}>
            <span className={styles.quoteIcon}>"</span>
            <p className={styles.quote}>{t.quote}</p>
            <div className={styles.author}>
              <img
                className={styles.avatar}
                src={t.photo}
                alt={t.name}
                loading="lazy"
              />
              <div>
                <div className={styles.name}>{t.name}</div>
                <div className={styles.role}>{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
