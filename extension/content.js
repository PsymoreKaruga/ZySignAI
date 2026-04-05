(function () {
  'use strict'

  // Don't inject twice
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

  // ── Build overlay HTML ──────────────────────────────────────────────
  const overlay = document.createElement('div')
  overlay.id = 'zysignai-overlay'
  overlay.innerHTML = `
    <div id="zysignai-header">
      <div id="zysignai-brand">ZySign<span>AI</span></div>
      <div id="zysignai-controls">
        <select id="zysignai-lang-select">
          ${['KSL','ASL','BSL','CSL','LSF','Auslan']
            .map(l => `<option value="${l}" ${l === currentLang ? 'selected' : ''}>${l}</option>`)
            .join('')}
        </select>
        <button id="zysignai-minimize" title="Minimize"
          style="background:none;border:none;color:rgba(255,255,255,0.4);cursor:pointer;font-size:12px;padding:0;">
          ─
        </button>
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

  // ── Dragging ────────────────────────────────────────────────────────
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
    overlay.style.top  = (e.clientY - dragY) + 'px'
    overlay.style.right = 'auto'
    overlay.style.bottom = 'auto'
  })

  document.addEventListener('mouseup', () => { dragging = false })

  // ── Controls ────────────────────────────────────────────────────────
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
      const glossText = document.getElementById('zysignai-gloss-text')
      if (glossText) glossText.style.color = color
      showLoading()
      loadCaptions()
    }
  }, 100)

  // ── Get YouTube video ID ────────────────────────────────────────────
  function getVideoId () {
    const m = location.href.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
    return m ? m[1] : null
  }

  // ── Load captions from ZySignAI backend ─────────────────────────────
  async function loadCaptions () {
    const vid = getVideoId()
    if (!vid) {
      showError('Open a YouTube video to start.')
      return
    }

    try {
      const res = await fetch(`${BACKEND}/api/youtube/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_id: vid, language: currentLang }),
      })
      const data = await res.json()

      if (data.error) {
        showError(data.error)
        return
      }

      captions = data.captions || []
      showAvatar()
      startPolling()

    } catch (err) {
      showError('Cannot reach ZySignAI.\nRetrying in 10 seconds…')
      setTimeout(loadCaptions, 10000)
    }
  }

  // ── Poll YouTube player time ────────────────────────────────────────
  function startPolling () {
    if (pollTimer) clearInterval(pollTimer)
    pollTimer = setInterval(() => {
      player = player || document.querySelector('.html5-main-video')
      if (!player) return

      const t = player.currentTime
      const paused = player.paused

      document.getElementById('zysignai-status-dot')
        .classList.toggle('live', !paused)

      if (paused) return

      const cap = captions.find(c =>
        t >= c.start && t < c.start + c.duration
      )

      if (cap) {
        const gloss = cap.gloss || ''
        const text  = cap.text  || ''

        if (gloss && gloss !== lastGloss) {
          lastGloss = gloss
          updateGloss(gloss, text)
          animateAvatar(gloss)
        }
      }
    }, 250)
  }

  // ── Avatar SVG ──────────────────────────────────────────────────────
  function buildAvatar (color) {
    color = color || '#10b981'
    return `
      <svg viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg"
        id="zysignai-avatar-svg">
        <!-- Body -->
        <ellipse cx="60" cy="75" rx="22" ry="28"
          fill="${color}" opacity="0.9"/>
        <!-- Head -->
        <circle cx="60" cy="36" r="22" fill="#FDDBB4"/>
        <!-- Hair -->
        <ellipse cx="60" cy="20" rx="22" ry="12" fill="${color}"/>
        <!-- Eyes -->
        <circle cx="52" cy="34" r="3.5" fill="white"/>
        <circle cx="68" cy="34" r="3.5" fill="white"/>
        <circle cx="52" cy="34" r="1.8" fill="#1f2937"/>
        <circle cx="68" cy="34" r="1.8" fill="#1f2937"/>
        <!-- Smile -->
        <path d="M52 44 Q60 51 68 44" stroke="#c2855a"
          stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <!-- Legs -->
        <rect x="46" y="100" width="12" height="38" rx="6"
          fill="${color}" opacity="0.8"/>
        <rect x="62" y="100" width="12" height="38" rx="6"
          fill="${color}" opacity="0.8"/>
        <!-- Arms — animated via JS -->
        <g id="zs-left-arm">
          <rect x="18" y="70" width="20" height="10" rx="5"
            fill="${color}" transform-origin="38 75"/>
        </g>
        <g id="zs-right-arm">
          <rect x="82" y="70" width="20" height="10" rx="5"
            fill="${color}" transform-origin="82 75"/>
        </g>
        <!-- Hands -->
        <circle id="zs-left-hand" cx="20" cy="75" r="8"
          fill="#FDDBB4"/>
        <circle id="zs-right-hand" cx="100" cy="75" r="8"
          fill="#FDDBB4"/>
      </svg>
    `
  }

  const SIGN_POSES = [
    { lx: 20, ly: 75, rx: 100, ry: 75, la: 0,   ra: 0   },  // rest
    { lx: 30, ly: 50, rx: 90,  ry: 50, la: -30, ra: 30  },  // up
    { lx: 25, ly: 60, rx: 95,  ry: 60, la: -20, ra: 20  },  // wave
    { lx: 15, ly: 80, rx: 105, ry: 80, la: 10,  ra: -10 },  // wide
    { lx: 40, ly: 55, rx: 80,  ry: 55, la: -40, ra: 40  },  // high
    { lx: 35, ly: 70, rx: 85,  ry: 70, la: -15, ra: 15  },  // mid
  ]

  function animateAvatar (gloss) {
    if (!gloss) return
    const words = gloss.split(' ').filter(Boolean)
    let i = 0

    function nextPose () {
      if (i >= words.length) {
        setPose(SIGN_POSES[0])
        return
      }
      const pose = SIGN_POSES[i % (SIGN_POSES.length - 1) + 1]
      setPose(pose)
      i++
      animFrame = setTimeout(nextPose, 380)
    }

    clearTimeout(animFrame)
    nextPose()
  }

  function setPose (pose) {
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

  // ── UI helpers ──────────────────────────────────────────────────────
  function showLoading () {
    document.getElementById('zysignai-avatar-area').innerHTML = `
      <div id="zysignai-status-dot"></div>
      <div id="zysignai-loading">
        <div id="zysignai-spinner"></div>
        <div id="zysignai-loading-text">Loading ${currentLang} captions…</div>
      </div>
    `
    document.getElementById('zysignai-gloss-bar').style.display = 'none'
  }

  function showError (msg) {
    document.getElementById('zysignai-avatar-area').innerHTML = `
      <div id="zysignai-status-dot"></div>
      <div id="zysignai-error">${msg}</div>
    `
    document.getElementById('zysignai-gloss-bar').style.display = 'none'
  }

  function showAvatar () {
    const color = LANG_COLORS[currentLang]
    overlay.style.borderColor = color + '60'
    document.getElementById('zysignai-avatar-area').innerHTML =
      `<div id="zysignai-status-dot"></div>` + buildAvatar(color)
    document.getElementById('zysignai-gloss-bar').style.display = 'flex'
    document.getElementById('zysignai-gloss-text').style.color = color
  }

  function updateGloss (gloss, text) {
    const g = document.getElementById('zysignai-gloss-text')
    const c = document.getElementById('zysignai-caption-text')
    if (g) g.textContent = gloss
    if (c) c.textContent = text
  }

  // ── Watch for YouTube navigation (SPA) ─────────────────────────────
  let lastUrl = location.href
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href
      if (location.href.includes('/watch')) {
        captions = []
        lastGloss = ''
        showLoading()
        setTimeout(loadCaptions, 1500)
      }
    }
  }).observe(document.body, { childList: true, subtree: true })

  // ── Init ────────────────────────────────────────────────────────────
  loadCaptions()

})()

