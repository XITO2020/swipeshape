#!/usr/bin/env pwsh
# Script PowerShell pour tester les API migrées vers App Router

Write-Host "========== TEST DES API MIGRÉES ==========" -ForegroundColor Cyan

# Configuration
$baseUrl = "http://localhost:3000"
# Variables de test (à remplacer par des valeurs réelles pour les tests)
$testArticleId = "test-article"
$testSlug = "test-article-slug"
$testProgramId = "123"
$testVideoId = "123"
$adminToken = "votre-token-admin"   # À remplacer par un token admin valide pour les tests admin
$userToken = "votre-token-user"     # À remplacer par un token utilisateur valide

# Configuration des headers
$adminHeaders = @{
    Authorization = "Bearer $adminToken"
    "Content-Type" = "application/json"
}

$userHeaders = @{
    Authorization = "Bearer $userToken"
    "Content-Type" = "application/json"
}

# Fonction utilitaire pour gérer les requêtes et les erreurs
function Invoke-ApiTest {
    param(
        [string]$Method,
        [string]$Uri,
        [string]$Description,
        [hashtable]$Headers = @{},
        [object]$Body = $null,
        [switch]$ExpectError
    )
    
    Write-Host "`n$Description" -ForegroundColor Green
    
    try {
        $params = @{
            Uri = $Uri
            Method = $Method
            ContentType = "application/json"
            ErrorAction = "Stop"
        }
        
        if ($Headers.Count -gt 0) {
            $params.Add("Headers", $Headers)
        }
        
        if ($null -ne $Body) {
            $jsonBody = ConvertTo-Json -InputObject $Body -Depth 5
            $params.Add("Body", $jsonBody)
        }
        
        $result = Invoke-RestMethod @params
        $jsonResult = ConvertTo-Json -InputObject $result -Depth 3
        Write-Host "SUCCESS: $($jsonResult.Substring(0, [Math]::Min(500, $jsonResult.Length)))" -ForegroundColor Green
        if ($jsonResult.Length -gt 500) { Write-Host "... (output truncated)" -ForegroundColor Gray }
        return $result
    }
    catch {
        if ($ExpectError) {
            Write-Host "ERREUR ATTENDUE: $($_.Exception.Message)" -ForegroundColor Yellow
        }
        else {
            Write-Host "ERREUR: $($_.Exception.Message)" -ForegroundColor Red
        }
        return $null
    }
}

# ==== SECTION 1: TESTS DES APIs PUBLIQUES ====
Write-Host "`n=========== TESTS DES APIs PUBLIQUES ===========" -ForegroundColor Cyan

# 1.1 Test API Comments (Public)
Write-Host "`n==== Test API Comments (Public) ====" -ForegroundColor Magenta

Invoke-ApiTest -Method "GET" -Uri "$baseUrl/api/comments/" -Description "GET /api/comments/ - Liste tous les commentaires"

Invoke-ApiTest -Method "GET" -Uri "$baseUrl/api/comments/?articleId=$testArticleId" -Description "GET /api/comments/?articleId=... - Liste les commentaires d'un article spécifique"

# 1.2 Test API Articles (Public)
Write-Host "`n==== Test API Articles (Public) ====" -ForegroundColor Magenta

Invoke-ApiTest -Method "GET" -Uri "$baseUrl/api/articles/" -Description "GET /api/articles/ - Liste tous les articles publics"

Invoke-ApiTest -Method "GET" -Uri "$baseUrl/api/articles/?slug=$testSlug" -Description "GET /api/articles/?slug=... - Obtient un article spécifique"

# 1.3 Test API Programs (Public)
Write-Host "`n==== Test API Programs (Public) ====" -ForegroundColor Magenta

Invoke-ApiTest -Method "GET" -Uri "$baseUrl/api/programs/" -Description "GET /api/programs/ - Liste tous les programmes publics"

Invoke-ApiTest -Method "GET" -Uri "$baseUrl/api/programs/?id=$testProgramId" -Description "GET /api/programs/?id=... - Obtient un programme spécifique"

# 1.4 Test API Health
Write-Host "`n==== Test API Health ====" -ForegroundColor Magenta

Invoke-ApiTest -Method "GET" -Uri "$baseUrl/api/health/" -Description "GET /api/health/ - Vérifie l'état de l'application"

# ==== SECTION 2: TESTS DES APIs ADMIN ====
Write-Host "`n=========== TESTS DES APIs ADMIN ===========" -ForegroundColor Cyan
Write-Host "Note: Ces tests nécessitent un token admin valide" -ForegroundColor Yellow

