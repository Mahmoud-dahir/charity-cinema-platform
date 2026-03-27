# 👤 Accounts App

Module de gestion des comptes utilisateurs pour Folium.

## 📋 Vue d'ensemble

Ce module gère l'authentification, l'inscription, et les profils utilisateurs. Il utilise JWT pour l'authentification et crée automatiquement un profil et un panier pour chaque nouvel utilisateur.

## 🗂️ Structure

```
accounts/
├── models.py              # User, UserProfile, EmailVerificationToken, PasswordResetToken
├── serializers.py         # Serializers pour l'API
├── views.py               # ViewSets et vues API
├── urls.py                # Routes API
├── admin.py               # Configuration admin Django
├── signals.py             # Signaux auto-création
├── apps.py                # Configuration de l'app
└── tests/
    ├── test_models.py         # Tests des modèles
    ├── test_serializers.py    # Tests des serializers
    ├── test_views.py          # Tests des endpoints API
    └── test_signals.py        # Tests des signaux
```

## 📦 Modèles

### User
Modèle utilisateur personnalisé avec UUID comme clé primaire.

**Champs principaux :**
- `id` (UUID) - Identifiant unique
- `email` (unique) - Email (utilisé pour login)
- `username` (unique) - Username pour URL portfolio (folium.app/{username})
- `first_name` - Prénom
- `last_name` - Nom
- `avatar` - Photo de profil
- `is_verified` - Email vérifié
- `user_type` - Type d'utilisateur (user/admin)

**Méthodes :**
- `get_full_name()` - Retourne prénom + nom
- `get_short_name()` - Retourne prénom

### UserProfile
Préférences et paramètres du compte utilisateur (différent du portfolio public).

**Champs :**
- `newsletter_subscribed` - Abonnement newsletter
- `email_notifications` - Notifications par email

### EmailVerificationToken
Tokens pour vérification d'email (expire après 24h).

**Propriétés :**
- `is_expired` - Token expiré
- `is_valid` - Token valide (non utilisé et non expiré)

### PasswordResetToken
Tokens pour réinitialisation du mot de passe (expire après 1h).

**Propriétés :**
- `is_expired` - Token expiré
- `is_valid` - Token valide (non utilisé et non expiré)

## 🔄 Signaux automatiques

Lorsqu'un utilisateur est créé :
1. ✅ **UserProfile** créé automatiquement
2. ✅ **Cart** créé automatiquement (via store app)

```python
# Signal dans signals.py
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.get_or_create(user=instance)

@receiver(post_save, sender=User)
def create_user_cart(sender, instance, created, **kwargs):
    if created:
        from apps.store.models import Cart
        Cart.objects.get_or_create(user=instance, completed=False)
```

## 🛣️ Endpoints API

### Authentification

| Endpoint | Méthode | Permission | Description |
|----------|---------|------------|-------------|
| `/api/accounts/register/` | POST | Public | Inscription |
| `/api/accounts/login/` | POST | Public | Connexion (JWT) |
| `/api/accounts/token/refresh/` | POST | Public | Rafraîchir token |

**Exemple Inscription :**
```json
POST /api/accounts/register/
{
  "email": "user@example.com",
  "username": "myusername",
  "password": "StrongPass123!",
  "password2": "StrongPass123!",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Réponse :**
```json
{
  "message": "User registered successfully. Please verify your email.",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "myusername",
    "first_name": "John",
    "last_name": "Doe",
    "is_verified": false,
    "profile": {
      "newsletter_subscribed": false,
      "email_notifications": true
    }
  }
}
```

### Profil utilisateur

| Endpoint | Méthode | Permission | Description |
|----------|---------|------------|-------------|
| `/api/accounts/users/me/` | GET | Authenticated | Profil actuel |
| `/api/accounts/users/update_profile/` | PUT/PATCH | Authenticated | Modifier profil |
| `/api/accounts/users/change_password/` | POST | Authenticated | Changer mot de passe |
| `/api/accounts/users/check_username/` | POST | Public | Vérifier dispo username |
| `/api/accounts/users/check_email/` | POST | Public | Vérifier si email existe |

### Préférences

| Endpoint | Méthode | Permission | Description |
|----------|---------|------------|-------------|
| `/api/accounts/profiles/me/` | GET | Authenticated | Préférences actuelles |
| `/api/accounts/profiles/update_preferences/` | PUT/PATCH | Authenticated | Modifier préférences |

## 🧪 Tests

Lancer tous les tests du module :
```bash
pytest apps/accounts/tests/
```

Lancer un fichier de tests spécifique :
```bash
pytest apps/accounts/tests/test_models.py
pytest apps/accounts/tests/test_views.py
pytest apps/accounts/tests/test_serializers.py
pytest apps/accounts/tests/test_signals.py
```

Tests avec couverture :
```bash
pytest accounts/tests/ --cov=accounts --cov-report=html
```

## 🔐 Sécurité

### Validation username
- Minimum 3 caractères
- Alphanumeric + tirets + underscores uniquement
- Converti en minuscules automatiquement
- Unique

### Validation password
- Utilise les validateurs Django par défaut
- Minimum 8 caractères
- Ne peut pas être trop commun
- Ne peut pas être uniquement numérique

### JWT Tokens
- Access token : courte durée (15 min)
- Refresh token : longue durée (7 jours)
- Blacklist des tokens révoqués

## 🔗 Dépendances

```python
# requirements/base.txt
djangorestframework-simplejwt==5.3.1
```

## 📝 Notes importantes

1. **Username pour portfolios** : Le username est utilisé dans l'URL du portfolio publié (`folium.app/{username}`)

2. **Email verification** : Après inscription, l'utilisateur reçoit un email avec un token de vérification (à implémenter)

3. **Password reset** : Workflow de réinitialisation via email (à implémenter)

4. **UserProfile vs Portfolio Profile** :
   - `UserProfile` = préférences compte (newsletter, notifications)
   - `Profile` (profiles app) = données affichées publiquement dans le portfolio

## 🚀 Prochaines étapes

- [ ] Implémenter l'envoi d'emails de vérification
- [ ] Implémenter le workflow de reset password
- [ ] Ajouter OAuth (Google, GitHub)
- [ ] Ajouter 2FA (authentification à deux facteurs)
