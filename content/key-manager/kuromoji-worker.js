self.addEventListener('message', async event => {
  const { id, filename } = event.data
  try {
    const response = await fetch(filename)
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)

    const stream = response.body?.pipeThrough(new DecompressionStream('gzip'))
    if (!stream) throw new Error('kuromoji dictionary response has no body')

    const buffer = await new Response(stream).arrayBuffer()
    self.postMessage({ id, buffer }, [buffer])
  }
  catch (error) {
    self.postMessage({ id, error: error instanceof Error ? error.message : String(error) })
  }
})
