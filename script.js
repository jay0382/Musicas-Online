
let currentIndex = 0; // Índice da música atual
let shuffleMode = false; // Modo aleatório desativado por padrão
let currentPlaylist = []; // Playlist atualmente em uso
let availablePlaylists = {}; // Objeto para armazenar as playlists
let combinedPlaylist = []; // Playlist combinada de todas as playlists

const playPauseButton = document.getElementById("play-pause-button");
const player = document.getElementById('player');
const albumCover = document.getElementById('current-album');
const shuffleButton = document.getElementById('shuffle');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');
const effectContainer = document.getElementById('effect-container');
const title = document.getElementById('music-title');
const artist = document.getElementById('music-artist');
const currentNumber = document.getElementById("current-number");
const btnPlaylist1 = document.getElementById('btn-playlist1');
const btnPlaylist2 = document.getElementById('btn-playlist2');
const btnCombined = document.getElementById('btn-combined');


// Modal para exibição da letra
const lyricsModal = document.getElementById('lyrics-modal');
const closeLyricsButton = document.getElementById('close-lyrics');
const lyricsTitle = document.getElementById('lyrics-title');
const lyricsContent = document.getElementById('lyrics-content');

// Variável para armazenar o botão "Visualizar Letra"
const lyricsButton = document.createElement("button");
lyricsButton.id = "view-lyrics";
lyricsButton.innerText = "Visualizar Letra";
lyricsButton.style.display = "none"; // Oculta o botão inicialmente
document.getElementById('music-details').appendChild(lyricsButton);

// Função para carregar playlists do HTML
function loadPlaylists() {
  const playlistElements = document.querySelectorAll('ul[id^="playlist"]'); // Seleciona todas as playlists
  playlistElements.forEach(playlistElement => {
    const playlistId = playlistElement.id; // ID da playlist
    const playlistItems = playlistElement.querySelectorAll('li');
    const playlist = Array.from(playlistItems).map(item => ({
      file: item.getAttribute('data-file'),
      cover: item.getAttribute('data-cover') || 'images/default-cover.jpg',
      title: item.getAttribute('data-title'),
      artist: item.getAttribute('data-artist') || 'Artista Desconhecido'
    }));
    availablePlaylists[playlistId] = playlist; // Armazena a playlist no objeto
    combinedPlaylist = combinedPlaylist.concat(playlist); // Adiciona as músicas à playlist combinada
  });
}

// Função para carregar o JSON de letras
async function fetchLyrics() {
  const response = await fetch("lyrics.json"); // Caminho do JSON
  const data = await response.json();
  return data;
}

// Função para exibir a letra da música
async function showLyrics(songTitle) {
  const lyricsData = await fetchLyrics();

  if (lyricsData[songTitle]) {
    const { artist, lyrics, language } = lyricsData[songTitle];

    // Formatar as letras com base no idioma e respeitar \n\n
    const formattedLyrics = lyrics
      .split("\n\n") // Divide estrofes por \n\n
      .map((strophe) =>
        strophe
          .split("\n") // Divide as linhas dentro de cada estrofe
          .map((line, index) =>
            index % 2 === 0
              ? `<span class="${language}">${line}</span>` // Classe do idioma original
              : `<span class="portuguese">${line}</span>` // Classe do português
          )
          .join("<br>") // Junta as linhas da estrofe com quebra simples
      )
      .join("<br><br>"); // Adiciona espaço maior entre estrofes

    // Atualizar o modal
    lyricsTitle.innerText = `${songTitle} - ${artist}`;
    lyricsContent.innerHTML = formattedLyrics;

    // Exibir o modal
    lyricsModal.style.display = "block";
  } else {
    console.error("Letra não encontrada para a música:", songTitle);
  }
}

// Função para ocultar o modal ao clicar no botão de fechar
closeLyricsButton.addEventListener("click", () => {
  lyricsModal.style.display = "none";
});

// Função para exibir o botão "Visualizar Letra" ao tocar uma música
function showLyricsButton(songTitle) {
  lyricsButton.style.display = "block"; // Exibe o botão
  lyricsButton.onclick = () => showLyrics(songTitle); // Associa o clique à função showLyrics
}

