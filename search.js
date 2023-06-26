let selected = "";

// Load the JSON data using an HTTP request
function loadJSON(callback) {
    let xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open("GET", "data.json", true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState === 4 && xobj.status === 200) {
            callback(Array.from(JSON.parse(xobj.responseText)));
        }
    };
    xobj.send(null);
}


// Perform the search and display the results
function performSearch() {
    let searchQuery = document.getElementById("searchInput").value.toLowerCase();
    let searchResults = document.getElementById("searchResults");
    searchResults.innerHTML = ""; // Clear previous results
    let results = [];

    let xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open("GET", "data.json", true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState === 4 && xobj.status === 200) {
            if (searchQuery.length > 2) {
                results = findResults(JSON.parse(xobj.responseText).children, searchQuery);

                if (results.length === 0) {
                    searchResults.innerHTML = "<a>No results found</a>";
                } else {
                    results.forEach(function (result) {
                        let resultElement = document.createElement("a");
                        let titleElement = document.createElement("h3");
                        titleElement.innerHTML = result.name;

                        if (result.children.length) {

                            titleElement.addEventListener("click", function () {
                                onItemClick(result.name);
                            });
                            titleElement.classList.add("clickable");

                            resultElement.appendChild(titleElement)

                            result.children.forEach(category => {

                                let node = document.createElement("p");
                                node.textContent = `${category.name}\n`;

                                if (category.children) {
                                    node.classList.add("clickable");
                                    node.addEventListener("click", function () {
                                        onItemClick(category.name);
                                    });
                                }


                                resultElement.appendChild(node)
                            });
                        }
                        searchResults.appendChild(resultElement);
                    });
                }
            } else {
                searchResults.innerHTML = "Search query too short.";
            }
        }
    };

    xobj.send(null);

}


// Attach the search functionality to the input field
document.getElementById("searchInput").addEventListener("keyup", performSearch);

// Close the dropdown when a click event occurs outside of it
document.addEventListener("click", function (event) {
    let dropdown = document.querySelector(".dropdown");
    let dropdownContent = dropdown.querySelector(".dropdown-content");
    if (!dropdown.contains(event.target)) {
        dropdownContent.style.display = "none";
    }

    if (document.getElementById("searchInput").contains(event.target)) {
        dropdownContent.style.display = "block";
    }
});

// Handle searched item click
function onItemClick(name) {
    selected = name;
    d3.select(`#${name.replace(/\s/g, "").replace(/&/g, "and")}`).dispatch('click');
}

function getTextFromData(data) {
    let text = "";
    data.forEach(element => {
        text += `<a>${element.name}\n</a>`
    });
    return text
}

function findResults(array, searchQuery) {
    let searchResults = [];

    let searchResults1stCategory = array.filter(item => {
        return (
            (item.name.toLowerCase().includes(searchQuery) && item.children.length)
        );
    });

    if (searchResults1stCategory.length) {
        return searchResults1stCategory
    }

    array.forEach(subcategory => {
        if (subcategory.children) {
            let partialResults = subcategory.children.filter(item => {
                return (
                    (item.name.toLowerCase().includes(searchQuery) && item.children.length)
                );
            });
            if (partialResults.length) {
                searchResults = partialResults
            }
        }
    });

    return searchResults

}