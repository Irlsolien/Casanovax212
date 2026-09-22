# CASANOVAX — Brief de croissance et passation à Claude

## 1. Mission

Améliorer le site et le système commercial de CASANOVAX pour rendre possible un objectif de **10 000 € de chiffre d’affaires mensuel**, soit environ **110 000 MAD/mois** selon le taux de change.

Cet objectif n’est pas une promesse de résultat. Le site doit créer les conditions nécessaires : offre rentable, preuve crédible, acquisition régulière, qualification des prospects, suivi commercial et revenus récurrents.

## 2. Contexte

- Marque : CASANOVAX
- Marché : Maroc, avec priorité Casablanca / Rabat / Témara
- Activité : sites web, SEO local, Google Business Profile, réputation, rendez-vous et automatisation
- Actif principal : `https://casanovax212.vercel.app/`
- Cas client médical public disponible dans la page Projets
- Canal de conversion principal : WhatsApp

## 3. Diagnostic objectif

### Forces

- Direction artistique distinctive et cohérente.
- Offre déjà structurée autour de trois briques utiles : site, visibilité, automatisation.
- Nombreuses pages SEO locales et services.
- Formulaire de check-up et redondance WhatsApp.
- Premier cas client réel dans le médical.

### Faiblesses

- Catalogue trop large : le prospect peut percevoir une agence généraliste.
- Offre d’entrée historiquement trop basse pour atteindre 110 000 MAD/mois sans produire trop de sites.
- Peu de preuves chiffrées vérifiées ; ne jamais en inventer.
- Dépendance aux ventes ponctuelles si la maintenance, le SEO et la réputation ne deviennent pas récurrents.
- Modal de capture anciennement affiché après 800 ms, trop agressif avant compréhension de l’offre.
- Le site actuellement déployé n’était pas entièrement synchronisé avec la branche `main` au début de cette mission. La version de travail a donc été reconstruite depuis le site public avant modification.

## 4. Positionnement retenu

Positionnement général :

> CASANOVAX relie votre site, Google, les avis et WhatsApp pour transformer une recherche locale en appel, message ou rendez-vous.

Verticale commerciale prioritaire :

> Médecins, cabinets et cliniques au Maroc.

Ce choix repose sur les actifs existants : cas médical déjà livré, besoin fort de confiance, valeur d’un rendez-vous, importance de Google local et possibilité de vendre un suivi récurrent.

Ne pas supprimer les autres services. Les garder pour le SEO et les opportunités entrantes, mais orienter la prospection active et la preuve vers la santé pendant 90 jours.

## 5. Modèle économique cible

### Offres santé affichées

1. **Fondation — 12 000 MAD** de mise en place
   - site jusqu’à 7 pages ;
   - parcours mobile et WhatsApp ;
   - SEO technique initial ;
   - cohérence Google Business ;
   - 30 jours de support.

2. **Acquisition locale — 20 000 MAD + dès 3 500 MAD/mois**
   - tout Fondation ;
   - pages de consultations ;
   - SEO local et contenus ;
   - suivi des demandes ;
   - réputation et avis.

3. **Clinique — dès 35 000 MAD + dès 6 000 MAD/mois**
   - architecture multi-praticiens ;
   - pages services et praticiens ;
   - rendez-vous avancés ;
   - automatisations ;
   - reporting mensuel.

### Équation mensuelle illustrative

- 4 mises en place Acquisition × 20 000 MAD = 80 000 MAD ;
- 10 accompagnements × 3 500 MAD = 35 000 MAD ;
- total = 115 000 MAD de CA mensuel.

Cette équation est un scénario de capacité, pas une prévision. Elle nécessite une production standardisée et probablement des freelances pour le contenu, le design ou l’intégration.

## 6. Modifications déjà réalisées

- Nouvelle promesse de hero centrée sur les demandes réelles.
- CTA principal remplacé par un diagnostic.
- Bloc vertical santé ajouté sur la page d’accueil.
- Nouvelle page `medecins-cliniques.html` : parcours patient, preuve, offres, FAQ et CTA.
- Nouveau visuel original `assets/casanovax-medecins-hero.webp` sans texte ni fausse interface.
- Formulaire `check-up.html` enrichi avec ville, priorité et budget.
- Formulaire converti en préparation WhatsApp : aucune donnée n’est transmise automatiquement à un service tiers.
- Modal de capture retardé de 800 ms à 20 secondes pour laisser le visiteur comprendre l’offre.
- Sitemap mis à jour avec la page santé.
- Les offres et la page indiquent explicitement qu’aucun classement, volume de patients ou résultat commercial n’est garanti.

