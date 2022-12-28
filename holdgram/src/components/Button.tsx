import React from 'react';

import 'components/Button.css';

type Props = {
    onClick: (transform: (guess: string) => string) => void,
    withGuess: (guess: string) => string,
    icon: string,
};

type State = { };

class Button extends React.Component<Props, State> {
    render() {
        return (
            <span className='button' onClick={this.onClick.bind(this)}>
                {this.props.icon}
            </span>
        );
    }

    onClick(_: React.MouseEvent<HTMLSpanElement>) {
        this.props.onClick(this.props.withGuess);
    }
}

export default Button;
