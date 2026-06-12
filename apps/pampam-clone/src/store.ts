import { createContext, useContext } from 'react'

export interface Spot {
  id: string
  title: string
  description: string
  address: string
  links: string[]
  date: string
  sticker: string // emoji
  image?: string
  lng: number
  lat: number
  rating?: number
  category?: string
}

export interface Section {
  id: string
  title: string
  description: string
  spots: Spot[]
}

export interface MapDoc {
  id: string
  title: string
  description: string
  links: string[]
  covers: string[] // image data urls / urls
  sections: Section[]
  center: [number, number]
  zoom: number
}

export interface Profile {
  name: string
  bio: string
  links: string[]
  avatarColor: string
  maps: MapDoc[]
}

export const uid = () => Math.random().toString(36).slice(2, 10)

const KEY = 'pampam-clone-state'

export const defaultProfile = (): Profile => ({
  name: 'Sam',
  bio: '',
  links: [],
  avatarColor: '#f4600c',
  maps: [],
})

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* corrupted state falls back to default */
  }
  return defaultProfile()
}

export function saveProfile(p: Profile) {
  localStorage.setItem(KEY, JSON.stringify(p))
}

export function newMap(): MapDoc {
  return {
    id: uid(),
    title: 'My map',
    description: '',
    links: [],
    covers: [],
    sections: [
      { id: uid(), title: '', description: '', spots: [] },
    ],
    center: [-74.0, 40.72],
    zoom: 11.5,
  }
}

export interface StoreCtx {
  profile: Profile
  update: (fn: (p: Profile) => Profile) => void
}

export const StoreContext = createContext<StoreCtx | null>(null)
export const useStore = () => {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('store missing')
  return ctx
}
