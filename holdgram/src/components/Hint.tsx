import React from 'react';

import type { Round } from 'paths';

import 'components/Hint.css';

type Props = {
    round: Round,
    hint: number,
    onHint: (hint: number) => void,
}

type State = { }

class Hint extends React.Component<Props, State>
{
    hints: string[];

    constructor(props: Props) {
        super(props);

        this.hints = this.writeHints();
    }

    writeHints(): string[] {
        let round = this.props.round;
        let firstLetters = [...round.words].map(word => word[0]).join(', ');
        let lastLetters = [...round.words].map(word => word[word.length - 1]).join(', ');

        return [
            `we think there are ${round.words.size} answer(s)`,
            `any of these first letters will do: ${firstLetters}`,
            `any of these last letters will do: ${lastLetters}`,
            `spill the beans?`,
            `alright.`,
            `if any aren't fun, please leave feedback (bit.ly/texasholdgram)!`,
            `the beans: ${[...round.words].join(', ')}`,
        ];
    }

    onHint() {
        let hint = this.props.hint;
        this.props.onHint(hint < this.hints.length ? hint + 1 : hint);
    }

    render() {
        this.hints = this.writeHints();

        return (
            <div className='hint-container'>
                <span className='hint' onClick={this.onHint.bind(this)}>hint {`${this.props.hint} of ${this.hints.length}`}</span>
                <ol>
                    {
                        this.hints
                            .slice(0, this.props.hint)
                            .map((hint, index) => <li key={index}>{hint}</li>)
                    }
                </ol>
            </div>
        );
    }
}

export default Hint;
