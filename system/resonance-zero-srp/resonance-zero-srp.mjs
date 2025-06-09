// resonance-zero-srp.mjs

// This is the main JavaScript file for your Resonance Zero SRP system.
// It will be loaded when your system is active in Foundry VTT.

// Import the Character Creation Wizard Sheet
import { CharacterCreationWizardSheet } from "./scripts/CharacterCreationWizardSheet-safe.mjs";

/**
 * Extend the basic ActorSheet for Resonance Zero SRP.
 * This will serve as your *standard* character sheet once creation is complete.
 * @extends {ActorSheet}
 */
export class ResonanceZeroSrpActorSheet extends foundry.appv1.sheets.ActorSheet {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["resonance-zero-srp", "sheet", "actor"],
            template: "systems/resonance-zero-srp/templates/character-sheet.html", // Correct template path for your standard sheet
            width: 720, // Adjusted width for better layout
            height: 800, // Adjusted height to accommodate new sections
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
        });
    }

    /** @override */
    // async getData() {
    //     const data = await super.getData();
    //     data.system = data.actor.system || {};

    //     // Ensure character creation wizard state exists based on template.json structure
    //     // This is important if an actor might not have the full template.json structure yet.
    //     // data.system._characterCreation = data.system._characterCreation || {
    //     // inProgress: false,
    //     // currentStep: "profile", // Use string name for consistency
    //     // completedSteps: {
    //     // profile: false, cardAllocation: false, attributesDisplay: false,
    //     // skillAllocation: false, resonanceAllocation: false, gearAllocation: false, fateCardDisplay: false
    //     // },
    //     // profile: { concept: "", background: "", motivation: "", trouble: "" },
    //     // drawnCards: [],
    //     // allocatedCards: { attributes: [], skills: [], resonances: [], gear: [], fate: [] },
    //     // pointPools: { skill: 0, resonance: 0, gear: 0 },
    //     // skillAllocations: {
    //     // social: { negotiation: 0, deception: 0, leadership: 0, empathy: 0, persuasion: 0 },
    //     // physical: { endurance: 0, acrobatics: 0, combat: { blade: 0, unarmed: 0, ranged: 0 }, evasion: 0, stealth: 0 },
    //     // spiritual: { resilience: 0, meditation: 0, mysticism: { ritualKnowledge: 0, channeling: 0 }, dreamwalking: 0 },
    //     // intellectual: { research: 0, deduction: 0, engineering: 0, translation: 0, tacticalAnalysis: 0 }
    //     // },
    //     // resonanceAllocations: {
    //     // echoOfPossibility: false, realityAnchor: false, phaseDrift: false, voidResonance: false, fatebinder: false,
    //     // fracturedReflex: false, mnemonicTransference: false, whisperOfThePast: false, chronoFlux: false,
    //     // confluxAdaptation: false, uniqueResonancePower: ""
    //     // },
    //     // gearAllocations: []
    //     // };


    //     // Ensure profile exists (using system.profile for consistency with template.json's base)
    //     // data.system.profile = data.system.profile || {};
    //     // const defaultProfile = {
    //     // concept: "",
    //     // background: "", // Added background for consistency with template.json
    //     // motivation: "",
    //     // trouble: ""
    //     // };
    //     // data.system.profile = foundry.utils.mergeObject(defaultProfile, data.system.profile);

    //     // Ensure health, strain, and fragmented exist at the root of system
    //     // data.system.health = data.system.health || { value: 4, max: 4 };
    //     // data.system.strain = data.system.strain || { value: 0, max: 10 }; // Corrected strain max
    //     // data.system.fragmented = data.system.fragmented ?? false;

    //     // Ensure pools exist
    //     // data.system.pools = data.system.pools || {};
    //     // const defaultPools = {
    //     // stress: { value: 0, max: 10 }, // Corrected stress max
    //     // experience: { value: 0, max: null } // Experience has no fixed max, or can be set to null
    //     // };
    //     // data.system.pools = foundry.utils.mergeObject(defaultPools, data.system.pools);

    //     // Ensure attributes exist
    //     // data.system.attributes = data.system.attributes || {};
    //     // const defaultAttributes = {
    //     // physical: { rank: 1, suit: "clubs", min: 1, max: 4 }, // Changed suit to lowercase as per template.json
    //     // social: { rank: 1, suit: "hearts", min: 1, max: 4 },
    //     // spiritual: { rank: 1, suit: "diamonds", min: 1, max: 4 },
    //     // intellectual: { rank: 1, suit: "spades", min: 1, max: 4 }
    //     // };
    //     // Merge attributes, ensuring to preserve existing data but add defaults
    //     // data.system.attributes = foundry.utils.mergeObject(defaultAttributes, data.system.attributes);


    //     // Ensure skills exist and initialize nested objects
    //     // const defaultSkills = {
    //     // social: { negotiation: 0, deception: 0, leadership: 0, empathy: 0, persuasion: 0 },
    //     // physical: { endurance: 0, acrobatics: 0, combat: { blade: 0, unarmed: 0, ranged: 0 }, evasion: 0, stealth: 0 },
    //     // spiritual: { resilience: 0, meditation: 0, mysticism: { ritualKnowledge: 0, channeling: 0 }, dreamwalking: 0 },
    //     // intellectual: { research: 0, deduction: 0, engineering: 0, translation: 0, tacticalAnalysis: 0 }
    //     // };

    //     // data.system.skills = data.system.skills || {};
    //     // Deep merge for skills to ensure all nested defaults are applied
    //     // data.system.skills = foundry.utils.mergeObject(defaultSkills, data.system.skills);

    //     // Define skill category labels for display in HBS
    //     // data.skillCategoryLabels = {
    //     // social: "Social",
    //     // physical: "Physical",
    //     // spiritual: "Spiritual",
    //     // intellectual: "Intellectual"
    //     // };

    //     // Define skill labels for display in HBS
    //     // data.skillLabels = {
    //     // Social Skills
    //     // negotiation: "Negotiation",
    //     // deception: "Deception",
    //     // leadership: "Leadership",
    //     // empathy: "Empathy",
    //     // persuasion: "Persuasion",
    //     // Physical Skills
    //     // endurance: "Endurance",
    //     // acrobatics: "Acrobatics",
    //     // evasion: "Evasion",
    //     // stealth: "Stealth",
    //     // Combat Skills (nested under Physical)
    //     // blade: "Blade",
    //     // unarmed: "Unarmed",
    //     // ranged: "Ranged",
    //     // Spiritual Skills
    //     // resilience: "Resilience",
    //     // meditation: "Meditation",
    //     // dreamwalking: "Dreamwalking",
    //     // Mysticism Skills (nested under Spiritual)
    //     // ritualKnowledge: "Ritual Knowledge",
    //     // channeling: "Channeling",
    //     // Intellectual Skills
    //     // research: "Research",
    //     // deduction: "Deduction",
    //     // engineering: "Engineering",
    //     // translation: "Translation",
    //     // tacticalAnalysis: "Tactical Analysis"
    //     // };

    //     // Ensure resonances exist
    //     // const defaultResonances = {
    //     // echoOfPossibility: false,
    //     // realityAnchor: false,
    //     // phaseDrift: false,
    //     // voidResonance: false,
    //     // fatebinder: false,
    //     // fracturedReflex: false,
    //     // mnemonicTransference: false,
    //     // whisperOfThePast: false,
    //     // chronoFlux: false,
    //     // confluxAdaptation: false,
    //     // uniqueResonancePower: ""
    //     // };
    //     // data.system.resonances = foundry.utils.mergeObject(defaultResonances, data.system.resonances || {});

    //     // Ensure description and generalNotes exist
    //     // data.system.description = data.system.description || "";
    //     // data.system.generalNotes = data.system.generalNotes || "";

    //     // Ensure relationships exist
    //     // data.system.relationships = data.system.relationships || [];

    //     // Ensure sundries (gear, armor, weapons, artifacts) exist
    //     // data.system.sundries = data.system.sundries || {
    //     // gear: [], armor: [], weapons: [], artifacts: []
    //     // };
    //     // Merge only if necessary, ensuring arrays are initialized
    //     // data.system.sundries.gear = data.system.sundries.gear || [];
    //     // data.system.sundries.armor = data.system.sundries.armor || [];
    //     // data.system.sundries.weapons = data.system.sundries.weapons || [];
    //     // data.system.sundries.artifacts = data.system.sundries.artifacts || [];


    //     // Ensure fate card exists
    //     // data.system.fate = data.system.fate || {};
    //     // const defaultFate = {
    //     // cardRank: "",
    //     // cardSuit: "",
    //     // isFlippedToNegative: false
    //     // };
    //     // data.system.fate = foundry.utils.mergeObject(defaultFate, data.system.fate);


    //     // Calculate bar widths safely to avoid division by zero (if you still use these, adjust paths)
    //     // data.healthBarWidth = `${(data.system.health.value / Math.max(1, data.system.health.max)) * 100}%`;
    //     // data.strainBarWidth = `${(data.system.strain.value / Math.max(1, data.system.strain.max)) * 100}%`;


    //     // return data;
    //     // }

    async getData() {
        const data = await super.getData();
        data.system = data.actor.system || {};

        // Ensure character creation wizard state exists based on template.json structure
        // This is important if an actor might not have the full template.json structure yet.
        data.system._characterCreation = data.system._characterCreation || {
            inProgress: false, // Default to false for standard sheet
            currentStep: "complete", // Default to "complete" for standard sheet
            completedSteps: {
                profile: false, overview: false, cardAllocation: false, attributesDisplay: false,
                skillAllocation: false, resonanceAllocation: false, gearAllocation: false, fateCardDisplay: false
            },
            profile: { concept: "", background: "", motivation: "" },
            drawnCards: [],
            allocatedCards: { attributes: [], skills: [], resonances: [], gear: [], fate: [] }, // Ensure this structure is always present
            pointPools: { attributes: 0, skills: 0, resonances: 0, gear: 0 },
            skillAllocations: {},
            resonanceAllocations: {},
            gearAllocations: []
        };

        return data;
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html); // Always call the superclass method first

        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;

        // Resource control buttons for Health, Strain, Stress
        html.find(".resource-control-button").click(this._onResourceControl.bind(this));

        // Fate card flip button
        html.find(".fate-flip-button").click(this._onFlipFate.bind(this));

        // Relationship controls
        html.find('.add-relationship').on('click', this._onAddRelationship.bind(this));
        html.find('.remove-relationship').on('click', this._onRemoveRelationship.bind(this));

        // Item controls
        html.find('.item-create').click(this._onItemCreate.bind(this));
        html.find('.item-edit').click(this._onItemEdit.bind(this));
        html.find('.item-delete').click(this._onItemDelete.bind(this));

        // Listener for the "Draw Cards" button (NEW)
        html.find('.draw-cards-button').click(this._onDrawCards.bind(this));
        // Make drawn cards draggable (NEW)
        // Ensure this listener is only active when on the cardAllocation step
        if (this.actor.system._characterCreation.currentStep === "cardAllocation") {
            // Find all draggable cards within the drawn-cards-container
            const draggableCards = html.find('.drawn-cards-container .card-display');
            for (let card of draggableCards) {
                card.setAttribute("draggable", true); // Make them draggable
                card.addEventListener('dragstart', this._onDragStartCard.bind(this));
            }

            // Make allocation areas droppable (NEW)
            const droppableAreas = html.find('.allocation-area .card-slots');
            for (let area of droppableAreas) {
                area.addEventListener('dragover', this._onDragOverCard.bind(this));
                area.addEventListener('drop', this._onDropCard.bind(this));
            }
        }
    }

    /**
     * Generic handler for resource control buttons (health, strain, stress).
     * This method handles incrementing or decrementing a resource's value within its min/max bounds.
     * @param {Event} event The click event.
     * @private
     */
    async _onResourceControl(event) {
        event.preventDefault();

        const button = event.currentTarget;
        const action = button.dataset.action; // e.g., 'increaseHealth', 'decreaseStrain', 'increaseStress'

        // Determine which resource is being affected based on the data-action
        let resourcePath;
        if (action.includes("Health")) resourcePath = "health";
        else if (action.includes("Strain")) resourcePath = "strain";
        else if (action.includes("Stress")) resourcePath = "pools.stress";
        else if (action.includes("Experience")) resourcePath = "pools.experience"; // Add for experience
        else return; // Should not happen if data-action attributes are correctly assigned in HTML

        // Get the current resource object from the actor's data using its path
        const resource = foundry.utils.getProperty(this.actor.system, resourcePath);

        let newValue = resource.value; // Start with the current value

        // Determine the new value based on the action (increase or decrease)
        if (action.startsWith("increase")) {
            newValue = newValue + 1;
            if (resource.max !== undefined && resource.max !== null) { // Check if max exists and is not null
                newValue = Math.min(newValue, resource.max); // Cap at max if defined
            }
        } else if (action.startsWith("decrease")) {
            newValue = newValue - 1;
            if (resource.min !== undefined && resource.min !== null) { // Check if min exists and is not null
                newValue = Math.max(newValue, resource.min); // Floor at min if defined
            } else {
                newValue = Math.max(newValue, 0); // Default floor at 0 if no min defined
            }
        }

        // Update the actor's data for the specific resource
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

    /**
     * Handle adding a new relationship.
     * @param {Event} event The originating click event
     * @private
     */
    _onAddRelationship(event) {
        const currentRelationships = foundry.utils.deepClone(this.actor.system.relationships || []);
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
        const currentRelationships = foundry.utils.deepClone(this.actor.system.relationships || []);
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
            no: () => { },
            defaultYes: false
        });
    }

    /**
     * Creates a standard 52-card deck + 2 Jokers.
     * @returns {Array<Object>} An array of card objects {suit: string, rank: string}
     */
    _createDeck() {
        const suits = ['clubs', 'diamonds', 'hearts', 'spades'];
        const ranks = ['ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king'];
        const deck = [];

        for (const suit of suits) {
            for (const rank of ranks) {
                deck.push({ suit: suit, rank: rank });
            }
        }
        // Add Jokers
        deck.push({ suit: 'wild', rank: 'fool' });
        deck.push({ suit: 'wild', rank: 'joker' });
        return deck;
    }

    /**
     * Handles drawing 10 random cards.
     * @param {Event} event
     * @private
     */
    async _onDrawCards(event) {
        event.preventDefault();
        const deck = this._createDeck();
        const drawnCards = [];

        // Shuffle the deck (Fisher-Yates)
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]]; // Swap
        }

        // Draw 10 cards (or fewer if deck is small)
        for (let i = 0; i < 10 && deck.length > 0; i++) {
            drawnCards.push(deck.pop());
        }

        // Update the actor's data with the drawn cards
        await this.actor.update({ "system._characterCreation.drawnCards": drawnCards });

        // Optional: Re-mark the profile step as complete if it's already done,
        // and allow moving to next step only if cards are drawn
        // For now, assume drawing cards makes the first part of this step 'ready'.
    }

    /**
     * Handle the drag start event for cards.
     * @param {Event} event
     * @private
     */
    _onDragStartCard(event) {
        const cardElement = event.currentTarget;
        const suit = cardElement.dataset.cardSuit;
        const rank = cardElement.dataset.cardRank;
        const cardData = { suit, rank };

        // Store the card data as JSON in the drag event
        event.dataTransfer.setData("text/plain", JSON.stringify(cardData));
        event.dataTransfer.dropEffect = "move"; // Indicate that the item will be moved
    }

    /**
     * Handle the drag over event for allocation areas.
     * @param {Event} event
     * @private
     */
    _onDragOverCard(event) {
        event.preventDefault(); // Essential to allow a drop
        event.dataTransfer.dropEffect = "move";
    }
    /**
     * Handle the drop event for allocation areas.
     * @param {Event} event
     * @private
     */
    async _onDropCard(event) {
        event.preventDefault();
        const droppedCardData = JSON.parse(event.dataTransfer.getData("text/plain"));
        const targetArea = event.currentTarget.closest('.allocation-area'); // Get the parent allocation area
        const allocationType = targetArea.classList[1].replace('-area', ''); // e.g., 'attributes' from 'attributes-area'

        let currentAllocatedCards = foundry.utils.deepClone(this.actor.system._characterCreation.allocatedCards);
        let currentDrawnCards = foundry.utils.deepClone(this.actor.system._characterCreation.drawnCards);

        // Find and remove the card from the drawn cards
        const cardIndexInDrawn = currentDrawnCards.findIndex(c =>
            c.suit === droppedCardData.suit && c.rank === droppedCardData.rank
        );
        if (cardIndexInDrawn > -1) {
            currentDrawnCards.splice(cardIndexInDrawn, 1);

            // Add the card to the target allocation area
            currentAllocatedCards[allocationType].push(droppedCardData);

            // TODO: Implement validation rules here (e.g., max cards per area, suit restrictions for attributes)
            // For now, it just adds. If rules are violated, you'd need to roll back or show error.
            const validationPassed = this._validateAllocation(allocationType, currentAllocatedCards[allocationType], droppedCardData);

            if (validationPassed) {
                // Update actor data
                await this.actor.update({
                    "system._characterCreation.drawnCards": currentDrawnCards,
                    [`system._characterCreation.allocatedCards`]: currentAllocatedCards
                });
                // After update, sheet will re-render and move card visually
            } else {
                // If validation fails, revert the changes or show a warning
                ui.notifications.error(`Invalid allocation for ${allocationType}. Please check the rules.`);
                // You might want to re-add the card to drawnCards here if validation failed
            }
        }
    }

    /**
     * Placeholder for allocation validation rules.
     * You'll expand this with your specific rules.
     * @param {string} type The type of allocation (e.g., 'attributes', 'skills')
     * @param {Array<Object>} currentCardsInArea The array of cards currently in that allocation area
     * @param {Object} newCard The card being dropped
     * @returns {boolean} True if the allocation is valid, false otherwise.
     * @private
     */
    _validateAllocation(type, currentCardsInArea, newCard) {
        switch (type) {
            case 'attributes':
                // Max 4 cards
                if (currentCardsInArea.length >= 4) return false;
                // Only one card of each suit
                if (currentCardsInArea.some(card => card.suit === newCard.suit && newCard.suit !== 'joker')) {
                    ui.notifications.warn(`Attributes can only have one card of each suit (Clubs, Diamonds, Hearts, Spades).`);
                    return false;
                }
                break;
            case 'skills':
                // Max 2 cards
                if (currentCardsInArea.length >= 2) return false;
                break;
            case 'resonances':
                // Max 1 card
                if (currentCardsInArea.length >= 1) return false;
                break;
            case 'gear':
                // Max 2 cards
                if (currentCardsInArea.length >= 2) return false;
                break;
            case 'fate':
                // Max 1 card
                if (currentCardsInArea.length >= 1) return false;
                break;
            default:
                return true; // No specific rules for other types yet
        }
        return true;
    }

}

