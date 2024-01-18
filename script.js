maxVisiblePages = 3

// variables to store fetched data
username = ""
repos_data = []
profile_data = {}

// query params for github api call
per_page = 10;
sort = "full_name";
direction = "asc";
page = 1;

document.getElementById("username-form").addEventListener("submit", function (event) {
    event.preventDefault(); // prevent page from reloading on fetch button press

    //clear controls and query params
    resetfilters();

    // set maxpage in navigation pages
    setmaxpage();

    //set username
    username = document.getElementById("username-input").value;

    // set loading in repos section and hide controls, pagination
    showloading();

    // fetch from github, set profile_data and call setprofile function
    profiledatafetch();

    // fetch from github, set repos_data and call setrepos function
    reposdatafetch();
})

// set maxpage in navigation pages
function setmaxpage() {
    const viewportWidth = window.innerWidth;

    if (viewportWidth < 576) {
        screenSize = 'sm';
        maxVisiblePages = 3;
    } else if (viewportWidth < 992) {
        maxVisiblePages = 4;
    } else {
        maxVisiblePages = 6;
    }
}

// reset filters and search bar
function resetfilters() {
    per_page = 10;
    sort = "full_name";
    direction = "asc";
    page = 1;
    document.getElementById('repo-search-input').value = "";
    document.getElementById('sort-by').value = "full_name";
    document.getElementById('sort-order').value = "asc";
    document.getElementById('per-page').value = 10;
}

// called each time a control is changed or page is changed
function applyfilters() {
    sort = document.getElementById('sort-by').value;
    direction = document.getElementById('sort-order').value;
    per_page = document.getElementById('per-page').value;

    // to ensure min repos in a page is 10 and max is 100
    if (per_page < 10) {
        per_page = 10;
        document.getElementById('per-page').value = 10;
    }

    else if (per_page > 100) {
        per_page = 100;
        document.getElementById('per-page').value = 100;
    }

    // logging api call with query params
    console.log(`Fetching -> https://api.github.com/users/${username}/repos?per_page=${per_page}&sort=${sort}&direction=${direction}&page=${page}`)

    // set loading in repos section, showloading() was not used coz controls need to be displayed
    const repoCardsContainer = document.getElementById('repos-section');
    repoCardsContainer.innerHTML = `
    <div class="container text-center mt-5">
        <p class="mt-2 text-primary">Loading</p>
        <span class="spinner-border text-primary" role="status"></span>
    </div>
    `;

    // fetch from github, set repos_data and call setrepos function
    reposdatafetch();
}


// set loading in repos section and hide controls, pagination
function showloading() {
    document.getElementById("repos-controls").style.display = "none";
    document.getElementById("pagination-console").style.display = "none";

    const repoCardsContainer = document.getElementById('repos-section');
    repoCardsContainer.innerHTML = `
    <div class="container text-center mt-5">
        <p class="mt-2 text-primary">Loading</p>
        <span class="spinner-border text-primary" role="status"></span>
    </div>
    `;
}

// for loading profile data from API
function profiledatafetch() {
    fetch(`https://api.github.com/users/${username}`)
        .then(response => response.json())
        .then(data => {
            profile_data = data;
            setprofile();
        })
}

// for loading repos data from API
function reposdatafetch() {
    fetch(`https://api.github.com/users/${username}/repos?per_page=${per_page}&sort=${sort}&direction=${direction}&page=${page}`)
        .then(response => response.json())
        .then(data => {
            repos_data = data;
            setTimeout(() => {
                setrepos();
            }, 500); // to show loading action
        })
}

// set profile info
function setprofile() {
    const data = profile_data;

    if (data.id == undefined) {
        console.log("User doesn't Exist!")

        document.getElementById("warning-section").style.display = "block";
        document.getElementById("display-section").style.display = "none";

        document.getElementById("warning-text").innerText = "Please check the username";
        document.getElementById("warning-text").classList.remove("text-primary");
        document.getElementById("warning-text").classList.add("text-danger");

        document.getElementById("fetch-button").classList.remove("btn-primary");
        document.getElementById("fetch-button").classList.add("btn-danger");

        document.getElementById("warning-image").src = "./assets/notfound.png";
    }
    else {
        console.log(data)

        document.getElementById("warning-section").style.display = "none";
        document.getElementById("display-section").style.display = "block";

        document.getElementById("fetch-button").classList.remove("btn-danger");
        document.getElementById("fetch-button").classList.add("btn-primary");

        document.getElementById("profile-image").src = data.avatar_url;
        document.getElementById("profile-link").href = data.html_url;
        document.getElementById("profile-link").innerText = "github.com/" + username;

        if (data.name) document.getElementById("profile-name").innerText = data.name;
        else document.getElementById("profile-name").innerText = `${username}`;

        document.getElementById("profile-followers-count").innerText = data.followers;
        document.getElementById("profile-following-count").innerText = data.following;

        document.getElementById("profile-repocount").innerText = data.public_repos

        if (data.bio) document.getElementById("profile-bio").innerText = data.bio;
        else document.getElementById("profile-bio").innerText = "";

        if (data.location) document.getElementById("profile-location").innerText = `📍 ${data.location}`;
        else document.getElementById("profile-location").innerText = "";

        if (data.twitter_username) {
            document.getElementById("profile-twitter").href = "https://twitter.com/" + data.twitter_username;
            document.getElementById("profile-twitter").style.display = "inline-block";
        }

        else {
            document.getElementById("profile-twitter").style.display = "none";
        }

        // converting bad links to good links
        if (data.blog) {
            if (data.blog.startsWith("http://") || data.blog.startsWith("https://")) {
                document.getElementById("profile-otherlink").href = data.blog;
            }
            else {
                document.getElementById("profile-otherlink").href = "http://" + data.blog;
            }

            document.getElementById("profile-otherlink").style.display = "inline-block";
        }

        else {
            document.getElementById("profile-otherlink").style.display = "none";
        }
    }
}

