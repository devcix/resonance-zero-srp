// This is the main JavaScript file for your Resonance Zero Solitaire module.
// It will handle the card game logic and interaction with the Resonance Zero SRP system.

import { challengeData } from './data/challenge-data.mjs'; // We'll create this file next!

// Simple seedable PRNG (Minimalist version for demonstration)
// You could replace this with a more robust library like 'seedrandom' if needed.
Math.seedrandom = Math.seedrandom || function(seed) {
    let x = seed ? (seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 999999999) : Date.now();
    let y = 123456789;
    let z = 987654321;
    let w = 432198765;

    return function() {
        let t = (x ^ (x << 11)) >>> 0;
        x = y;
        y = z;
        z = w;
        w = (w ^ (w >>> 19) ^ (t ^ (t >>> 8))) >>> 0;
        return w / 4294967296; // Divide by 2^32 to get a float between 0 and 1
    };
};

// Class for managing the card deck
class CardDeck {
    constructor(seed = '') {
        this.suits = ['♠', '♥', '♦', '♣'];
        this.ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        this.deck = this._createDeck();
        this.prng = seed ? new Math.seedrandom(seed) : Math.random;
        this._shuffle();
    }

    _createDeck() {
        const deck = [];
        for (const suit of this.suits) {
            for (const rank of this.ranks) {
                deck.push({ suit, rank, faceUp: false }); // Add faceUp property
            }
        }
        return deck;
    }

    _shuffle() {
        let array = this.deck;
        let currentIndex = array.length;
        let randomIndex;

        // While there remain elements to shuffle.
        while (currentIndex !== 0) {
            // Pick a remaining element.
            randomIndex = Math.floor(this.prng() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]
            ];
        }
    }

    draw(num = 1) {
        if (this.deck.length === 0) {
            console.warn("CardDeck: Deck is empty, cannot draw more cards.");
            return [];
        }
        return this.deck.splice(0, num);
    }

    // Add cards back to the deck (e.g., if re-shuffling discards)
    addCards(cards) {
        this.deck = this.deck.concat(cards);
    }
}

// Global variable to hold the solitaire game instance
let solitaireGame = null;