// -----------------------------------------------------------
// Custom Item Sheet Class
// This class defines the behavior of your item sheet.
// -----------------------------------------------------------
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
Hooks.once("init", async function () {
    console.log("Resonance Zero SRP | Initializing system...");

    // -------------------------------------------------------------------
    // IMPORTANT: REGISTER HANDLEBARS HELPERS *BEFORE* LOADING TEMPLATES
    // -------------------------------------------------------------------
    Handlebars.registerHelper('capitalize', function (str) {
        if (typeof str !== 'string' || str.length === 0) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    });

    Handlebars.registerHelper('includes', function (array, value) {
        if (!Array.isArray(array)) return false;
        return array.includes(value);
    });

    Handlebars.registerHelper('last', function (array) {
        if (!Array.isArray(array) || array.length === 0) return undefined;
        return array[array.length - 1];
    });

    Handlebars.registerHelper('add', function (value1, value2) {
        return value1 + value2;
    });

    Handlebars.registerHelper("range", function (start, end) {
        let result = [];
        for (let i = start; i <= end; i++) {
            result.push(i);
        }
        return result;
    });

    // New helper for checking if a value is an object (for skill iteration)
    Handlebars.registerHelper('isObject', function (value) {
        return typeof value === 'object' && value !== null && !Array.isArray(value);
    });
    // -------------------------------------------------------------------


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
    // It's good practice to unregister the default sheets from 'core' to ensure your sheets are used.
    foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);

    // Register your standard character sheet (ResonanceZeroSrpActorSheet)
    // This will be the default for *existing* characters or those not picked up by preCreateActor logic.
    foundry.documents.collections.Actors.registerSheet("resonance-zero-srp", ResonanceZeroSrpActorSheet, {
        types: ["character"],
        makeDefault: true,
        label: "Resonance Zero SRP Standard Character Sheet"
    });

    // Register your character creation wizard sheet
    // This sheet is NOT made default, as it's conditionally assigned via the preCreateActor hook.
    foundry.documents.collections.Actors.registerSheet("resonance-zero-srp", CharacterCreationWizardSheet, {
        types: ["character"],
        makeDefault: false, // Essential: do NOT make this the automatic default
        label: "Resonance Zero SRP: Character Creation Wizard"
    });

    // Register item sheets
    foundry.documents.collections.Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);
    foundry.documents.collections.Items.registerSheet("resonance-zero-srp", ResonanceZeroItemSheet, {
        types: ["item"],
        makeDefault: true,
        label: "Resonance Zero SRP Item Sheet"
    });

    // Preload Handlebars templates (essential for your HTML sheet rendering)
    const templatePaths = [
        "systems/resonance-zero-srp/templates/character-sheet.html",
        "systems/resonance-zero-srp/templates/item-sheet.hbs",
        "systems/resonance-zero-srp/templates/character-creation-wizard-sheet.hbs",
        // Add your specific wizard step partials
        "systems/resonance-zero-srp/templates/character-creation/wizard-step-0.html", // Profile page
        "systems/resonance-zero-srp/templates/character-creation/wizard-step-1.html", // NEW: Overview page
        "systems/resonance-zero-srp/templates/character-creation/wizard-step-2.html",
        "systems/resonance-zero-srp/templates/character-creation/wizard-step-3.html",
        "systems/resonance-zero-srp/templates/character-creation/wizard-step-4.html",
        "systems/resonance-zero-srp/templates/character-creation/wizard-step-5.html",
        "systems/resonance-zero-srp/templates/character-creation/wizard-step-6.html"
        // You might need to add wizard-step-7.html if fateCardDisplay is step 7
    ];
    await foundry.applications.handlebars.loadTemplates(templatePaths);

    console.log('Resonance Zero SRP | System initialization complete.');
});

