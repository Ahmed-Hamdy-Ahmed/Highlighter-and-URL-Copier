console.log("Content script loaded"); // Debug log

function getSelectedText() {
  const selection = window.getSelection();
  return selection.toString().trim();
}

function getCurrentTime() {
  const video = document.querySelector("video");
  if (video) {
    return Math.floor(video.currentTime);
  }
  return null;
}

function getPageTitle() {
  return document.title.trim();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "get_url") {
    const selectedText = getSelectedText();
    let url = window.location.href;
    const title = getPageTitle();
    console.log("Original URL:", url); // Debug log

    if (url.includes("youtube.com/watch")) {
      const currentTime = getCurrentTime();
      if (currentTime !== null) {
        const timeParam = `t=${currentTime}s`;
        if (url.includes("&t=")) {
          url = url.replace(/&t=\d+s/, `&${timeParam}`);
        } else if (url.includes("?")) {
          url += `&${timeParam}`;
        } else {
          url += `?${timeParam}`;
        }
      }
      console.log("YouTube URL with timestamp:", url); // Debug log
      sendResponse({ url, title, selectedText: null });
    } else if (selectedText) {
      const encodedText = encodeURIComponent(selectedText);
      if (url.includes("#:~:text=")) {
        url = url.replace(/#:~:text=[^&]*/, `#:~:text=${encodedText}`);
      } else {
        url += `#:~:text=${encodedText}`;
      }
      console.log("URL with text selection:", url); // Debug log
      sendResponse({ url, title, selectedText });
    } else {
      console.log("Standard URL:", url); // Debug log
      sendResponse({ url, title, selectedText: null });
    }
  }
});
