import React from 'react';

import 'components/Share.css'

type Props = {
    identifier: number,
    faceup: number,
    facedown: number,
    win: boolean,
    prize: string,
};

type State = {
    status: string,
};

class Share extends React.Component<Props, State>
{
    constructor(props: Props) {
        super(props);
        this.state = { status: '' };
    }

    render() {
        let state = this.state.status;
        if (state !== '') {
            state = ` (${state})`;
        }

        return (
            <div className='share-container'>
                <span className='share' onClick={this.onClick.bind(this)}>
                    {`share to clipboard${state}`}
                </span>
            </div>
        );
    }

    format(): string {
        let readable = [`hold'gram #${this.props.identifier} `];

        for (let i = 0; i < this.props.faceup; ++i) {
            readable.push('⬜️');
        }

        for (let i = 0; i < this.props.facedown; ++i) {
            readable.push('🟥');
        }

        if (this.props.win) {
            readable.push(this.props.prize);
        }

        return readable.join('');
    }

    onClick(_: React.MouseEvent<HTMLParagraphElement>) {
        navigator.clipboard.writeText(this.format())
            .then(() => this.setState({ status: 'okay'}))
            .catch(() => this.setState({ status: 'error'}));
    }
}

export default Share;
