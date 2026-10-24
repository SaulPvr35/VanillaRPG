# Script de empaquetado automático para Minecraft Bedrock
param(
    [string]$Salida = "MiAddonRPG.mcaddon"
)

Write-Host "Generando paquete .mcaddon..." -ForegroundColor Cyan

if (Test-Path $Salida) {
    Remove-Item $Salida -Force
}

$zipTemp = "$Salida.zip"
if (Test-Path $zipTemp) {
    Remove-Item $zipTemp -Force
}

Compress-Archive -Path "MiAddonRPG/BP_RPG", "MiAddonRPG/RP_RPG" -DestinationPath $zipTemp
Rename-Item -Path $zipTemp -NewName $Salida -Force

Write-Host "¡Completado! Archivo generado: $Salida" -ForegroundColor Green