// set repos
function setrepos() {
    const repoCardsContainer = document.getElementById('repos-section');
    repoCardsContainer.innerHTML = "";

    const repos = repos_data;

    if (repos.length > 0) {

        const searchtext = document.getElementById('repo-search-input').value.toLowerCase().split(" ").join("-");
        const filteredRepos = repos.filter(repo => repo.name.toLowerCase().includes(searchtext));

        document.getElementById("repos-controls").style.display = "block";
        document.getElementById("pagination-console").style.display = "block";

        filteredRepos.forEach(repo => {
            const createdDate = new Date(repo.created_at);
            const year = createdDate.getFullYear();

            let lang = null;
            let badges = [];

            if (repo.language) {
                lang = repo.language.toLowerCase();
                badges.push(lang);

                if (lang == "c++") lang = "cpp";
            }

            const topics = repo.topics.concat(badges);
            const badgesHTML = topics.map(topic => `<span class="badge bg-primary">${topic}</span>`).join(' ');

            const cardHtml = `
            <div class="col-md-3 mb-4">
                <div class="card d-flex flex-column h-100">
                    <div class="card-body">
                        <h5 class="card-title">${repo.name.split('-').join(' ')}</h5>
                        
                        ${repo.description ? `<p class="card-text">${repo.description} (${year})</p>` : `<p>(${year})</p>`}
                        
                        <div class="tags mb-2">
                            ${badgesHTML}
                        </div>
                        
                        <div class="d-flex gap-2">
                            ${repo.stargazers_count ? `<p>${repo.stargazers_count} ⭐</p>` : ''}
                            ${repo.forks_count ? `<p>${repo.forks_count} 🍴</p>` : ''}
                        </div>
                        
                        ${lang ? `<img src="https://skillicons.dev/icons?i=${lang}" />` : ''}
                    </div>
                    
                    <div class="card-footer">
                        <small class="text-muted">
                            <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">View on GitHub ↗</a>
                        </small>
                    </div>
                </div>
            </div>
        `;

            repoCardsContainer.innerHTML += cardHtml;
        });

        createPaginationControls(profile_data.public_repos);
    }

    else {
        repoCardsContainer.innerHTML = `
        <div class="container text-center mt-5">
            <p>This user has no repositories.</p>
        </div>
        `;
    }
}


// Create pagination controls
function createPaginationControls(totalRepos) {
    const totalPages = Math.ceil(totalRepos / per_page);

    let paginationHtml = '';

    // Previous button
    paginationHtml += `
        <li class="page-item ${page === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${page - 1})" aria-label="Previous" data-bs-toggle="tooltip" data-bs-placement="left" title="Go to previous">
                <span aria-hidden="true">←</span>
            </a>
        </li>
    `;

    // Generate page links with ellipsis
    if (totalPages <= maxVisiblePages) {
        // Display all pages if there are fewer pages than the maximum visible pages
        for (let i = 1; i <= totalPages; i++) {
            paginationHtml += createPageItem(i);
        }
    } else {
        // Display ellipsis and a subset of pages based on the current page
        const startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (startPage > 1) {
            paginationHtml += createPageItem(1);
            if (startPage > 2) {
                paginationHtml += createEllipsis();
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHtml += createPageItem(i);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHtml += createEllipsis();
            }
            paginationHtml += createPageItem(totalPages);
        }
    }

    // Next button
    paginationHtml += `
        <li class="page-item ${page === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${page + 1})" aria-label="Next" data-bs-toggle="tooltip" data-bs-placement="right" title="Go to next">
                <span aria-hidden="true">→</span>
            </a>
        </li>
    `;

    document.getElementById('pagination-controls').innerHTML = paginationHtml;
}

function createPageItem(pageNumber) {
    return `
        <li class="page-item ${page === pageNumber ? 'active' : ''}">
            <a class="page-link" href="#" onclick="changePage(${pageNumber})">${pageNumber}</a>
        </li>
    `;
}

function createEllipsis() {
    return `
        <li class="page-item disabled">
            <span class="page-link">...</span>
        </li>
    `;
}

// Change the current page and update repos display
function changePage(newPage) {
    page = newPage;
    applyfilters();
}
