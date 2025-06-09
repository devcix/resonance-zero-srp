// ===============================================
// Core Character Creation Wizard Application Class (scripts/character-creation-wizard.mjs)
// ===============================================

export class ResonanceZeroCharacterCreationWizard extends FormApplication {
    constructor(actor, options = {}) {
        super(actor, options);
        this.actor = actor; // The actor being created/modified
        this.config = this._getWizardConfig(); // Load wizard configuration
    }

    /**
     * Define default options for the application.
     */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "resonance-zero-char-creation-wizard",
            classes: ["resonance-zero-srp", "character-creation-wizard", "sheet"],
            width: 750,
            height: 700,
            resizable: true,
            submitOnChange: true, // Auto-save changes to actor data when inputs change
            submitOnClose: true
        });
    }

    /**
     * Define the structure and configuration for the wizard steps.
     * Note: currentStepIndex of 0 in template.json implies Profile is first.
     * We'll adjust based on `template.json` default for `currentStepIndex`.
     * Doc Step 0 is 'Create Actor'. Doc Step 1 is 'Profile'. Doc Step 2 is 'Overview'.
     * JS Step 0 will be 'Overview' (after initial Profile entry).
     * JS Step 1 will be 'Profile'.
     */
    _getWizardConfig() {
        return {
            // This order is used for navigation and step indexing (0-based)
            steps: [
                { name: "Overview", id: "overview" },                  // JS Index 0 (Doc Step 2)
                { name: "Profile", id: "profile" },                   // JS Index 1 (Doc Step 1) - Initial entry point
                { name: "Card Allocation", id: "card-allocation" },   // JS Index 2 (Doc Step 2.1)
                { name: "Attributes", id: "attributes-display" },     // JS Index 3 (Doc Step 2.2)
                { name: "Skill Allocation", id: "skill-allocation" }, // JS Index 4 (Doc Step 2.3)
                { name: "Resonance Allocation", id: "resonance-allocation" }, // JS Index 5 (Doc Step 2.4)
                { name: "Gear Allocation", id: "gear-allocation" },   // JS Index 6 (Doc Step 2.5)
                { name: "Fate Card", id: "fate-card-display" },       // JS Index 7 (Doc Step 2.6)
                { name: "Deploy", id: "deploy" }                      // JS Index 8 (Doc Step 3)
            ],
            // Define limits for card allocation categories
            cardCategoryLimits: {
                attributes: 4,
                skills: 2,
                resonances: 1,
                gear: 2,
                fate: 1
            }
        };
    }

    /**
     * Retrieve the actor data and character creation specific data.
     */
    async getData() {
        const data = await super.getData();
        const actorData = this.actor.system;

        // Expose character creation data from the actor
        data.creation = actorData._characterCreation;

        // Expose wizard configuration
        data.config = this.config;

        // Expose actor's main profile data (for Step 1)
        data.actorProfile = actorData.profile;

        // Pass the drawn cards and allocated cards to the template (even if empty initially)
        data.drawnCards = data.creation.drawnCards;
        data.allocatedCards = data.creation.allocatedCards;

        // Register Handlebars helpers. It's safe to do this here repeatedly; Handlebars handles re-registration.
        Handlebars.registerHelper('eq', (v1, v2) => v1 === v2);
        Handlebars.registerHelper('gt', (v1, v2) => v1 > v2);
        Handlebars.registerHelper('gte', (v1, v2) => v1 >= v2);
        Handlebars.registerHelper('subtract', (v1, v2) => v1 - v2);
        Handlebars.registerHelper('add', (v1, v2) => v1 + v2);
        Handlebars.registerHelper('lowercase', (str) => typeof str === 'string' ? str.toLowerCase() : '');
        Handlebars.registerHelper('uppercaseFirst', (str) => typeof str === 'string' ? str.charAt(0).toUpperCase() + str.slice(1) : '');
        Handlebars.registerHelper('length', (arr) => arr ? arr.length : 0); // Helper to get array length

        return data;
    }

    /**
     * Handle updating the actor's character creation data.
     * This is automatically called by FormApplication on submitOnChange/submitOnClose.
     */
    async _updateObject(event, formData) {
        const updateData = foundry.utils.expandObject(formData);

        const profileUpdates = {};
        // Only update profile fields if they exist in the form data
        if (updateData.profile) {
            if (updateData.profile.concept !== undefined) profileUpdates["system.profile.concept"] = updateData.profile.concept;
            if (updateData.profile.background !== undefined) profileUpdates["system.profile.background"] = updateData.profile.background;
            if (updateData.profile.motivation !== undefined) profileUpdates["system.profile.motivation"] = updateData.profile.motivation;
        }

        const creationUpdates = {};
        // Only update _characterCreation fields if they exist in the form data
        if (updateData.creation) {
             if (updateData.creation.currentStepIndex !== undefined) creationUpdates["system._characterCreation.currentStepIndex"] = updateData.creation.currentStepIndex;
             if (updateData.creation.inProgress !== undefined) creationUpdates["system._characterCreation.inProgress"] = updateData.creation.inProgress;
             if (updateData.creation.drawnCards !== undefined) creationUpdates["system._characterCreation.drawnCards"] = updateData.creation.drawnCards;
             if (updateData.creation.allocatedCards !== undefined) creationUpdates["system._characterCreation.allocatedCards"] = updateData.creation.allocatedCards;
             // Add other characterCreation fields here as they become form inputs
        }

        // Merge all updates and apply to the actor
        await this.actor.update(foundry.utils.mergeObject(profileUpdates, creationUpdates));
    }

    /**
     * Activate event listeners for the wizard.
     */
    activateListeners(html) {
        super.activateListeners(html); // Call parent's listeners

        // Navigation buttons
        html.find('.wizard-nav-button[data-action="next-step"]').click(this._onNextStep.bind(this));
        html.find('.wizard-nav-button[data-action="prev-step"]').click(this._onPrevStep.bind(this));

        // Begin process button (Step 1: Profile)
        html.find('.begin-creation-process').click(this._onBeginProcess.bind(this));

        // Overview checklist links
        html.find('.overview-step-link').click(this._onOverviewStepClick.bind(this));

        // Re-render sheet if profile fields change to update 'Begin Process' button enabled state
        // Use 'change' and 'input' for better responsiveness and consistency
        html.find('#profile-concept, #profile-background, #profile-motivation').on('input change', () => this.render(false));
    }

    /**
     * Handles clicking the "Begin Process" button in Step 1 (Profile).
     */
    async _onBeginProcess(event) {
        event.preventDefault();
        console.log("ResonanceZeroCharacterCreationWizard | Beginning creation process...");

        // Validate profile fields before moving to step 0 (Overview)
        const profile = this.actor.system.profile;
        if (!profile.concept || !profile.background || !profile.motivation) {
            ui.notifications.warn("Please fill in Concept, Background, and Motivation before proceeding.");
            return;
        }

        // Move to the next step (Overview is index 0 in JS steps)
        await this.actor.update({ "system._characterCreation.currentStepIndex": 0 });
        this.render(true); // Re-render the sheet to show the next step
    }

    /**
     * Handles clicking a step link in the Overview (JS Step 0).
     */
    async _onOverviewStepClick(event) {
        event.preventDefault();
        const stepId = $(event.currentTarget).data('step-id');
        const targetStepIndex = this.config.steps.findIndex(step => step.id === stepId);

        // Only allow clicking on completed steps or the next available step
        if (targetStepIndex !== -1 && targetStepIndex <= this.actor.system._characterCreation.currentStepIndex + 1) { // Allow going back or to next step
            await this.actor.update({ "system._characterCreation.currentStepIndex": targetStepIndex });
            this.render(true);
        } else {
            ui.notifications.warn("Please complete the current step before advancing to a future step.");
        }
    }

    /**
     * Handles navigation to the next step.
     */
    async _onNextStep(event) {
        event.preventDefault();
        const currentStepIndex = this.actor.system._characterCreation.currentStepIndex;
        const nextStepIndex = Math.min(currentStepIndex + 1, this.config.steps.length - 1);

        // Perform step-specific validation before advancing
        const currentStepId = this.config.steps[currentStepIndex].id;
        if (currentStepId === "profile") { // Validation for Profile step
            const profile = this.actor.system.profile;
            if (!profile.concept || !profile.background || !profile.motivation) {
                ui.notifications.warn("Please fill in Concept, Background, and Motivation before proceeding.");
                return;
            }
        }
        // Add more validation for other steps here as they are implemented
        // e.g., if (currentStepId === "card-allocation") { /* validate all cards allocated */ }

        await this.actor.update({ "system._characterCreation.currentStepIndex": nextStepIndex });
        this.render(true);
    }

    /**
     * Handles navigation to the previous step.
     */
    async _onPrevStep(event) {
        event.preventDefault();
        const currentStepIndex = this.actor.system._characterCreation.currentStepIndex;
        const prevStepIndex = Math.max(currentStepIndex - 1, 0);
        await this.actor.update({ "system._characterCreation.currentStepIndex": prevStepIndex });
        this.render(true);
    }

    // You will add more methods here for card drawing, allocation, point spending, etc.

    // ===============================================
    // Card Allocation Logic (to be expanded in next steps)
    // ===============================================

    /**
     * Defines the full deck of cards (52 standard + 2 Jokers + 1 Fool).
     * Returns an array of card objects with value, suit, id, and image path.
     */
    _getFullDeck() {
        const suits = {
            clubs: { name: "Clubs", img: "systems/resonance-zero-srp/assets/cards/clubs.webp" },
            diamonds: { name: "Diamonds", img: "systems/resonance-zero-srp/assets/cards/diamonds.webp" },
            hearts: { name: "Hearts", img: "systems/resonance-zero-srp/assets/cards/hearts.webp" },
            spades: { name: "Spades", img: "systems/resonance-zero-srp/assets/cards/spades.webp" }
        };

        const ranks = {
            "2": { value: 2, label: "2" },
            "3": { value: 3, label: "3" },
            "4": { value: 4, label: "4" },
            "5": { value: 5, label: "5" },
            "6": { value: 6, label: "6" },
            "7": { value: 7, label: "7" },
            "8": { value: 8, label: "8" },
            "9": { value: 9, label: "9" },
            "10": { value: 10, label: "10" },
            "J": { value: 11, label: "Jack" },
            "Q": { value: 12, label: "Queen" },
            "K": { value: 13, label: "King" },
            "A": { value: 14, label: "Ace" } // Ace high for consistent sorting/comparison
        };

        let deck = [];
        // Standard 52 cards
        for (const suitKey in suits) {
            for (const rankKey in ranks) {
                const id = `${rankKey.toLowerCase()}-${suitKey}`;
                deck.push({
                    id: id,
                    rank: rankKey,
                    suit: suitKey,
                    label: `${ranks[rankKey].label} of ${suits[suitKey].name}`,
                    value: ranks[rankKey].value,
                    img: `systems/resonance-zero-srp/assets/cards/${id}.webp`,
                    allocatedTo: null // Will store 'attributes', 'skills', etc.
                });
            }
        }

        // Add Jokers and Fool
        deck.push({ id: "joker-black", rank: "Joker", suit: "black", label: "Black Joker", value: 15, img: "systems/resonance-zero-srp/assets/cards/joker-black.webp", allocatedTo: null });
        deck.push({ id: "joker-red", rank: "Joker", suit: "red", label: "Red Joker", value: 15, img: "systems/resonance-zero-srp/assets/cards/joker-red.webp", allocatedTo: null });
        deck.push({ id: "fool", rank: "Fool", suit: "multi", label: "Fool Card", value: 16, img: "systems/resonance-zero-srp/assets/cards/fool.webp", allocatedTo: null });

        return deck;
    }

    /**
     * Draws 10 random cards ensuring all 4 standard suits are present.
     * @returns {Object} An object containing the array of 10 unique card objects and a byID lookup.
     */
    _drawInitialCards() {
        const fullDeck = this._getFullDeck();
        let drawnCards = [];
        const numCardsToDraw = 10;
        const standardSuits = new Set(['clubs', 'diamonds', 'hearts', 'spades']);
        let attempts = 0;
        const MAX_ATTEMPTS = 500; // Prevent infinite loop, might need adjustment

        // Try to find a valid draw
        while (drawnCards.length < numCardsToDraw && attempts < MAX_ATTEMPTS) {
            attempts++;
            const tempDeck = foundry.utils.deepClone(fullDeck); // Work with a copy of the deck
            let currentDraw = [];
            let currentSuitsInDraw = new Set();
            const tempIndices = Array.from({length: tempDeck.length}, (_, i) => i); // Array of indices

            for (let i = 0; i < numCardsToDraw; i++) {
                if (tempIndices.length === 0) break; // No more cards to draw
                const randomIdxInTempIndices = Math.floor(Math.random() * tempIndices.length);
                const originalIndex = tempIndices.splice(randomIdxInTempIndices, 1)[0]; // Remove original index
                const card = tempDeck[originalIndex];
                currentDraw.push(card);
                if (standardSuits.has(card.suit)) {
                    currentSuitsInDraw.add(card.suit);
                }
            }

            // Check if all standard suits are present in this draw
            let allStandardSuitsPresent = true;
            for (const suit of standardSuits) {
                if (!currentSuitsInDraw.has(suit)) {
                    allStandardSuitsPresent = false;
                    break;
                }
            }

            if (allStandardSuitsPresent && currentDraw.length === numCardsToDraw) {
                drawnCards = currentDraw;
                break; // Valid draw found
            }
        }

        // Fallback if max attempts reached without finding a valid draw (unlikely with a full deck)
        if (drawnCards.length === 0) {
            console.warn("ResonanceZeroCharacterCreationWizard | Max attempts reached for card draw, forcing suit inclusion.");
            const fallbackDraw = [];
            const remainingDeck = foundry.utils.deepClone(fullDeck);

            // Add one of each standard suit
            for (const suit of standardSuits) {
                const cardsOfSuit = remainingDeck.filter(c => c.suit === suit);
                if (cardsOfSuit.length > 0) {
                    const randomCard = cardsOfSuit[Math.floor(Math.random() * cardsOfSuit.length)];
                    fallbackDraw.push(randomCard);
                    // Remove the drawn card from the remaining deck to ensure uniqueness
                    foundry.utils.inplaceSplice(remainingDeck, remainingDeck.indexOf(randomCard), 1);
                }
            }

            // Fill the rest with random cards
            while (fallbackDraw.length < numCardsToDraw && remainingDeck.length > 0) {
                const randomIndex = Math.floor(Math.random() * remainingDeck.length);
                fallbackDraw.push(remainingDeck.splice(randomIndex, 1)[0]);
            }
            drawnCards = fallbackDraw;
        }

        // Initialize allocatedTo property for each drawn card and create a lookup by ID
        const finalDrawnCards = drawnCards.map(card => ({ ...card, allocatedTo: null }));
        // Create a lookup object for easy access in Handlebars
        const drawnCardsByID = finalDrawnCards.reduce((obj, card) => {
            obj[card.id] = card;
            return obj;
        }, {});

        return { cards: finalDrawnCards, byID: drawnCardsByID };
    }

    /**
     * Handles changing the allocated category for a drawn card.
     * @param {Event} event The change event from a radio button.
     */
    async _onCardAllocationChange(event) {
        const cardId = $(event.currentTarget).data('card-id');
        const newCategory = $(event.currentTarget).val();
        console.log(`Card ${cardId} allocated to ${newCategory}`);

        const currentDrawnCards = foundry.utils.deepClone(this.actor.system._characterCreation.drawnCards);
        // Ensure allocatedCards is initialized with empty arrays for each category if they don't exist
        const currentAllocatedCards = foundry.utils.deepClone(this.actor.system._characterCreation.allocatedCards);
        for (const cat in this.config.cardCategoryLimits) {
            if (!currentAllocatedCards[cat]) {
                currentAllocatedCards[cat] = [];
            }
        }

        // Find the card by ID in the drawnCards array
        const cardToMove = currentDrawnCards.find(c => c.id === cardId);
        if (!cardToMove) {
            ui.notifications.error(`Could not find card with ID: ${cardId}`);
            return;
        }

        // --- Validation Logic ---
        // 1. Remove card from its old category if it was allocated
        const oldCategory = cardToMove.allocatedTo;
        if (oldCategory && currentAllocatedCards[oldCategory]) {
            currentAllocatedCards[oldCategory] = currentAllocatedCards[oldCategory].filter(cId => cId !== cardId);
        }

        // 2. Check limits for the new category (excluding the current card if it's already there)
        const limit = this.config.cardCategoryLimits[newCategory];
        if (newCategory !== 'none' && limit !== undefined && currentAllocatedCards[newCategory].length >= limit) {
            ui.notifications.warn(`Cannot allocate more than ${limit} cards to ${this.config.steps.find(s => s.id === newCategory).name}.`);
            // Revert the radio button selection visually
            $(event.currentTarget).prop('checked', false); // Uncheck the one just clicked
            // Find the previously checked radio button for this card and re-check it
            if (oldCategory) {
                $(`.card-allocation-radio[data-card-id="${cardId}"][value="${oldCategory}"]`).prop('checked', true);
            } else {
                $(`.card-allocation-radio[data-card-id="${cardId}"][value="none"]`).prop('checked', true);
            }
            return; // Stop the allocation
        }

        // 3. Check specific suit limits for Attributes
        if (newCategory === 'attributes') {
            const currentAttributeCards = currentAllocatedCards.attributes.map(cId => currentDrawnCards.find(c => c.id === cId));
            const newSuit = cardToMove.suit;
            // Only validate standard suits (clubs, diamonds, hearts, spades)
            if (newSuit !== 'black' && newSuit !== 'red' && newSuit !== 'multi' && currentAttributeCards.some(c => c && c.suit === newSuit)) {
                ui.notifications.warn(`Attributes cannot have more than one card of the same standard suit.`);
                // Revert the radio button selection
                $(event.currentTarget).prop('checked', false);
                if (oldCategory) {
                    $(`.card-allocation-radio[data-card-id="${cardId}"][value="${oldCategory}"]`).prop('checked', true);
                } else {
                    $(`.card-allocation-radio[data-card-id="${cardId}"][value="none"]`).prop('checked', true);
                }
                return;
            }
        }

        // --- Apply Allocation ---
        cardToMove.allocatedTo = newCategory;
        if (newCategory !== 'none') {
            currentAllocatedCards[newCategory].push(cardId);
        }

        // Update the actor data
        await this.actor.update({
            "system._characterCreation.drawnCards": currentDrawnCards,
            "system._characterCreation.allocatedCards": currentAllocatedCards
        });

        this.render(false); // Re-render the sheet (not forced) to update counts/validation
    }
}

