import { useEffect, useMemo, useRef, useState } from 'react'
import type maplibregl from 'maplibre-gl'
import { Link } from 'react-router-dom'
import MapCanvas from './MapCanvas'
import { loadProfile, newMap, saveProfile, uid } from './store'
import type { MapDoc, Profile, Section, Spot } from './store'
import { DEFAULT_STICKER, TRAY_STICKERS } from './stickers'

type View =
  | { kind: 'profile' }
  | { kind: 'map'; mapId: string }
  | { kind: 'spot'; mapId: string; spotId: string }

export default function App() {
  const [profile, setProfile] = useState<Profile>(loadProfile)
  const [view, setView] = useState<View>({ kind: 'profile' })
  const [editMode, setEditMode] = useState(true)
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null)
  const [askPamOpen, setAskPamOpen] = useState(false)
  const [pamMessages, setPamMessages] = useState<string[]>([])
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const mapHandle = useRef<maplibregl.Map | null>(null)

  useEffect(() => saveProfile(profile), [profile])

  const update = (fn: (p: Profile) => Profile) => setProfile(p => fn(structuredClone(p)))

  const currentMap: MapDoc | null =
    view.kind === 'profile' ? null : profile.maps.find(m => m.id === view.mapId) ?? null

  const updateMap = (mapId: string, fn: (m: MapDoc) => void) =>
    update(p => {
      const m = p.maps.find(x => x.id === mapId)
      if (m) fn(m)
      return p
    })

  const findSpot = (doc: MapDoc | null, id: string | null): Spot | null => {
    if (!doc || !id) return null
    for (const s of doc.sections) for (const sp of s.spots) if (sp.id === id) return sp
    return null
  }

  const updateSpot = (mapId: string, spotId: string, fn: (s: Spot) => void) =>
    updateMap(mapId, m => {
      const sp = m.sections.flatMap(s => s.spots).find(s => s.id === spotId)
      if (sp) fn(sp)
    })

  const makeMap = () => {
    const m = newMap()
    update(p => { p.maps.push(m); return p })
    setView({ kind: 'map', mapId: m.id })
    setEditMode(true)
  }

  const addSpot = (mapId: string, sticker: string, lng: number, lat: number, title = 'New spot') => {
    const spot: Spot = {
      id: uid(), title, description: '', address: '', links: [],
      date: '', sticker, lng, lat,
    }
    updateMap(mapId, m => {
      if (!m.sections.length) m.sections.push({ id: uid(), title: '', description: '', spots: [] })
      m.sections[m.sections.length - 1].spots.push(spot)
    })
    setSelectedSpotId(spot.id)
    return spot
  }

  const deleteSpot = (mapId: string, spotId: string) => {
    updateMap(mapId, m => {
      for (const s of m.sections) s.spots = s.spots.filter(sp => sp.id !== spotId)
    })
    if (selectedSpotId === spotId) setSelectedSpotId(null)
    if (view.kind === 'spot' && view.spotId === spotId) setView({ kind: 'map', mapId })
  }

  const cycleSticker = (mapId: string, spotId: string) =>
    updateSpot(mapId, spotId, sp => {
      const i = TRAY_STICKERS.indexOf(sp.sticker)
      sp.sticker = TRAY_STICKERS[(i + 1) % TRAY_STICKERS.length]
    })

  const runSearch = async () => {
    const q = search.trim()
    if (!q || view.kind === 'profile') return
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
      )
      const results = await res.json()
      if (!results.length) return
      const r = results[0]
      const lng = parseFloat(r.lon), lat = parseFloat(r.lat)
      mapHandle.current?.flyTo({ center: [lng, lat], zoom: 14 })
      if (editMode && view.kind === 'map') {
        addSpot(view.mapId, DEFAULT_STICKER, lng, lat, r.name || q)
      }
      setSearch('')
    } catch {
      /* offline — ignore */
    }
  }

  const askPam = (q: string) => {
    setPamMessages(ms => [...ms,
      q,
      "Great idea! I'd suggest exploring the area around the city center — try searching for specific spots above and I'll pin them to your map.",
    ])
  }

  const spot = view.kind === 'spot' ? findSpot(currentMap, view.spotId) : null

  return (
    <div className="app-shell">
      <MapCanvas
        doc={currentMap}
        selectedSpotId={selectedSpotId}
        editMode={editMode && view.kind !== 'profile'}
        onSelectSpot={id => {
          setSelectedSpotId(id)
          if (id && view.kind !== 'profile') setView({ kind: 'spot', mapId: (view as Exclude<View, { kind: 'profile' }>).mapId, spotId: id })
          else if (!id && view.kind === 'spot') setView({ kind: 'map', mapId: view.mapId })
        }}
        onMoveSpot={(id, lng, lat) => view.kind !== 'profile' && updateSpot(view.mapId, id, s => { s.lng = lng; s.lat = lat })}
        onDropSticker={(stk, lng, lat) => view.kind !== 'profile' && editMode && addSpot(view.mapId, stk, lng, lat)}
        onDeleteSpot={id => view.kind !== 'profile' && deleteSpot(view.mapId, id)}
        onCycleSticker={id => view.kind !== 'profile' && cycleSticker(view.mapId, id)}
        registerMap={m => { mapHandle.current = m }}
      />

      <Link to="/" className="logo-corner" title="PamPam home"><span>PAM</span></Link>

      <div className="left-rail">
        <button className="rail-btn" title="Draw">✎</button>
        <button className="rail-btn" title="Add"
          onClick={() => view.kind !== 'profile' && editMode && addSpot(view.mapId, DEFAULT_STICKER, ...centerOf(mapHandle.current))}>+</button>
        <button className="rail-btn avatar" style={{ background: profile.avatarColor }}
          onClick={() => { setView({ kind: 'profile' }); setSelectedSpotId(null) }}>
          {profile.name[0]?.toUpperCase() || 'S'}
        </button>
      </div>

      <div className="top-bar">
        <div className="search-pill">
          <span>🔍</span>
          <input
            placeholder="Search this map"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && runSearch()}
          />
        </div>
        <button className="dots-btn">⋯</button>
        {view.kind !== 'profile' && (
          <button className="edit-toggle" onClick={() => setEditMode(m => !m)}>
            Edit <span className={`toggle-knob${editMode ? ' on' : ''}`} />
          </button>
        )}
      </div>

      {view.kind !== 'profile' && (
        <button className="share-btn" onClick={() => {
          navigator.clipboard?.writeText(location.href).catch(() => {})
        }}>Share</button>
      )}

      <div className="panel">
        {view.kind === 'profile' && (
          <ProfilePanel profile={profile} update={update} editMode={editMode}
            onOpenMap={id => { setView({ kind: 'map', mapId: id }); setSelectedSpotId(null) }}
            onMakeMap={makeMap} />
        )}
        {view.kind === 'map' && currentMap && (
          <MapPanel doc={currentMap} editMode={editMode}
            updateMap={fn => updateMap(currentMap.id, fn)}
            onBack={() => { setView({ kind: 'profile' }); setSelectedSpotId(null) }}
            onOpenSpot={id => {
              setView({ kind: 'spot', mapId: currentMap.id, spotId: id })
              setSelectedSpotId(id)
              const sp = findSpot(currentMap, id)
              if (sp) mapHandle.current?.flyTo({ center: [sp.lng, sp.lat], zoom: 14 })
            }}
            onAddSpot={() => addSpot(currentMap.id, DEFAULT_STICKER, ...centerOf(mapHandle.current))}
            onAddSection={() => updateMap(currentMap.id, m => { m.sections.push({ id: uid(), title: '', description: '', spots: [] }) })} />
        )}
        {view.kind === 'spot' && currentMap && spot && (
          <SpotPanel spot={spot} editMode={editMode}
            updateSpot={fn => updateSpot(currentMap.id, spot.id, fn)}
            onBack={() => { setView({ kind: 'map', mapId: currentMap.id }); setSelectedSpotId(null) }}
            onZoom={img => setLightbox(img)} />
        )}
      </div>

      {view.kind !== 'profile' && editMode && (
        <div className="sticker-tray">
          {TRAY_STICKERS.slice(0, 12).map((s, i) => (
            <span key={i} className="tray-sticker" draggable
              onDragStart={e => e.dataTransfer.setData('text/sticker', s)}
              onClick={() => addSpot(view.mapId, s, ...centerOf(mapHandle.current))}
            >{s}</span>
          ))}
        </div>
      )}

      {askPamOpen && (
        <AskPam messages={pamMessages} onAsk={askPam} onClose={() => setAskPamOpen(false)} />
      )}
      <button className="chat-bubble" onClick={() => setAskPamOpen(o => !o)}>💬</button>

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" onClick={e => e.stopPropagation()} />
          <button className="close" onClick={() => setLightbox(null)}>✕</button>
        </div>
      )}
    </div>
  )
}

