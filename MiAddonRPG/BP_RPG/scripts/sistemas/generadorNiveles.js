import { world, EquipmentSlot } from '@minecraft/server';
import { CONFIG_RPG } from '../config/variablesGlobales.js';
import { EntidadRPG } from '../clases/EntidadRPG.js';
import { contarArmaduraEquipada } from './habilidadesBoss.js';
import { SistemaJugadorRPG } from './sistemaJugadorRPG.js';

export function inicializarGeneradorNiveles() {
    // 1. Detección automática al aparecer cualquier entidad del juego o de otros addons
    world.afterEvents.entitySpawn.subscribe((evento) => {
        const entidad = evento.entity;
        if (!entidad || !entidad.isValid()) return;

        if (CONFIG_RPG.familiasOEntidadesExcluidas.includes(entidad.typeId)) return;
        if (entidad.nameTag && entidad.nameTag.includes("[Lv.")) return;

        const componenteSalud = entidad.getComponent("minecraft:health");
        if (!componenteSalud) return;

        try {
            const mobRPG = new EntidadRPG(entidad);
            mobRPG.generarNivel();
            mobRPG.inicializarEstadisticas();
        } catch (error) {
            console.warn(`Error al inicializar mob RPG en spawn: ${error}`);
        }
    });

    // 2. Evento de daño: instakill de Boss, escalado de daño del jugador y absorción RPG
    world.afterEvents.entityHurt.subscribe((evento) => {
        const atacado = evento.hurtEntity;
        const atacante = evento.damageSource?.damagingEntity;

        // --- REGLA 1: Instakill si un Boss golpea a un Jugador desprotegido ---
        if (atacante && atacante.isValid() && atacado && atacado.isValid() && atacado.typeId === "minecraft:player") {
            let esAtacanteBoss = false;
            try {
                esAtacanteBoss = atacante.getDynamicProperty("es_boss_rpg") || false;
            } catch (_) {}

            if (esAtacanteBoss && CONFIG_RPG.configuracionBosses.instakill.activo) {
                const piezasArmadura = contarArmaduraEquipada(atacado);
                const minimoRequerido = CONFIG_RPG.configuracionBosses.instakill.minimoPiezasArmaduraRequeridas;

                if (piezasArmadura < minimoRequerido) {
                    atacado.sendMessage(CONFIG_RPG.configuracionBosses.instakill.mensajeAlerta);
                    atacado.kill();
                    return;
                }
            }
        }

        // --- REGLA 2: Escalado de daño del Jugador RPG y Armas Especiales ---
        let danioTotalExtra = 0;
        if (atacante && atacante.isValid() && atacante.typeId === "minecraft:player") {
            const nivelJugador = SistemaJugadorRPG.obtenerNivel(atacante);
            const multJugador = SistemaJugadorRPG.calcularMultiplicadorDanio(nivelJugador);

            // Leer arma equipada en mano principal
            let multArma = 1.0;
            try {
                const equip = atacante.getComponent("minecraft:equippable");
                const arma = equip ? equip.getEquipment(EquipmentSlot.Mainhand) : null;
                if (arma) {
                    const lore = arma.getLore();
                    if (lore) {
                        if (lore.some(l => l.includes("+150%"))) multArma = 2.5; // Legendario
                        else if (lore.some(l => l.includes("+60%"))) multArma = 1.6; // Épico
                        else if (lore.some(l => l.includes("+25%"))) multArma = 1.25; // Raro
                    }
                }
            } catch (_) {}

            // Calcular daño amplificado
            const danioBase = evento.damage || 1;
            const danioPotenciado = (danioBase * multJugador * multArma);
            danioTotalExtra = Math.max(0, danioPotenciado - danioBase);
        }

        // --- REGLA 3: Actualización de vida RPG al recibir daño ---
        if (!atacado || !atacado.isValid()) return;
        if (!atacado.nameTag || !atacado.nameTag.includes("[Lv.")) return;

        try {
            const componenteSalud = atacado.getComponent("minecraft:health");
            if (!componenteSalud) return;

            let nivel = 1;
            let saludMaximaTotal = 20;
            let vidaExtraVirtual = 0;
            let esBoss = false;
            let etiquetasModificadores = "";

            try {
                nivel = atacado.getDynamicProperty("nivel_rpg") || 1;
                saludMaximaTotal = atacado.getDynamicProperty("salud_maxima_rpg") || 20;
                vidaExtraVirtual = atacado.getDynamicProperty("vida_extra_virtual_rpg") ?? 0;
                esBoss = atacado.getDynamicProperty("es_boss_rpg") || false;
                
                const modsGuardados = atacado.getDynamicProperty("modificadores_rpg");
                if (modsGuardados) {
                    const parsed = JSON.parse(modsGuardados);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        etiquetasModificadores = " " + parsed.join(" ");
                    }
                }
            } catch (_) {}

            // Daño recibido = daño del golpe vanilla + daño extra calculado por el nivel y arma del jugador
            const danioTotalEfectivo = (evento.damage || 0) + danioTotalExtra;

            // Manejo de absorción virtual
            if (vidaExtraVirtual > 0) {
                if (vidaExtraVirtual >= danioTotalEfectivo) {
                    vidaExtraVirtual -= danioTotalEfectivo;
                    const restaurar = Math.min(componenteSalud.defaultValue, componenteSalud.currentValue + (evento.damage || 0));
                    componenteSalud.setCurrentValue(restaurar);
                } else {
                    const sobrante = danioTotalEfectivo - vidaExtraVirtual;
                    vidaExtraVirtual = 0;
                    const restaurar = Math.max(1, componenteSalud.currentValue + (evento.damage || 0) - sobrante);
                    componenteSalud.setCurrentValue(restaurar);
                }

                try {
                    atacado.setDynamicProperty("vida_extra_virtual_rpg", vidaExtraVirtual);
                } catch (_) {}
            }

            const vidaActual = Math.max(0, Math.ceil(componenteSalud.currentValue + vidaExtraVirtual));

            // Actualizar etiqueta visual
            let colorNivel = "§a";
            if (nivel >= 50) colorNivel = "§e";
            if (nivel >= 80) colorNivel = "§c";

            const nombreOriginal = atacado.typeId.split(":")[1];
            const multDanioBase = esBoss 
                ? CONFIG_RPG.configuracionBosses.multiplicadorDanioBoss 
                : CONFIG_RPG.multiplicadorDanio;
            const factorDanio = (1 + (nivel * multDanioBase)).toFixed(1);
            const prefijoBoss = esBoss ? CONFIG_RPG.configuracionBosses.prefijoBoss : "";

            const linea1 = `${prefijoBoss}${colorNivel}[Lv. ${nivel}] §f${nombreOriginal}${etiquetasModificadores}`;
            const linea2 = `§c❤ ${vidaActual}/${saludMaximaTotal} §7| §6⚔ ${factorDanio}x`;

            atacado.nameTag = `${linea1}\n${linea2}`;
        } catch (error) {
            console.warn(`Error al actualizar estado en golpe: ${error}`);
        }
    });

    // 3. Explosión de Creeper Boss escalable por nivel
    world.afterEvents.entityDie.subscribe((evento) => {
        const victima = evento.deadEntity;
        if (!victima || !victima.isValid()) return;
        if (victima.typeId !== "minecraft:creeper") return;

        let esBoss = false;
        let nivel = 1;
        try {
            esBoss = victima.getDynamicProperty("es_boss_rpg") || false;
            nivel = victima.getDynamicProperty("nivel_rpg") || 1;
        } catch (_) {}

        if (!esBoss) return;

        try {
            const confCreeper = CONFIG_RPG.configuracionBosses.creeper;
            const radioEscalado = Math.min(
                confCreeper.radioMaximo,
                confCreeper.radioBase + (nivel / 100) * (confCreeper.radioMaximo - confCreeper.radioBase)
            );

            victima.dimension.createExplosion(victima.location, radioEscalado, {
                causesFire: confCreeper.causaFuego,
                breaksBlocks: true
            });
        } catch (error) {
            console.warn(`Error al generar explosión de Creeper Boss: ${error}`);
        }
    });
}
