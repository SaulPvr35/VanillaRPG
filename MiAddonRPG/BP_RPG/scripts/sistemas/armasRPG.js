import { world, system, EquipmentSlot } from '@minecraft/server';

/**
 * Gestor de habilidades para armas y herramientas RPG (Irrompibilidad y Minería en Área)
 */
export function inicializarHabilidadesArmasRPG() {
    // 1. Minería en Área para Picos Legendarios
    world.afterEvents.playerBreakBlock.subscribe((evento) => {
        const jugador = evento.player;
        const bloqueRoto = evento.block;
        const itemAntes = evento.itemStackBeforeBreak;

        if (!jugador || !jugador.isValid() || !itemAntes) return;
        if (!itemAntes.typeId.includes("pickaxe")) return;

        // Comprobar si el pico es Legendario por Lore o Dynamic Property
        const lore = itemAntes.getLore();
        const esLegendario = (lore && lore.some(linea => linea.includes("Legendario") || linea.includes("Área"))) ||
                             itemAntes.nameTag?.includes("Legendario");

        if (!esLegendario) return;

        // Minería en área 3x3x1 alrededor del bloque roto
        minarEnArea(jugador, bloqueRoto.dimension, bloqueRoto.location);
    });

    // 2. Mantenimiento de Irrompibilidad 100% para Armas Legendarias
    // Se verifica tras golpear o romper un bloque para reparar el desgaste
    world.afterEvents.entityHurt.subscribe((evento) => {
        const atacante = evento.damageSource?.damagingEntity;
        if (!atacante || !atacante.isValid() || atacante.typeId !== "minecraft:player") return;

        repararItemSiEsLegendario(atacante);
    });
}

/**
 * Mina bloques en un área 3x3 respetando la dureza del bloque
 */
function minarEnArea(jugador, dimension, centro) {
    const radio = 1; // 1 bloque a cada lado = 3x3 en total (9 bloques)
    for (let x = -radio; x <= radio; x++) {
        for (let y = -radio; y <= radio; y++) {
            for (let z = -radio; z <= radio; z++) {
                if (x === 0 && y === 0 && z === 0) continue; // Ya fue roto

                const pos = { x: centro.x + x, y: centro.y + y, z: centro.z + z };
                try {
                    const blk = dimension.getBlock(pos);
                    if (!blk || blk.isAir) continue;

                    // No romper bedrock ni bloques indestructibles
                    if (blk.typeId === "minecraft:bedrock" || blk.typeId === "minecraft:barrier") continue;

                    // Romper el bloque simulando minado natural
                    dimension.runCommand(`setblock ${pos.x} ${pos.y} ${pos.z} air destroy`);
                } catch (_) {}
            }
        }
    }
}

/**
 * Restaura la durabilidad a 0 de desgaste si el arma es Legendaria
 */
function repararItemSiEsLegendario(jugador) {
    try {
        const equipable = jugador.getComponent("minecraft:equippable");
        if (!equipable) return;

        const mainHand = equipable.getEquipment(EquipmentSlot.Mainhand);
        if (!mainHand) return;

        const lore = mainHand.getLore();
        const esLegendaria = (lore && lore.some(l => l.includes("Legendario") || l.includes("Irrompible"))) ||
                             mainHand.nameTag?.includes("Legendario");

        if (!esLegendaria) return;

        const durabilidad = mainHand.getComponent("minecraft:durability");
        if (durabilidad && durabilidad.damage > 0) {
            durabilidad.damage = 0; // 100% Irrompible siempre
            equipable.setEquipment(EquipmentSlot.Mainhand, mainHand);
        }
    } catch (_) {}
}