// The main application class for our Solitaire Game UI
class SolitaireApplication extends Application {
    constructor(options = {}) {
        super(options);
        // Initialize game state (tableau, hand, deck)
        this.gameState = {
            deck: [], // The main draw pile (represents cards remaining in the deck)
            hand: [], // Player's hand (typically one "drawn" card in Klondike variant)
            tableau: [], // Array of arrays, representing columns/stacks
            discard: [] // Discard pile
        };
        this.cardDeck = null; // Will be initialized with a seed later

        // Set up the initial tableau with empty stacks or initial draws as per solitaire rules
        // For a simple Tableau, let's start with 7 empty stacks.
        for (let i = 0; i < 7; i++) {
            this.gameState.tableau.push([]);
        }
    }

    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "rz-solitaire-app",
            classes: ["rz-solitaire-module", "solitaire-board"],
            template: "modules/rz-solitaire-module/templates/solitaire-board.hbs",
            width: 900,
            height: 700,
            resizable: true,
            title: "Resonance Zero: Questing Phase"
        });
    }

    /** @override */
    getData() {
        // Data to pass to the Handlebars template
        const data = super.getData();
        data.gameState = this.gameState;
        // Add paths for card images
        data.getCardImagePath = (card) => `modules/rz-solitaire-module/assets/cards/${card.rank}${card.suit}.webp`;
        return data;
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Listener for drawing cards from the deck
        html.find('.draw-deck').on('click', this._onDrawCard.bind(this));

        // Listener for interacting with tableau stacks (e.g., clicking top card)
        html.find('.tableau-stack').on('click', '.card-image', this._onCardClick.bind(this));

        // Listener for making a move (e.g., button to move cards) - More complex
        html.find('.make-move-button').on('click', this._onMakeMove.bind(this));

        // Listen for the "Reset Game" button
        html.find('.reset-game-button').on('click', this._onResetGame.bind(this));
    }

    /**
     * Handle drawing a card from the main deck.
     * @private
     */
    async _onDrawCard() {
        if (this.cardDeck.deck.length > 0) {
            const drawnCards = this.cardDeck.draw(1);
            if (drawnCards.length > 0) {
                drawnCards[0].faceUp = true; // Immediately reveal drawn card
                this.gameState.hand.push(drawnCards[0]); // Add to player's hand (or discard)
                this.render(true); // Re-render the UI
                console.log("Drew card:", drawnCards[0]);
            }
        } else {
            ui.notifications.warn("The draw deck is empty!");
            // Optionally, shuffle discards back into deck
            if (this.gameState.discard.length > 0) {
                this.cardDeck.addCards(this.gameState.discard);
                this.gameState.discard = [];
                this.cardDeck._shuffle(); // Reshuffle the new deck
                ui.notifications.info("Discard pile shuffled back into draw deck!");
                this.render(true);
            }
        }
    }

    /**
     * Handle clicking on a card in a tableau stack.
     * This is a simplified example; actual solitaire would need drag/drop or more complex click logic.
     * @param {Event} event
     * @private
     */
    async _onCardClick(event) {
        const cardElement = event.currentTarget;
        const stackIndex = parseInt($(cardElement).closest('.tableau-stack').data('stack-index'));
        const cardIndexInStack = parseInt(cardElement.dataset.cardIndex);

        if (isNaN(stackIndex) || isNaN(cardIndexInStack)) return;

        // For simplicity: just flip the top card if it's face down
        const card = this.gameState.tableau[stackIndex][cardIndexInStack];
        if (card && !card.faceUp && cardIndexInStack === this.gameState.tableau[stackIndex].length - 1) {
            card.faceUp = true;
            this.render(true);
            ui.notifications.info(`Flipped ${card.rank}${card.suit}`);
        } else {
            ui.notifications.info(`Clicked on ${card.rank}${card.suit}`);
            // Here you would implement logic for selecting cards for a move.
            // For now, let's just make it a "moved" card for the challenge phase.
            await this._triggerChallengePhase(card);
        }
    }

    /**
     * Placeholder for "make a move" button.
     * In a real solitaire game, this would involve selecting cards and target stacks.
     * For Resonance Zero, a "move" is what triggers a challenge.
     * For now, let's just use the last drawn card or a dummy card for demonstration.
     * @private
     */
    async _onMakeMove() {
        // This is where your solitaire game logic would determine *which* card was "moved"
        // for the purpose of generating a challenge.
        // For now, let's just use the last card in the hand as the 'moved' card.
        if (this.gameState.hand.length === 0 && this.cardDeck.deck.length === 0) {
            ui.notifications.error("No cards to move! Draw a card or reset the game.");
            return;
        }

        let movedCard;
        if (this.gameState.hand.length > 0) {
            movedCard = this.gameState.hand.pop(); // Take the last card from hand as the moved card
        } else {
            // If hand is empty, draw one from the deck if possible for a "move"
            const drawn = this.cardDeck.draw(1);
            if (drawn.length > 0) {
                movedCard = drawn[0];
                movedCard.faceUp = true;
            } else {
                ui.notifications.error("No cards left to make a move with!");
                return;
            }
        }

        // Add the moved card to discard for now (or a specific "moved pile")
        this.gameState.discard.push(movedCard);
        this.render(true); // Re-render to show card moved from hand/deck

        if (movedCard) {
            await this._triggerChallengePhase(movedCard);
        }
    }

    /**
     * Reset the game to its initial state.
     * @private
     */
    async _onResetGame() {
        ui.notifications.info("Resetting Solitaire Game...");
        const seed = game.settings.get("resonance-zero-srp", "solitaireDeckSeed") || Date.now().toString();
        this.cardDeck = new CardDeck(seed);
        this.gameState.hand = [];
        this.gameState.discard = [];
        this.gameState.tableau = [];
        for (let i = 0; i < 7; i++) {
            const stack = this.cardDeck.draw(i + 1); // Draw 1 card for first stack, 2 for second, etc.
            // Only the top card of the initial draw is face up
            stack.forEach((card, idx) => {
                card.faceUp = (idx === stack.length - 1);
            });
            this.gameState.tableau.push(stack);
        }
        this.render(true); // Re-render the UI
        ui.notifications.info("Solitaire game reset. New deck shuffled.");
    }

    /**
     * Triggers the Challenge Phase based on the moved card.
     * @param {object} card The card that was moved (e.g., {suit: '♠', rank: '7'})
     * @private
     */
    async _triggerChallengePhase(card) {
        if (!card) {
            ui.notifications.error("No card was moved to generate a challenge.");
            return;
        }

        const challenge = challengeData[card.suit][card.rank];
        if (!challenge) {
            ui.notifications.error(`No challenge defined for ${card.rank}${card.suit}.`);
            return;
        }

        let chatContent = `
            <div class="rz-challenge-chat-card">
                <h2 class="rz-challenge-title">Resonance Zero Challenge Encounter!</h2>
                <div class="rz-challenge-header">
                    <span class="rz-challenge-card"><b>${card.rank}${card.suit}</b></span>
                    <span class="rz-challenge-level">${challenge.threat} Threat</span>
                </div>
                <h3 class="rz-challenge-theme">${challenge.theme}</h3>
                <p><b>Primary Attribute:</b> <span class="rz-attribute">${challenge.primaryAttr}</span></p>
                <p><b>Relevant Skills:</b> ${challenge.skills.join(', ')}</p>
                <p><b>Special Abilities/Effects:</b> ${challenge.abilities.join(', ')}</p>
                <p><b>Possible Rewards:</b> ${challenge.rewards.join(', ')}</p>
                <hr/>
                <p class="rz-narrative-prompt"><i><b>Narrative Prompt:</b> Imagine a scene based on this challenge and the context of your last card move. Describe it in the chat! How does your Traveler perceive or interact with this unfolding reality distortion?</i></p>
                <div class="rz-roll-section">
                    <p>When ready to resolve, select your character and click below to roll:</p>
                    <button class="rz-challenge-roll-button" data-attribute-type="${challenge.primaryAttr}" data-attribute-suit="${card.suit}">Roll for <span style="text-transform: capitalize;">${challenge.primaryAttr}</span></button>
                </div>
            </div>
        `;

        await ChatMessage.create({
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ alias: "Resonance Zero Narrator" }),
            content: chatContent,
            whisper: [game.user.id] // Whisper to the player for solo play
        });

        console.log("Challenge triggered:", challenge);
        ui.notifications.info(`Challenge triggered by ${card.rank}${card.suit}: ${challenge.theme}`);
    }
}

