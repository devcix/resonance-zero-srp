// scripts/CharacterCreationWizardSheet.mjs

/**
 * Extend the basic ActorSheet for your Resonance Zero SRP system.
 * @extends {ActorSheet}
 */
export class CharacterCreationWizardSheet extends foundry.appv1.sheets.ActorSheet {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["resonance-zero-srp", "sheet", "actor", "character-creation-wizard"],
            template: "systems/resonance-zero-srp/templates/character-creation-wizard-sheet.hbs",
            width: 780,
            height: 840,
            tabs: [],
            resizable: true,
            dragDrop: []
        });
    }

    /** @override */
    async getData() {
        const data = await super.getData();

        // Ensure data.system is available. super.getData() should already populate data.system.
        data.system = data.actor.system || {};

        // Ensure _characterCreation exists and is initialized within data.system
        // This is crucial for consistency and to prevent undefined errors when accessing properties
        data.system._characterCreation = data.system._characterCreation || {
            inProgress: true, // Should generally be true while this sheet is open
            currentStep: "profile", // Default to "profile" if not set
            completedSteps: {
                profile: false, overview: false, cardAllocation: false, attributesDisplay: false,
                skillAllocation: false, resonanceAllocation: false, gearAllocation: false, fateCardDisplay: false
            },
            drawnCards: [],
            allocatedCards: {}, // Initialize as an empty object here
            pointPools: { skill: 0, resonance: 0, gear: 0 },
            skillAllocations: {},
            resonanceAllocations: {},
            gearAllocations: []
        };

        // Ensure allocatedCards and its sub-arrays are initialized
        const allocatedCards = data.system._characterCreation.allocatedCards;
        allocatedCards.attributes = allocatedCards.attributes || [];
        allocatedCards.skills = allocatedCards.skills || [];
        allocatedCards.resonances = allocatedCards.resonances || [];
        allocatedCards.gear = allocatedCards.gear || [];
        allocatedCards.fate = allocatedCards.fate || [];

        console.log("CharacterCreationWizardSheet getData - Data passed to template: Object", data);

        return data;
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html); // Always call the superclass method first

        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;
        
        // Click handlers for wizard navigation buttons
        html.find('.wizard-navigation-button').click(this._onNavigateWizard.bind(this));
        // Listener for the "Next Step" button
        html.find('.wizard-next-button').click(this._onNextStep.bind(this));
        // Listener for the "Prev Step" button
        html.find('.wizard-prev-button').click(this._onPrevStep.bind(this));
        // Listener for the "Draw Cards" button
        html.find('.draw-cards-button').click(this._onDrawCards.bind(this));


        // Activate drag & drop listeners specifically for the card allocation step
        if (this.actor.system._characterCreation.currentStep === "cardAllocation") {
            // Make drawn cards draggable
            const draggableCards = html.find('.drawn-cards-container .card-display');
            for (let card of draggableCards) {
                card.setAttribute("draggable", true);
                card.addEventListener('dragstart', this._onDragStartCard.bind(this));
            }

            // Make allocation areas droppable
            const droppableAreas = html.find('.allocation-area .card-slots');
            for (let area of droppableAreas) {
                area.addEventListener('dragover', this._onDragOverCard.bind(this));
                area.addEventListener('drop', this._onDropCard.bind(this));
                area.addEventListener('dragenter', this._onDragEnterCard.bind(this)); // Added dragenter for visual feedback
            }
        }

        // Listen for changes on profile fields only if current step is 'profile'
        if (this.actor.system._characterCreation.currentStep === "profile") {
            html.find('input[name="system.profile.concept"]').change(this._onUpdateProfile.bind(this));
            html.find('textarea[name="system.profile.background"]').change(this._onUpdateProfile.bind(this));
            html.find('input[name="system.profile.motivation"]').change(this._onUpdateProfile.bind(this));
        }

        // Attach listeners for specific steps only when those elements are present
        if (this.actor.system._characterCreation.currentStep === "overview") {
            // Listener for clickable checklist stage links
            html.find('.stage-link').click(this._onStageLinkClick.bind(this));
        }

        // Listener for attribute rank changes (if applicable in this sheet)
        html.find('.attribute-rank-input').change(this._onAttributeRankChange.bind(this));

        // Listener for skill point inputs
        html.find('.skill-point-input').change(this._onSkillPointChange.bind(this));

        // Listener for resonance checkboxes/text inputs
        html.find('.resonance-checkbox, .resonance-text-input').change(this._onResonanceChange.bind(this));

        // Listener for gear input changes
        html.find('.gear-input').change(this._onGearChange.bind(this));
        html.find('.add-gear').click(this._onAddGear.bind(this));
        html.find('.remove-gear').click(this._onRemoveGear.bind(this));
    }


    async _onNextStep(event) {
        event.preventDefault();
        let currentStep = this.actor.system._characterCreation.currentStep;
        let completedSteps = foundry.utils.deepClone(this.actor.system._characterCreation.completedSteps); // Use deepClone

        // Perform validation for the current step before proceeding
        let validationPassed = true;
        switch (currentStep) {
            case "profile":
                validationPassed = this._validateProfileCompletion();
                if (validationPassed) completedSteps.profile = true;
                break;
            case "overview":
                // No specific validation needed for overview, it's informational
                completedSteps.overview = true;
                break;
            case "cardAllocation":
                // Validate if all cards are allocated
                validationPassed = this._validateCardAllocationCompletion();
                if (validationPassed) completedSteps.cardAllocation = true;
                break;
            case "attributesDisplay":
                // This step is primarily for display; validation occurs on card drop.
                // Mark as complete if cards are allocated and attributes derived.
                validationPassed = this._validateAttributesCompletion();
                if (validationPassed) completedSteps.attributesDisplay = true;
                break;
            case "skillAllocation":
                validationPassed = this._validateSkillAllocationCompletion();
                if (validationPassed) completedSteps.skillAllocation = true;
                break;
            case "resonanceAllocation":
                validationPassed = this._validateResonanceAllocationCompletion();
                if (validationPassed) completedSteps.resonanceAllocation = true;
                break;
            case "gearAllocation":
                validationPassed = this._validateGearAllocationCompletion();
                if (validationPassed) completedSteps.gearAllocation = true;
                break;
            case "fateCardDisplay":
                // No specific validation needed for fate card display, it's informational
                completedSteps.fateCardDisplay = true;
                break;
            default:
                break;
        }

        if (!validationPassed) {
            // UI notification handled by specific validation methods
            return;
        }

        const stepOrder = ["profile", "overview", "cardAllocation", "attributesDisplay", "skillAllocation", "resonanceAllocation", "gearAllocation", "fateCardDisplay", "complete"]; // Added "overview" and "complete"
        const currentIndex = stepOrder.indexOf(currentStep);
        let nextIndex = currentIndex + 1;

        // Skip steps if not needed or logic dictates (e.g., if "complete" is final)
        if (nextIndex >= stepOrder.length) {
            nextIndex = stepOrder.length - 1; // Stay on the last step (e.g., "complete")
        }

        const nextStep = stepOrder[nextIndex];

        // Update the actor's data for the next step and completed steps
        await this.actor.update({
            "system._characterCreation.currentStep": nextStep,
            "system._characterCreation.completedSteps": completedSteps
        });

        // If the wizard is complete, switch to the standard sheet
        if (nextStep === "complete") {
            // Perform final validation for overall completion
            if (this._validateCompletion()) {
                await this.actor.update({ "system._characterCreation.inProgress": false });
                ui.notifications.info(`Character creation for ${this.actor.name} is complete!`);
                // The "updateActor" hook in resonance-zero-srp.mjs will handle sheet switching
            } else {
                ui.notifications.error("Please complete all required steps before finalizing character creation.");
                await this.actor.update({ "system._characterCreation.currentStep": currentStep }); // Revert to current step
                return;
            }
        }
    }

    async _onPrevStep(event) {
        event.preventDefault();
        const currentStep = this.actor.system._characterCreation.currentStep;
        const stepOrder = ["profile", "overview", "cardAllocation", "attributesDisplay", "skillAllocation", "resonanceAllocation", "gearAllocation", "fateCardDisplay", "complete"]; // Added "overview"
        const currentIndex = stepOrder.indexOf(currentStep);
        let prevIndex = currentIndex - 1;

        if (prevIndex < 0) {
            prevIndex = 0; // Stay on the first step
        }

        const prevStep = stepOrder[prevIndex];
        await this.actor.update({ "system._characterCreation.currentStep": prevStep });
    }

    /**
     * Handles updates to profile fields and marks 'profile' step complete if all fields are filled.
     * @param {Event} event
     * @private
     */
    async _onUpdateProfile(event) {
        event.preventDefault();
        const fieldName = event.currentTarget.name;
        const value = event.currentTarget.value;
        // The path in the input name is correct for direct update: system.profile.concept
        await this.actor.update({ [fieldName]: value });

        // Re-check profile completion status after each input change
        this._validateProfileCompletion();
    }

    /**
     * Handle clicks on stage links in the overview checklist.
     * @param {Event} event
     * @private
     */
    async _onStageLinkClick(event) {
        event.preventDefault(); // Prevent default link behavior (e.g., opening new tab)
        const link = event.currentTarget;
        const targetStep = link.dataset.stepName; // Get the step name from data-step-name

        // Update the actor's currentStep and re-render the sheet
        await this.actor.update({ "system._characterCreation.currentStep": targetStep });
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

        // Mark card allocation step as incomplete until cards are actually allocated
        await this.actor.update({ "system._characterCreation.completedSteps.cardAllocation": false });

        ui.notifications.info("10 cards drawn! Now drag them to their allocation areas.");
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
     * Handle the drag enter event for allocation areas.
     * @param {Event} event
     * @private
     */
   async _onDropCard(event) {
    event.preventDefault();

    // Ensure _characterCreation exists on the actor's data
    if (!this.actor.system._characterCreation) {
        await this.actor.update({ "system._characterCreation": {} });
    }

    // Ensure allocatedCards exists within _characterCreation on the actor's data
    if (!this.actor.system._characterCreation.allocatedCards) {
        await this.actor.update({ "system._characterCreation.allocatedCards": {} });
    }

    const droppedCardData = JSON.parse(event.dataTransfer.getData("text/plain"));
    const targetArea = event.currentTarget.closest('.allocation-area');
    const allocationType = targetArea?.dataset.allocationType;

    // Ensure the specific array for the allocationType exists within allocatedCards on the actor's data
    if (allocationType && !this.actor.system._characterCreation.allocatedCards[allocationType]) {
        await this.actor.update({ [`system._characterCreation.allocatedCards.${allocationType}`]: [] });
    }

    // IMPORTANT: After all potential updates, re-fetch the _characterCreation object
    // from the actor's current state to ensure it reflects all updates.
    let currentCharacterCreation = this.actor.system._characterCreation;

    // Now, currentAllocatedCards and currentDrawnCards can be safely cloned from the updated state
    let currentAllocatedCards = foundry.utils.deepClone(currentCharacterCreation.allocatedCards);
    let currentDrawnCards = foundry.utils.deepClone(currentCharacterCreation.drawnCards);

    // Find and remove the card from the drawn cards
    const cardIndexInDrawn = currentDrawnCards.findIndex(c =>
        c.suit === droppedCardData.suit && c.rank === droppedCardData.rank
    );

    if (cardIndexInDrawn > -1) {
        // Before making changes, validate the proposed allocation
        const tempCardsInArea = [...(currentAllocatedCards[allocationType] || []), droppedCardData];
        const validationPassed = this._validateAllocation(allocationType, tempCardsInArea, droppedCardData);

        if (validationPassed) {
            currentDrawnCards.splice(cardIndexInDrawn, 1); // Remove from drawn cards

            // Ensure the target allocation array exists (this might be redundant if the initial update works, but is a safe fallback)
            if (!currentAllocatedCards[allocationType]) {
                currentAllocatedCards[allocationType] = [];
            }
            currentAllocatedCards[allocationType].push(droppedCardData); // Add to target allocation area

            // Update actor data
            await this.actor.update({
                "system._characterCreation.drawnCards": currentDrawnCards,
                [`system._characterCreation.allocatedCards`]: currentAllocatedCards
            });
            ui.notifications.info(`Card ${droppedCardData.rank} of ${droppedCardData.suit} allocated to ${allocationType}.`);
        } else {
            // Validation failed, show error (message already handled by _validateAllocation)
        }
    } else {
        ui.notifications.warn("The card you tried to drop was not found in your drawn cards.");
    }
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

        // Defensive initialization to ensure structure exists on the actor's data directly
        if (!this.actor.system._characterCreation) {
            await this.actor.update({ "system._characterCreation": {} });
        }
        if (!this.actor.system._characterCreation.allocatedCards) {
            await this.actor.update({ "system._characterCreation.allocatedCards": {} });
        }

        // Also ensure the specific array for the allocationType exists within allocatedCards
        const droppedCardData = JSON.parse(event.dataTransfer.getData("text/plain"));
        const targetArea = event.currentTarget.closest('.allocation-area');
        const allocationType = targetArea?.dataset.allocationType; // Use optional chaining for safety

        if (allocationType && !this.actor.system._characterCreation.allocatedCards[allocationType]) {
            await this.actor.update({ [`system._characterCreation.allocatedCards.${allocationType}`]: [] });
        }

        // Now proceed with your original logic
        let currentAllocatedCards = foundry.utils.deepClone(this.actor.system._characterCreation.allocatedCards);
        let currentDrawnCards = foundry.utils.deepClone(this.actor.system._characterCreation.drawnCards);
  
        if (!targetArea) {
            ui.notifications.error("Invalid drop target. Please drop the card into an allocation area.");
            return;
        }

        // const allocationType = targetArea.dataset.allocationType; // Using data-allocation-type for cleaner access
        if (!allocationType) {
            ui.notifications.error("Allocation area type not found. Cannot allocate card.");
            return;
        }


        // Find and remove the card from the drawn cards
        const cardIndexInDrawn = currentDrawnCards.findIndex(c =>
            c.suit === droppedCardData.suit && c.rank === droppedCardData.rank
        );

        if (cardIndexInDrawn > -1) {
            // Before making changes, validate the proposed allocation
            // Pass a clone of the array in the target area plus the new card for validation
            const tempCardsInArea = [...(currentAllocatedCards[allocationType] || []), droppedCardData];
            const validationPassed = this._validateAllocation(allocationType, tempCardsInArea, droppedCardData);

            if (validationPassed) {
                currentDrawnCards.splice(cardIndexInDrawn, 1); // Remove from drawn cards

                // Ensure the target allocation array exists before pushing
                if (!currentAllocatedCards[allocationType]) {
                    currentAllocatedCards[allocationType] = [];
                }
                currentAllocatedCards[allocationType].push(droppedCardData); // Add to target allocation area

                // Update actor data
                await this.actor.update({
                    "system._characterCreation.drawnCards": currentDrawnCards,
                    [`system._characterCreation.allocatedCards`]: currentAllocatedCards
                });
                ui.notifications.info(`Card ${droppedCardData.rank} of ${droppedCardData.suit} allocated to ${allocationType}.`);
            } else {
                // Validation failed, show error (message already handled by _validateAllocation)
                // No update to actor data needed as allocation was invalid
            }
        } else {
            // Optional: Handle case where card being dropped wasn't found in drawn cards
            ui.notifications.warn("The card you tried to drop was not found in your drawn cards.");
        }
    }

    /**
     * Placeholder for allocation validation rules.
     * You'll expand this with your specific rules.
     * @param {string} type The type of allocation (e.g., 'attributes', 'skills')
     * @param {Array<Object>} currentCardsInArea The array of cards currently in that allocation area (including the new card for validation)
     * @param {Object} newCard The card being dropped
     * @returns {boolean} True if the allocation is valid, false otherwise.
     * @private
     */
    _validateAllocation(type, currentCardsInArea, newCard) {
        switch (type) {
            case 'attributes':
                // Max 4 cards
                if (currentCardsInArea.length > 4) { // Use > 4 because currentCardsInArea already includes the newCard
                    ui.notifications.error(`Attributes can only have a maximum of 4 cards.`);
                    return false;
                }
                // Only one card of each suit (excluding joker)
                if (newCard.suit !== 'wild' && currentCardsInArea.filter(card => card.suit === newCard.suit).length > 1) {
                    ui.notifications.warn(`Attributes can only have one card of each suit (Clubs, Diamonds, Hearts, Spades).`);
                    return false;
                }
                break;
            case 'skills':
                // Max 2 cards
                if (currentCardsInArea.length > 2) {
                    ui.notifications.error(`Skills can only have a maximum of 2 cards.`);
                    return false;
                }
                break;
            case 'resonances':
                // Max 1 card
                if (currentCardsInArea.length > 1) {
                    ui.notifications.error(`Resonances can only have a maximum of 1 card.`);
                    return false;
                }
                break;
            case 'gear':
                // Max 2 cards
                if (currentCardsInArea.length > 2) {
                    ui.notifications.error(`Gear can only have a maximum of 2 cards.`);
                    return false;
                }
                break;
            case 'fate':
                // Max 1 card
                if (currentCardsInArea.length > 1) {
                    ui.notifications.error(`Fate can only have a maximum of 1 card.`);
                    return false;
                }
                break;
            default:
                // No specific rules for other types yet, assume valid
                return true;
        }
        return true;
    }

    /**
     * Validates if Concept, Background, and Motivation are filled for the Profile step.
     * Updates the 'profile' completed status in the actor's data.
     * @returns {boolean} True if all required profile fields are filled.
     * @private
     */
    _validateProfileCompletion() {
        const profile = this.actor.system._characterCreation.profile; // Access through _characterCreation
        const isComplete = profile.concept && profile.background && profile.motivation;

        // Update the completion status flag without re-rendering the whole sheet
        if (this.actor.system._characterCreation.completedSteps.profile !== isComplete) {
            this.actor.update({ [`system._characterCreation.completedSteps.profile`]: isComplete }, { render: false });
        }
        if (!isComplete) {
            ui.notifications.error("Please fill in Concept, Background, and Motivation.");
        }
        return isComplete;
    }

    /**
     * Validates if all 10 cards have been allocated.
     * @returns {boolean} True if all cards are allocated.
     * @private
     */
    _validateCardAllocationCompletion() {
        const drawnCardsCount = this.actor.system._characterCreation.drawnCards.length;
        if (drawnCardsCount > 0) {
            ui.notifications.error(`You still have ${drawnCardsCount} cards left to allocate.`);
            return false;
        }

        // Check if cards have been allocated to each required type
        const allocated = this.actor.system._characterCreation.allocatedCards;
        const requiredAllocations = ['attributes', 'skills', 'resonances', 'gear', 'fate'];
        for (const type of requiredAllocations) {
            if (!allocated[type] || allocated[type].length === 0) {
                // This is a soft check, depends on your game's rules for *minimum* allocations.
                // For a hard check, you'd iterate through a fixed number of slots.
            }
        }

        // This assumes that if drawnCards is 0, allocation is complete.
        // You might need more complex logic based on game rules (e.g., minimum cards per area).
        const totalAllocated = Object.values(allocated).reduce((sum, arr) => sum + arr.length, 0);
        if (totalAllocated !== 10) {
            ui.notifications.error(`You have allocated ${totalAllocated} cards. Please allocate exactly 10 cards.`);
            return false;
        }

        ui.notifications.info("All cards allocated!");
        return true;
    }

    /**
     * Validates if attributes are properly set (implicitly, by card allocation).
     * This might involve checking the number of cards in 'attributes' area.
     * @returns {boolean} True if attributes are deemed complete.
     * @private
     */
    _validateAttributesCompletion() {
        const attributesCards = this.actor.system._characterCreation.allocatedCards.attributes;
        if (attributesCards.length !== 4) {
            ui.notifications.error("Please allocate exactly 4 cards to Attributes.");
            return false;
        }
        // Additional rules can be added here, e.g., checking for specific suits or ranks
        return true;
    }

    /**
     * Handles changes to attribute rank inputs (e.g., if you have manual overrides or adjustments)
     * This function is a placeholder and might need to be implemented based on your UI for attributes.
     * @param {Event} event
     * @private
     */
    async _onAttributeRankChange(event) {
        // Example: If you allow manual input for attribute ranks after card allocation
        // const input = event.currentTarget;
        // const attribute = input.dataset.attribute; // e.g., 'physical', 'social'
        // const newValue = parseInt(input.value);
        // if (!isNaN(newValue)) {
        //     await this.actor.update({ [`system.attributes.${attribute}.rank`]: newValue });
        // }
    }


    /**
     * Validates if skill points have been allocated appropriately.
     * @returns {boolean} True if skill allocation is complete.
     * @private
     */
    _validateSkillAllocationCompletion() {
        const skillPointsRemaining = this.actor.system._characterCreation.pointPools.skill;
        if (skillPointsRemaining > 0) {
            ui.notifications.error(`You have ${skillPointsRemaining} skill points remaining. Please allocate them.`);
            return false;
        }
        // You can add more complex validation here, e.g., minimum points in certain skills
        return true;
    }

    /**
     * Handles changes to skill point inputs.
     * @param {Event} event
     * @private
     */
    async _onSkillPointChange(event) {
        const input = event.currentTarget;
        const skillPath = input.dataset.skillpath; // e.g., 'social.negotiation', 'physical.combat.blade'
        let newValue = parseInt(input.value) || 0; // Default to 0 if NaN

        // Ensure value is non-negative
        newValue = Math.max(0, newValue);

        // Get current skill value to calculate the change
        const currentSkillValue = foundry.utils.getProperty(this.actor.system._characterCreation.skillAllocations, skillPath) || 0;
        const change = newValue - currentSkillValue;

        let currentSkillPoints = this.actor.system._characterCreation.pointPools.skill;

        // Check if allocation is valid based on remaining points
        if (currentSkillPoints - change < 0) {
            ui.notifications.warn("Not enough skill points remaining.");
            input.value = currentSkillValue; // Revert input
            return;
        }

        // Update skill points and the specific skill
        await this.actor.update({
            [`system._characterCreation.skillAllocations.${skillPath}`]: newValue,
            "system._characterCreation.pointPools.skill": currentSkillPoints - change
        });
    }

    /**
     * Validates if resonances have been allocated.
     * @returns {boolean} True if resonance allocation is complete.
     * @private
     */
    _validateResonanceAllocationCompletion() {
        // Example: Check if at least one resonance is selected or unique resonance power is filled
        const resonances = this.actor.system._characterCreation.resonanceAllocations;
        const hasSelectedResonance = Object.values(resonances).some(val => val === true || (typeof val === 'string' && val.trim() !== ''));

        if (!hasSelectedResonance) {
            ui.notifications.error("Please select at least one Resonance or define a Unique Resonance Power.");
            return false;
        }
        return true;
    }

    /**
     * Handles changes to resonance checkboxes or text inputs.
     * @param {Event} event
     * @private
     */
    async _onResonanceChange(event) {
        const input = event.currentTarget;
        const resonanceKey = input.dataset.resonanceKey; // e.g., 'echoOfPossibility', 'uniqueResonancePower'

        let newValue;
        if (input.type === 'checkbox') {
            newValue = input.checked;
        } else { // text input
            newValue = input.value;
        }

        await this.actor.update({ [`system._characterCreation.resonanceAllocations.${resonanceKey}`]: newValue });
    }

    /**
     * Validates if gear has been appropriately allocated.
     * @returns {boolean} True if gear allocation is complete.
     * @private
     */
    _validateGearAllocationCompletion() {
        const gearPointsRemaining = this.actor.system._characterCreation.pointPools.gear;
        if (gearPointsRemaining > 0) {
            ui.notifications.error(`You have ${gearPointsRemaining} gear points remaining. Please allocate them.`);
            return false;
        }
        // You might check if gearAllocations array is not empty, etc.
        if (this.actor.system._characterCreation.gearAllocations.length === 0) {
            ui.notifications.warn("Consider adding some gear.");
            // return false; // Or just a warning, not a hard stop
        }
        return true;
    }

    /**
     * Handles changes to gear inputs.
     * @param {Event} event
     * @private
     */
    async _onGearChange(event) {
        const index = $(event.currentTarget).data('index');
        const field = $(event.currentTarget).data('field');
        const value = event.currentTarget.value;

        // Clone the gearAllocations array to modify
        const currentGear = foundry.utils.deepClone(this.actor.system._characterCreation.gearAllocations);
        if (currentGear[index]) {
            currentGear[index][field] = value;
            await this.actor.update({ "system._characterCreation.gearAllocations": currentGear });
        }
    }

    /**
     * Handles adding a new gear entry.
     * @param {Event} event
     * @private
     */
    async _onAddGear(event) {
        event.preventDefault();
        const currentGear = foundry.utils.deepClone(this.actor.system._characterCreation.gearAllocations);
        currentGear.push({ name: "", description: "" }); // Add a new empty gear item
        await this.actor.update({ "system._characterCreation.gearAllocations": currentGear });
    }

    /**
     * Handles removing a gear entry.
     * @param {Event} event
     * @private
     */
    async _onRemoveGear(event) {
        event.preventDefault();
        const index = $(event.currentTarget).data('index');
        const currentGear = foundry.utils.deepClone(this.actor.system._characterCreation.gearAllocations);
        currentGear.splice(index, 1); // Remove the item at the specified index
        await this.actor.update({ "system._characterCreation.gearAllocations": currentGear });
    }

    /**
     * Placeholder for wizard completion validation.
     * @returns {boolean} True if all necessary steps are complete.
     * @private
     */
    _validateCompletion() {
        const completedSteps = this.actor.system._characterCreation.completedSteps;
        // Ensure all required steps are complete before finishing the wizard
        const requiredSteps = ["profile", "overview", "cardAllocation", "attributesDisplay", "skillAllocation", "resonanceAllocation", "gearAllocation", "fateCardDisplay"]; // Add all steps you want to be mandatory
        const allRequiredCompleted = requiredSteps.every(step => completedSteps[step] === true);

        if (!allRequiredCompleted) {
            // Provide specific feedback on which step is incomplete
            const incomplete = requiredSteps.filter(step => completedSteps[step] !== true);
            ui.notifications.error(`The following steps are not yet complete: ${incomplete.map(s => s.capitalize()).join(', ')}.`);
        }
        return allRequiredCompleted;
    }
}