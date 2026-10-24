import { world, ItemStack } from '@minecraft/server';
import { CONFIG_RPG } from '../config/variablesGlobales.js';
import { ObjetoRPG } from '../clases/ObjetoRPG.js';
import { SistemaJugadorRPG } from './sistemaJugadorRPG.js';

export function inicializarGestorLoot() {
    // Al morir cualquier entidad del mundo
    world.afterEvents.entityDie.subscribe((evento) => {
        const victima = evento.deadEntity;
        const asesino = evento.damageSource?.damagingEntity;
        if (!victima || !victima.isValid()) return;

        let nivel = 1;
        let esBoss = false;
        try {
            nivel = victima.getDynamicProperty("nivel_rpg");
            esBoss = victima.getDynamicProperty("es_boss_rpg") || false;
        } catch (_) {}

        if (!nivel || typeof nivel !== "number") return;

        // 1. Si el asesino fue un jugador, otorgarle experiencia RPG para subir su nivel y daño
        if (asesino && asesino.isValid() && asesino.typeId === "minecraft:player") {
            SistemaJugadorRPG.otorgarXPPorVictoria(asesino, nivel, esBoss);
        }

        try {
            const dimension = victima.dimension;
            const ubicacion = victima.location;

            // 2. Escalado de Drops Vanilla Naturales (carne podrida, huesos, pólvora, flechas, etc.)
            // A mayor nivel, multiplica el botín clásico de Minecraft
            soltarDropsVanillaEscalados(victima, dimension, ubicacion, nivel);

            // 3. Probabilidad de Loot Especial RPG (armas raras, épicas, legendarias o libros ilegales)
            const bonoNivel = (nivel / CONFIG_RPG.nivelMaximo) * 0.40;
            const probabilidadTotal = esBoss 
                ? CONFIG_RPG.lootRPG.probabilidadDropBoss 
                : CONFIG_RPG.lootRPG.probabilidadDropBase + bonoNivel;

            if (Math.random() > probabilidadTotal) return;

            // Determinar rareza del drop
            let claveRareza = ObjetoRPG.calcularRarezaPorNivel(nivel);
            if (esBoss && claveRareza === 'COMUN') {
                claveRareza = Math.random() < 0.60 ? 'RARO' : 'EPICO';
            }

            const tablaDrops = CONFIG_RPG.lootRPG.dropsPorRareza[claveRareza];
            if (!tablaDrops || tablaDrops.length === 0) return;

            const cantidadDrops = esBoss ? Math.floor(Math.random() * 2) + 2 : 1;

            for (let i = 0; i < cantidadDrops; i++) {
                const dropElegido = tablaDrops[Math.floor(Math.random() * tablaDrops.length)];
                const factorBoss = esBoss ? 2 : 1;
                const cantidadAleatoria = (Math.floor(Math.random() * (dropElegido.max - dropElegido.min + 1)) + dropElegido.min) * factorBoss;

                const objetoRPG = new ObjetoRPG(
                    dropElegido.item,
                    claveRareza,
                    cantidadAleatoria,
                    dropElegido.nombre,
                    dropElegido.opciones || {}
                );

                const itemStack = objetoRPG.crearItemStack();
                if (itemStack) {
                    dimension.spawnItem(itemStack, ubicacion);
                }
            }
        } catch (error) {
            console.warn(`Error al generar drop RPG: ${error}`);
        }
    });
}

/**
 * Multiplica los drops vanilla naturales de la criatura según su nivel
 */
function soltarDropsVanillaEscalados(victima, dimension, ubicacion, nivel) {
    try {
        // Multiplicador: nivel 1 = 1x, nivel 50 = 3x, nivel 100 = 6x
        const multiplicadorExtra = Math.floor(nivel / 20);
        if (multiplicadorExtra <= 0) return;

        let itemVanilla = null;
        if (victima.typeId.includes("zombie")) itemVanilla = "minecraft:rotten_flesh";
        else if (victima.typeId.includes("skeleton") || victima.typeId.includes("stray")) itemVanilla = "minecraft:bone";
        else if (victima.typeId.includes("creeper")) itemVanilla = "minecraft:gunpowder";
        else if (victima.typeId.includes("spider")) itemVanilla = "minecraft:string";

        if (itemVanilla) {
            const stackExtra = new ItemStack(itemVanilla, multiplicadorExtra);
            dimension.spawnItem(stackExtra, ubicacion);
        }
    } catch (_) {}
}
