// Check if current tab is YouTube
chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
  const url = tabs[0]?.url || ''
  const statusText = document.querySelector('.status-text')
  const dot = document.querySelector('.dot')

  if (url.includes('youtube.com/watch')) {
    statusText.textContent = 'Active on this video'
    dot.style.background = '#10b981'
  } else if (url.includes('youtube.com')) {
    statusText.textContent = 'Open a YouTube video'
    dot.style.background = '#f59e0b'
  } else {
    statusText.textContent = 'Navigate to YouTube'
    dot.style.background = '#6b7280'
    dot.style.animation = 'none'
  }
})

