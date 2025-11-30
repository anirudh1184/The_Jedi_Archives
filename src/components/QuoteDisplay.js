export class QuoteDisplay {
    constructor() {
        this.quotes = [
            { text: "I've seen things you people wouldn't believe...", author: "Roy Batty, Blade Runner" },
            { text: "May the Force be with you.", author: "Han Solo, Star Wars" },
            { text: "There is no spoon.", author: "The Matrix" },
            { text: "Open the pod bay doors, HAL.", author: "2001: A Space Odyssey" },
            { text: "E.T. phone home.", author: "E.T. the Extra-Terrestrial" },
            { text: "I'll be back.", author: "The Terminator" },
            { text: "Game over, man! Game over!", author: "Aliens" },
            { text: "Do, or do not. There is no try.", author: "Yoda, The Empire Strikes Back" },
            { text: "I am your father.", author: "Darth Vader, The Empire Strikes Back" },
            { text: "Life finds a way.", author: "Jurassic Park" },
            { text: "The needs of the many outweigh the needs of the few.", author: "Spock, Star Trek II" },
            { text: "Resistance is futile.", author: "The Borg, Star Trek" }
        ];
        this.element = this.render();
        this.startCycling();
    }

    render() {
        const container = document.createElement('div');
        container.className = 'quote-container';
        this.updateQuote(container);
        return container;
    }

    updateQuote(container) {
        const randomQuote = this.quotes[Math.floor(Math.random() * this.quotes.length)];

        // Fade out
        container.style.opacity = '0';

        setTimeout(() => {
            container.innerHTML = `
                <span class="quote-text">"${randomQuote.text}"</span>
                <span class="quote-author">— ${randomQuote.author}</span>
            `;
            // Fade in
            container.style.opacity = '1';
        }, 500);
    }

    startCycling() {
        setInterval(() => {
            this.updateQuote(this.element);
        }, 5000); // Change every 5 seconds
    }
}
