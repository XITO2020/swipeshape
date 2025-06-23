#!/usr/bin/env pwsh
# Script PowerShell simplifié pour tester les API migrées vers App Router

$baseUrl = "http://localhost:3000"

Write-Host "`n==== Test API Programs (Public) ====" -ForegroundColor Magenta
$response = Invoke-RestMethod -Uri "$baseUrl/api/programs/" -Method GET -ErrorAction SilentlyContinue
if ($response) {
    Write-Host "SUCCÈS: API Programs fonctionne !" -ForegroundColor Green
    Write-Host "Nombre de programmes: $($response.Count)" -ForegroundColor Green
} else {
    Write-Host "ÉCHEC: L'API Programs ne répond pas correctement" -ForegroundColor Red
}

Write-Host "`n==== Test API Articles (Public) ====" -ForegroundColor Magenta
$response = Invoke-RestMethod -Uri "$baseUrl/api/articles/" -Method GET -ErrorAction SilentlyContinue
if ($response) {
    Write-Host "SUCCÈS: API Articles fonctionne !" -ForegroundColor Green
    Write-Host "Nombre d'articles: $($response.Count)" -ForegroundColor Green
} else {
    Write-Host "ÉCHEC: L'API Articles ne répond pas correctement" -ForegroundColor Red
}

Write-Host "`n==== Test API Health ====" -ForegroundColor Magenta
$response = Invoke-RestMethod -Uri "$baseUrl/api/health/" -Method GET -ErrorAction SilentlyContinue
if ($response) {
    Write-Host "SUCCÈS: API Health fonctionne !" -ForegroundColor Green
    Write-Host "Statut: $($response.status)" -ForegroundColor Green
} else {
    Write-Host "ÉCHEC: L'API Health ne répond pas correctement" -ForegroundColor Red
}
