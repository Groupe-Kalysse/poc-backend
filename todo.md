- ✅ messages back>front
- ✅ badges RFID
  - ✅ lecteur en mode HID
  - ✅ lecteur en mode PCSC
  - ✅ vraie phase de test nécessaire sur le matériel final
- ordres (port serie)
- reimplementer database
- centraliser configs

## Analyse Python

### settings.py

Fichier de config, contient pour chaque typologie de coupleur:

- startCode:
- adresse:
- codeGetStatus:
- codeOpening:
- codeResponseStatus:
- endCode:
- lockerNumber: Nombre de verrous

### utils_API.py

Fichier de déclaration de fonctions:

- get_list_of_all_IP_interfaces
- get_token_API
- get_borne_ID_from_API
- get_info_borne_dans_BDD_API

### commandLocker.py

Fichier de déclaration de fonctions relatives au Locker:

- openLocker
- getStatus

### lockerHandle.py

... Tout le reste ? 🤷

- Init: Initialisation des variables de fonctionnement
  - Récupération du port série pour la communication
  - Pour chaque port potentiel (255):
    - Tentative d'ouverture du port, d'envoi et de réception de messages avec le CU
    - Initialisation de l'état des casiers avec celui récupéré lors de la connexion
    - Initialisation de la date de la session
- run
- checkState: Vérifie l'état physique des casiers par rapport à l'état souhaité
  - Pour chaque casier:
    - vérifie s'il y a des changements à effectuer
      - Casier fermé alors qu'il doit être ouvert
      - Casier ouvert alors qu'il doit être fermé
      - Quand l'attente est trop longue pour la fermeture
      - Ouverture inattendue
      - Fermeture non souhaitée
      - Casier correctement fermé
    - Si le casier est dans le bon etat on reinitialise le compteur
