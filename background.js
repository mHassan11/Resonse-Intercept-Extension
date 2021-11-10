var currentTab;
var version = "1.0";

chrome.tabs.query( //get current Tab
    {
        currentWindow: true,
        active: true
    },
    function(tabArray) {
        console.log(tabArray)
        // currentTab = tabArray[0];
        currentTab = getCurrentTab()
        
		itemToForm = () => {
			if(this.currentTab === undefined  && currentTab.url.startsWith("chrome:")) {
                console.log("either chrome: tab or undefined")
                return
            }
            console.log(currentTab)
			chrome.debugger.attach({ //debug at current tab
				tabId: currentTab.id
			}, version, onAttach.bind(null, currentTab.id));
		  }
        // chrome.debugger.attach({ //debug at current tab
        //     tabId: currentTab.id
        // }, version, onAttach.bind(null, currentTab.id));
    }
)

async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

function onAttach(tabId) {

    console.log("onAttach")
    chrome.debugger.sendCommand({ //first enable the Network
        tabId: tabId
    }, "Network.enable");

    chrome.debugger.onEvent.addListener(allEventHandler);

}


function allEventHandler(debuggeeId, message, params) {

    if (currentTab.id != debuggeeId.tabId) {
        return;
    }

    if (message == "Network.responseReceived") { //response return 
        chrome.debugger.sendCommand({
            tabId: debuggeeId.tabId
        }, "Network.getResponseBody", {
            "requestId": params.requestId
        }, function(response) {
			console.log(response)
            // you get the response body here!
            // you can close the debugger tips by:
            chrome.debugger.detach(debuggeeId);
        });
    }

}