function centerOf(map: maplibregl.Map | null): [number, number] {
  if (!map) return [-74.0, 40.72]
  const c = map.getCenter()
  return [c.lng, c.lat]
}

// ---------------- Profile panel ----------------
function ProfilePanel({ profile, update, editMode, onOpenMap, onMakeMap }: {
  profile: Profile
  update: (fn: (p: Profile) => Profile) => void
  editMode: boolean
  onOpenMap: (id: string) => void
  onMakeMap: () => void
}) {
  return (
    <>
      <div className="panel-scroll">
        <div className="avatar-lg" style={{ background: profile.avatarColor }}>
          {profile.name[0]?.toUpperCase() || 'S'}
        </div>
        <div className="profile-name">
          <input value={profile.name} style={{ fontSize: 17, fontWeight: 700 }}
            onChange={e => update(p => { p.name = e.target.value; return p })} />
        </div>
        <span className="plan-badge">Free Plan</span>

        {editMode && (
          <>
            <div className="field">
              <div className="label">Description</div>
              <input placeholder="Say something about yourself" value={profile.bio}
                onChange={e => update(p => { p.bio = e.target.value; return p })} />
            </div>
            <div className="field">
              <div className="label">Links</div>
              <input placeholder="Paste a link"
                onKeyDown={e => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    const v = e.currentTarget.value.trim()
                    update(p => { p.links.push(v); return p })
                    e.currentTarget.value = ''
                  }
                }} />
              {profile.links.length > 0 && (
                <div className="links-row" style={{ marginTop: 6 }}>
                  {profile.links.map((l, i) => <span className="link-chip" key={i}>🌐 {l.replace(/^https?:\/\//, '')}</span>)}
                </div>
              )}
            </div>
          </>
        )}

        {profile.maps.length === 0 ? (
          <div className="empty-globe">
            <div className="globe">🌐</div>
            <p>A world waiting to be filled with maps. <a href="#examples">See examples</a> or <a href="#watch">watch how to get started</a></p>
          </div>
        ) : (
          <div className="section-card">
            <div className="sec-title"><input placeholder="Section title" readOnly /></div>
            <div className="sec-desc"><input placeholder="Description of this section" readOnly /></div>
            {profile.maps.map(m => (
              <div className="map-row" key={m.id} onClick={() => onOpenMap(m.id)}>
                {m.covers[0]
                  ? <img className="thumb" src={m.covers[0]} alt="" />
                  : <div className="thumb">🗺️</div>}
                <div className="meta">
                  <div className="t">{m.title}</div>
                  {m.description && <div className="d">{m.description}</div>}
                </div>
                <span className="drag-dots">⋮⋮</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="panel-footer">
        <button className="btn-block blue" onClick={onMakeMap}>Make a map</button>
      </div>
    </>
  )
}

// ---------------- Map panel ----------------
function MapPanel({ doc, editMode, updateMap, onBack, onOpenSpot, onAddSpot, onAddSection }: {
  doc: MapDoc
  editMode: boolean
  updateMap: (fn: (m: MapDoc) => void) => void
  onBack: () => void
  onOpenSpot: (id: string) => void
  onAddSpot: () => void
  onAddSection: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const totalSpots = useMemo(() => doc.sections.reduce((n, s) => n + s.spots.length, 0), [doc])

  const addCover = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => updateMap(m => { m.covers.push(reader.result as string) })
    reader.readAsDataURL(file)
  }

  return (
    <>
      <div className="panel-scroll">
        <button className="panel-back" onClick={onBack}>← Back</button>

        {editMode ? (
          <div className="cover-row">
            {doc.covers.map((c, i) => (
              <div className="cover-wrap" key={i}>
                <img className="cover-thumb" src={c} alt="" />
                <button className="remove" onClick={() => updateMap(m => { m.covers.splice(i, 1) })}>✕</button>
              </div>
            ))}
            <div className={`add-image${doc.covers.length ? '' : ' wide'}`} onClick={() => fileRef.current?.click()}>
              <span>🖼</span><span>Add image</span>
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden
              onChange={e => { const f = e.target.files?.[0]; if (f) addCover(f); e.target.value = '' }} />
          </div>
        ) : doc.covers.length > 0 && (
          <div className="cover-row">
            {doc.covers.map((c, i) => <img className="cover-thumb" src={c} key={i} alt="" />)}
          </div>
        )}

        <div className="field title-input">
          <input value={doc.title} readOnly={!editMode}
            onChange={e => updateMap(m => { m.title = e.target.value })} />
        </div>
        <div className="field">
          <div className="label">Description</div>
          <input placeholder="What's this map about?" value={doc.description} readOnly={!editMode}
            onChange={e => updateMap(m => { m.description = e.target.value })} />
        </div>
        <div className="field">
          <div className="label">Links</div>
          <div className="links-row">
            {doc.links.map((l, i) => <span className="link-chip" key={i}>🌐 {l.replace(/^https?:\/\//, '')}</span>)}
            {editMode && (
              <input placeholder="Paste a link"
                onKeyDown={e => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    const v = e.currentTarget.value.trim()
                    updateMap(m => { m.links.push(v) })
                    e.currentTarget.value = ''
                  }
                }} />
            )}
          </div>
        </div>

        {doc.sections.map(section => (
          <SectionCard key={section.id} section={section} editMode={editMode} totalSpots={totalSpots}
            updateSection={fn => updateMap(m => { const s = m.sections.find(x => x.id === section.id); if (s) fn(s) })}
            onOpenSpot={onOpenSpot} onAddSpot={onAddSpot} />
        ))}
      </div>
      {editMode && (
        <div className="panel-footer">
          <button className={`btn-block ${totalSpots > 0 ? 'gray' : 'orange'}`} onClick={onAddSection}>Add</button>
        </div>
      )}
    </>
  )
}

function SectionCard({ section, editMode, totalSpots, updateSection, onOpenSpot, onAddSpot }: {
  section: Section
  editMode: boolean
  totalSpots: number
  updateSection: (fn: (s: Section) => void) => void
  onOpenSpot: (id: string) => void
  onAddSpot: () => void
}) {
  return (
    <div className="section-card">
      <div className="sec-title">
        <input placeholder="Section title" value={section.title} readOnly={!editMode}
          onChange={e => updateSection(s => { s.title = e.target.value })} />
      </div>
      <div className="sec-desc">
        <input placeholder="Description of this section" value={section.description} readOnly={!editMode}
          onChange={e => updateSection(s => { s.description = e.target.value })} />
      </div>

      {section.spots.map(sp => (
        <div className="spot-row" key={sp.id} onClick={() => onOpenSpot(sp.id)}>
          {sp.image
            ? <img className="spot-thumb" src={sp.image} alt="" />
            : <div className="spot-thumb">{sp.sticker}</div>}
          <div className="meta">
            <div className="t">{sp.title}</div>
            {sp.description && <div className="d">{sp.description}</div>}
          </div>
          <span className="drag-dots">⋮⋮</span>
        </div>
      ))}

      {editMode && (
        section.spots.length === 0 && totalSpots === 0 ? (
          <div className="section-hint">
            Add up to 30 spots, or get more spots with <span className="pro">Pro</span>
          </div>
        ) : (
          <button className="btn-block lightblue" style={{ marginTop: 10 }} onClick={onAddSpot}>
            Add spot to section
          </button>
        )
      )}
    </div>
  )
}

// ---------------- Spot panel ----------------
function SpotPanel({ spot, editMode, updateSpot, onBack, onZoom }: {
  spot: Spot
  editMode: boolean
  updateSpot: (fn: (s: Spot) => void) => void
  onBack: () => void
  onZoom: (img: string) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  return (
    <div className="panel-scroll">
      <button className="panel-back" onClick={onBack}>← Back</button>

      {spot.image ? (
        <img className="spot-photo" src={spot.image} alt="" onClick={() => onZoom(spot.image!)} />
      ) : (
        <div className="spot-photo-emoji" onClick={() => editMode && fileRef.current?.click()}>{spot.sticker}</div>
      )}
      <input ref={fileRef} type="file" accept="image/*" hidden
        onChange={e => {
          const f = e.target.files?.[0]
          if (f) {
            const reader = new FileReader()
            reader.onload = () => updateSpot(s => { s.image = reader.result as string })
            reader.readAsDataURL(f)
          }
          e.target.value = ''
        }} />

      <div className="place-card">
        <div className="name">{spot.title || 'Untitled spot'}</div>
        <div className="sub">
          <span className="stars">★★★★☆</span>
          <span>· {spot.category || 'Place'}</span>
        </div>
        {spot.address && <div className="sub">📍 {spot.address}</div>}
      </div>

      <div className="field">
        <div className="label">Title</div>
        <input value={spot.title} readOnly={!editMode}
          onChange={e => updateSpot(s => { s.title = e.target.value })} />
      </div>
      <div className="field">
        <div className="label">Description</div>
        <textarea rows={2} placeholder="Add a description about this place" value={spot.description} readOnly={!editMode}
          onChange={e => updateSpot(s => { s.description = e.target.value })} />
      </div>
      <div className="field">
        <div className="label">Address</div>
        <input placeholder="Address" value={spot.address} readOnly={!editMode}
          onChange={e => updateSpot(s => { s.address = e.target.value })} />
      </div>
      <div className="field">
        <div className="label">Links</div>
        <div className="links-row">
          <span className="link-chip">G Google</span>
          {spot.links.map((l, i) => <span className="link-chip" key={i}>🌐 {l.replace(/^https?:\/\//, '')}</span>)}
          {editMode && (
            <input placeholder="Paste a link"
              onKeyDown={e => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  const v = e.currentTarget.value.trim()
                  updateSpot(s => { s.links.push(v) })
                  e.currentTarget.value = ''
                }
              }} />
          )}
        </div>
      </div>
      <div className="field">
        <div className="label">Date · From</div>
        <input placeholder="04/20/2025, 12:30 PM" value={spot.date} readOnly={!editMode}
          onChange={e => updateSpot(s => { s.date = e.target.value })} />
      </div>
    </div>
  )
}

// ---------------- Ask Pam ----------------
function AskPam({ messages, onAsk, onClose }: {
  messages: string[]
  onAsk: (q: string) => void
  onClose: () => void
}) {
  return (
    <div className="askpam">
      <button className="close" onClick={onClose}>✕</button>
      <div className="pam-head">
        <span className="pam-avatar">🧑‍🌾</span>
        <div className="pam-msg">Hello! Let's explore the world together</div>
      </div>
      {messages.map((m, i) => (
        i % 2 === 0
          ? <div className="user-msg" key={i}>{m}</div>
          : <div className="pam-msg" key={i} style={{ marginTop: 8 }}>{m}</div>
      ))}
      <input placeholder="Ask Pam"
        onKeyDown={e => {
          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
            onAsk(e.currentTarget.value.trim())
            e.currentTarget.value = ''
          }
        }} />
    </div>
  )
}
