# Description

## Infrastructure

Contient un dossier pour chaque module principal
Chaque fichier index.ts est un portail vers les implémentations (choisies selon les variables d'environnement)
-> On peut swap une classe par une autre plus facilement dans le système
Dans la mesure du possible, on fournira une implémentation "mock" de chaque domaine afin de tester ce dernier facilement

## CommBus

Domaine particulier: son rôle est de permettre la communication d'events entre les autres domaines
Chaque infrastructure ne connait qu'un autre Domain: CommBus
Chaque infrastructure peut emettre un event
Chaque infrastructure peut s'abonner à un event (via son label), et déclencher une fonction lorsque l'event est déclenché
Permet une decorrelation totale entre les modules -> swap d'implémentations plus facile

### Events disponibles

Tous les events:

- "label" est un nom unique pour les dispatch/register du CommandBus
- "type" donne le niveau de sécérité
