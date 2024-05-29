document.addEventListener("DOMContentLoaded", () => {
  const copyUrlButton = document.getElementById("copy-url");
  const downloadUrlsButton = document.getElementById("download-urls");
  const resetUrlsButton = document.getElementById("reset-urls");
  const viewUrlsButton = document.getElementById("view-urls");
  const urlListDiv = document.getElementById("url-list");

  if (
    copyUrlButton &&
    downloadUrlsButton &&
    resetUrlsButton &&
    viewUrlsButton
  ) {
    copyUrlButton.addEventListener("click", () => {
      console.log("Copy URL button clicked"); // Debug log
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "get_url" },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError.message);
            } else if (response) {
              const { url, title, selectedText } = response;
              console.log(
                "Received URL, title, and selected text:",
                url,
                title,
                selectedText
              ); // Debug log

              let urlWithLabel = `Title:\n${title}\nLink:\n${url}`;
              if (selectedText) {
                urlWithLabel += `\nSelected Text:\n${selectedText}`;
              }
              urlWithLabel += `\n\n`;

              // Copy URL with label to clipboard
              navigator.clipboard
                .writeText(urlWithLabel)
                .then(() => {
                  console.log(
                    "URL with label copied to clipboard:",
                    urlWithLabel
                  ); // Debug log
                })
                .catch((err) => {
                  console.error(
                    "Failed to copy URL with label to clipboard:",
                    err
                  ); // Debug log
                });

              // Save URL with label to local storage
              chrome.storage.local.get("urls", (data) => {
                const urls = data.urls || [];
                urls.push(urlWithLabel);
                chrome.storage.local.set({ urls }, () => {
                  console.log("URL with label saved:", urlWithLabel); // Debug log
                });
              });
            }
          }
        );
      });
    });

    downloadUrlsButton.addEventListener("click", () => {
      console.log("Download URLs button clicked"); // Debug log
      chrome.storage.local.get("urls", (data) => {
        const urls = data.urls || [];
        const blob = new Blob([urls.join("\n")], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        chrome.downloads.download(
          {
            url: url,
            filename: "urls_with_texts.txt",
          },
          () => {
            console.log("Download initiated"); // Debug log
          }
        );
      });
    });

    resetUrlsButton.addEventListener("click", () => {
      console.log("Reset URLs button clicked"); // Debug log
      chrome.storage.local.set({ urls: [] }, () => {
        console.log("URLs reset"); // Debug log
        urlListDiv.textContent = ""; // Clear the displayed list
      });
    });

    viewUrlsButton.addEventListener("click", () => {
      console.log("View URLs button clicked"); // Debug log
      chrome.storage.local.get("urls", (data) => {
        const urls = data.urls || [];
        urlListDiv.textContent = urls.join("\n");
      });
    });
  } else {
    console.error("Buttons not found in the DOM"); // Debug log
  }
});
