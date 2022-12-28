import React from 'react';

import 'components/Card.css';

type Props = {
    symbol: string,
    facedown: boolean,
    onClick: React.MouseEventHandler<HTMLSpanElement>,
};

type State = { };

class Card extends React.Component<Props, State>
{
    render() {
        let classes = '';
        let symbol = this.props.symbol;

        if (this.props.facedown) {
            classes = ' facedown-card';
            symbol = '';
        }

        return (
            <span className={`card${classes}`} onClick={this.props.onClick}>
                {symbol}
            </span>
        );
  }
}

export type { Props };
export { Card };
