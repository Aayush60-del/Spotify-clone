let currentSong = new Audio();
let songs = [];
let currfolder = "";

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

async function song_fetch(folder) {
    currfolder = folder;

    let response = await fetch(`/songs/${folder}/songs.json`);
    let data = await response.json();
    let songList = data.songs;

    console.log("✅ Songs mile:", songList);

    let ul = document.querySelector(".songList ul");
    ul.innerHTML = "";

    for (let songName of songList) {
        let displayName = decodeURIComponent(songName.replace(".mp3", ""));
        let li = document.createElement("li");
        li.dataset.track = songName;
        li.innerHTML = `
            <img class="invert" src="music.svg" alt="music">
            <div class="info">
                <div>${displayName}</div>
                <div>Song</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="play.svg" alt="play">
            </div>
        `;
        ul.appendChild(li);
        li.addEventListener("click", () => {
            playMusic(li.dataset.track);
            // Mobile pe sidebar close ho jaye song select karne ke baad
            if (window.innerWidth <= 899) closeSidebar();
        });
    }

    songs = songList;
    return songList;
}

function playMusic(track, pause = false) {
    // ✅ FIX: spaces wale folder/track names ke liye
    let encodedFolder = currfolder.split(" ").join("%20");
    let encodedTrack = track.split(" ").join("%20");
    currentSong.src = `/songs/${encodedFolder}/${encodedTrack}`;

    document.querySelector(".songinfo").textContent =
        decodeURIComponent(track.replace(".mp3", ""));
    document.querySelector(".songtime").textContent = "00:00 / 00:00";

    // ✅ FIX: circle reset karo har nayi song pe
    document.querySelector(".circle_").style.left = "0%";

    if (!pause) {
        currentSong.play();
        play.src = "pause.svg";
    } else {
        play.src = "play.svg";
    }
}

async function displayAlbums() {
    let response = await fetch("/songs.json");
    let data = await response.json();
    let folders = data.folders;

    console.log("📁 Folders mile:", folders);

    let cardcontainer = document.querySelector(".cardcontainer");
    cardcontainer.innerHTML = "";

    for (let folder of folders) {
        try {
            let encodedFolder = folder.split(" ").join("%20");
            let infoRes = await fetch(`/songs/${encodedFolder}/info.json`);
            if (!infoRes.ok) {
                console.log(`❌ info.json nahi mila: ${folder}`);
                continue;
            }
            let info = await infoRes.json();
            console.log("✅ Card bana:", info.title);

            cardcontainer.innerHTML += `
                <div data-folder="${folder}" class="card rounded">
                    <div class="icon-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                            fill="none" stroke="#141B34" stroke-width="1.5" stroke-linejoin="round">
                            <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" fill="#000"/>
                        </svg>
                    </div>
                    <img class="rounded" src="/songs/${encodedFolder}/cover.jpg" alt="${info.title}">
                    <h2>${info.title}</h2>
                    <p>${info.description}</p>
                </div>
            `;
        } catch (err) {
            console.log(`Skip ${folder}:`, err.message);
        }
    }

    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async () => {
            let folder = card.dataset.folder;
            console.log("🎵 Card clicked:", folder);
            songs = await song_fetch(folder);
            if (songs.length > 0) playMusic(songs[0], true);
        });
    });
}

function openSidebar() {
    document.querySelector(".left").classList.add("open");
    document.getElementById("overlay").classList.add("active");
}

function closeSidebar() {
    document.querySelector(".left").classList.remove("open");
    document.getElementById("overlay").classList.remove("active");
}

async function main() {

    // ✅ Cards PEHLE dikho
    await displayAlbums();

    // ✅ Phir pehla folder load karo
    try {
        let rootRes = await fetch("/songs.json");
        let rootData = await rootRes.json();
        let firstFolder = rootData.folders[0];
        console.log("🚀 Starting with:", firstFolder);
        songs = await song_fetch(firstFolder);
        if (songs.length > 0) playMusic(songs[0], true);
    } catch (err) {
        console.log("Song load error:", err.message);
    }

    // Play / Pause
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
        } else {
            currentSong.pause();
            play.src = "play.svg";
        }
    });

    // Seekbar update
    currentSong.addEventListener("timeupdate", () => {
        if (isNaN(currentSong.duration)) return;
        document.querySelector(".songtime").innerHTML =
            `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
        let percent = (currentSong.currentTime / currentSong.duration) * 100;
        document.querySelector(".circle_").style.left = percent + "%";
    });

    // Seekbar click
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle_").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Previous
    previous.addEventListener("click", () => {
        let currentTrack = decodeURIComponent(currentSong.src.split("/").slice(-1)[0]);
        let idx = songs.indexOf(currentTrack);
        if (idx > 0) playMusic(songs[idx - 1]);
        else playMusic(songs[0]);
    });

    // Next
    next.addEventListener("click", () => {
        let currentTrack = decodeURIComponent(currentSong.src.split("/").slice(-1)[0]);
        let idx = songs.indexOf(currentTrack);
        if (idx < songs.length - 1) playMusic(songs[idx + 1]);
        else playMusic(songs[0]);
    });

    // Volume
    document.querySelector(".range input").addEventListener("input", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    // Mute / Unmute
    document.querySelector(".volume > img").addEventListener("click", (e) => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.7;
            document.querySelector(".range input").value = 70;
        }
    });

    // Hamburger / Close / Overlay
    document.querySelector(".hamburger").addEventListener("click", openSidebar);
    document.querySelector(".close").addEventListener("click", closeSidebar);
    document.getElementById("overlay").addEventListener("click", closeSidebar);

    // Auto next
    currentSong.addEventListener("ended", () => {
        let currentTrack = decodeURIComponent(currentSong.src.split("/").slice(-1)[0]);
        let idx = songs.indexOf(currentTrack);
        if (idx < songs.length - 1) playMusic(songs[idx + 1]);
        else playMusic(songs[0]);
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
        if (e.target.tagName === "INPUT") return;
        if (e.code === "Space") { e.preventDefault(); play.click(); }
        if (e.code === "ArrowRight") next.click();
        if (e.code === "ArrowLeft") previous.click();
    });
}

main();