// Função para tocar música
function playMusic(index) {
  const music = currentPlaylist[index];
  if (!music) {
    console.error("Música não encontrada na playlist.");
    return;
  }

  player.src = music.file;
  title.innerText = music.title;
  artist.innerText = music.artist;
  albumCover.src = music.cover;
  currentNumber.textContent = music.number; // Exibe o número da música atual

  // Exibir o botão "Visualizar Letra"
  showLyricsButton(music.title);

  player.play().catch((error) => console.log("Erro ao tocar a música:", error));
}

// Funções para botão e modal informções do artista
document.addEventListener("DOMContentLoaded", () => {
  const artistButton = document.getElementById("artist-info-button"); // Botão "Informações do Artista"
  const artistModal = document.getElementById("artist-modal");
  const closeArtistModalButton = document.getElementById("close-artist-modal");

  // Função para carregar informações do artista
  async function loadArtistInfo(artistName) {
    try {
      const response = await fetch("artists.json");
      const data = await response.json();

      // Procura o artista no JSON
      const artistInfo = data.artists.find(artist => artist.name === artistName);

      if (artistInfo) {
        document.getElementById("artist-name").textContent = artistInfo.name;
        document.getElementById("artist-bio").textContent = artistInfo.bio;
        document.getElementById("artist-genre").textContent = `Gênero: ${artistInfo.genre}`;
        document.getElementById("artist-origin").textContent = `Origem: ${artistInfo.origin}`;
        document.getElementById("artist-image").src = artistInfo.image;
      } else {
        document.getElementById("artist-name").textContent = "Artista não encontrado";
        document.getElementById("artist-bio").textContent = "";
        document.getElementById("artist-genre").textContent = "";
        document.getElementById("artist-origin").textContent = "";
        document.getElementById("artist-image").src = "images/default-artist.png"; // Imagem padrão
      }
    } catch (error) {
      console.error("Erro ao carregar informações do artista:", error);
    }
  }

  // Função para abrir o modal do artista
  function openArtistModal() {
    artistModal.style.display = "block";
  }

  // Função para fechar o modal do artista
  function closeArtistModal() {
    artistModal.style.display = "none";
  }

  // Eventos para o modal de artista
  artistButton.addEventListener("click", () => {
    const currentArtist = document.getElementById("music-artist").textContent; // Nome do artista atual
    loadArtistInfo(currentArtist); // Carrega as informações do JSON
    openArtistModal(); // Abre o modal
  });

  closeArtistModalButton.addEventListener("click", closeArtistModal);

  // Fechar o modal ao clicar fora dele
  window.addEventListener("click", (event) => {
    if (event.target === artistModal) {
      closeArtistModal();
    }
  });
});


// PlayLists
//Funções para playlists

// Selecionar os elementos do DOM
const playlistDropdown = document.getElementById("playlist-dropdown");
const playButton = document.getElementById("play-selected-playlist");

// Função para carregar a playlist selecionada
function playSelectedPlaylist() {
  const selectedPlaylist = playlistDropdown.value;

  switch (selectedPlaylist) {
    case "playlist1":
      currentPlaylist = availablePlaylists["playlist"]; // Playlist 1
      clearArtistInput(); // Limpar o campo do filtro
      break;
    case "playlist2":
      currentPlaylist = availablePlaylists["playlist2"]; // Playlist 2
      clearArtistInput(); // Limpar o campo do filtro
      break;
    case "combined":
      currentPlaylist = [...availablePlaylists["playlist"], ...availablePlaylists["playlist2"]]; // Apenas playlists 1 e 2
      clearArtistInput(); // Limpar o campo do filtro
      break;
    case "playlist3":
      currentPlaylist = availablePlaylists["playlist3"]; // Playlist 3 (isolada)
      clearArtistInput(); // Limpar o campo do filtro
      break;
    case "favorites":
      if (favoritePlaylist.length === 0) {
        alert("A playlist de favoritos está vazia!");
        return;
      }
      currentPlaylist = favoritePlaylist;
      clearArtistInput(); // Limpar o campo do filtro
      break;
    default:
      console.error("Playlist desconhecida.");
      return;
  }

  // Iniciar reprodução da playlist selecionada
  currentIndex = 0;
  playMusic(currentIndex);
}

// Adicionar evento ao botão de reprodução
playButton.addEventListener("click", playSelectedPlaylist);

