// This is the main JavaScript file for your Resonance Zero SRP system.
// It will be loaded when your system is active in Foundry VTT.

/**
 * Extend the basic ActorSheet for Resonance Zero SRP.
 * @extends {ActorSheet}
 */
export class ResonanceZeroSrpActorSheet extends foundry.appv1.sheets.ActorSheet {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["resonance-zero-srp", "sheet", "actor"],
            template: "systems/resonance-zero-srp/templates/character-sheet.html", // Correct template path
            width: 600,
            height: 800, // Adjusted height to accommodate new sections
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
        });
    }

    /** @override */
    async getData() {
        const data = await super.getData(); // Use await with super.getData()

        // Make system data available directly for easier access in template
        data.system = data.actor.system;

        // Calculate Health Bar Width
        const health = data.actor.system.attributes.health;
        data.healthBarWidth = `${(health.value / health.max) * 100}%`;

        // Calculate Resonance Bar Width
        const resonance = data.actor.system.resources.resonance;
        data.resonanceBarWidth = `${(resonance.value / Math.max(1, resonance.max)) * 100}%`; // Math.max(1, ...) to prevent division by zero

        // Calculate Skill Points Bar Width
        const skillPoints = data.actor.system.resources.skillPoints;
        data.skillPointsBarWidth = `${(skillPoints.value / Math.max(1, skillPoints.max)) * 100}%`; // Math.max(1, ...) to prevent division by zero

        // Add roll data for convenience (keeping this from your original code, though unused for now)
        data.rollData = {}; 

        // console.log("Data sent to character-sheet.html:", data); // Uncomment for debugging

        return data;
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html); // Always call the superclass method first

        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;

        // Health control buttons
        html.find(".health-control-button").click(this._onResourceControl.bind(this));

        // Resonance control buttons (using the generic resource handler)
        html.find(".resonance-control-button").click(this._onResourceControl.bind(this));

        // Skill Points control buttons (using the generic resource handler)
        html.find(".skill-points-control-button").click(this._onResourceControl.bind(this));

        // Fate card flip button
        html.find(".fate-flip-button").click(this._onFlipFate.bind(this));

        // Keep your original methods for skills, relationships, and items if their HTML elements are active.
        // html.find('.skill-checkbox').change(this._onSkillToggle.bind(this));
        // html.find('.add-relationship').on('click', this._onAddRelationship.bind(this));
        // html.find('.remove-relationship').on('click', this._onRemoveRelationship.bind(this));
        // html.find('.item-create').click(this._onItemCreate.bind(this));
        // html.find('.item-edit').click(this._onItemEdit.bind(this));
        // html.find('.item-delete').click(this._onItemDelete.bind(this));
    }

    /**
     * Generic handler for resource control buttons (health, resonance, skill points).
     * This method handles incrementing or decrementing a resource's value within its min/max bounds.
     * @param {Event} event The click event.
     * @private
     */
    async _onResourceControl(event) {
        event.preventDefault();

        const button = event.currentTarget;
        const action = button.dataset.action; // e.g., 'decreaseHealth', 'increaseResonance', 'decreaseSkillPoints'

        // Determine which resource is being affected based on the data-action
        let resourcePath;
        if (action.includes("Health")) resourcePath = "attributes.health";
        else if (action.includes("Resonance")) resourcePath = "resources.resonance";
        else if (action.includes("SkillPoints")) resourcePath = "resources.skillPoints";
        else return; // Should not happen if data-action attributes are correctly assigned in HTML

        // Get the current resource object from the actor's data using its path
        const resource = foundry.utils.getProperty(this.actor.system, resourcePath);

        let newValue = resource.value; // Start with the current value

        // Determine the new value based on the action (increase or decrease)
        if (action.startsWith("increase")) {
            newValue = Math.min(resource.value + 1, resource.max); // Increment, but not above max
        } else if (action.startsWith("decrease")) {
            newValue = Math.max(resource.value - 1, resource.min); // Decrement, but not below min
        }

        // Update the actor's data for the specific resource
        // The square brackets `[]` create a dynamic property name for the update object
        await this.actor.update({ [`system.${resourcePath}.value`]: newValue });
    }

    /**
     * Handle click events for the fate card flip button.
     * Toggles the 'isFlippedToNegative' boolean property of the fate card.
     * @param {Event} event The click event.
     * @private
     */
    async _onFlipFate(event) {
        event.preventDefault();

        // Get the current state of the fate card
        const currentFateState = this.actor.system.fate.isFlippedToNegative;
        
        // Update the actor's data to toggle the state
        await this.actor.update({ "system.fate.isFlippedToNegative": !currentFateState });
    }

    // Keeping your original methods for skills, relationships, and items for future use.
    // They are not directly wired to new HTML elements in this step, but the methods are functional.

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
// Keeping this as is, as it's for items and not the current focus.
class ResonanceZeroItemSheet extends foundry.appv1.sheets.ItemSheet {
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


// --- Foundry Hooks ---
// All system initialization and ready hooks are consolidated here for clarity and proper execution order.
Hooks.once("init", async function() {
    console.log("Resonance Zero SRP | Initializing system...");

    // Register custom system settings (if you have any later)
    game.settings.register("resonance-zero-srp", "solitaireDeckSeed", {
        name: "Solitaire Deck Seed",
        hint: "A seed for the solitaire deck randomization. Leave blank for random.",
        scope: "world", // This setting applies to the specific world
        config: true, // Show this setting in the Foundry settings menu
        type: String,
        default: ""
    });

    // Register actor sheets
    // Unregister the default sheet if it was previously registered under 'core' to avoid conflicts
    foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet); 
    // Register your custom actor sheet for 'character' type actors
    foundry.documents.collections.Actors.registerSheet("resonance-zero-srp", ResonanceZeroSrpActorSheet, {
        types: ["character"], // Apply this sheet only to 'character' actors
        makeDefault: true,   // Make it the default sheet for 'character'
        label: "Resonance Zero SRP Character Sheet"
    });

    // Register item sheets
    // Unregister the default item sheet if needed
    foundry.documents.collections.Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);
    // Register your custom item sheet for 'item' type items
    foundry.documents.collections.Items.registerSheet("resonance-zero-srp", ResonanceZeroItemSheet, {
        types: ["item"], // This sheet will be used for 'item' type items
        makeDefault: true, // Make this the default sheet for new items
        label: "Resonance Zero SRP Item Sheet"
    });

    // Preload Handlebars templates (essential for your HTML sheet rendering)
    const templatePaths = [
        "systems/resonance-zero-srp/templates/character-sheet.html",
        "systems/resonance-zero-srp/templates/item-sheet.hbs" // Assuming this is your item sheet template
        // Add other templates here like dialogs, etc.
    ];
    await foundry.applications.handlebars.loadTemplates(templatePaths);

    // Register custom Handlebars helpers (optional, but useful for template logic)
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

// This hook runs once Foundry VTT is fully initialized and ready.
Hooks.on("ready", function() {
    console.log("Resonance Zero SRP | System Ready!");
});