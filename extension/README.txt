The purpose of this file is to document manifest.json

Author: Hunter Turner (A00488748)
        Caleb Halverson (A00000000)
        Jim nguyen (A00000000)

{
  "manifest_version": 3,                <-- Modern chrome extention
  "name": "CSCI 2356 Final Project",    <-- Extention name (Due to change)
  "version": "1.0",                     <-- Project version (!!UPDATE THIS WHEN VERSION CHANGES!!)
  "background": {                       
    "service_worker": "background.js"   <-- Background service worker script
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],        <-- Match for every site visited
      "js": ["content.js"]              <-- Foreground content script
    }
  ]
}