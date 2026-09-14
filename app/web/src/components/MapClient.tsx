'use client'

import {
  AttributionControl,
  LngLatBounds,
  Map as MapLibreMap,
  Marker,
  NavigationControl,
} from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useRef, useState } from 'react'

export type MapMarker = {
  id: number
  lat: number
  lng: number
  name: string
  type?: string | null
  href?: string | null
  postTitle?: string | null
  excerpt?: string | null
}

const TYPE_LABEL: Record<string, string> = {
  sight: 'Tham quan',
  food: 'Ăn uống',
  stay: 'Lưu trú',
  stop: 'Điểm dừng',
  other: 'Khác',
}

// Bản đồ MapLibre với marker đồng bộ bài viết — hover/click hiện preview, click chuyển tới bài.
export function MapClient({
  styleUrl,
  markers,
  height = 520,
  fit = true,
}: {
  styleUrl: string
  markers: MapMarker[]
  height?: number
  fit?: boolean
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [active, setActive] = useState<MapMarker | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let map: MapLibreMap
    try {
      map = new MapLibreMap({
        container,
        style: styleUrl,
        attributionControl: false,
        scrollZoom: false,
      })
    } catch {
      setFailed(true)
      return
    }

    map.addControl(new NavigationControl({ showCompass: false }), 'top-right')
    map.addControl(new AttributionControl({ compact: true }), 'bottom-right')

    let cancelled = false
    const markersOnMap: Marker[] = []

    map.on('load', () => {
      if (cancelled) return
      for (const m of markers) {
        const el = document.createElement('button')
        el.className = 'map-marker'
        el.setAttribute('aria-label', m.name)
        el.innerHTML = `<span class="map-marker-dot"></span><span class="map-marker-stem"></span>`

        el.addEventListener('mouseenter', () => setActive(m))
        el.addEventListener('focus', () => setActive(m))
        el.addEventListener('click', () => setActive(m))

        const marker = new Marker({ element: el })
          .setLngLat([m.lng, m.lat])
          .addTo(map)
        markersOnMap.push(marker)
      }
      if (fit && markers.length > 0) {
        const bounds = new LngLatBounds()
        for (const m of markers) bounds.extend([m.lng, m.lat])
        if (!bounds.isEmpty()) {
          map.fitBounds(bounds, { padding: 70, maxZoom: 9, duration: 600 })
        }
      }
    })
    map.on('error', () => setFailed(true))

    return () => {
      cancelled = true
      for (const mk of markersOnMap) mk.remove()
      map.remove()
    }
  }, [styleUrl, markers, fit])

  if (failed) {
    return (
      <div className="map-fallback" style={{ height }}>
        Bản đồ chưa cấu hình được (style không tải được). Kiểm tra đường dẫn style trong
        <strong> Thiết lập website → Bản đồ</strong>.
      </div>
    )
  }

  return (
    <div className="map-wrap" style={{ height }}>
      <div ref={containerRef} className="map-canvas" />
      {active ? (
        <a className="map-preview" href={active.href ?? '#'} onClick={(e) => !active.href && e.preventDefault()}>
          <span className="map-preview-kicker">
            {active.type ? TYPE_LABEL[active.type] ?? 'Khác' : 'Địa điểm'} · {active.name}
          </span>
          <span className="map-preview-title">{active.postTitle ?? active.name}</span>
          {active.excerpt ? <span className="map-preview-desc">{active.excerpt}</span> : null}
          {active.href ? <span className="map-preview-cta">Đọc bài viết →</span> : null}
        </a>
      ) : null}
    </div>
  )
}