// Carregar playlists
loadPlaylists();

// Inicializar com a primeira playlist por padrão
currentPlaylist = availablePlaylists["playlist"];
playMusic(currentIndex);

// Funções para botaõ favoritos (Coração)
// Array para armazenar músicas favoritas
let favoritePlaylist = [];

// Função para adicionar/remover uma música dos favoritos
function toggleFavoriteMusic(index) {
  const music = currentPlaylist[index];

  // Verificar se a música já está nos favoritos
  const favoriteIndex = favoritePlaylist.findIndex((fav) => fav.title === music.title);

  if (favoriteIndex !== -1) {
    // Se já está, remover dos favoritos
    favoritePlaylist.splice(favoriteIndex, 1);
    alert(`Música removida dos favoritos: ${music.title}`);
  } else {
    // Caso contrário, adicionar aos favoritos
    favoritePlaylist.push(music);
    alert(`Música adicionada aos favoritos: ${music.title}`);
  }
}

// Selecionar o botão de coração
const favoriteButton = document.getElementById("favorite-button");

// Evento de clique para adicionar/remover dos favoritos
favoriteButton.addEventListener("click", () => {
  toggleFavoriteMusic(currentIndex);
});

// Funções par  Eventos filtro de artistas
// Selecionar os elementos
const artistInput = document.getElementById("artist-input");
const filterArtistButton = document.getElementById("filter-artist-button");
const musicList = document.querySelectorAll("li[data-artist]"); // Selecionar todas as músicas

// Função para limpar o campo de entrada
function clearArtistInput() {
  artistInput.value = ""; // Limpa o valor do campo
}

// Função para filtrar músicas pelo artista
function filterByArtist() {
  const artistName = artistInput.value.trim().toLowerCase(); // Obter o nome do artista

  if (!artistName) {
    alert("Por favor, digite o nome de um artista.");
    return;
  }

  // Criar uma nova playlist baseada no filtro
  const filteredPlaylist = [];
  musicList.forEach((music) => {
    const artist = music.getAttribute("data-artist").toLowerCase();

     if (artist.includes(artistName)) {
      // Adicionar música à nova playlist
      filteredPlaylist.push({
        file: music.getAttribute("data-file"),
        title: music.getAttribute("data-title"),
        artist: music.getAttribute("data-artist"),
        cover: music.getAttribute("data-cover"),
      });
    }
  });

  if (filteredPlaylist.length === 0) {
    alert(`Nenhuma música encontrada para o artista: ${artistName}`);
    return;
  }

  // Atualizar a playlist atual e reiniciar a reprodução
  currentPlaylist = filteredPlaylist;
  currentIndex = 0;
  playMusic(currentIndex);
}

// Associar o evento ao botão de filtrar
filterArtistButton.addEventListener("click", filterByArtist);

// Funções para botões dos players:Próxima, Anterior e Aleatório
// Próxima música
function nextMusic() {
  if (shuffleMode) {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * currentPlaylist.length);
    } while (randomIndex === currentIndex);
    currentIndex = randomIndex;
  } else {
    currentIndex = (currentIndex + 1) % currentPlaylist.length;
  }
  playMusic(currentIndex);
}

