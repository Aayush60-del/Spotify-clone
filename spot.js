let currentSong = new Audio();
var song;
let currfolder;

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const formattedMins = String(mins).padStart(2, '0');
    const formattedSecs = String(secs).padStart(2, '0');
    return `${formattedMins}:${formattedSecs}`;
}


async function song_fetch(folder = "songs") {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/PROJECTS/spotify/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    let song_doc = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            song_doc.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";

    for (const s of song_doc) {
        let li = document.createElement("li");
        li.dataset.track = s;

        li.innerHTML = `
            <img class="invert " src="music.svg" alt="">
                <div class="info">
                    <div>${decodeURIComponent(s.replace("mp3", ""))}</div>
                    <div>IUS</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" id = "li_play" src="play.svg" alt="playnow">
                </div>`;
        songUL.appendChild(li);
        li.style.display = "flex";
        li.style.justifyContent = "space-evenly";
        li.style.listStyle = "none";
        li.style.border = "0.0001px solid grey";
    }

    //Attach an event listener to each song
    Array.from(document.querySelector(".songList ").getElementsByTagName("li")).forEach((e) => {

        e.addEventListener("click", () => {


            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.dataset.track);


        })
    })
    return song_doc;
}

const playMusic = (track, pause = false) => {

    currentSong.src = `/PROJECTS/spotify/${currfolder}/` + track;
    document.querySelector(".songinfo").textContent = decodeURIComponent(track);
    document.querySelector(".songtime").textContent = "00:00";
    if (!pause) {
        currentSong.play();
        play.src = "pause.svg";
    }
    else {
        play.src = "play.svg";
    }
};

async function displayAlbums() {

    let a = await fetch(`http://127.0.0.1:5500/PROJECTS/spotify/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardcontainer = document.querySelector(".cardcontainer");
    let array = Array.from(anchors);

    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0];

            //Get metadata of folder
            if (folder === "songs") continue;

            let a = await fetch(`http://127.0.0.1:5500/PROJECTS/spotify/songs/${folder}/info.json`);
            let response = await a.json();
            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${folder}" class="card rounded ">

                        <div class="icon-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                                color="currentColor" fill="none" stroke="#141B34" stroke-width="1.5"
                                stroke-linejoin="round">
                                <path
                                    d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z "
                                    fill="#000" />
                            </svg>
                        </div>
                        <img class="rounded" src="/songs/${folder}/cover.jpg">
                        <h2>${response.title}</h2>
                        <p>
                            ${response.description}
                        </p>
                    </div>`
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {

        e.addEventListener("click", async item => {
            song = await song_fetch(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(song[0], true);
        }
        )
    }
    )


}

async function main() {

    song = await song_fetch("songs/ncs");
    playMusic(song[0], true);

    //Display all the albums on the page
    displayAlbums()


    //Attach an event listener to play, next and previous song
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";

        }
        else {
            currentSong.pause();
            play.src = "play.svg";
        }
    })

    //Listen for time update event

    currentSong.addEventListener("timeupdate", () => {
        if (!isNaN(currentSong.duration)) {
            document.querySelector(".songtime").innerHTML =
                `${formatTime(currentSong.currentTime)}:${formatTime(currentSong.duration)}`;

            document.querySelector(".circle_").style.left =
                (currentSong.currentTime / currentSong.duration) * 100 + "%";
        }
    });


    //Listner to seek bar
    document.querySelector(".seekbar").addEventListener("click", e => {
        console.log((e.offsetX / e.target.getBoundingClientRect().width) * 100 + "%");
        let perc = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle_").style.left = perc + "%";

        currentSong.currentTime = (currentSong.duration) * perc / 100;
    })

    // add an event for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;

    })

    // add an event for close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";

    })

    // add an event for previous \

    previous.addEventListener("click", () => {
        console.log("Previous clicked")
        console.log(currentSong);
        let idx_ = song.indexOf(currentSong.src.split("/").slice(-1)[0]);
        console.log(song, idx_);
        if (idx_ - 1 >= 0) {
            playMusic(song[idx_ - 1]);
        }
        else {
            playMusic(song[idx_]);
        }


    })

    next.addEventListener("click", () => {
        console.log("Next clicked");
        console.log(currentSong.src);
        let idx_ = song.indexOf(currentSong.src.split("/").slice(-1)[0]);
        console.log(song, idx_);
        if (idx_ + 1 < song.length) {
            playMusic(song[idx_ + 1]);
        }
        else {
            playMusic(song[idx_]);
        }

    })

    // add an event to volume 

    document.querySelector(".range input").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    //load the playlist whenever card is clicked

    document.querySelector(".volume > img").addEventListener("click",e=>
    {
        if(e.target.src.includes("volume.svg"))
        {
            e.target.src = e.target.src.replace("volume.svg","mute.svg");
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg","volume.svg");
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    }
    )







}

main()





