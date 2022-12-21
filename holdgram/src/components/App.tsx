import React from 'react';

import 'components/App.css';

import Game from 'components/Game';

import type { Path } from 'paths';
import { fetchDaily } from 'paths';

type Props = { };

type State = {
    path: { identifier: number, path: Path } | null,
};

class App extends React.Component<Props, State>
{
    constructor(props: Props) {
        super(props);
        this.state = { path: null };
    }

    componentDidMount() {
        fetchDaily().then(path => {
            this.setState({ path });
        });
    }

    render() {
        let contents: JSX.Element;

        if (this.state.path === null) {
            contents = <p className='loading'>dictionary spelunking…</p>;
        } else {
            let path = this.state.path;
            contents = (
                <Game
                    identifier={path.identifier}
                    path={path.path}
                />
            );
        }

        return contents;
    }
}

export default App;