// Música anterior
function prevMusic() {
  currentIndex = (currentIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
  playMusic(currentIndex);
}

// Função para alternar modo aleatório (shuffle)
function toggleShuffle() {
  shuffleMode = !shuffleMode; // Alterna o estado de shuffle

  if (shuffleMode) {
    shuffleButton.classList.add("active");
    shuffleButton.style.textDecoration = "none"; // Remove o risco quando ativado
  } else {
    shuffleButton.classList.remove("active");
    shuffleButton.style.textDecoration = "line-through"; // Adiciona o risco quando desativado
  }
}

// Eventos dos botões de controle
nextButton.addEventListener("click", nextMusic);
prevButton.addEventListener("click", prevMusic);
shuffleButton.addEventListener("click", toggleShuffle);

// Reproduzir próxima música automaticamente ao terminar
player.addEventListener("ended", nextMusic);


// Inicializar player com a primeira música da playlist
if (currentPlaylist && currentPlaylist.length > 0) {
  playMusic(currentIndex);
}

// Funções para sleep timer
// Selecionar o botão de Sleep Timer
const sleepTimerButton = document.getElementById("sleep-timer-button");

// Selecionar o elemento do cronômetro
const countdownElement = document.getElementById("countdown-timer");
const timerDisplay = document.getElementById("timer-display");

// Variável para armazenar o timer
let sleepTimer = null;
let countdownInterval = null;

// Função para programar o Sleep Timer
sleepTimerButton.addEventListener("click", () => {
  // Perguntar ao usuário o tempo para o Sleep Timer (em minutos)
  const minutes = parseInt(prompt("Digite o tempo para o Sleep Timer (em minutos):"));

  if (isNaN(minutes) || minutes <= 0) {
    alert("Por favor, insira um número válido.");
    return;
  }

  const milliseconds = minutes * 60 * 1000;

  // Cancelar qualquer timer anterior
  if (sleepTimer) {
    clearTimeout(sleepTimer);
    clearInterval(countdownInterval);
    countdownElement.style.display = "none";
  }

  // Exibir mensagem de confirmação
  alert(`Sleep Timer programado para ${minutes} minuto(s).`);

  // Mostrar o cronômetro regressivo
  countdownElement.style.display = "block";
  const endTime = Date.now() + milliseconds;

  countdownInterval = setInterval(() => {
    const timeLeft = endTime - Date.now();
    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
      countdownElement.style.display = "none"; // Ocultar o cronômetro
    } else {
      const minutesLeft = Math.floor(timeLeft / 60000);
      const secondsLeft = Math.floor((timeLeft % 60000) / 1000);
      timerDisplay.textContent = `${minutesLeft}:${secondsLeft.toString().padStart(2, "0")}`;
    }
  }, 1000);

  // Programar a parada da música após o tempo especificado
  sleepTimer = setTimeout(() => {
    player.pause(); // Parar a reprodução
    alert("Sleep Timer: Música pausada.");
    sleepTimer = null; // Resetar o timer
    clearInterval(countdownInterval);
    countdownElement.style.display = "none"; // Ocultar o cronômetro
  }, milliseconds);
});

// Função opcional para cancelar o Sleep Timer
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && sleepTimer) { // Pressionar "Esc" para cancelar
    clearTimeout(sleepTimer);
    clearInterval(countdownInterval);
    sleepTimer = null;
    countdownElement.style.display = "none"; // Ocultar o cronômetro
    alert("Sleep Timer cancelado.");
  }
});

// Função para aba
// Aba em segundo plano
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    console.log("A aba está em segundo plano, mas o áudio continuará.");
    // Muda o título da aba para indicar que a música continua
    document.title = "🎵 Continuando a reprodução...";
  } else {
    console.log("A aba voltou ao primeiro plano.");
    // Restaura o título original da aba
    document.title = "Sua Rádio Online";
  }
});



//  Função para Versiculos
document.addEventListener("DOMContentLoaded", () => {
  const verseButton = document.getElementById("verse-button");
  const verseModal = document.getElementById("verse-modal");
  const closeModalButton = document.getElementById("close-verse-modal");
  const verseText = document.getElementById("verse-text");

 // Função para carregar e atualizar o versículo do dia com base na data
  function updateVerseWithClock() {
    const now = new Date();
    const brasiliaTime = new Date(now.toLocaleString("en-US", {
        timeZone: "America/Sao_Paulo",
    }));
    const today = brasiliaTime.toDateString(); // Data atual no formato legível
    const savedDate = localStorage.getItem("verseDate");

    if (savedDate !== today) {
      // Data mudou, carregar um novo versículo
      fetch("versiculodia.json")
        .then((response) => response.json())
        .then((data) => {
          const randomIndex = Math.floor(Math.random() * data.verses.length);
          const newVerse = data.verses[randomIndex];

          // Atualizar o localStorage com o novo versículo
          localStorage.setItem("verseDate", today);
          localStorage.setItem("verse", newVerse);
        })
        .catch((error) => {
          console.error("Erro ao carregar o versículo do dia:", error);
        });
    }
  }

 // Função para exibir o modal com o versículo atual
  async function loadVerseOfTheDay() {
    const savedVerse = localStorage.getItem("verse");
    if (savedVerse) {
      // Exibe o versículo salvo
      verseText.textContent = savedVerse;
    } else {
      // Caso o versículo ainda não tenha sido carregado
      verseText.textContent = "Nenhum versículo disponível no momento.";
    }
  }

  // Função para abrir o modal
  function openVerseModal() {
    loadVerseOfTheDay();
    verseModal.style.display = "block";
  }

  // Função para fechar o modal
  function closeVerseModal() {
    verseModal.style.display = "none";
  }

  // Eventos
  verseButton.addEventListener("click", openVerseModal);
  closeModalButton.addEventListener("click", closeVerseModal);

  // Atualizar o versículo com base na data a cada minuto
  setInterval(updateVerseWithClock, 60000); // Verifica a cada minuto
  updateVerseWithClock(); // Chamada inicial para garantir que o versículo seja atualizado ao carregar
});



