let songs = [];
let currSong = new Audio;
let curvolume;
let currfolder;
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }



    // Show all the songs in the playlist
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" width="34" src="svg/music.svg" alt="">
                            <div class="info">
                                <div> ${song.replaceAll("%20", " ")}</div>
                                <div>Harry</div>
                            </div>
                            <div class="playnow">
                                <img class="invert" src="svg/play.svg" alt="">
                            </div> </li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playSong(e.querySelector(".info").firstElementChild.innerHTML.trim())

        })
    })

    return songs
}

const playSong = (track, pause = false) => {
    currSong.src = `/${currFolder}/` + track
    if (!pause) {
        currSong.play()
        play.src = "svg/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"


}

async function displayAlbums() {
    console.log("displaying albums")
    let a = await fetch(`/Songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".cardcontainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/Songs/") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/Songs/")[1]
            // Get the metadata of the folder
            let a = await fetch(`Songs/${folder}/info.json`)
            let response = await a.json();
            cardcontainer.innerHTML = cardcontainer.innerHTML + ` <div data-folder="${folder}" class="card">
            <div class="play">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="red"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1"
                        stroke-linejoin="round" />
                </svg>
            </div>

            <img src="/Songs/${folder}/cover.jpeg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getSongs(`Songs/${item.currentTarget.dataset.folder}`)
            playSong(songs[0])

        })
    })
}
async function main() {
    curvolume = currSong.volume;

    await getSongs("Songs/Aashiquie");
    playSong(songs[0])
    await displayAlbums()
    play.addEventListener("click", (e) => {
        if (currSong.paused) {
            currSong.play();
            play.src = "svg/pause.svg"
        }
        else {
            currSong.pause();
            play.src = "svg/play.svg"
        }

    }
    )
    window.addEventListener("keydown", (e) => {
        if (e.key ===' ') {
            if (currSong.paused) {
                currSong.play();
                play.src = "svg/pause.svg"
            }
            else {
                currSong.pause();
                play.src = "svg/play.svg"
            }
        }
    }
    )
    currSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${formatTime(currSong.currentTime)}/${formatTime(currSong.duration)}`
        document.querySelector(".circle").style.left = (currSong.currentTime / currSong.duration) * 100 + "%";
        document.querySelector(".slider").style.width = (currSong.currentTime / currSong.duration) * 100 + "%";
        if (currSong.currentTime === currSong.duration) {
            nextSong()
        }
    }
    )
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        document.querySelector(".slider").style.width = percent + "%";
        currSong.currentTime = (percent * currSong.duration) / 100;
    }
    )
    //addEventListern to hamburger
    document.querySelector(".hamberger").addEventListener("click", (e) => {
        document.querySelector(".left").style.left = "0"
        document.querySelector(".close").style.display = "block"
    }
    )
    document.querySelector(".close").addEventListener("click", (e) => {
        document.querySelector(".left").style.left = "-190%"
    }
    )
    let nextSong = () => {
        currSong.pause();
        let index = songs.indexOf(currSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playSong(songs[index + 1])
        }
    }
    let prevSong = () => {
        currSong.pause();
        let index = songs.indexOf(currSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playSong(songs[index - 1])
        }
    }
    //addEventListerner to prev and post button
    prevsong.addEventListener("click", (e) => {
        prevSong()
    }
    )
    //Event Listrner to next button
    nextsong.addEventListener("click", (e) => {
        nextSong()
    }
    )
    //Eventlistener to volume button
    document.querySelector(".input").addEventListener("input", (e) => {
        let vol=(document.querySelector(".input").value)
        currSong.volume=vol/100;
        if (vol/100 == 0.0) {
            document.querySelector(".volumeimg").src = "svg/mute.svg"
        }
        else {
            document.querySelector(".volumeimg").src = "svg/volume.svg"
        }
    }
    )

    document.querySelector(".volumeimg").addEventListener("click", (e) => {
        if (e.target.src.includes("volume")) {
            e.target.src = "svg/mute.svg"
            document.querySelector(".input").value=0;
            currSong.volume = 0.0;
        }
        else {
            e.target.src = "svg/volume.svg"
           document.querySelector(".input").value=45;
            currSong.volume = 45;
        }
    }
    )
}
main();
