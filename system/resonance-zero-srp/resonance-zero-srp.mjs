// This is the main JavaScript file for your Resonance Zero SRP system.
// It will be loaded when your system is active in Foundry VTT.


// Import necessary Foundry classes
// import { ActorSheet } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/documents.mjs"; // Adjust if your types path is different or remove if not using strict types

/**
 * Extend the basic ActorSheet for Resonance Zero SRP.
 * @extends {ActorSheet}
 */
export class ResonanceZeroSrpActorSheet extends ActorSheet {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["resonance-zero-srp", "sheet", "actor"],
            template: "systems/resonance-zero-srp/templates/character-sheet.html",
            width: 600,
            height: 600,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
        });
    }

    /** @override */
    getData() {
        // Retrieve the data to render the sheet
        const context = super.getData();

        // Add roll data for convenience
        context.rollData = {};

        // Return data to the sheet
        return context;
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;

        // Example: Add a click listener for a custom button (if you had one)
        // html.find('.some-button').click(this._onSomeAction.bind(this));
    }

    // Example: Handler for a custom action
    // _onSomeAction(event) {
    //     event.preventDefault();
    //     console.log("Some action was performed!");
    // }
}


// Register the custom sheet when Foundry is ready
Hooks.once("init", async function() {
    console.log("Resonance Zero SRP | Initializing system...");

    // Register custom system settings (if you have any later)
    // game.settings.register("resonance-zero-srp", "someSetting", {
    //     name: "Some Setting",
    //     hint: "A hint for some setting.",
    //     scope: "world",
    //     config: true,
    //     default: false,
    //     type: Boolean
    // });

    // Register actor sheets
    Actors.unregisterSheet("core", ActorSheet); // Unregister the default sheet
    Actors.registerSheet("resonance-zero-srp", ResonanceZeroSrpActorSheet, {
        types: ["character"], // Apply this sheet only to 'character' actors
        makeDefault: true,   // Make it the default sheet for 'character'
        label: "Resonance Zero SRP Character Sheet"
    });

    // Register item sheets (you'll create these later)
    // Items.unregisterSheet("core", ItemSheet);
    // Items.registerSheet("resonance-zero-srp", ResonanceZeroSrpItemSheet, {
    //     types: ["item"],
    //     makeDefault: true,
    //     label: "Resonance Zero SRP Item Sheet"
    // });

    // Preload Handlebars templates (essential for your HTML sheet)
    const templatePaths = [
        "systems/resonance-zero-srp/templates/character-sheet.html"
        // Add other templates here like item sheets, dialogs, etc.
    ];
    await loadTemplates(templatePaths);
});

// You can add more Hooks here, e.g., for combat, chat, etc.
Hooks.on("ready", function() {
    console.log("Resonance Zero SRP | System Ready!");
});