// Função para anunciar a hora atual
function announceTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // Configurando a mensagem
  let message = `Agora são ${hours} horas`;
  if (minutes > 0) {
    message += ` e ${minutes} minutos`;
  }

  // Usando a Web Speech API para falar a hora
  const speech = new SpeechSynthesisUtterance(message);
  speech.lang = "pt-BR"; // Configura o idioma para português
  speech.volume = 1; // Volume máximo
  speech.rate = 1; // Velocidade normal
  speech.pitch = 1; // Tom normal

  // Referência ao player de música
  const player = document.getElementById('player');

  // Reduzir o volume da música ao iniciar a fala
  speech.onstart = () => {
    if (player) {
      player.volume = 0.5; // Reduz para 50% do volume atual
    }
  };

  // Restaurar o volume da música após a fala
  speech.onend = () => {
    if (player) {
      player.volume = 1; // Volta ao volume normal
    }
  };

 // Fala a mensagem
  window.speechSynthesis.speak(speech);
}



// Função para anunciar "Altar Worship Online" a cada hora
function announceStation() {
  const speech = new SpeechSynthesisUtterance("Você está ouvindo Altar Worship Online");
  speech.lang = "pt-BR"; // Configura o idioma para português
  speech.volume = 1; // Volume máximo
  speech.rate = 1; // Velocidade normal
  speech.pitch = 1.2; // Tom ligeiramente mais animado para parecer radialista

  // Referência ao player de música
  const player = document.getElementById('player');

  // Reduzir o volume da música ao iniciar a fala
  speech.onstart = () => {
    if (player) {
      player.volume = 0.5; // Reduz para 50% do volume atual
    }
  };

  // Restaurar o volume da música após a fala
  speech.onend = () => {
    if (player) {
      player.volume = 1; // Volta ao volume normal
    }
  };

  // Fala a mensagem
  window.speechSynthesis.speak(speech);
}

// Função para verificar a cada minuto
function startAnnouncements() {
  setInterval(() => {
    const now = new Date();
    const minutes = now.getMinutes();

// Verifica se é múltiplo de 15 para anunciar a hora
    if (minutes % 15 === 0) {
      announceTime();
    }

    // Verifica se é a hora exata para anunciar "Altar Worship Online"
    if (minutes === 0) {
      announceStation();
    }
  }, 60000); // Executa a cada minuto
}

// Inicia o sistema de anúncios ao carregar a página
startAnnouncements();



// Função para efeito partituras
document.addEventListener('DOMContentLoaded', () => {
    const background = document.querySelector('.background-effect');
    const symbols = ['♪', '♫', '♬', '♩', '♭', '♯', '𝄞', '𝄢', '𝄡', '♮', '♯']; // Símbolos musicais

    function createSymbol() {
        const symbol = document.createElement('div');
        symbol.className = 'symbol';
        symbol.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        symbol.style.left = `${Math.random() * 100}%`; // Posição horizontal aleatória
        symbol.style.fontSize = `${Math.random() * 20 + 20}px`; // Tamanho aleatório
        symbol.style.animationDuration = `${Math.random() * 5 + 5}s`; // Duração aleatória
        background.appendChild(symbol);

        // Remove o símbolo após a animação
        setTimeout(() => {
            symbol.remove();
        }, 10000); // Deve ser igual à duração máxima da animação
    }

    // Gera novos símbolos a cada 300ms
    setInterval(createSymbol, 300);
});



// Variável para armazenar os dados do clima
let currentWeatherData = null;