// ===============================================
// Extend the Base ActorSheet for Resonance Zero SRP
// ===============================================

export class ResonanceZeroActorSheet extends foundry.appv1.sheets.ActorSheet {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["resonance-zero-srp", "sheet", "actor"],
            template: "systems/resonance-zero-srp/templates/character-creation-wizard-sheet.hbs",
            width: 750,
            height: 700,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
        });
    }

    /**
     * Override getData to handle rendering either the wizard or the normal sheet.
     * @override
     */
    async getData() {
        const baseData = await super.getData();
        const actor = this.actor;
        const system = actor.system;

        // Add a flag to indicate if we're in character creation mode
        // Default to true if _characterCreation or inProgress is undefined (for new actors)
        baseData.isCharacterCreationMode = system._characterCreation?.inProgress ?? true;

        // If in character creation mode, pass data from the wizard class
        if (baseData.isCharacterCreationMode) {
            // Create a temporary wizard instance to get its data and config
            // Use this.options to pass sheet options (like actor, application ID) to the wizard
            this.wizard = new ResonanceZeroCharacterCreationWizard(actor, this.options);
            baseData.wizardData = await this.wizard.getData();
        }

        // console.log("Actor Sheet getData:", baseData); // Debugging
        return baseData;
    }

    /**
     * Override activateListeners to handle listeners for both wizard and normal sheet.
     * @override
     */
    activateListeners(html) {
        super.activateListeners(html);

        // If we are in character creation mode, delegate listener activation to the wizard
        if (this.actor.system._characterCreation?.inProgress) {
            console.log("ResonanceZeroActorSheet | Activating Wizard Listeners");
            // The wizard needs to activate its listeners on the *same* HTML element as the sheet
            this.wizard.activateListeners(html);
        } else {
            console.log("ResonanceZeroActorSheet | Activating Standard Sheet Listeners");
            // Add listeners for your regular actor sheet functionality here
            // e.g., html.find('.some-button').click(...)
        }
    }

    /**
     * Override _updateObject to ensure data is updated correctly based on mode.
     * @override
     */
    _updateObject(event, formData) {
        // If we are in character creation mode, delegate the update to the wizard
        if (this.actor.system._characterCreation?.inProgress) {
            console.log("ResonanceZeroActorSheet | Delegating update to Wizard.");
            // The wizard's _updateObject is responsible for saving the wizard-specific data.
            // We pass the formData directly.
            return this.wizard._updateObject(event, formData);
        } else {
            console.log("ResonanceZeroActorSheet | Updating standard Actor Sheet data.");
            // Otherwise, let the default ActorSheet handle the update
            return super._updateObject(event, formData);
        }
    }
}