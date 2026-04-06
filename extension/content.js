(function () {
  'use strict'

  if (document.getElementById('zysignai-overlay')) return

  const BACKEND = 'https://zysignai-backend.onrender.com'

  const LANG_COLORS = {
    ASL: '#10b981', BSL: '#3b82f6', KSL: '#f59e0b',
    CSL: '#ef4444', LSF: '#8b5cf6', Auslan: '#06b6d4',
  }

  let currentLang = 'KSL'
  let captions = []
  let lastGloss = ''
  let animFrame = 0
  let player = null
  let pollTimer = null
  let isMinimized = false

  // Build overlay
  const overlay = document.createElement('div')
  overlay.id = 'zysignai-overlay'
  overlay.innerHTML = `
    <div id="zysignai-header">
      <div id="zysignai-brand">ZySign<span>AI</span></div>
      <div id="zysignai-controls">
        <select id="zysignai-lang-select">
          ${['KSL','ASL','BSL','CSL','LSF','Auslan']
            .map(l => `<option value="${l}" ${l===currentLang?'selected':''}>${l}</option>`)
            .join('')}
        </select>
        <button id="zysignai-minimize" title="Minimize"
          style="background:none;border:none;color:rgba(255,255,255,0.4);cursor:pointer;font-size:12px;padding:0 4px;">─</button>
        <button id="zysignai-close" title="Close">✕</button>
      </div>
    </div>
    <div id="zysignai-avatar-area">
      <div id="zysignai-status-dot"></div>
      <div id="zysignai-loading">
        <div id="zysignai-spinner"></div>
        <div id="zysignai-loading-text">Loading captions…</div>
      </div>
    </div>
    <div id="zysignai-gloss-bar" style="display:none;">
      <div id="zysignai-gloss-text">Waiting…</div>
      <div id="zysignai-caption-text"></div>
    </div>
  `
  document.body.appendChild(overlay)

  // Drag
  let dragging = false, dragX = 0, dragY = 0
  overlay.addEventListener('mousedown', e => {
    if (['SELECT','BUTTON'].includes(e.target.tagName)) return
    dragging = true
    dragX = e.clientX - overlay.getBoundingClientRect().left
    dragY = e.clientY - overlay.getBoundingClientRect().top
  })
  document.addEventListener('mousemove', e => {
    if (!dragging) return
    overlay.style.left = (e.clientX - dragX) + 'px'
    overlay.style.top = (e.clientY - dragY) + 'px'
    overlay.style.right = 'auto'
    overlay.style.bottom = 'auto'
  })
  document.addEventListener('mouseup', () => { dragging = false })

  // Controls
  document.getElementById('zysignai-close').onclick = () => overlay.remove()
  document.getElementById('zysignai-minimize').onclick = () => {
    isMinimized = !isMinimized
    overlay.classList.toggle('minimized', isMinimized)
    document.getElementById('zysignai-minimize').textContent = isMinimized ? '□' : '─'
  }

  setTimeout(() => {
    const sel = document.getElementById('zysignai-lang-select')
    if (!sel) return
    sel.onchange = e => {
      currentLang = e.target.value
      const color = LANG_COLORS[currentLang]
      overlay.style.borderColor = color + '60'
      const gt = document.getElementById('zysignai-gloss-text')
      if (gt) gt.style.color = color
      captions = []
      lastGloss = ''
      showLoading('Switching to ' + currentLang + '…')
      loadCaptions()
    }
  }, 200)

  function getVideoId() {
    const m = location.href.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
    return m ? m[1] : null
  }

  // ── FETCH CAPTIONS FROM BROWSER (not server) ──────────────────────
  async function fetchCaptionsFromBrowser(videoId) {
    try {
      const pageRes = await fetch(
        `https://www.youtube.com/watch?v=${videoId}&hl=en`,
        { credentials: 'include' }
      )
      const html = await pageRes.text()

      // Try multiple regex patterns for different YouTube page formats
      let captionTracks = null

      const patterns = [
        /"captionTracks":(\[.*?\])/,
        /"captionTracks": (\[.*?\])/,
        /captionTracks":"(.*?)"/,
      ]

      for (const pattern of patterns) {
        const match = html.match(pattern)
        if (match) {
          try {
            captionTracks = JSON.parse(match[1])
            break
          } catch {
            continue
          }
        }
      }

      if (!captionTracks || captionTracks.length === 0) {
        console.log('ZySignAI: No caption tracks found in page')
        return null
      }

      // Find English track — prefer manual over auto-generated
      const enTrack =
        captionTracks.find(t => t.languageCode === 'en' && !t.kind) ||
        captionTracks.find(t => t.languageCode === 'en-US') ||
        captionTracks.find(t => t.languageCode === 'en-GB') ||
        captionTracks.find(t => t.languageCode?.startsWith('en'))

      if (!enTrack || !enTrack.baseUrl) {
        console.log('ZySignAI: No English track found. Tracks:', captionTracks.map(t => t.languageCode))
        return null
      }

      // Fetch captions — try JSON format first, fall back to XML
      let transcript = null

      try {
        // Add lang parameter to ensure we get English
        const captionUrl = enTrack.baseUrl + '&fmt=json3&lang=en'
        const jsonRes = await fetch(captionUrl)
        const text = await jsonRes.text()
        if (!text || text.trim() === '') throw new Error('Empty response')
        const jsonData = JSON.parse(text)

        if (jsonData.events) {
          transcript = jsonData.events
            .filter(e => e.segs && e.tStartMs !== undefined)
            .map(e => ({
              start: e.tStartMs / 1000,
              duration: (e.dDurationMs || 3000) / 1000,
              text: e.segs
                .map(s => s.utf8 || '')
                .join('')
                .replace(/\n/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
            }))
            .filter(e => e.text && e.text.length > 1)
        }
      } catch (jsonErr) {
        console.log('ZySignAI: JSON captions failed, trying XML:', jsonErr.message)

        // Try XML format
        try {
          const xmlRes = await fetch(enTrack.baseUrl)
          const xmlText = await xmlRes.text()
          const parser = new DOMParser()
          const xmlDoc = parser.parseFromString(xmlText, 'text/xml')
          const texts = xmlDoc.querySelectorAll('text')

          transcript = Array.from(texts).map(node => ({
            start: parseFloat(node.getAttribute('start') || '0'),
            duration: parseFloat(node.getAttribute('dur') || '3'),
            text: node.textContent
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&#39;/g, "'")
              .replace(/&quot;/g, '"')
              .replace(/\n/g, ' ')
              .trim()
          })).filter(e => e.text)
        } catch (xmlErr) {
          console.log('ZySignAI: XML captions also failed:', xmlErr.message)
          return null
        }
      }

      return transcript && transcript.length > 0 ? transcript : null

    } catch (err) {
      console.log('ZySignAI: Caption fetch error:', err.message)
      return null
    }
  }

  // ── SEND TEXT TO BACKEND FOR GLOSSING ────────────────────────────
  async function glossBatch(texts, language) {
    try {
      const res = await fetch(`${BACKEND}/api/gloss/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: texts.join(' | '),
          language: language
        })
      })
      const data = await res.json()
      return data.gloss || texts.join(' ').toUpperCase()
    } catch {
      return texts.join(' ').toUpperCase()
    }
  }

  async function loadCaptions() {
    const vid = getVideoId()
    if (!vid) {
      showError('Open a YouTube video to start.')
      return
    }

    showLoading('Fetching captions from YouTube…')

    // Fetch captions directly in browser
    const transcript = await fetchCaptionsFromBrowser(vid)

    if (!transcript || transcript.length === 0) {
      showError('No English captions found.\nTry a video with CC enabled.')
      return
    }

    showLoading(`Generating ${currentLang} sign glosses…`)

    // Batch gloss — 10 captions per API call
    const glossed = []
    const batchSize = 10

    for (let i = 0; i < transcript.length; i += batchSize) {
      const batch = transcript.slice(i, i + batchSize)
      const texts = batch.map(s => s.text)
      const gloss = await glossBatch(texts, currentLang)

      for (let j = 0; j < batch.length; j++) {
        glossed.push({
          start: batch[j].start,
          duration: batch[j].duration,
          text: batch[j].text,
          gloss: j === 0 ? gloss : ''
        })
      }
    }

    captions = glossed
    showAvatar()
    startPolling()
  }

  function startPolling() {
    if (pollTimer) clearInterval(pollTimer)
    pollTimer = setInterval(() => {
      player = player || document.querySelector('.html5-main-video')
      if (!player) return

      const t = player.currentTime
      const paused = player.paused

      const dot = document.getElementById('zysignai-status-dot')
      if (dot) dot.classList.toggle('live', !paused)

      if (paused) return

      const cap = captions.find(c => t >= c.start && t < c.start + c.duration)
      if (cap) {
        const gloss = cap.gloss || ''
        const text = cap.text || ''
        if (gloss && gloss !== lastGloss) {
          lastGloss = gloss
          updateGloss(gloss, text)
          animateAvatar(gloss)
        }
      }
    }, 300)
  }

  function buildAvatar(color) {
    return `
      <svg viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg" id="zysignai-avatar-svg">
        <ellipse cx="60" cy="75" rx="22" ry="28" fill="${color}" opacity="0.9"/>
        <circle cx="60" cy="36" r="22" fill="#FDDBB4"/>
        <ellipse cx="60" cy="20" rx="22" ry="12" fill="${color}"/>
        <circle cx="52" cy="34" r="3.5" fill="white"/>
        <circle cx="68" cy="34" r="3.5" fill="white"/>
        <circle cx="52" cy="34" r="1.8" fill="#1f2937"/>
        <circle cx="68" cy="34" r="1.8" fill="#1f2937"/>
        <path d="M52 44 Q60 51 68 44" stroke="#c2855a" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <rect x="46" y="100" width="12" height="38" rx="6" fill="${color}" opacity="0.8"/>
        <rect x="62" y="100" width="12" height="38" rx="6" fill="${color}" opacity="0.8"/>
        <g id="zs-left-arm">
          <rect x="18" y="70" width="20" height="10" rx="5" fill="${color}" transform-origin="38 75"/>
        </g>
        <g id="zs-right-arm">
          <rect x="82" y="70" width="20" height="10" rx="5" fill="${color}" transform-origin="82 75"/>
        </g>
        <circle id="zs-left-hand" cx="20" cy="75" r="8" fill="#FDDBB4"/>
        <circle id="zs-right-hand" cx="100" cy="75" r="8" fill="#FDDBB4"/>
      </svg>
    `
  }

  const SIGN_POSES = [
    { lx:20, ly:75, rx:100, ry:75, la:0,   ra:0   },
    { lx:30, ly:50, rx:90,  ry:50, la:-30, ra:30  },
    { lx:25, ly:60, rx:95,  ry:60, la:-20, ra:20  },
    { lx:15, ly:80, rx:105, ry:80, la:10,  ra:-10 },
    { lx:40, ly:55, rx:80,  ry:55, la:-40, ra:40  },
    { lx:35, ly:70, rx:85,  ry:70, la:-15, ra:15  },
  ]

  function animateAvatar(gloss) {
    if (!gloss) return
    const words = gloss.split(' ').filter(Boolean)
    let i = 0
    function nextPose() {
      if (i >= words.length) { setPose(SIGN_POSES[0]); return }
      setPose(SIGN_POSES[i % (SIGN_POSES.length - 1) + 1])
      i++
      animFrame = setTimeout(nextPose, 380)
    }
    clearTimeout(animFrame)
    nextPose()
  }

  function setPose(pose) {
    const lh = document.getElementById('zs-left-hand')
    const rh = document.getElementById('zs-right-hand')
    const la = document.getElementById('zs-left-arm')
    const ra = document.getElementById('zs-right-arm')
    if (!lh || !rh) return
    lh.setAttribute('cx', pose.lx)
    lh.setAttribute('cy', pose.ly)
    rh.setAttribute('cx', pose.rx)
    rh.setAttribute('cy', pose.ry)
    la.setAttribute('transform', `rotate(${pose.la}, 38, 75)`)
    ra.setAttribute('transform', `rotate(${pose.ra}, 82, 75)`)
  }

  function showLoading(msg) {
    document.getElementById('zysignai-avatar-area').innerHTML = `
      <div id="zysignai-status-dot"></div>
      <div id="zysignai-loading">
        <div id="zysignai-spinner"></div>
        <div id="zysignai-loading-text">${msg || 'Loading…'}</div>
      </div>
    `
    const bar = document.getElementById('zysignai-gloss-bar')
    if (bar) bar.style.display = 'none'
  }

  function showError(msg) {
    document.getElementById('zysignai-avatar-area').innerHTML = `
      <div id="zysignai-status-dot"></div>
      <div id="zysignai-error">${msg}</div>
    `
    const bar = document.getElementById('zysignai-gloss-bar')
    if (bar) bar.style.display = 'none'
  }

  function showAvatar() {
    const color = LANG_COLORS[currentLang]
    overlay.style.borderColor = color + '60'
    document.getElementById('zysignai-avatar-area').innerHTML =
      `<div id="zysignai-status-dot"></div>` + buildAvatar(color)
    const bar = document.getElementById('zysignai-gloss-bar')
    if (bar) bar.style.display = 'flex'
    const gt = document.getElementById('zysignai-gloss-text')
    if (gt) gt.style.color = color
  }

  function updateGloss(gloss, text) {
    const g = document.getElementById('zysignai-gloss-text')
    const c = document.getElementById('zysignai-caption-text')
    if (g) g.textContent = gloss
    if (c) c.textContent = text
  }

  // Watch for YouTube SPA navigation
  let lastUrl = location.href
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href
      if (location.href.includes('/watch')) {
        captions = []
        lastGloss = ''
        showLoading('Loading new video…')
        setTimeout(loadCaptions, 1500)
      }
    }
  }).observe(document.body, { childList: true, subtree: true })

  loadCaptions()

})()