// Hook to ensure wizard data is initialized for newly created characters
Hooks.on("preCreateActor", (document, data, options, userId) => {
    // Only apply this logic to 'character' type actors
    if (data.type === "character") {
        // If it's a brand new actor (no _id yet), ensure _characterCreation is set up
        if (!data._id) {
            console.log("preCreateActor: Initializing _characterCreation data for NEW actor.");

            // Define the essential default structure for _characterCreation
            const characterCreationDefaults = {
                inProgress: true, // <--- CRITICAL: Ensure this is true for new actors
                currentStep: "profile",
                completedSteps: {
                    profile: false, cardAllocation: false, attributesDisplay: false,
                    skillAllocation: false, resonanceAllocation: false, gearAllocation: false, fateCardDisplay: false
                },
                profile: { concept: "", background: "", motivation: "", "trouble": "" }, // Ensure profile also gets defaults
                drawnCards: [],
                allocatedCards: { attributes: [], skills: [], resonances: [], gear: [], fate: [] },
                pointPools: { skill: 0, resonance: 0, gear: 0 },
                skillAllocations: {
                    social: { negotiation: 0, deception: 0, leadership: 0, empathy: 0, persuasion: 0 },
                    physical: { endurance: 0, acrobatics: 0, combat: { blade: 0, unarmed: 0, ranged: 0 }, evasion: 0, stealth: 0 },
                    spiritual: { resilience: 0, meditation: 0, mysticism: { ritualKnowledge: 0, channeling: 0 }, dreamwalking: 0 },
                    intellectual: { research: 0, deduction: 0, engineering: 0, translation: 0, tacticalAnalysis: 0 }
                },
                resonanceAllocations: {
                    echoOfPossibility: false, realityAnchor: false, phaseDrift: false, voidResonance: false, fatebinder: false,
                    fracturedReflex: false, mnemonicTransference: false, whisperOfThePast: false, chronoFlux: false,
                    confluxAdaptation: false, uniqueResonancePower: ""
                },
                gearAllocations: []
            };

            // Safely merge these defaults into data.system._characterCreation.
            // This ensures we don't overwrite other data in `data.system` if it exists,
            // and provides a complete _characterCreation structure.
            // Also ensure data.system exists first.
            data.system = data.system || {}; // Initialize data.system if it doesn't exist
            data.system._characterCreation = foundry.utils.mergeObject(characterCreationDefaults, data.system._characterCreation || {});

            console.log("preCreateActor: data.system._characterCreation after forced init:", foundry.utils.deepClone(data.system._characterCreation));

            // **** NEW: Set a flag on the options object to communicate context ****
            options.resonanceZeroNewActorWizard = true;
            console.log("preCreateActor: Setting options.resonanceZeroNewActorWizard = true");
        }
    }
});

