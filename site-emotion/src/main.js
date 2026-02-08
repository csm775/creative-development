const rideau = document.getElementById("rideau");
const rideauTexte = document.getElementById("rideauTexte");

const audioAmbiance = document.getElementById("audioAmbiance");
const audioTransition = document.getElementById("audioTransition");

const boutonEntrer = document.getElementById("boutonEntrer");
const cartes = document.querySelectorAll(".carte");
const chapitres = document.querySelectorAll(".chapitre");
const landing = document.getElementById("landing");


window.addEventListener("load", () => {
  if (landing) landing.classList.add("landing--intro");
});


function reglerVolume(audio, volume) {
  audio.volume = Math.max(0, Math.min(1, volume));
}

function animerCadreSortie() {
  const chapitreVisible = document.querySelector(".chapitre.chapitre--visible");
  if (!chapitreVisible) return;

  const cadre = chapitreVisible.querySelector(".cadre");
  if (!cadre) return;

  cadre.classList.add("cadre--sortie");
  setTimeout(() => {
    cadre.classList.remove("cadre--sortie");
  }, 600);
}


function fonduAudio(audio, volumeDepart, volumeFin, dureeMs) {
  const pas = 30;
  const nbEtapes = Math.max(1, Math.floor(dureeMs / pas));
  const delta = (volumeFin - volumeDepart) / nbEtapes;

  reglerVolume(audio, volumeDepart);

  let i = 0;
  const interval = setInterval(() => {
    i++;
    reglerVolume(audio, audio.volume + delta);
    if (i >= nbEtapes) {
      reglerVolume(audio, volumeFin);
      clearInterval(interval);
      if (volumeFin === 0) {
        audio.pause();
        audio.currentTime = 0;
      }
    }
  }, pas);
}

function jouerAmbiancePourChapitre(chapitreId) {
  let fichier = "";
  if (chapitreId === "joie") fichier = "sons/joie.mp3";
  if (chapitreId === "bastille") fichier = "sons/surprise.mp3";
  if (chapitreId === "sedan") fichier = "sons/degout.mp3";
  if (!fichier) return;

  audioAmbiance.src = fichier;
  audioAmbiance.loop = true;

  audioAmbiance.play().then(() => {
    fonduAudio(audioAmbiance, 0, 0.6, 700);
  }).catch(() => {});
}

function cacherTousLesChapitres() {
  chapitres.forEach((ch) => {
    ch.classList.remove("chapitre--visible");
    ch.setAttribute("aria-hidden", "true");

   
    const scenes = ch.querySelectorAll(".scene");
    scenes.forEach((s) => {
      s.classList.remove("scene--active");
      s.classList.remove("scene--animee");
    });

    const scene1 = ch.querySelector('.scene[data-scene="1"]');
    if (scene1) scene1.classList.add("scene--active");
  });
}


function animerScene(scene) {
  scene.classList.remove("scene--animee");
  requestAnimationFrame(() => {
    scene.classList.add("scene--animee");
  });
}

function afficherChapitre(chapitreId) {
  cacherTousLesChapitres();

  const cible = document.getElementById(chapitreId);
  if (!cible) return;

  cible.classList.add("chapitre--visible");
  cible.setAttribute("aria-hidden", "false");

  const sceneActive = cible.querySelector(".scene.scene--active");
  if (sceneActive) animerScene(sceneActive);

  jouerAmbiancePourChapitre(chapitreId);
  window.location.hash = "#" + chapitreId;
}

function sceneSuivanteDansChapitre(chapitreElement) {
  const sceneActive = chapitreElement.querySelector(".scene.scene--active");
  if (!sceneActive) return;

  const numero = Number(sceneActive.getAttribute("data-scene"));
  const prochaine = chapitreElement.querySelector(`.scene[data-scene="${numero + 1}"]`);

  if (!prochaine) return;

  sceneActive.classList.remove("scene--active");
  sceneActive.classList.remove("scene--animee");

  prochaine.classList.add("scene--active");
  animerScene(prochaine);
}

function afficherRideau(texte) {
  rideauTexte.textContent = texte || "Chapitre suivant…";
  rideau.classList.add("rideau--visible");
}

function cacherRideau() {
  rideau.classList.remove("rideau--visible");
}

function transitionVersChapitre(chapitreCibleId) {
  if (!audioAmbiance.paused) {
    fonduAudio(audioAmbiance, audioAmbiance.volume, 0, 400);
  }

  if (audioTransition && audioTransition.src) {
    try {
      audioTransition.currentTime = 0;
      reglerVolume(audioTransition, 0.7);
      audioTransition.play();
    } catch (e) {}
  }
  animerCadreSortie();


  afficherRideau("Chapitre suivant…");

  setTimeout(() => {
    if (chapitreCibleId === "landing") {
      cacherTousLesChapitres();
      if (!audioAmbiance.paused) fonduAudio(audioAmbiance, audioAmbiance.volume, 0, 250);
      window.location.hash = "#landing";
    } else {
      afficherChapitre(chapitreCibleId);
    }
  }, 650);

  setTimeout(() => {
    cacherRideau();
  }, 1200);
}


boutonEntrer.addEventListener("click", () => transitionVersChapitre("joie"));

cartes.forEach((carte) => {
  carte.addEventListener("click", () => {
    const chapitre = carte.getAttribute("data-chapitre");
    transitionVersChapitre(chapitre);
  });
});

document.body.addEventListener("click", (e) => {
  const bouton = e.target.closest("button");
  if (!bouton) return;

  const action = bouton.getAttribute("data-action");

  if (action === "suite") {
    const chapitre = bouton.closest(".chapitre");
    if (chapitre) sceneSuivanteDansChapitre(chapitre);
  }

  if (action === "chapitre") {
    const cible = bouton.getAttribute("data-cible");
    transitionVersChapitre(cible);
  }
});
