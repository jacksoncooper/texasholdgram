import React from 'react';

import 'components/Caption.css';

import { daysFromEpoch, shuffle } from 'paths';

type Props = {
    round: number,
    win: boolean,
    prize: string,
};

type State = { };

let turns = choose(["the turn", "fourth street"]);
let rivers = choose(["the river", "fifth street"]);

let beyonds = shuffle([
    "fourth avenue",
    "scott street",
    "sixth street",
    "the ace of pentacles",
    "the bop",
    "the briars",
    "the cobblestones",
    "the cooper",
    "the elephant",
    "the empress",
    "the fold",
    "the fool",
    "the forest",
    "the hierophant",
    "the lovers",
    "the magician",
    "the meadow",
    "the moon",
    "the pastry",
    "the postman",
    "the radio",
    "the rory",
    "the spin",
    "the tower",
    "the twister",
    "the wisps",
    "the world",
    "twelfth street"
]);

class Caption extends React.Component<Props, State>
{
    toCaption() {
        if (this.props.win) {
            return `the victory! ${this.props.prize}`;
        }

        let round = this.props.round;

        if (round === 0) {
            return "the flop";
        } else if (round === 1) {
            return turns;
        } else if (round === 2) {
            return rivers;
        } else {
            return beyonds[this.props.round % beyonds.length];
        }
    }

    render() {
        return <p className='caption'>{this.toCaption()}</p>;
    }
}

function choose(captions: string[]) {
    let { days, from } = daysFromEpoch();
    return captions[(from.valueOf() + days) % captions.length];
}

export default Caption;