// Hook to assign the wizard sheet and render it for newly created characters
Hooks.on("createActor", (actor, options, userId) => {
    // Only apply this logic if the actor was just created by the current user
    if (userId === game.user.id) { // Ensure only the creating user triggers this
        // Check the flag from the options object instead of actor.system or actor._source.system
        const isInWizard = options.resonanceZeroNewActorWizard === true;

        const wizardSheetId = "resonance-zero-srp.CharacterCreationWizardSheet";
        const standardSheetId = "resonance-zero-srp.ResonanceZeroSrpActorSheet";

        console.log(`createActor: Actor "${actor.name}" created.`);
        console.log(`    isInWizard (from options): ${isInWizard}`);
        // Log actor.system directly, not _source for the "live" data.
        console.log(`    Full actor.system._characterCreation:`, foundry.utils.deepClone(actor.system._characterCreation));
        console.log(`    Current Sheet ID: ${actor.sheet.id}`);

        // If it's a character and the wizard is marked as in progress (explicitly true)
        if (actor.type === "character" && isInWizard) {
            // It's possible the default sheet *still* tried to open first, so we tell it to close.
            // Then, we explicitly open the wizard sheet.
            // Adding a small delay can sometimes help with rendering race conditions, but Foundry should handle this.

            // Close any currently open sheet for this actor.
            actor.sheet.close({ render: false }); // Don't render while closing

            // Now, explicitly set the sheet class and render the wizard sheet
            console.log(`createActor: Switching sheet to wizard for "${actor.name}".`);
            actor.setFlag("core", "sheetClass", wizardSheetId);
            actor.sheet.render(true); // Re-render the sheet immediately to show the wizard
            ui.notifications.info(`Starting character creation for ${actor.name}.`);
        } else if (actor.type === "character" && !isInWizard) {
            // If it's a character but the wizard is NOT in progress (e.g., copied, or wizard completed previously)
            // ensure it uses the standard sheet if it's not already.
            if (actor.sheet.id !== standardSheetId) {
                console.log(`createActor: Ensuring standard sheet for "${actor.name}".`);
                actor.setFlag("core", "sheetClass", standardSheetId);
                actor.sheet.render(true);
            } else {
                console.log(`createActor: Actor "${actor.name}" already has standard sheet. No change needed.`);
            }
        }
    }
});

