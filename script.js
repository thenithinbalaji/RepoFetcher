username = ""
repos_data = []
profile_data = {}

per_page = 10;
sort = "full_name";
direction = "asc";
page = 1;

document.getElementById("username-form").addEventListener("submit", function (event) {
    event.preventDefault();

    //set username
    username = document.getElementById("username-input").value;

    // set loading in repos section and hide controls
    showloading();

    // set profile_data and call setprofile function
    profiledatafetch();

    // set repos_data and call setrepos function
    reposdatafetch();
})

// called each time a control is changed
function applyfilters() {
    sort = document.getElementById('sort-by').value;
    direction = document.getElementById('sort-order').value;


    per_page = document.getElementById('per-page').value;

    if (per_page < 10) {
        per_page = 10;
        document.getElementById('per-page').value = 10;
    }

    else if (per_page > 100) {
        per_page = 100;
        document.getElementById('per-page').value = 100;
    }

    console.log(`Fetching -> https://api.github.com/users/${username}/repos?per_page=${per_page}&sort=${sort}&direction=${direction}&page=${page}`)

    // set loading in repos
    const repoCardsContainer = document.getElementById('repos-section');
    repoCardsContainer.innerHTML = `
    <div class="container text-center mt-5">
        <p class="mt-2 text-primary">Loading</p>
        <span class="spinner-border text-primary" role="status"></span>
    </div>
    `;

    // set repos_data and call setrepos function
    reposdatafetch();
}


// set loading in repos section and hide controls
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

// for loading data from API
function profiledatafetch() {
    fetch(`https://api.github.com/users/${username}`)
        .then(response => response.json())
        .then(data => {
            profile_data = data;
            setprofile();
        })
}

// for loading data from API
function reposdatafetch() {
    fetch(`https://api.github.com/users/${username}/repos?per_page=${per_page}&sort=${sort}&direction=${direction}&page=${page}`)
        .then(response => response.json())
        .then(data => {
            repos_data = data;
            setTimeout(() => {
                setrepos();
            }, 1000);
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

    let paginationHtml = `
        <li class="page-item ${page === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${page - 1})" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>
    `;

    for (let i = 1; i <= totalPages; i++) {
        paginationHtml += `
            <li class="page-item ${page === i ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
            </li>
        `;
    }

    paginationHtml += `
        <li class="page-item ${page === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${page + 1})" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
    `;

    document.getElementById('pagination-controls').innerHTML = paginationHtml;
}

// Change the current page and update repos display
function changePage(newPage) {
    page = newPage;
    applyfilters(); // Reapply filters to update repos display
}