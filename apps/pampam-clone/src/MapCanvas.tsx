import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { MapDoc, Spot } from './store'

const STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    carto: {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap © CARTO',
    },
  },
  layers: [{ id: 'carto', type: 'raster', source: 'carto' }],
}

interface Props {
  doc: MapDoc | null
  selectedSpotId: string | null
  editMode: boolean
  onSelectSpot: (id: string | null) => void
  onMoveSpot: (id: string, lng: number, lat: number) => void
  onDropSticker: (sticker: string, lng: number, lat: number) => void
  onDeleteSpot: (id: string) => void
  onCycleSticker: (id: string) => void
  registerMap?: (map: maplibregl.Map) => void
}

export default function MapCanvas(props: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map())
  const propsRef = useRef(props)
  propsRef.current = props

  useEffect(() => {
    const map = new maplibregl.Map({
      container: containerRef.current!,
      style: STYLE,
      center: props.doc?.center ?? [-74.0, 40.72],
      zoom: props.doc?.zoom ?? 11.5,
      attributionControl: { compact: false },
    })
    mapRef.current = map
    props.registerMap?.(map)
    map.on('click', () => propsRef.current.onSelectSpot(null))

    const el = containerRef.current!
    const onDragOver = (e: DragEvent) => e.preventDefault()
    const onDrop = (e: DragEvent) => {
      e.preventDefault()
      const sticker = e.dataTransfer?.getData('text/sticker')
      if (!sticker) return
      const rect = el.getBoundingClientRect()
      const pt = map.unproject([e.clientX - rect.left, e.clientY - rect.top])
      propsRef.current.onDropSticker(sticker, pt.lng, pt.lat)
    }
    el.addEventListener('dragover', onDragOver)
    el.addEventListener('drop', onDrop)
    return () => {
      el.removeEventListener('dragover', onDragOver)
      el.removeEventListener('drop', onDrop)
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // sync markers with spots
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const spots: Spot[] = props.doc?.sections.flatMap(s => s.spots) ?? []
    const markers = markersRef.current
    const live = new Set(spots.map(s => s.id))

    for (const [id, m] of markers) {
      if (!live.has(id)) { m.remove(); markers.delete(id) }
    }

    for (const spot of spots) {
      let marker = markers.get(spot.id)
      if (!marker) {
        const el = document.createElement('div')
        el.className = 'spot-marker'
        marker = new maplibregl.Marker({ element: el, draggable: props.editMode, anchor: 'bottom' })
          .setLngLat([spot.lng, spot.lat])
          .addTo(map)
        marker.on('dragend', () => {
          const ll = marker!.getLngLat()
          propsRef.current.onMoveSpot(spot.id, ll.lng, ll.lat)
        })
        el.addEventListener('click', e => {
          e.stopPropagation()
          propsRef.current.onSelectSpot(spot.id)
        })
        markers.set(spot.id, marker)
      }
      marker.setLngLat([spot.lng, spot.lat])
      marker.setDraggable(props.editMode)
      const el = marker.getElement()
      const selected = props.selectedSpotId === spot.id && props.editMode
      el.innerHTML = `
        ${selected ? `<div class="marker-toolbar">
          <button data-act="link" title="Link">🔗</button>
          <button data-act="title" title="Title">T</button>
          <button data-act="sticker" title="Sticker">𖠋</button>
          <button data-act="delete" title="Delete">🗑</button>
        </div>` : ''}
        <div class="stk">${spot.sticker}</div>
        <div class="lbl">${escapeHtml(spot.title)}</div>`
      el.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation()
          const act = (e.currentTarget as HTMLElement).dataset.act
          if (act === 'delete') propsRef.current.onDeleteSpot(spot.id)
          if (act === 'sticker') propsRef.current.onCycleSticker(spot.id)
          if (act === 'title' || act === 'link') propsRef.current.onSelectSpot(spot.id)
        })
      })
    }
  }, [props.doc, props.selectedSpotId, props.editMode])

  return <div ref={containerRef} className="map-canvas" />
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}