// Hook to switch back to the standard character sheet once the wizard is complete
Hooks.on("updateActor", (actor, changed, options, userId) => {
    // Check if the actor is a character and if the inProgress status was changed from true to false
    // We check changed.system?._characterCreation?.inProgress to see if *this specific update* modified it.
    // Also, ensure the actor's current actual state for inProgress is false.
    if (actor.type === "character" && changed.system?._characterCreation?.inProgress === false && actor.system._characterCreation?.inProgress === false) {
        const standardCharSheetId = "resonance-zero-srp.ResonanceZeroSrpActorSheet"; // Your standard sheet's full ID
        const wizardSheetId = "resonance-zero-srp.CharacterCreationWizardSheet";

        // If the actor is currently using the wizard sheet AND it just completed
        if (actor.sheet.id === wizardSheetId) {
            actor.setFlag("core", "sheetClass", standardCharSheetId);
            actor.sheet.render(true); // Re-render the sheet with the new class
            ui.notifications.info(`Character creation complete for ${actor.name}! Opening standard sheet.`);
        }
    }
});

// This hook runs once Foundry VTT is fully initialized and ready.
Hooks.on("ready", function () {
    console.log("Resonance Zero SRP | System Ready!");
});


// Register the standard character sheet
Actors.registerSheet("resonance-zero-srp", ResonanceZeroSrpActorSheet, {
    types: ["character"],
    makeDefault: true, // Make this the default sheet for character actors
    label: "Resonance Zero SRP Character Sheet"
});

