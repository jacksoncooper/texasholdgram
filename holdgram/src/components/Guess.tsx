import React from 'react';

import 'components/Guess.css';

type Props = {
    guess: string,
    placeholder: string,
    disabled: boolean,
    onGuessChange: React.FormEventHandler<HTMLInputElement>;
};

type State = { };

class Guess extends React.Component<Props, State>
{
    render() {
        return (
            <input
                className='guess'
                type='text'
                value={this.props.guess}
                placeholder={this.props.placeholder}
                disabled={this.props.disabled}
                onInput={this.props.onGuessChange}
            />
        );
  }
}

export default Guess;
