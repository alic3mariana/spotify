let pontos = 0;
let player;
let trackName;
let erros = 0;
let jogos = {};
let playTimeout;
let tentativasOuvir = 0;
let musicaAnterior;


function startGame() {
    if (trackName.includes('-')) {
        const partes = trackName.split('-');
        trackName = partes[0].trim();
    }
    trackName = trackName.trim();
    return trackName;
}

function atualizarPontuacao() {
    const pontuacaoElement = document.getElementById("score");
    pontuacaoElement.innerText = `Pontuação: ${pontos}`;
}

function mostrarMensagem(mensagem) {
    const mensagemContainer = document.getElementById("mensagem-container");
    const mensagemElement = document.getElementById("mensagem");

    mensagemContainer.classList.remove("hidden");

    mensagemElement.innerText = mensagem;
}

function reiniciarJogo() {
    mostrarMensagem("Você errou 3 vezes e perdeu o jogo!");
    setTimeout(() => {
        window.location.href = "index.html";
    }, 1000);
}

function extrairNomeDaMusica() {
    if (trackName.includes('-')) {
        const partes = trackName.split('-');
        trackName = partes[0].trim();
    }
    trackName = trackName.trim();
    return trackName;
}

const tempoDaMusica = 15000;
let stopTimeout;

function playMusic() {
    if (player.getCurrentState().position === 0) {
        player.togglePlay();
        playTimeout = setTimeout(() => {
            if (player.getCurrentState().position === 0) {
                player.pause();
                if (trackName === musicaAnterior) {
                    tentativasOuvir++;
                    if (tentativasOuvir > 1) {
                        pontos -= 2;
                        atualizarPontuacao();
                    }
                } else {
                    tentativasOuvir = 0;
                }
                musicaAnterior = trackName;
            }
        }, tempoDaMusica);
        stopTimeout = setTimeout(() => {
            player.pause(); 
        }, tempoDaMusica);
    } else {
        player.togglePlay();
        clearTimeout(playTimeout);
        clearTimeout(stopTimeout); 
        playTimeout = setTimeout(() => {
            if (player.getCurrentState().position !== 0) {
                player.pause();
                pontos -= 2;
                atualizarPontuacao();
                alert("Você perderá 2 pontos por não ter acertado a música no tempo suficiente.");
            }
        }, tempoDaMusica);
        stopTimeout = setTimeout(() => {
            player.pause(); 
        }, tempoDaMusica);
    }
}

window.onSpotifyWebPlaybackSDKReady = () => {
    const token = "BQB1UPPCNcg6i1pC61xkQfHDkBXmiJC9lbxUkmKyywdVvgS6hJli8gTADhkmfxf9e9Dro7zp3Way3shjPEYlLvNU1Q-SPcQpcKrfyzkDQ8SLa9BOCUYgoue7WcnA3HtSXr3m4IP0Jo2C61q_Ywftj770tlCQwv_cW0Mu6OxLDTgZCA79cJZCnyrRhMka1kQ5bmkccJ4OcTU-aHz8XxIwDITlKtT1";
    player = new Spotify.Player({
        name: "Web Playback SDK Quick Start Player",
        getOAuthToken: (cb) => {
            cb(token);
        },
        volume: 0.5,
    });

    const musicasEJogos = {
        "super mario bros. theme": "super mario",
        "tetris theme":"tetris",
        "donkey kong country theme":"donkey kong",
        "crash bandicoot theme":"crash",
        "san andreas theme song":"gta",
        "bomberman theme (area 1)":"bomberman",
        "god of war iii overture":"god of war",
        "among us theme":"among us",
        "genshin impact main theme":"genshin impact",
        "free fire lobby: original":"free fire",
    };

    player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        const connect_to_device = () => {
            let album_uri = "https://open.spotify.com/playlist/6mve2VQybFKpFzUudmk3Dt";
            fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device_id}`, {
                method: "PUT",
                body: JSON.stringify({
                    context_uri: album_uri,
                    play: false,
                }),
                headers: new Headers({
                    "Authorization": "Bearer " + token,
                }),
            }).then(response => console.log(response))
                .then(data => {
                    player.addListener('player_state_changed', ({
                        track_window
                    }) => {
                        trackName = track_window.current_track.name.toLowerCase();
                        console.log('Current Track:', trackName);

                        if (musicasEJogos[trackName]) {
                            jogos[trackName] = musicasEJogos[trackName];
                        }
                    });
                });
        }
        connect_to_device();
    });

    document.getElementById("play-music").addEventListener('click', () => {
        playMusic();
    });

    document.getElementById("btn-resposta").addEventListener('click', (event) => {
        event.preventDefault();
        let resposta = document.getElementById("resposta").value;
        resposta = resposta.toLowerCase();

        if (jogos[trackName] && resposta === jogos[trackName]) {
            alert("Você Acertou, Parabéns!");
            pontos += 10;
            atualizarPontuacao();
            document.getElementById("resposta").value = "";
            player.nextTrack();
            setTimeout(() => {
                player.pause();
                document.getElementById("mensagem-container").classList.add("hidden");
            }, 1300);
        } else {
            alert("Você errou, tente novamente!");
            pontos -= 5;
            atualizarPontuacao();
            erros++;
            if (erros === 3) {
                reiniciarJogo();
            }
        }
    });

    player.connect();
};
