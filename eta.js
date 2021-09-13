const routeInfoJson = `
{
    "tabs": [
        {
            "id": "tab-one-content",
            "groups":[
                {
                    "name": "From Tung Chung",
                    "routes": [
                        {
                            "url": "https://rt.data.gov.hk/v1/transport/citybus-nwfb/eta/ctb/001860/S52",
                            "dir": "O"
                        },
                        {
                            "url": "https://data.etabus.gov.hk/v1/transport/kmb/eta/86FD7EFBB651F5CE/S64/1",
                            "dir": "O"
                        },
                        {
                            "url": "https://data.etabus.gov.hk/v1/transport/kmb/eta/86FD7EFBB651F5CE/S64C/1",
                            "dir": "O"
                        }
                    ]
                },
                {
                    "name": "From Cathay City",
                    "routes": [
                        {
                            "url": "https://rt.data.gov.hk/v1/transport/citybus-nwfb/eta/ctb/001844/S52",
                            "dir": "I"
                        },
                        {
                            "url": "https://data.etabus.gov.hk/v1/transport/kmb/eta/18CA599721E67265/S64/1",
                            "dir": "O"
                        }
                    ]
                }
            ]
        },
        {
            "id": "tab-two-content",
            "groups":[
                {
                    "name": "To HK Island",
                    "routes": [
                        {
                            "url": "https://rt.data.gov.hk/v1/transport/citybus-nwfb/eta/ctb/001845/E11",
                            "dir": "I"
                        },
                        {
                            "url": "https://rt.data.gov.hk/v1/transport/citybus-nwfb/eta/ctb/001845/E11A",
                            "dir": "I"
                        }
                    ]
                }
            ]
        },
        {
            "id": "tab-three-content",
            "groups":[
                {
                    "name": "To Jordan",
                    "routes": [
                        {
                            "url": "https://rt.data.gov.hk/v1/transport/citybus-nwfb/eta/ctb/001845/E23",
                            "dir": "I"
                        },
                        {
                            "url": "https://rt.data.gov.hk/v1/transport/citybus-nwfb/eta/ctb/001845/E23A",
                            "dir": "I"
                        }
                    ]
                }
            ]
        }
    ]
}
`;



var activeTab = "tab-one-content";
renderETATables();

function reloadETA() {
    clearETA();
    renderETATables();
    document.getElementById("refresh-btn").blur();
}

function clearETA() {
    const elements = ["tab-one-content", "tab-two-content", "tab-three-content"];
    for (let i in elements) {
        document.getElementById(elements[i]).innerHTML = "";
    }
} 

function changeActiveTab(tab) {
    activeTab = tab;
    renderETATables();
}



function getRouteETA(url, dir) {
    var routeETA = new Array();

    const xmlhttp = new XMLHttpRequest();
    xmlhttp.onload = function() {
    const etaData = JSON.parse(this.responseText);
    etaData.data.forEach(etaObj => {
        if (etaObj.dir == dir) {
            if (!etaObj.eta || etaObj.eta == ""){
                return;
            }
            const eta = {
                route: etaObj.route,
                eta: new Date(etaObj.eta)
            };
            
            routeETA.push(eta);
        }
    });
    };
    xmlhttp.open("GET", url, false);
    xmlhttp.send();
    return routeETA;
}


function renderETATables() {
    
    var tabInfo = JSON.parse(routeInfoJson).tabs; // list of objs
    
    let htmlSegment = "";

    tabInfo.forEach(tab => {
        var element = tab.id;
        if (activeTab != element) {
            return;
        }

        
        tab.groups.forEach(group => {
            var eta = [];

            group.routes.forEach(route => {
                let routeETA = getRouteETA(route.url, route.dir);
                eta = eta.concat(routeETA);
            })

            eta.sort((a,b) => (a.eta > b.eta) ? 1 : ((b.eta > a.eta) ? -1 : 0));

            htmlSegment += "<h2>" + group.name + "</h2>";
            htmlSegment += `<table class="table">
            <thead><tr>
                <th scope="col">Route</th>
                <th scope="col">ETA</th>
            </tr></thead>
            <tbody>`

            for(var i =0; i < Math.min(4, eta.length); i++) {
                htmlSegment += "<tr>";
                htmlSegment += "<td>" + eta[i].route + "</td>";
                htmlSegment += "<td>" + eta[i].eta.toLocaleTimeString() + "</td>";
                htmlSegment += "</tr>";
                console.log(eta[i].route);
            }

            htmlSegment += `</tbody>
            </table>
            </br>`
            console.log(element);
            
        })
        const d = new Date();
        htmlSegment += "Last update: " + d.toLocaleString();
        document.getElementById(element).innerHTML = htmlSegment;
    })
}


// Popup for "Install to Home Screen"
// Detects if device is on iOS 
const isIos = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test( userAgent );
    }
    // Detects if device is in standalone mode
    const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);

    // Checks if should display install popup notification:
    if (isIos() && !isInStandaloneMode()) {
        document.getElementById("popup").hidden = false;
    }

function closePopup() {
    document.getElementById("popup").hidden = true;
}