## 7. Travail demandé à Claude

Analyser le dépôt complet et travailler avec esprit critique. Ne pas valider automatiquement les choix ci-dessus.

### Priorité A — Vérification fonctionnelle

- Tester toutes les pages desktop et mobile.
- Vérifier les liens, ancres, formulaires, WhatsApp, scripts et navigation.
- Vérifier que `check-up.html?secteur=sante` préremplit correctement l’activité.
- Vérifier le rendu 375 px, 768 px, 1440 px et à 200 % de zoom texte.
- Contrôler CLS, LCP, poids d’image et absence de scroll horizontal.
- Vérifier l’absence d’erreurs console.

### Priorité B — Conversion

- Évaluer si le premier écran explique en moins de 5 secondes : cible, problème, résultat et action.
- Réduire les CTA concurrents.
- Vérifier que la page santé mène naturellement vers le diagnostic.
- Ajouter des événements Analytics documentés pour : clic diagnostic, clic WhatsApp, envoi du formulaire, consultation des offres.
- Ne pas utiliser de dark patterns ni afficher le modal immédiatement.

### Priorité C — Preuve

- Transformer le projet médical existant en étude de cas uniquement avec des données vérifiables.
- Ne jamais inventer avis, nombre de patients, progression SEO, chiffre d’affaires ou taux de conversion.
- Si aucune donnée commerciale n’est disponible, montrer les livrables, la méthode, les captures et les mesures techniques réelles.

### Priorité D — SEO

- Vérifier canonical, sitemap, robots, données structurées et maillage interne.
- Éviter les pages locales dupliquées ou artificielles.
- Ajouter une page uniquement si elle répond à une intention distincte et possède du contenu réellement utile.
- Préparer un plan de contenu santé sans donner de conseil médical personnalisé.

### Priorité E — Architecture commerciale

- Prévoir un pipeline simple : prospect → audit → appel → proposition → acompte → production → abonnement.
- Proposer un CRM léger avant toute construction de SaaS.
- Ne développer un produit logiciel que lorsque plusieurs clients paient pour le même besoin répétitif.

## 8. KPIs à suivre pendant 90 jours

### Acquisition

- prospects qualifiés contactés par semaine ;
- réponses positives ;
- diagnostics envoyés ;
- appels obtenus ;
- propositions envoyées.

### Vente

- taux appel → proposition ;
- taux proposition → signature ;
- panier moyen initial ;
- MRR signé ;
- délai moyen de signature.

### Site

- clics vers le diagnostic ;
- clics WhatsApp ;
- taux de complétion du formulaire ;
- source de chaque lead ;
- pages d’entrée et requêtes SEO.

### Livraison

- marge brute par projet ;
- temps de production ;
- nombre de retours client ;
- rétention des abonnements ;
- résultats vérifiés par client.

## 9. Cadence commerciale suggérée

Chaque semaine :

- construire une liste de 50 à 100 prospects réellement qualifiés ;
- produire 10 à 15 mini-audits personnalisés ;
- obtenir 5 conversations sérieuses ;
- viser 2 propositions ;
- analyser les objections et mettre à jour l’offre.

Le volume est secondaire si la personnalisation est faible. La priorité est la pertinence : spécialité, ville, présence Google, site actuel, avis et friction de rendez-vous.

## 10. Garde-fous

- Ne jamais promettre 10 000 €/mois au public : c’est l’objectif interne de CASANOVAX.
- Ne jamais garantir la première place Google.
- Ne jamais inventer un témoignage ou une statistique.
- Ne pas publier de données médicales ou patient.
- Ne pas multiplier les services sans capacité réelle de livraison.
- Ne pas sacrifier la marge avec des sites sur mesure à bas prix.
- Conserver les changements réversibles et expliquer chaque modification importante.

## 11. Critère de réussite

Le site est réussi si un médecin au Maroc comprend immédiatement :

1. ce que CASANOVAX construit ;
2. pourquoi cela compte pour son cabinet ;
3. quelle preuve réelle existe ;
4. combien commence l’investissement ;
5. comment demander un diagnostic.

Le business est sur la trajectoire des 10 000 €/mois lorsque le MRR augmente, que le panier moyen initial dépasse le prix historique des sites isolés et que le volume de livraison reste soutenable.
