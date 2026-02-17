# Teck Talk — Initiation au DDD et à la Clean Architecture

> Partie 1 : Domain-Driven Design (Value Objects, Entities, Aggregates, Bounded Contexts)

Ce repository accompagne la présentation Teck Talk sur le **Domain-Driven Design** et la **Clean Architecture**. Il contient un exemple concret de modélisation d'un domaine **Order** (commande) en TypeScript, illustrant les concepts fondamentaux du DDD.

## Le constat de départ

Dans beaucoup de codebases, on retrouve les mêmes problèmes :

1. **Logique métier dans le service** — Validation, calculs et vérifications mélangés avec l'accès à la base
2. **Modèle anémique** — Des objets bruts sans comportement, simples sacs de données
3. **Impossible de tester unitairement** — Tester une règle métier nécessite toute l'infrastructure
4. **Couplage ORM / métier** — Changer de base impose de réécrire la logique métier
5. **Duplication inévitable** — Chaque endpoint redécouvre et ré-implémente les mêmes règles

## DDD vs Clean Architecture

| | **DDD** (le quoi) | **Clean Architecture** (le où) |
|---|---|---|
| **Origine** | Eric Evans (2003) | Robert C. Martin (2012/2017) |
| **Question** | *Comment modéliser mon métier dans le code ?* | *Comment organiser mes couches pour que le métier ne dépende pas de la technique ?* |
| **Apport** | La **substance** : Value Objects, Entities, Aggregates, Ubiquitous Language | La **structure** : couches concentriques, dépendances vers l'intérieur |
| **Sans l'autre** | Domaine riche mais couplé à l'infrastructure | Couches bien séparées mais modèles anémiques |

**Les deux ensemble** = un domaine riche ET isolé de l'infrastructure. C'est ce qu'on vise.

## Concepts DDD illustrés

### Value Object

Un objet **défini par ses valeurs**, **immutable** et **auto-validant**. Un Value Object invalide ne peut pas exister.

> *Analogie : un billet de 20 € est un Value Object. Deux billets de 20 € sont interchangeables — pas d'identité propre.*

Exemples dans le code :
- [`Currency`](src/modules/order/domain/value-objects/currency.vo.ts) — Devise supportée (EUR, USD, GBP, CHF, CAD)
- [`Money`](src/modules/order/domain/value-objects/money.vo.ts) — Montant + devise, avec opérations `add()` et `multiply()`
- [`OrderStatus`](src/modules/order/domain/value-objects/order-status.vo.ts) — Statut avec transitions contrôlées (DRAFT → CONFIRMED → CANCELLED)
- [`UuidV7`](src/modules/shared/domain/value-objects/uuid-v7.vo.ts) — Identifiant UUID v7 validé

### Entity

Un objet avec une **identité unique**, un **cycle de vie** et qui **contient sa logique métier**.

> *Analogie : un passeport est une Entity. Deux passeports avec le même nom sont quand même différents (numéro unique).*

Exemple dans le code :
- [`OrderItem`](src/modules/order/domain/entities/order-item.entity.ts) — Article de commande avec calcul automatique du sous-total

### Aggregate

Un **groupe d'Entities et de Value Objects** qui forment une unité de cohérence. Toute modification passe par l'Aggregate Root.

> *Analogie : l'Aggregate, c'est le PDG d'une entreprise. On ne parle pas directement au comptable — on passe par le PDG qui s'assure que tout reste cohérent.*

**4 règles :**
1. Accès uniquement par l'Aggregate Root
2. Références externes par ID (pas de référence directe)
3. Chargé et persisté en bloc (unité de transaction)
4. Les Domain Events sont émis par l'Aggregate

Exemple dans le code :
- [`Order`](src/modules/order/domain/aggregates/order.aggregate.ts) — Aggregate Root qui protège les invariants (pas d'ajout d'items sur une commande non-DRAFT, pas de confirmation sans items)

### Bounded Context

Une **frontière explicite** à l'intérieur de laquelle un modèle a un sens précis. Le même mot peut avoir des significations différentes selon le contexte (ex : "Produit" pour le catalogue vs la logistique).

Les contextes communiquent par **ID** et par **événements**, jamais par références directes.

### Domain Events

Quand quelque chose d'important se passe, l'Aggregate émet un événement.

Exemple : [`OrderConfirmedEvent`](src/modules/order/domain/events/order-confirmed.event.ts) — Émis lors de la confirmation d'une commande.

## Structure du projet

```
src/
└── modules/
    ├── shared/                          # Module partagé
    │   └── domain/
    │       ├── aggregates/
    │       │   └── aggregate.ts         # Classe abstraite Aggregate (base)
    │       ├── events/
    │       │   └── domain-event.ts      # Interface DomainEvent
    │       └── value-objects/
    │           └── uuid-v7.vo.ts        # Value Object UUID v7
    │
    └── order/                           # Bounded Context "Order"
        ├── domain/                      # Couche Domaine
        │   ├── aggregates/
        │   │   └── order.aggregate.ts   # Aggregate Root Order
        │   ├── entities/
        │   │   └── order-item.entity.ts # Entity OrderItem
        │   ├── events/
        │   │   └── order-confirmed.event.ts
        │   ├── repositories/
        │   │   └── order.repository.ts  # Interface (port)
        │   └── value-objects/
        │       ├── currency.vo.ts
        │       ├── money.vo.ts
        │       └── order-status.vo.ts
        │
        ├── application/                 # Couche Application (Use Cases)
        │   └── use-cases/
        │       ├── create-order.use-case.ts
        │       └── confirm-order.use-case.ts
        │
        └── infrastructure/              # Couche Infrastructure
            └── repositories/
                └── in-memory-order.repository.ts  # Implémentation (adapter)
```

## Go / No-Go du DDD

### Quand utiliser le DDD

- Logique métier complexe (règles, conditions, calculs croisés)
- Le domaine évolue souvent
- Application critique (fintech, santé, juridique)
- Plusieurs développeurs en parallèle sur le même domaine
- Besoin de tests unitaires solides et rapides
- Projet long terme (2+ ans)

### Quand éviter le DDD

- Simple CRUD sans logique métier
- Prototype ou MVP à valider rapidement
- Microservice de lecture seule
- Script ou outil interne jetable
- Deadline serrée sans possibilité de refactorer

### L'approche pragmatique

> Le DDD n'est pas une religion. C'est un outil. On l'utilise là où il apporte de la valeur, et on le laisse de côté ailleurs.

Identifier les modules avec une vraie logique métier et appliquer le DDD uniquement sur ceux-là. Le reste reste en CRUD classique.

## Sessions

| Session | Sujet | Contenu |
|---------|-------|---------|
| **Session 1** | Le DDD | Value Object, Entity, Aggregate, Bounded Context |
| **Session 2** | La Clean Architecture | Use Case, Repository, UoW, DI, Controller, DTO |
