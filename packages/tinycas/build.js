/* eslint-disable @typescript-eslint/no-var-requires */
const esbuild = require('esbuild')
const { dependencies, peerDependencies } = require('./package.json')
// Automatically exclude all node_modules from the bundled version
// const { nodeExternalsPlugin } = require('esbuild-node-externals')
console.log(dependencies)
esbuild
	.build({
		entryPoints: ['src/index.ts'],
		outfile: 'dist/index.mjs',
		// outdir: 'dist',
		bundle: true,
		sourcemap: true,
		minify: true,
		// splitting: true,
		format: 'esm',
		target: ['esnext'],
		external: Object.keys(dependencies ? dependencies : {}).concat(
			Object.keys(peerDependencies ? peerDependencies : {}),
		),
	})
	.then(() => console.log('⚡ Done : esm'))
	.catch(() => process.exit(1))

esbuild
	.build({
		entryPoints: ['src/index.ts'],
		outfile: 'dist/index.cjs',
		bundle: true,
		sourcemap: true,
		minify: true,
		target: ['esnext'],
		platform: 'node',
		// plugins: [nodeExternalsPlugin()]
	})
	.then(() => console.log('⚡ Done : node'))
	.catch(() => process.exit(1))
// Output:
// { errors: [], warnings: [] }