// Função para obter localização do usuário
function getUserLocation(callback) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                console.log("Localização obtida:", { latitude, longitude });
                callback(latitude, longitude);
            },
            (error) => {
                console.error("Erro ao obter localização:", error.message);
                alert("Não foi possível obter sua localização.");
            }
        );
    } else {
        alert("Geolocalização não é suportada pelo seu navegador.");
    }
}

// Função para obter informações do clima do OpenWeatherMap
function getWeather(latitude, longitude, callback) {
    const apiKey = "5bf2b65c5212135fb230d1432dd6bb3b"; // Substitua pela sua chave do OpenWeatherMap
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=pt_br&appid=${apiKey}`;

    fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Erro na API de clima: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            const temperature = Math.round(data.main.temp);
            const humidity = data.main.humidity;
            const weatherDescription = data.weather[0].description;
            const city = data.name;

            console.log("Dados de clima obtidos:", { temperature, humidity, weatherDescription, city });

            callback({ temperature, humidity, weatherDescription, city });
        })
        .catch((error) => {
            console.error("Erro ao buscar clima:", error);
            alert("Não foi possível obter informações do clima.");
        });
}



// Função para atualizar o relógio
function updateClock() {
    const clockElement = document.getElementById("digital-clock");

    const now = new Date();
    const brasiliaTime = new Date(now.toLocaleString("en-US", {
        timeZone: "America/Sao_Paulo",
    }));

    const weekDays = [
        "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira",
        "Quinta-feira", "Sexta-feira", "Sábado"
    ];

    const day = brasiliaTime.getDate().toString().padStart(2, "0");
    const month = (brasiliaTime.getMonth() + 1).toString().padStart(2, "0");
    const year = brasiliaTime.getFullYear();
    const hours = brasiliaTime.getHours().toString().padStart(2, "0");
    const minutes = brasiliaTime.getMinutes().toString().padStart(2, "0");
    const seconds = brasiliaTime.getSeconds().toString().padStart(2, "0");
    const weekDayName = weekDays[brasiliaTime.getDay()];

    const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    const formattedDate = `${day} ${monthNames[parseInt(month, 10) - 1]} ${year}`;
    const formattedTime = `${hours}:${minutes}:${seconds}`;

    // Verifica se há dados de clima
    let weatherInfo = "";
    if (currentWeatherData) {
        const { temperature, humidity, weatherDescription, city } = currentWeatherData;
        weatherInfo = `<br>${city} - ${temperature}°C, ${weatherDescription}, Umidade: ${humidity}%`;
    }

// Atualiza o elemento HTML com a data, hora e clima
    clockElement.innerHTML = `${formattedTime} - ${weekDayName}, ${formattedDate}${weatherInfo}`;
}

// Função para atualizar automaticamente as informações do clima
function updateWeatherAutomatically(latitude, longitude) {
    function fetchWeather() {
        getWeather(latitude, longitude, (weatherData) => {
            currentWeatherData = weatherData; // Armazena os dados do clima
        });
    }

    fetchWeather(); // Atualiza o clima imediatamente ao carregar
    setInterval(fetchWeather, 300000); // Atualiza o clima a cada 5 minutos
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
    // Atualiza o relógio a cada segundo
    setInterval(updateClock, 1000);

    // Atualiza o clima periodicamente
    getUserLocation((latitude, longitude) => {
        updateWeatherAutomatically(latitude, longitude);
    });
});



// Função para efeito cascata
document.addEventListener('DOMContentLoaded', () => {
    function createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDuration = `${Math.random() * 1.5 + 0.5}s`; // Entre 0.5s e 2s
        particle.style.animationDelay = `${Math.random() * 0.5}s`; // Pequeno atraso
        container.appendChild(particle);

        // Remove a partícula após a animação
        setTimeout(() => {
            particle.remove();
        }, 2000); // Deve corresponder à duração máxima da animação
    }

    const leftCascade = document.querySelector('.cascade.left');
    const rightCascade = document.querySelector('.cascade.right');

    if (leftCascade && rightCascade) {
        // Reduz o intervalo para criar mais partículas
        setInterval(() => createParticle(leftCascade), 100); // Mais frequente na esquerda
        setInterval(() => createParticle(rightCascade), 100); // Mais frequente na direita
    }
});


 
