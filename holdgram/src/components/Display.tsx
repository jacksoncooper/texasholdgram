import React from 'react';

import * as Card from 'components/Card';
import Button from 'components/Button';

import 'components/Display.css';

type Props = {
    cards: Card.Props[],
    deleteTransform: (guess: string) => string,
    clearTransform: (guess: string) => string,
    onButtonClick: (transform: (guess: string) => string) => void,
    win: boolean,
};

type State = { };

class Display extends React.Component<Props, State>
{
    render() {
        let cards = this.props.cards.map((card, index) =>
            <Card.Card
                key={index}
                symbol={card.symbol}
                facedown={card.facedown}
                onClick={card.onClick}
                win={this.props.win}
            />
        );

        return (
            <div className='display'>
                {cards}
                <Button
                    icon="⌫"
                    onClick={this.props.onButtonClick}
                    withGuess={this.props.deleteTransform}
                />
                <Button
                    icon="╳"
                    onClick={this.props.onButtonClick}
                    withGuess={this.props.clearTransform}
                />
            </div>
        );
    }
}

export default Display;
