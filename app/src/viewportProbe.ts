// TEMPORARY: measures the viewport while an installed copy starts, to find which height is already
// right on the first frame on iOS. Shown only in the installed app, or with `?probe` in the address.
// Remove this file and its import in main.ts once the numbers are in.

const installed =
  matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true

if (installed || new URLSearchParams(location.search).has('probe')) startProbe()

function startProbe() {
  const started = performance.now()

  const gauge = (css: string) => {
    const element = document.createElement('div')
    element.style.cssText = `position:fixed;top:0;left:-20px;width:1px;visibility:hidden;pointer-events:none;${css}`
    document.documentElement.append(element)
    return element
  }
  const units = {
    dvh: gauge('height:100dvh'),
    svh: gauge('height:100svh'),
    lvh: gauge('height:100lvh'),
    vh: gauge('height:100vh'),
  }
  const insets = gauge('padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)')

  const panel = document.createElement('pre')
  panel.style.cssText =
    'position:fixed;z-index:99;left:6px;right:6px;top:calc(env(safe-area-inset-top) + 56px);margin:0;' +
    'padding:6px;font:10px/1.35 ui-monospace,Menlo,monospace;white-space:pre;overflow:hidden;' +
    'background:rgb(255 255 255 / 0.92);color:#000;border:1px solid #000;pointer-events:none'
  document.documentElement.append(panel)

  const round = (value: number | undefined) => (value === undefined ? '-' : String(Math.round(value)))
  const read = () => {
    const work = document.querySelector('.work')
    const style = getComputedStyle(insets)
    return [
      round(innerHeight),
      round(visualViewport?.height),
      round(units.dvh.offsetHeight),
      round(units.svh.offsetHeight),
      round(units.lvh.offsetHeight),
      round(units.vh.offsetHeight),
      round(document.body?.getBoundingClientRect().height),
      round(parseFloat(style.paddingTop)),
      round(parseFloat(style.paddingBottom)),
      round(work?.getBoundingClientRect().top),
    ].join(' ')
  }

  const head =
    `screen ${screen.width}x${screen.height} dpr ${devicePixelRatio} installed ${installed}\n` +
    '   ms inner   vv  dvh  svh  lvh   vh body sTop sBot work'
  const rows: string[] = []
  let last = ''
  const record = (why: string) => {
    const now = read()
    if (now === last) return
    last = now
    const ms = String(Math.round(performance.now() - started)).padStart(5)
    const columns = now.split(' ').map((value) => value.padStart(4))
    rows.push(`${ms}${why} ${columns.join(' ')}`)
    if (rows.length > 24) rows.splice(1, 1)
    panel.textContent = `${head}\n${rows.join('\n')}`
  }

  // Every frame for the first few seconds, then on every resize.
  const watchUntil = started + 4000
  const frame = () => {
    record(' ')
    if (performance.now() < watchUntil) requestAnimationFrame(frame)
  }
  record(' ')
  requestAnimationFrame(frame)
  addEventListener('resize', () => record('r'))
  visualViewport?.addEventListener('resize', () => record('v'))
  document.addEventListener('visibilitychange', () => record('s'))
}
