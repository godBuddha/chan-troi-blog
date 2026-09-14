import React from 'react'

// Hero cinematic: media (video ưu tiên, không thì ảnh poster) hiện dần,
// sau đó tên blog và dòng phụ xuất hiện theo nhịp staggered.
export function Hero({
  siteName,
  tagline,
  videoUrl,
  posterUrl,
}: {
  siteName: string
  tagline?: string | null
  videoUrl?: string | null
  posterUrl?: string | null
}) {
  return (
    <section className="hero" data-cy="hero">
      {videoUrl ? (
        <video
          className="hero-media hero-fade"
          src={videoUrl}
          poster={posterUrl ?? undefined}
          autoPlay
          muted
          loop
          playsInline
          disablePictureInPicture
        />
      ) : posterUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="hero-media hero-fade" src={posterUrl} alt="" />
      ) : (
        <div className="hero-media hero-media--blank" />
      )}
      <div className="hero-veil" />
      <div className="hero-text">
        <p className="hero-kicker reveal" style={{ '--d': '0.7s' } as React.CSSProperties}>
          Nhật ký hành trình
        </p>
        <h1 className="hero-title reveal" style={{ '--d': '0.9s' } as React.CSSProperties}>
          {siteName}
        </h1>
        {tagline ? (
          <p className="hero-sub reveal" style={{ '--d': '1.15s' } as React.CSSProperties}>
            {tagline}
          </p>
        ) : null}
      </div>
      <a className="hero-scroll reveal" href="#moi-nhat" style={{ '--d': '1.6s' } as React.CSSProperties}>
        Cuộn để xem tiếp
      </a>
    </section>
  )
}
