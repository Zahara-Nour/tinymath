import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../types/supabase'
import { getLogger } from '$lib/utils'
let { info, fail, warn } = getLogger('images', 'info')
import { browser } from '$app/environment'

import db from '$lib/db'

export async function fetchImage(
	path: string,
	bucket = 'public/mental',
): Promise<string> {
	let base64: string | null = null

	if (browser) {
		base64 = sessionStorage.getItem(path)

		if (!base64) {
			info('fetching image', path)
			const { data: blob, error } = await db.storage
				.from(`${bucket}`)
				.download(path)

			if (error) {
				fail('error', error.message)
				return Promise.reject(new Error(error.message))
			} else {
				return new Promise(function (resolve, reject) {
					let reader = new FileReader()

					reader.onload = () => {
						const result = reader.result as string
						if (result) {
							try {
								sessionStorage.setItem(path, result as string)
							} catch (error) {
								warn('error', (error as Error).message)
							}
							info('image loaded', path)
							return resolve(result)
						} else return reject(new Error(`Error while loading image ${path}`))
					}
					reader.onerror = (ev) =>
						reject(new Error(`Error while loading image ${path}`))
					reader.readAsDataURL(blob)
				})
			}
		}
	} else {
		console.log('fetch called on server')
	}

	// l'image a été trouvée dans le localStorage, on la retourne
	return Promise.resolve(base64!)
}