// -----------------------------------------------------------
// Hook into Foundry VTT Lifecycle
// -----------------------------------------------------------

// When Foundry is ready, but before the game world is fully loaded
Hooks.once('setup', function() {
    // Ensure our system is active. If not, this module won't function correctly.
    if (!game.system.id === "resonance-zero-srp") {
        ui.notifications.error("Resonance Zero Solitaire Module requires the 'Resonance Zero SRP' system to be active!");
        return;
    }
    console.log('Resonance Zero Solitaire Module | Setup complete.');
});

// When the game world is fully loaded
Hooks.once('ready', async function() {
    console.log('Resonance Zero Solitaire Module | Game world ready. Launching Solitaire UI...');

    // Instantiate and render the solitaire game application
    solitaireGame = new SolitaireApplication();

    // Reset game on first load or if not already initialized
    // This will draw initial tableau cards
    if (!solitaireGame.cardDeck) {
        await solitaireGame._onResetGame();
    }

    solitaireGame.render(true); // Render the application, true makes it bring to front

    // Register a chat message listener for the roll button
    Hooks.on('renderChatMessage', (app, html, data) => {
        if (!html.find('.rz-challenge-roll-button').length) return; // Only process challenge cards

        html.find('.rz-challenge-roll-button').on('click', async (event) => {
            const button = event.currentTarget;
            const attributeType = button.dataset.attributeType; // e.g., "Physical"
            const attributeSuit = button.dataset.attributeSuit; // e.g., "♦"

            // Get the currently selected player character (actor)
            const actor = game.actors.find(a => a.hasPlayerOwner); // Find an actor controlled by the current player
            if (!actor) {
                ui.notifications.warn("Please select a player character to roll for the challenge.");
                return;
            }

            let attributeValue = 0;
            // Map the attributeType to the correct path in the actor's system data
            const mappedAttribute = attributeType.toLowerCase(); // "physical", "social", "spiritual", "intellectual"

            if (actor.system.attributes[mappedAttribute]) {
                attributeValue = actor.system.attributes[mappedAttribute].rank;
            } else {
                ui.notifications.warn(`Could not find attribute value for: ${attributeType}. Defaulting to 0.`);
            }

            // Perform the roll (e.g., 1d20 + attribute)
            const rollFormula = `1d20 + ${attributeValue}`; // Example: D20 + Attribute
            const roll = await new Roll(rollFormula).evaluate({async: true});

            // Post the roll result to chat
            roll.toMessage({
                speaker: ChatMessage.getSpeaker({ actor: actor }),
                flavor: `Roll for ${attributeType} Challenge!`
            });

            // TODO: Implement logic for success/failure based on a difficulty (e.g., target 10 or 15)
            // This is where the Challenge Phase's success/failure and reward/cost logic would go.
            // You'll need to define how to determine difficulty based on the card's threat level.
            // For now, it just rolls.
            let successMessage = "";
            const difficulty = 15; // Example difficulty, you'd make this dynamic based on threat level
            if (roll.total >= difficulty) {
                successMessage = `<h3>Challenge Overcome!</h3><p>Your Traveler succeeded against the ${attributeType} challenge! You gain potential rewards and insights.</p>`;
                // You'd add logic here to grant rewards to the actor
            } else {
                successMessage = `<h3>Challenge Failed!</h3><p>The ${attributeType} challenge proved too great. Your Traveler suffers consequences (e.g., gain Strain, lose Health, incur a new trouble).</p>`;
                // You'd add logic here to apply costs to the actor
            }

            ChatMessage.create({
                user: game.user.id,
                speaker: ChatMessage.getSpeaker({ alias: "Resonance Zero Narrator" }),
                content: successMessage,
                whisper: [game.user.id]
            });
        });
    });
});