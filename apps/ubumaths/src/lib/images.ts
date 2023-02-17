import { supabaseClient } from '$lib/supabaseClients'
import { getLogger } from '$lib/utils'
let { info, fail, warn } = getLogger('images', 'info')
import { browser } from '$app/environment'

export async function fetchImage(name: string): Promise<string> {
	let base64: string | null = null

	if (browser) {
		base64 = sessionStorage.getItem(name)

		if (!base64) {
			info('fetching image', name)
			const { data: blob, error } = await supabaseClient.storage
				.from('public/mental')
				.download(name)

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
								sessionStorage.setItem(name, result as string)
							} catch (error) {
								warn('error', (error as Error).message)
							}
							info('image loaded', name)
							return resolve(result)
						} else return reject(new Error(`Error while loading image ${name}`))
					}
					reader.onerror = (ev) =>
						reject(new Error(`Error while loading image ${name}`))
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
