const esbuild = require('esbuild')
const svgrPlugin = require('esbuild-plugin-svgr')
const fs = require('fs/promises')
const fsSync = require('fs')
const dotenv = require('dotenv')

dotenv.config()
;(async () => {
  const define = {}

  for (const envVarName in process.env) {
    if (envVarName.startsWith('REACT_APP_') || envVarName === 'NODE_ENV') {
      define[`process.env.${envVarName}`] = JSON.stringify(
        process.env[envVarName]
      )
    }
  }

  const config = {
    entryPoints: ['./src/index.tsx'],
    bundle: true,
    outdir: './build',
    sourcemap: true,
    minify: false,
    target: ['esnext'],
    plugins: [
      svgrPlugin({
        exportType: 'named',
      }),
    ],
    loader: {
      '.js': 'jsx',
      '.ts': 'ts',
      '.tsx': 'tsx',
      '.webp': 'file',
      '.png': 'file',
    },
    define,
    publicPath: '/', // fix webp etc
    splitting: true,
    format: 'esm',
  }

  try {
    if (fsSync.existsSync('./build')) {
      await fs.rm('./build', { recursive: true, force: true })
    }

    await fs.cp('./public', './build', { recursive: true })

    const context = await esbuild.context(config)

    if (process.env.NODE_ENV === 'development') {
      console.log('Serving...')

      const { port, hosts } = await context.serve({
        servedir: './build',
        port: 3000,
        fallback: './build/index.html',
      })

      console.log(`${hosts} :${port}`)

      console.log('Watching...')

      context.watch()

      await new Promise(() => {})
    } else {
      const result = await context.rebuild()

      console.log('Build success', result)
    }

    await context.dispose()

    console.log('Done')
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
})()
