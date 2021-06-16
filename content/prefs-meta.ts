/* eslint-disable @typescript-eslint/no-unsafe-return */

import preferences from '../gen/preferences.json'
import type { Preferences, PreferenceName } from '../gen/preferences'
import { fromEntries } from './object'

export const override: { names: PreferenceName[], types: Record<string, unknown> } = {
  names: preferences.filter(pref => pref.override).map(pref => (pref.var as PreferenceName)),
  types: fromEntries(preferences.filter(pref => pref.override).map(pref => [pref.var, pref.options ? { enum: Object.keys(pref.options) } : { type: pref.type } ])),
}

export const defaults = (fromEntries(preferences.map(pref => [ pref.var, pref.name === 'citekey.format' ? (pref.default as string).replace('\u200b', '') : pref.default ])) as Preferences)
export const names = (Object.freeze(Object.keys(defaults).sort()) as PreferenceName[])
export const affects: Record<PreferenceName, string[]> = (preferences.reduce((acc, pref) => { acc[pref.name] = pref.affects || []; return acc}, {}) as Record<PreferenceName, string[]>)