// Register the character creation wizard sheet, but don't make it default
// It will be opened conditionally via a hook
Actors.registerSheet("resonance-zero-srp", CharacterCreationWizardSheet, {
    types: ["character"],
    makeDefault: false, // Not the default sheet
    label: "Resonance Zero SRP Character Creation Wizard"
});

// Hook to modify actor data before creation (preCreateActor)
Hooks.on("preCreateActor", (document, data, options, userId) => {
    // Only apply this logic for newly created "character" actors
    if (data.type === "character") {
        if (!data._id) { // This means it's a brand new actor
            console.log("preCreateActor: Initializing _characterCreation data for NEW actor.");

            // Ensure data.system exists first
            if (!data.system) {
                data.system = {};
            }

            // Ensure _characterCreation exists as an object
            // This is the critical part to ensure Foundry persists it
            if (!data.system._characterCreation || typeof data.system._characterCreation !== 'object') {
                data.system._characterCreation = {};
            }

            // Explicitly set its default values and ensure nested objects/arrays exist
            data.system._characterCreation.inProgress = true;
            data.system._characterCreation.currentStep = "profile";
            data.system._characterCreation.completedSteps = data.system._characterCreation.completedSteps || {
                profile: false, overview: false, cardAllocation: false, attributesDisplay: false,
                skillAllocation: false, resonanceAllocation: false, gearAllocation: false, fateCardDisplay: false
            };
            data.system._characterCreation.profile = data.system._characterCreation.profile || {
                concept: "", background: "", motivation: ""
            };
            data.system._characterCreation.drawnCards = data.system._characterCreation.drawnCards || [];

            // Crucially ensure allocatedCards is an object, and its sub-arrays exist
            data.system._characterCreation.allocatedCards = data.system._characterCreation.allocatedCards || {};
            data.system._characterCreation.allocatedCards.attributes = data.system._characterCreation.allocatedCards.attributes || [];
            data.system._characterCreation.allocatedCards.skills = data.system._characterCreation.allocatedCards.skills || [];
            data.system._characterCreation.allocatedCards.resonances = data.system._characterCreation.allocatedCards.resonances || [];
            data.system._characterCreation.allocatedCards.gear = data.system._characterCreation.allocatedCards.gear || [];
            data.system._characterCreation.allocatedCards.fate = data.system._characterCreation.allocatedCards.fate || [];

            data.system._characterCreation.pointPools = data.system._characterCreation.pointPools || {
                attributes: 0, skills: 0, resonances: 0, gear: 0
            };
            data.system._characterCreation.skillAllocations = data.system._characterCreation.skillAllocations || {};
            data.system._characterCreation.resonanceAllocations = data.system._characterCreation.resonanceAllocations || {};
            data.system._characterCreation.gearAllocations = data.system._characterCreation.gearAllocations || [];


            console.log("preCreateActor: data.system._characterCreation after forced init:", foundry.utils.deepClone(data.system._characterCreation));

            // Set a flag to indicate that the wizard sheet should be opened after creation
            options.resonanceZeroNewActorWizard = true;
        }
    }
});

