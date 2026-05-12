document.getElementById('copy').onclick = async () => {
  const [tab] = await chrome.tabs.query({active:true,currentWindow:true});
  await navigator.clipboard.writeText(`Title: ${tab.title}\nURL: ${tab.url}`);
  alert('Copied. Paste it into the app.');
};