// We use an asynchronous IIFE (Immediately Invoked Function Expression)
// to ensure the DOM is ready and to avoid polluting the global scope.
Hooks.once('init', async function() {
    console.log('Resonance Zero SRP | Initializing system...');

    // -----------------------------------------------------------
    // 1. Define custom data models for your Actors and Items
    //    This tells Foundry what kind of data your characters and items will store.
    // -----------------------------------------------------------

    // Define the data model for Actors (your Player Characters)
    game.system.defineActorModel({
        // Core character details
        concept: { type: String, default: "" },
        motivation: { type: String, default: "" },
        trouble: { type: String, default: "" },

        // Attributes (Numerical values)
        attributes: {
            physical: {
                type: { type: String, default: "Physical", label: "Physical" },
                suit: { type: String, default: "♦", label: "Suit" },
                rank: { type: Number, default: 0, label: "Rank" }
            },
            social: {
                type: { type: String, default: "Social", label: "Social" },
                suit: { type: String, default: "♥", label: "Suit" },
                rank: { type: Number, default: 0, label: "Rank" }
            },
            spiritual: {
                type: { type: String, default: "Spiritual", label: "Spiritual" },
                suit: { type: String, default: "♠", label: "Suit" },
                rank: { type: Number, default: 0, label: "Rank" }
            },
            intellectual: {
                type: { type: String, default: "Intellectual", label: "Intellectual" },
                suit: { type: String, default: "♣", label: "Suit" },
                rank: { type: Number, default: 0, label: "Rank" }
            }
        },

        // Health and Strain
        health: {
            value: { type: Number, default: 10, label: "Current Health" },
            max: { type: Number, default: 10, label: "Max Health" }
        },
        strain: { // Resonant Strain
            value: { type: Number, default: 0, label: "Current Resonant Strain" },
            max: { type: Number, default: 5, label: "Max Resonant Strain" } // Example: Max strain before fragmentation
        },
        fragmented: { type: Boolean, default: false, label: "Fragmented State" },

        // Skills (You'll need a way to represent selected skills, perhaps a list of strings or booleans)
        // For simplicity, let's start with a general skills array.
        skills: {
            type: Array,
            default: [],
            // Example: "Investigation", "Deduction", "Meditation"
            // Later, you can add flags like skill.rank or skill.isProficient
            label: "Skills"
        },

        // Resonances (Powers over fate)
        resonances: {
            echoOfPossibility: { type: Boolean, default: false, label: "Echo of Possibility" },
            chronoFlux: { type: Boolean, default: false, label: "Chrono-Flux" },
            veilPierce: { type: Boolean, default: false, label: "Veil Pierce" },
            resonantOverload: { type: Boolean, default: false, label: "Resonant Overload" },
            // Add more specific data for resonances if needed (e.g., uses per day, cooldowns)
            uniqueResonancePower: { type: String, default: "", label: "Unique Resonance Power" } // For rewards
        },

        // Inventory (references items owned by the actor)
        inventory: {
            type: Array,
            default: [], // Array of item IDs or embedded item data
            label: "Inventory"
        },

        // Relationships (for social rewards)
        relationships: {
            type: Array,
            default: [], // e.g., [{name: "NPC Name", bond: "Strong"}]
            label: "Relationships"
        },

        // Player-specific notes or lore
        notes: { type: String, default: "", label: "Notes" }
    });

    // Define the data model for Items (e.g., Salvaged Supplies, Powerful Artifact)
    game.system.defineItemModel({
        description: { type: String, default: "", label: "Description" },
        // Example properties for different item types
        quantity: { type: Number, default: 1, label: "Quantity" },
        weight: { type: Number, default: 0, label: "Weight" },
        // Add more specific fields for artifacts, cores, keys, etc.
        type: { type: String, default: "generic", label: "Item Type" } // e.g., "supply", "artifact", "key"
    });

    // -----------------------------------------------------------
    // 2. Register your custom sheets
    //    This tells Foundry which Handlebars templates to use for your Actor and Item types.
    // -----------------------------------------------------------

    // Register the custom Actor Sheet
    Actors.registerSheet("resonance-zero-srp", ResonanceZeroActorSheet, {
        types: ["character"], // This sheet will be used for 'character' type actors
        makeDefault: true, // Make this the default sheet for new characters
        label: "Resonance Zero SRP Character Sheet"
    });

    // Register the custom Item Sheet
    Items.registerSheet("resonance-zero-srp", ResonanceZeroItemSheet, {
        types: ["item"], // This sheet will be used for 'item' type items
        makeDefault: true, // Make this the default sheet for new items
        label: "Resonance Zero SRP Item Sheet"
    });

    // -----------------------------------------------------------
    // 3. Register Settings (optional, but good for future expansion)
    //    Allows you to store system-specific configurations.
    // -----------------------------------------------------------
    game.settings.register("resonance-zero-srp", "solitaireDeckSeed", {
        name: "Solitaire Deck Seed",
        hint: "A seed for the solitaire deck randomization. Leave blank for random.",
        scope: "world", // This setting applies to the specific world
        config: true, // Show this setting in the Foundry settings menu
        type: String,
        default: ""
    });

    // -----------------------------------------------------------
    // 4. Register custom Handlebars helpers (optional)
    //    These are like small functions you can use directly in your .hbs templates.
    // -----------------------------------------------------------
    // Example: A helper to capitalize the first letter of a string
    Handlebars.registerHelper('capitalize', function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    });

    Handlebars.registerHelper('includes', function(array, value) {
        if (!Array.isArray(array)) return false;
        return array.includes(value);
    });

    Handlebars.registerHelper('last', function(array) {
        if (!Array.isArray(array) || array.length === 0) return undefined;
        return array[array.length - 1];
    });

    Handlebars.registerHelper('add', function(value1, value2) {
        return value1 + value2;
    });

    console.log('Resonance Zero SRP | System initialization complete.');
});


