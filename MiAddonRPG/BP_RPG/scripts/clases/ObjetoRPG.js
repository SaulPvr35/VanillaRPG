import { ItemStack } from '@minecraft/server';
import { CONFIG_RPG } from '../config/variablesGlobales.js';

export class ObjetoRPG {
    /**
     * @param {string} idItem Identificador del item de Minecraft (ej: 'minecraft:iron_sword')
     * @param {keyof typeof CONFIG_RPG.rarezas} rareza Clave de rareza
     * @param {number} cantidad Cantidad de items
     * @param {string} [nombrePersonalizado] Nombre descriptivo
     * @param {object} [opcionesEspeciales] Opciones de encantamientos ilegales o efectos
     */
    constructor(idItem, rareza = 'COMUN', cantidad = 1, nombrePersonalizado = null, opcionesEspeciales = {}) {
        this.idItem = idItem;
        this.rareza = CONFIG_RPG.rarezas[rareza] || CONFIG_RPG.rarezas.COMUN;
        this.cantidad = Math.max(1, cantidad);
        this.nombrePersonalizado = nombrePersonalizado;
        this.opcionesEspeciales = opcionesEspeciales;
    }

    /**
     * Determina la rareza correspondiente a un nivel de mob o cofre
     * @param {number} nivel 
     * @returns {keyof typeof CONFIG_RPG.rarezas}
     */
    static calcularRarezaPorNivel(nivel) {
        const azar = Math.random();
        if (nivel >= 85) {
            if (azar < 0.35) return 'LEGENDARIO';
            if (azar < 0.75) return 'EPICO';
            return 'RARO';
        } else if (nivel >= 50) {
            if (azar < 0.12) return 'LEGENDARIO';
            if (azar < 0.45) return 'EPICO';
            return 'RARO';
        } else if (nivel >= 25) {
            if (azar < 0.20) return 'EPICO';
            if (azar < 0.60) return 'RARO';
            return 'COMUN';
        } else {
            if (azar < 0.15) return 'RARO';
            return 'COMUN';
        }
    }

    /**
     * Crea un ItemStack con componente de encantamiento nativo real de Minecraft (enchantable)
     * y lore descriptivo
     * @returns {ItemStack|null}
     */
    crearItemStack() {
        try {
            const item = new ItemStack(this.idItem, this.cantidad);
            const titulo = this.nombrePersonalizado || item.typeId.split(':')[1];
            item.nameTag = `${this.rareza.color}${titulo} §r§8[${this.rareza.nombre}]`;

            const lore = [
                `§7Rareza: ${this.rareza.color}${this.rareza.nombre}`,
                `§8Objeto Arcano de Aventura`
            ];

            // 1. Aplicar Encantamiento Nativo Real de Bedrock
            if (this.opcionesEspeciales.encantamientoIlegal) {
                const enc = this.opcionesEspeciales.encantamientoIlegal;
                try {
                    const compEnchant = item.getComponent("minecraft:enchantable");
                    if (compEnchant) {
                        compEnchant.addEnchantment({
                            type: enc.idNativo,
                            level: enc.nivelNumerico
                        });
                    }
                } catch (e) {
                    // Si el motor rechaza por encima del límite vanilla, se respalda visualmente en Lore
                }
                lore.push(`§d✦ Encantamiento: §f${enc.nombre} ${enc.nivelRomano} §7(Nativo)`);
            }

            // 2. Bonos de Daño según Rareza
            if (this.idItem.includes("sword") || this.idItem.includes("axe")) {
                let bonoDanio = "+0%";
                if (this.rareza.id === "raro") bonoDanio = "+25% Daño Físico";
                if (this.rareza.id === "epico") bonoDanio = "+60% Daño Físico";
                if (this.rareza.id === "legendario") bonoDanio = "+150% Daño Físico";
                lore.push(`§c⚔ ${bonoDanio}`);
            }

            // 3. Habilidades Únicas para Items Legendarios
            if (this.rareza.id === "legendario") {
                lore.push("§6★ Efecto Único: §eIrrompibilidad Absoluta (100%)");
                if (this.idItem.includes("pickaxe")) {
                    lore.push("§b★ Excavación Sísmica: §3Minería en Área 3x3");
                }
            }

            item.setLore(lore);
            return item;
        } catch (error) {
            console.warn(`Error al instanciar ItemStack RPG (${this.idItem}): ${error}`);
            return null;
        }
    }
}
