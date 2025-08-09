import contentScript from '../content/index.tsx?script'

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {  
  if (changeInfo.status === 'complete') {
    chrome.tabs.get(tabId, (fullTab) => {
      if (chrome.runtime.lastError) {
        return
      }

      if (!fullTab.url) {
        return
      }
      try {
        const url = new URL(fullTab.url)
        const domain = url.hostname
        
        chrome.storage.local.get([domain], (result) => {          
          if (result[domain]) {
            const scriptPath = contentScript.startsWith('/') ? contentScript.slice(1) : contentScript
            chrome.scripting.executeScript({
              target: { tabId: tabId },
              files: [scriptPath],
            })
          } else {
          }
        })
      } catch (error) {
      }
    })
  }
})