// Hook to open the character creation wizard sheet after actor creation
Hooks.on("createActor", (actor, options, userId) => {
    // Only apply if this is a newly created character and the wizard flag is set
    if (actor.type === "character" && options.resonanceZeroNewActorWizard) {
        console.log(`createActor: Actor "${actor.name}" created.`);
        console.log(`    isInWizard (from options): ${options.resonanceZeroNewActorWizard}`);
        console.log(`    Full actor.system._characterCreation:`, foundry.utils.deepClone(actor.system._characterCreation));
        console.log(`    Current Sheet ID: ${actor.sheet.id}`);


        // Check if the actor is not already using the wizard sheet (e.g., if a default sheet was assigned first)
        const wizardSheetId = "resonance-zero-srp.CharacterCreationWizardSheet";
        if (actor.sheet.id !== wizardSheetId) {
            console.log(`createActor: Switching sheet to wizard for "${actor.name}".`);
            actor.setFlag("core", "sheetClass", wizardSheetId);
            actor.sheet.render(true); // Re-render the sheet with the new class
            ui.notifications.info(`Starting character creation for ${actor.name}.`);
        } else {
            console.log(`createActor: Actor "${actor.name}" already has wizard sheet. No change needed.`);
        }
    } else if (actor.type === "character") {
        // If it's a character but not a new wizard-driven actor, ensure standard sheet is active
        const standardCharSheetId = "resonance-zero-srp.ResonanceZeroSrpActorSheet";
        if (actor.sheet.id !== standardCharSheetId) {
            console.log(`createActor: Actor "${actor.name}" already has standard sheet. No change needed.`);
        }
    }
});

