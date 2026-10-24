import { world, system, EquipmentSlot } from '@minecraft/server';
import { CONFIG_RPG } from '../config/variablesGlobales.js';

// Registro de timestamps para el cooldown de teletransporte de cada Boss
const ultimoTeletransporteBoss = new Map();

/**
 * Cuenta cuántas piezas de armadura tiene equipadas un jugador
 * @param {import('@minecraft/server').Player} jugador
 * @returns {number}
 */
export function contarArmaduraEquipada(jugador) {
    if (!jugador || !jugador.isValid()) return 0;
    const equipable = jugador.getComponent("minecraft:equippable");
    if (!equipable) return 0;

    let piezas = 0;
    const slots = [
        EquipmentSlot.Head,
        EquipmentSlot.Chest,
        EquipmentSlot.Legs,
        EquipmentSlot.Feet
    ];

    for (const slot of slots) {
        const item = equipable.getEquipment(slot);
        if (item) piezas++;
    }
    return piezas;
}

/**
 * Inicializa el bucle periódico de IA y habilidades de los Bosses
 */
export function inicializarSistemaHabilidadesBoss() {
    system.runInterval(() => {
        const sobremundo = world.getDimension("overworld");
        if (!sobremundo) return;

        // Iterar dimensiones activas
        const dimensiones = ["overworld", "nether", "the_end"];
        for (const idDim of dimensiones) {
            try {
                const dim = world.getDimension(idDim);
                if (!dim) continue;

                // Buscar entidades vivas que sean Bosses
                for (const tipoMob of CONFIG_RPG.mobsCandidatosBoss) {
                    let entidades;
                    try {
                        entidades = dim.getEntities({ type: tipoMob });
                    } catch (_) {
                        continue;
                    }

                    for (const entidad of entidades) {
                        if (!entidad || !entidad.isValid()) continue;

                        let esBoss = false;
                        let nivel = 1;
                        try {
                            esBoss = entidad.getDynamicProperty("es_boss_rpg") || false;
                            nivel = entidad.getDynamicProperty("nivel_rpg") || 1;
                        } catch (_) {}

                        if (!esBoss) continue;

                        // Ejecutar comportamiento especial del Boss
                        procesarHabilidadesBoss(entidad, dim, nivel);
                    }
                }
            } catch (error) {
                // Dimensión no cargada o sin jugadores
            }
        }
    }, CONFIG_RPG.configuracionBosses.intervaloHabilidadesTicks);
}

/**
 * Procesa teletransportación, auras y tácticas agresivas
 */
function procesarHabilidadesBoss(boss, dimension, nivel) {
    try {
        const locBoss = boss.location;
        const rango = CONFIG_RPG.configuracionBosses.rangoDeteccionJugadores;

        // Buscar jugadores cercanos
        const jugadores = dimension.getPlayers({
            location: locBoss,
            maxDistance: rango
        });

        if (!jugadores || jugadores.length === 0) return;

        // Elegir al jugador más cercano
        const jugadorObjetivo = jugadores[0];
        const distSq = Math.pow(jugadorObjetivo.location.x - locBoss.x, 2) + 
                       Math.pow(jugadorObjetivo.location.z - locBoss.z, 2);

        const ahora = Date.now();
        const idBoss = boss.id;
        const ultimoTp = ultimoTeletransporteBoss.get(idBoss) || 0;
        const cooldownMs = CONFIG_RPG.configuracionBosses.cooldownTeletransporteSegundos * 1000;

        // Habilidad 1: Teletransportarse hacia el jugador si está huyendo o lejos (> 7 bloques)
        if (distSq > 49 && (ahora - ultimoTp) >= cooldownMs) {
            ultimoTeletransporteBoss.set(idBoss, ahora);

            // Calcular posición a espaldas o al lado del jugador
            const targetLoc = {
                x: jugadorObjetivo.location.x + (Math.random() * 2 - 1),
                y: jugadorObjetivo.location.y,
                z: jugadorObjetivo.location.z + (Math.random() * 2 - 1)
            };

            // Efecto visual/partículas de teletransporte
            try {
                dimension.spawnParticle("minecraft:portal_directional_emitter", locBoss);
                boss.teleport(targetLoc, { dimension });
                dimension.spawnParticle("minecraft:dragon_destroy_block", targetLoc);
                
                // Mensaje amenazante al jugador
                jugadorObjetivo.sendMessage(`§5⚠ ¡Un Boss de Lv. ${nivel} se ha teletransportado hacia ti!`);
            } catch (_) {}
        }

        // Habilidad 2: Aura debilitante si el Boss es de nivel alto (>= 50)
        if (nivel >= 50 && distSq < 36) { // Menos de 6 bloques
            jugadorObjetivo.addEffect("slowness", 60, { amplifier: 1, showParticles: true });
            jugadorObjetivo.addEffect("blindness", 40, { amplifier: 0, showParticles: false });
        }
    } catch (error) {
        console.warn(`Error en procesarHabilidadesBoss: ${error}`);
    }
}
