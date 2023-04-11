import type { Database } from './supabase'

export type Sex = 'fille' | 'gars'
export type Tutor = 'Namuka' | 'Katillys' | 'Sivem' | 'Leorn'
export type PlayerProfile = {
	id: number
	sex: Sex
	pseudo: string
	avatar: string
	level: number
	xp: number
	fire_pyrs: number
	wind_pyrs: number
	water_pyrs: number
	earth_pyrs: number
	spent_fire_pyrs: number
	spent_wind_pyrs: number
	spent_water_pyrs: number
	spent_earth_pyrs: number
	prestige: number
	tuto: string
	tutor: Tutor
	position: Position
	monsters_ids: Array<number>
}

export type Player = {
	profile: PlayerProfile
	monsters: Array<Monster>
	getElementsStats(): Record<string, number>
	defineElement(): string
	readonly element: string
	readonly stamina: number
	readonly pm: number
	definePosition(): void
}

export type PlayerData = Omit<
	Database['public']['Tables']['navadra_players']['Row'],
	'created_at'
>

export type MonsterInfos = {
	level?: number
	nb_hunters?: number
	caracs?: MonsterCaracs
}

export type Element = 'feu' | 'vent' | 'eau' | 'terre'
export type MonsterCategory = 'offensif' | 'defensif' | 'equilibre'
export type MonsterCaracs = {
	name: string
	element: Element
	category: MonsterCategory
}

export type MonsterProfile = MonsterCaracs & {
	id: number
	level: number
	position: Position
	dead: boolean
	nb_hunters: number
}

export type Monster = {
	profile: MonsterProfile
	readonly pm: number
	readonly stamina: number
	defineBorderColorHex(): string
	defineNameColorHex(): string
	definePosition(): void
}

export type MonsterData = Omit<
	Database['public']['Tables']['navadra_monsters']['Row'],
	'created_at'
>

export type Position = {
	x: number
	y: number
}