// Hook to switch back to the standard character sheet once the wizard is complete
Hooks.on("updateActor", (actor, changed, options, userId) => {
    // Check if the actor is a character and if the inProgress status was changed from true to false
    // We check changed.system?._characterCreation?.inProgress to see if *this specific update* modified it.
    // Also, ensure the actor's current actual state for inProgress is false.
    if (actor.type === "character" && changed.system?._characterCreation?.inProgress === false && actor.system._characterCreation?.inProgress === false) {
        const standardCharSheetId = "resonance-zero-srp.ResonanceZeroSrpActorSheet"; // Your standard sheet's full ID
        const wizardSheetId = "resonance-zero-srp.CharacterCreationWizardSheet";

        // If the actor is currently using the wizard sheet AND it just completed
        if (actor.sheet.id === wizardSheetId) {
            actor.setFlag("core", "sheetClass", standardCharSheetId);
            actor.sheet.render(true); // Re-render the sheet with the new class
            ui.notifications.info(`Character creation complete for ${actor.name}! Opening standard sheet.`);
        }
    }
});

// This hook runs once Foundry VTT is fully initialized and ready.
Hooks.on("ready", function () {
    console.log("Resonance Zero SRP | System Ready!");
    // Any other code that needs to run once Foundry is fully initialized goes here.
    // For example, custom UI elements, game settings, etc.
});

// Optionally, if you have a custom 'setup' hook for very early initialization (before 'ready')
Hooks.on("setup", function () {
    console.log("Resonance Zero SRP | Initializing system...");
    // Any system-wide setup that should happen very early, e.g., registering settings
});