// This file contains the background script for the Chrome extension. It manages events and handles interactions between different parts of the extension.

chrome.runtime.onInstalled.addListener(() => {
    console.log("Chrome Extension Game installed.");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "startGame") {
        // Logic to start the game
        sendResponse({ status: "Game started" });
    } else if (request.action === "stopGame") {
        // Logic to stop the game
        sendResponse({ status: "Game stopped" });
    }
});