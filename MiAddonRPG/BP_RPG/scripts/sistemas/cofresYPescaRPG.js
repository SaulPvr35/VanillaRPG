import { world } from '@minecraft/server';
import { CONFIG_RPG } from '../config/variablesGlobales.js';
import { ObjetoRPG } from '../clases/ObjetoRPG.js';

// Coordenadas de cofres ya enriquecidos para no duplicar botín infinitamente
const cofresEnriquecidos = new Set();

/**
 * Inicializa la generación natural de botín RPG en Cofres del Mundo y Pesca
 */
export function inicializarCofresYPescaRPG() {
    // 1. Generación de Botín Arcano en Cofres descubiertos
    world.beforeEvents.playerInteractWithBlock.subscribe((evento) => {
        const bloque = evento.block;
        const jugador = evento.player;

        if (!bloque || !jugador || !jugador.isValid()) return;
        if (!bloque.typeId.includes("chest") && !bloque.typeId.includes("barrel") && !bloque.typeId.includes("shulker_box")) return;

        const clavePos = `${bloque.dimension.id}_${bloque.location.x}_${bloque.location.y}_${bloque.location.z}`;
        if (cofresEnriquecidos.has(clavePos)) return;
        cofresEnriquecidos.add(clavePos);

        // Probabilidad de que este cofre descubierto contenga botín RPG
        if (Math.random() > CONFIG_RPG.cofresYPescaRPG.probabilidadCofreGenerarLoot) return;

        // Intentar agregar un item RPG al inventario del cofre
        try {
            const inventario = bloque.getComponent("minecraft:inventory");
            if (!inventario || !inventario.container) return;

            const contenedor = inventario.container;
            const slotVacio = contenedor.emptySlotsCount;
            if (slotVacio <= 0) return;

            const itemGenerado = generarItemAleatorioSegunProbabilidad();
            if (itemGenerado) {
                contenedor.addItem(itemGenerado);
            }
        } catch (_) {}
    });

    // 2. Pesca RPG: cuando un jugador pesca un pez o tesoro, puede obtener un libro arcano o arma
    // Se detecta mediante el uso de la caña de pescar y su interacción
    world.afterEvents.itemUse.subscribe((evento) => {
        const itemUsado = evento.itemStack;
        const jugador = evento.source;

        if (!jugador || !jugador.isValid() || !itemUsado || itemUsado.typeId !== "minecraft:fishing_rod") return;

        // Probabilidad baja y balanceada de pescar un Tesoro Arcano RPG (8%)
        if (Math.random() < CONFIG_RPG.cofresYPescaRPG.probabilidadPescaLoot) {
            const itemTesoro = generarItemAleatorioSegunProbabilidad();
            if (itemTesoro) {
                try {
                    jugador.dimension.spawnItem(itemTesoro, jugador.location);
                    jugador.sendMessage("§6🎣 ¡Has pescado un Tesoro Arcano de las profundidades!");
                    jugador.playSound("random.orb", { pitch: 1.2, volume: 1.0 });
                } catch (_) {}
            }
        }
    });
}

/**
 * Genera un item RPG (Raro, Épico o Legendario) según probabilidades de tesoro
 * @returns {import('@minecraft/server').ItemStack|null}
 */
function generarItemAleatorioSegunProbabilidad() {
    const azar = Math.random();
    let rarezaClave = 'RARO';

    if (azar < CONFIG_RPG.cofresYPescaRPG.probabilidadLegendario) {
        rarezaClave = 'LEGENDARIO'; // 4% extremadamente difícil
    } else if (azar < (CONFIG_RPG.cofresYPescaRPG.probabilidadLegendario + CONFIG_RPG.cofresYPescaRPG.probabilidadEpico)) {
        rarezaClave = 'EPICO'; // 18%
    } else {
        rarezaClave = 'RARO'; // 45%
    }

    const tablaDrops = CONFIG_RPG.lootRPG.dropsPorRareza[rarezaClave];
    if (!tablaDrops || tablaDrops.length === 0) return null;

    const elegido = tablaDrops[Math.floor(Math.random() * tablaDrops.length)];
    const cantidad = Math.floor(Math.random() * (elegido.max - elegido.min + 1)) + elegido.min;

    const objeto = new ObjetoRPG(
        elegido.item,
        rarezaClave,
        cantidad,
        elegido.nombre,
        elegido.opciones || {}
    );

    return objeto.crearItemStack();
}
