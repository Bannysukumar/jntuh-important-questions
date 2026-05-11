import { useEffect } from 'react'

/**
 * Loads Microsoft Clarity when `VITE_CLARITY_PROJECT_ID` is set.
 * @see https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-setup
 */
export function MicrosoftClarity() {
  useEffect(() => {
    const id = import.meta.env.VITE_CLARITY_PROJECT_ID
    if (typeof id !== 'string' || !id.trim()) return
    const key = id.trim()
    if (document.querySelector(`script[data-clarity-id="${key}"]`)) return
    const s = document.createElement('script')
    s.async = true
    s.dataset.clarityId = key
    s.text = `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", ${JSON.stringify(key)});`
    document.head.appendChild(s)
  }, [])
  return null
}