# 2.1 Test API Admin Comments
Write-Host "`n==== Test API Admin Comments ====" -ForegroundColor Magenta

Invoke-ApiTest -Method "GET" -Uri "$baseUrl/api/admin/comments/" -Headers $adminHeaders -Description "GET /api/admin/comments/ - Liste tous les commentaires (admin)" -ExpectError

# 2.2 Test API Admin Programs
Write-Host "`n==== Test API Admin Programs ====" -ForegroundColor Magenta

Invoke-ApiTest -Method "GET" -Uri "$baseUrl/api/admin/programs/" -Headers $adminHeaders -Description "GET /api/admin/programs/ - Liste tous les programmes (admin)" -ExpectError

Invoke-ApiTest -Method "GET" -Uri "$baseUrl/api/admin/programs/?id=$testProgramId" -Headers $adminHeaders -Description "GET /api/admin/programs/?id=... - Récupère un programme spécifique (admin)" -ExpectError

# 2.3 Test API Admin Articles
Write-Host "`n==== Test API Admin Articles ====" -ForegroundColor Magenta

Invoke-ApiTest -Method "GET" -Uri "$baseUrl/api/admin/articles/" -Headers $adminHeaders -Description "GET /api/admin/articles/ - Liste tous les articles (admin)" -ExpectError

Invoke-ApiTest -Method "GET" -Uri "$baseUrl/api/admin/articles/?slug=$testSlug" -Headers $adminHeaders -Description "GET /api/admin/articles/?slug=... - Récupère un article spécifique (admin)" -ExpectError

# 2.4 Test API Admin Videos
Write-Host "`n==== Test API Admin Videos ====" -ForegroundColor Magenta

Invoke-ApiTest -Method "GET" -Uri "$baseUrl/api/admin/videos/" -Headers $adminHeaders -Description "GET /api/admin/videos/ - Liste toutes les vidéos (admin)" -ExpectError

Invoke-ApiTest -Method "GET" -Uri "$baseUrl/api/admin/videos/?id=$testVideoId" -Headers $adminHeaders -Description "GET /api/admin/videos/?id=... - Récupère une vidéo spécifique (admin)" -ExpectError

# 2.5 Test API Admin Purchases
Write-Host "`n==== Test API Admin Purchases ====" -ForegroundColor Magenta

Invoke-ApiTest -Method "GET" -Uri "$baseUrl/api/admin/purchases/" -Headers $adminHeaders -Description "GET /api/admin/purchases/ - Liste tous les achats (admin)" -ExpectError

# ==== SECTION 3: TESTS DES APIs UTILISATEUR ====
Write-Host "`n=========== TESTS DES APIs UTILISATEUR ===========" -ForegroundColor Cyan
Write-Host "Note: Ces tests nécessitent un token utilisateur valide" -ForegroundColor Yellow

# 3.1 Test API User Verify Purchase
Write-Host "`n==== Test API User Verify Purchase ====" -ForegroundColor Magenta

Invoke-ApiTest -Method "POST" -Uri "$baseUrl/api/user/verify-purchase/" -Headers $userHeaders -Description "POST /api/user/verify-purchase/ - Vérifie l'achat d'un programme" -Body @{ programId = $testProgramId } -ExpectError

# 3.2 Test API User Purchases
Write-Host "`n==== Test API User Purchases ====" -ForegroundColor Magenta

Invoke-ApiTest -Method "GET" -Uri "$baseUrl/api/user/purchases/" -Headers $userHeaders -Description "GET /api/user/purchases/ - Liste les achats de l'utilisateur" -ExpectError

# ==== SECTION 4: TESTS DES APIs NEWSLETTER ====
Write-Host "`n=========== TESTS DES APIs NEWSLETTER ===========" -ForegroundColor Cyan

# 4.1 Test API Newsletter Subscribers (GET - liste publique)
Write-Host "`n==== Test API Newsletter Subscribers ====" -ForegroundColor Magenta

Invoke-ApiTest -Method "GET" -Uri "$baseUrl/api/newsletter/subscribers/" -Headers $adminHeaders -Description "GET /api/newsletter/subscribers/ - Liste les abonnés (admin)" -ExpectError

# ==== FIN DES TESTS ====
Write-Host "`n========== FIN DES TESTS ==========" -ForegroundColor Cyan
Write-Host "Note: Les erreurs pour les routes protégées sont attendues sans tokens valides." -ForegroundColor Yellow
Write-Host "Pour tester complètement, remplacez 'votre-token-admin' et 'votre-token-user' par des tokens JWT valides." -ForegroundColor Yellow
