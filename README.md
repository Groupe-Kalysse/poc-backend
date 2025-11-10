# A propos
## Historique
- 2025-11-10: Vérification et upload de la documentation
- 2025-06-22: Rédaction initiale de cette documentation

## Utilisateurs & Sécurité
Il est conseillé de disposer de deux utilisateurs distincts: 
- un pour l'installation/maintenance de la borne (ex: `kalysse`/`k@Ly$$e`)
- un pour l'utilisation quotidienne des utilisateurs finaux (ex: `kiosk`/`kiosk`)

Afin de bien séparer ces deux profils, nous utiliserons dans ce document les conventions suivantes:
- Au début de chaque étape, il sera précisé quel utilisateur doit effectuer les actions ("🔵kiosk" ou "🟥kalysse")
- Nous réserverons à 🟥kalysse le tty1 graphique, 🔵kiosk utilisera quant à lui le tty3 en mode terminal. 
- 🔵kiosk aura des droits limités ne lui permettant pas 
	- d'éditer le code
	- d'utiliser des commandes Docker
	- de toucher à la base du système

⚠ Attention!
La ou les personnes en possession des identifiants 🟥kalysse disposera des accès "root" sur le système. Il lui appartiendra de respecter les consignes de sécurité usuelles:
- Ne pas partager lesdits identifiants à la légère
- Respecter en fin d'intervention les étapes suivantes:
	- Couper l'accès au réseau
	- Se déconnecter
	- Retirer les périphériques tels que clavier et souris

## Description du projet

### Architecture
//TODO explications

### Connexion à Internet
- L'application est conçue pour tourner sur une machine autonome, sans connexion nécessaire à Internet
- L'installation initiale nécessitera par contre une connexion afin de récupérer le code et les outils nécessaires
- Toute mise à jour de l'applicatif passera par le net, il sera donc nécessaire de raccorder la borne au net le temps de l'opération

### Concepts Linux utilisés

#### Utilisation de différents "écrans virtuels" (aka "terminaux", "tty")
Linux propose par défaut plusieurs environnements "parallèles", permettant à plusieurs utilisateurs d'être connectés en même temps et d'avoir leurs activités bien séparées. Ces environnements peuvent être utilisés en "mode texte" (moins gourmand en ressources) ou en mode graphique (pour une meilleure UX). 
- Ubuntu est préconfiguré pour proposer 7 tty par défaut: le premier en graphique, les autres en mode texte
- Pour passer sur un tty "x", on utilise la commande `Ctrl-Alt-Fx` (ex: `F1` ou `F3`)

Pour notre application, on utilisera le tty1 (graphique) pour l'installation / maintenance / administration, et le tty3 (texte) pour l'utilisation quotidienne. Le tty3, même s'il est nativement en mode texte, est capable de lancer des programmes graphiques via le package `xorg` dont l'installation / config / utilisation est couverte dans cette documentation.

#### Droits des utilisateurs
Nous avons scindé les deux utilisations principales de la borne: installation/maintenance/intervention versus l'utilisation quotidienne.
Le seul utilisateur qui reste connecté en l'absence de staff Kalysse doit être 🔵kiosk. La borne n'est sensée afficher que le navigateur Firefox et ne pas permettre d'en sortir, mais même si c'était le cas les vecteurs d'attaque resteraient très limités car cet utilisateur ne dispose pas des accès nécessaires pour attaquer le système, consulter la bdd par lui même ou activer les commandes Docker

# Installation initiale

## Installer la dernière Ubuntu LTS
Application testée sur la version Ubuntu: 24.04
- Le premier utilisateur créé sera 🟥kalysse

## Créer l'utilisateur 🔵kiosk
//TODO instructions

## Installer les outils nécessaires
🟥kalysse

### Docker
```bash
# Install & configure Docker
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Make docker usable without root access
sudo groupadd docker
sudo usermod -aG docker $USER
newgrp docker
```

### xorg
//TODO explications
```bash
# Install other packages
## "xorg" allows to launch a graphic Firefox instance from a cli-only tty
sudo apt install xorg
```

## Récupérer le code de l'application
🟥kalysse
- Copier une clé SSH ( ⚠ deux fichiers) permettant l'accès au repo de l'application `https://github.com/Groupe-Kalysse/poc-backend` dans le dossier `~/.ssh`
- Se placer dans un répertoire dédié (`cd ~/www`)
- Récupérer le code depuis GitHub (`git clone git@github.com:Groupe-Kalysse/poc-backend.git`)

## Configurer & démarrer l'application
🟥kalysse
- Se placer dans l'app nouvellement téléchargée (`cd ~/www/poc-backend`)
- Créer un fichier `.env` contenant la configuration souhaitée (`cp .end.sample .env`)
- Lancer l'app (`make dev`)
- Attendre que l'app démarre (quelques minutes la première fois ; quelques secondes les suivantes)
- Se déconnecter (En haut à droite: "Icone Power" > "Log out")

## Mettre en place le navigateur pour les utilisateurs
🟥kalysse
- Entrer dans un tty cli-only (`Ctrl-Alt-F3`)
- Entrer les identifiants de 🔵kiosk
- Créer un fichier de configuration pour lancer le navigateur (`nano .xinitrc`)
- Ecrire dans ce fichier le contenu suivant
```bash
#!/bin/bash
exec firefox --kiosk http://localhost:7000
```
- Sauvegarder et quitter le fichier (`Ctrl-S` `Ctrl-X`)
- Lancer le navigateur (`startx`)

# Annexes

## Outils utiles
//TODO compléter
Ces outils sont utiles au debug et peuvent être installés sur la borne ***sur le compte 🟥kalysse uniquement***. En effet, s'ils ne représentent pas une faille de sécurité en soi, ils restent des outils destinés à examiner (voire modifier) le comportement de la borne, ils ne doivent jamais être exposés aux utilisateurs tiers.

### Codium
- Description: 
- Installation: 

### Bruno
- Description: 
- Installation:

### Lazydocker
- Description: 
- Installation:

### Remote desktop tool (ssh ? Remmina ? )
https://doc.ubuntu-fr.org/bureau_a_distance
- Description: 
- Installation:
