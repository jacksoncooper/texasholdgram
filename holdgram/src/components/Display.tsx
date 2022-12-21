import React from 'react';

import * as Card from 'components/Card';
import 'components/Display.css';

type Props = {
    cards: Card.Props[],
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
                onCardClick={card.onCardClick}
            />
        );

        return (
            <div className='display'>
                {cards}
            </div>
        );
    }
}

export default Display;
