import type { Metadata } from "next";
import styles from "./UnderDevelopment.module.css";

export const metadata: Metadata = {
  title: "Dalam Pengembangan",
  description: "Halaman sedang dalam pengembangan",
};

export default function UnderDevelopmentPage() {
  return (
    <div className="absolute inset-0">
      <div className={styles.pageWrapper}>
        {/* Dekorasi lingkaran */}
        <div className={styles.bgDecoration}>
          <div className={`${styles.circle} ${styles.circleRed}`} />
          <div className={`${styles.circle} ${styles.circleGreen}`} />
        </div>

        {/* Kartu utama */}
        <div className={styles.card}>
          {/* Ikon gir */}
          <div className={styles.gearIcon}>
            <svg viewBox="0 0 64 64" width="64" height="64" fill="none">
              <circle cx="32" cy="32" r="14" fill="#D42027" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <rect
                  key={deg}
                  x="28"
                  y="2"
                  width="8"
                  height="14"
                  rx="2"
                  fill="#D42027"
                  transform={`rotate(${deg} 32 32)`}
                />
              ))}
              <circle cx="32" cy="32" r="6" fill="#fff" />
            </svg>
          </div>

          <h1 className={styles.title}>Halaman Sedang dalam Pengembangan</h1>

          <div className={styles.progressTrack}>
            <div className={styles.progressFill} />
          </div>
        </div>
      </div>
    </div>
  );
}