// -----------------------------------------------------------
// Custom Actor Sheet Class
// This class defines the behavior of your character sheet.
// -----------------------------------------------------------
class ResonanceZeroActorSheet extends ActorSheet {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["resonance-zero-srp", "sheet", "actor"], // CSS classes for the sheet
            template: "systems/resonance-zero-srp/templates/actor-sheet.hbs", // Path to your Handlebars template
            width: 700,
            height: 800,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
        });
    }

    /** @override */
    getData() {
        const data = super.getData();
        // Prepare actor data for the template
        data.system = data.actor.system; // Make system data easily accessible in template

        // Add any additional data preparation here if needed
        data.allSkills = [
            "Acrobatics", "Blades", "Channeling", "Deception", "Deduction", "Dreamwalking",
            "Empathy", "Endurance", "Engineering", "Evasion", "Expression", "Influence",
            "Insight", "Intellect", "Investigation", "Leadership", "Meditation",
            "Negotiation", "Persuasion", "Ranged", "Research", "Resilience", "Rituals",
            "Stealth", "Tactics", "Unarmed", "Willpower"
        ];

        // Organize attributes for display
        data.attributes = {
            physical: data.system.attributes.physical,
            social: data.system.attributes.social,
            spiritual: data.system.attributes.spiritual,
            intellectual: data.system.attributes.intellectual
        };

        return data;
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;

        // Example: Listen for changes to a skill checkbox
        html.find('.skill-checkbox').change(this._onSkillToggle.bind(this));

        // Add/Remove Relationships
        html.find('.add-relationship').on('click', this._onAddRelationship.bind(this));
        html.find('.remove-relationship').on('click', this._onRemoveRelationship.bind(this));

        // Listen for item creation
        html.find('.item-create').click(this._onItemCreate.bind(this));
        // Listen for item editing
        html.find('.item-edit').click(this._onItemEdit.bind(this));
        // Listen for item deletion
        html.find('.item-delete').click(this._onItemDelete.bind(this));
    }

    /**
     * Handle toggling a skill checkbox.
     * @param {Event} event The originating click event
     * @private
     */
    _onSkillToggle(event) {
        const checkbox = event.currentTarget;
        const skillName = checkbox.dataset.skill;
        const currentSkills = this.actor.system.skills;

        if (checkbox.checked) {
            if (!currentSkills.includes(skillName)) {
                currentSkills.push(skillName);
            }
        } else {
            const index = currentSkills.indexOf(skillName);
            if (index > -1) {
                currentSkills.splice(index, 1);
            }
        }
        this.actor.update({ "system.skills": currentSkills });
    }

    /**
     * Handle adding a new relationship.
     * @param {Event} event The originating click event
     * @private
     */
    _onAddRelationship(event) {
        const currentRelationships = duplicate(this.actor.system.relationships || []);
        currentRelationships.push({ name: "", bond: "" });
        this.actor.update({ "system.relationships": currentRelationships });
    }

    /**
     * Handle removing a relationship.
     * @param {Event} event The originating click event
     * @private
     */
    _onRemoveRelationship(event) {
        const indexToRemove = $(event.currentTarget).data('index');
        const currentRelationships = duplicate(this.actor.system.relationships || []);
        currentRelationships.splice(indexToRemove, 1);
        this.actor.update({ "system.relationships": currentRelationships });
    }

    /**
     * Handle creating a new item.
     * @param {Event} event The originating click event
     * @private
     */
    _onItemCreate(event) {
        event.preventDefault();
        const header = event.currentTarget;
        const type = header.dataset.type;
        const itemData = {
            name: `New ${type.capitalize()}`,
            type: type,
            img: `icons/svg/${type}.svg` // Default icon
        };
        return this.actor.createEmbeddedDocuments("Item", [itemData]);
    }

    /**
     * Handle editing an existing item.
     * @param {Event} event The originating click event
     * @private
     */
    _onItemEdit(event) {
        event.preventDefault();
        const itemId = $(event.currentTarget).closest(".item").data("item-id");
        const item = this.actor.items.get(itemId);
        if (item) {
            item.sheet.render(true);
        }
    }

    /**
     * Handle deleting an existing item.
     * @param {Event} event The originating click event
     * @private
     */
    _onItemDelete(event) {
        event.preventDefault();
        const itemId = $(event.currentTarget).closest(".item").data("item-id");
        // Ask for confirmation before deleting
        Dialog.confirm({
            title: "Delete Item",
            content: "<p>Are you sure you want to delete this item?</p>",
            yes: () => this.actor.deleteEmbeddedDocuments("Item", [itemId]),
            no: () => {},
            defaultYes: false
        });
    }
}

// -----------------------------------------------------------
// Custom Item Sheet Class
// This class defines the behavior of your item sheet.
// -----------------------------------------------------------
class ResonanceZeroItemSheet extends ItemSheet {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["resonance-zero-srp", "sheet", "item"], // CSS classes for the sheet
            template: "systems/resonance-zero-srp/templates/item-sheet.hbs", // Path to your Handlebars template
            width: 400,
            height: 300
        });
    }

    /** @override */
    getData() {
        const data = super.getData();
        data.system = data.item.system; // Make system data easily accessible in template
        return data;
    }
}