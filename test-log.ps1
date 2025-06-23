#!/usr/bin/env pwsh
# Script PowerShell pour tester les API migrées vers App Router et enregistrer les résultats

$baseUrl = "http://localhost:3000"
$logFile = "api-test-results.txt"

# Vider le fichier log
"Test des API migrées - $(Get-Date)" | Out-File -FilePath $logFile

function Test-Api {
    param (
        [string]$Method,
        [string]$Endpoint,
        [string]$Description
    )

    $fullUrl = "$baseUrl$Endpoint"
    
    try {
        $response = Invoke-RestMethod -Uri $fullUrl -Method $Method -ErrorAction Stop
        $success = "SUCCÈS: $Description"
        $success | Out-File -FilePath $logFile -Append
        
        $responseInfo = "  - Type de réponse: $($response.GetType().Name)"
        if ($response -is [System.Array]) {
            $responseInfo += ", Nombre d'éléments: $($response.Count)"
        }
        $responseInfo | Out-File -FilePath $logFile -Append
    }
    catch {
        $error = "ÉCHEC: $Description - $($_.Exception.Message)"
        $error | Out-File -FilePath $logFile -Append
    }
    
    "" | Out-File -FilePath $logFile -Append
}

# Tester les API publiques principales
"=== APIs PUBLIQUES ===" | Out-File -FilePath $logFile -Append
Test-Api -Method "GET" -Endpoint "/api/programs/" -Description "Liste des programmes"
Test-Api -Method "GET" -Endpoint "/api/articles/" -Description "Liste des articles"
Test-Api -Method "GET" -Endpoint "/api/comments/" -Description "Liste des commentaires"
Test-Api -Method "GET" -Endpoint "/api/health/" -Description "État de l'application"

"=== TESTS TERMINÉS - VOIR api-test-results.txt POUR LES RÉSULTATS ===" | Write-Host -ForegroundColor Cyan
