import React from 'react';

import 'components/Game.css';

import * as Card from 'components/Card';

import Caption from 'components/Caption';
import Display from 'components/Display';
import Guess from 'components/Guess';
import Hint from 'components/Hint';
import Share from 'components/Share';

import type { Path } from 'paths';
import { shuffleRound } from 'paths';

type Props = {
    path: Path,
    identifier: number,
};

type State = {
    round: number,
    guess: string,
    win: boolean,
    hint: number,
};

class Game extends React.Component<Props, State>
{
    flop: string;
    placeholder: string;

    constructor(props: Props) {
        super(props);

        this.flop = shuffleRound(this.props.path[0]);
        this.placeholder = 'anagram?';

        this.state = {
            round: 0,
            guess: '',
            win: false,
            hint: 0,
        };
    }

    onGuessChange(event: React.FormEvent<HTMLInputElement>) {
        let input = event.currentTarget.value.toLowerCase();

        this.setState((state, _) => {
            let solutionLength = this.flop.length + this.state.round;

            let guess: string;
            if (input.length <= solutionLength) {
                guess = input;
            } else {
                guess = input.substring(input.length - solutionLength);
            }

            let progress = this.checkGuess(guess, state);

            if (state.round + 1 === progress.round) {
                this.placeholder = guess;
                guess = '';
            }

            return { ...progress, guess };
        });
    }

    onCardClick(event: React.MouseEvent<HTMLSpanElement>) {
        // TODO: Pass up `Card.Props`, not the span element.
        let symbol = event.currentTarget.textContent ?? '';

        // TODO: Hack.
        if (symbol === '' || this.state.win) {
            return;
        }

        this.setState((state, _) => {
            let solutionLength = this.flop.length + this.state.round;

            let guess: string;
            if (state.guess.length + 1 <= solutionLength) {
                guess = state.guess + symbol;
            } else {
                guess = symbol;
            }

            let progress = this.checkGuess(guess, state);

            if (state.round + 1 === progress.round) {
                this.placeholder = guess;
                guess = '';
            }

            return { ...progress, guess };
        });
    }

    checkGuess(guess: string, state: State): { round: number, win: boolean, hint: number } {
        // Only check the guess if its length is equal to the number of faceup cards.
        let inDictionary = this.props.path[state.round].words.has(guess);
        let correctLength = guess.length === 3 + state.round;
        let lastRound = state.round === this.props.path.length - 1;

        if (!(correctLength && inDictionary)) {
            return { ...state };
        }

        if (lastRound) {
            return { ...state, win: true };
        }

        return {
            round: state.round + 1,
            win: false,
            hint: 0,
        };
    }

    toCards(flop: string, path: Path): Card.Props[] {
        // Remove the last vertex of the path. It does not contain an edge symbol.
        path = path.slice(0, path.length - 1);

        let cards = [...flop].map(symbol => ({
            symbol,
            facedown: false,
            onCardClick: this.onCardClick.bind(this),
        }));

        cards.push(...path.map((round, index) => ({
            // Non-null assertion because each vertex except the last contains an edge symbol.
            symbol: round.next!,
            facedown: this.state.round <= index,
            onCardClick: this.onCardClick.bind(this),
        })));

        return cards;
    }

    onHint(hint: number) {
        this.setState((state, _) => ({
            ...state,
            hint,
        }));
    }

    render() {
        return (
            <div>
                <Caption round={this.state.round} win={this.state.win} />
                <Display cards={this.toCards(this.flop, this.props.path)} />
                <Guess
                    guess={this.state.guess}
                    placeholder={this.placeholder}
                    disabled={this.state.win}
                    onGuessChange={this.onGuessChange.bind(this)}
                />
                <Share
                    identifier={this.props.identifier}
                    faceup={this.flop.length + this.state.round}
                    facedown={this.props.path.length - 1 - this.state.round}
                    win={this.state.win}
                />
                <Hint
                    round={this.props.path[this.state.round]}
                    hint={this.state.hint}
                    onHint={this.onHint.bind(this)}
                />
            </div>
        );
    }
}

export default Game;
