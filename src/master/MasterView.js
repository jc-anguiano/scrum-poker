import React from 'react';
import {Page, Header} from '../common/layout';
import UsersList from './UsersList';
import Results from './Results';
import './MasterView.css';
import calcResults from './calcResults';
import withNotifications from '../common/withNotifications';

class MasterView extends React.Component {
    constructor(props) {
        super(props);
        this.handleStartVoting = this.handleStartVoting.bind(this);
        this.handleEndVoting = this.handleEndVoting.bind(this);

        this.state = {
            voting: true,
            users: [],
            results: null
        };
    }

    componentDidMount() {
        this.addListeners();
    }

    componentWillUnmount() {
        this.removeListeners();
    }

    addListeners() {
        var {socket} = this.props;

        socket.on('user joined', (user) => this.handleUserJoined(user));
        socket.on('card changed', (userId, card) => this.handleCardChanged(userId, card));
        socket.on('user disconnected', (userId) => this.handleUserDisconnected(userId));
        socket.on('user connected', (userId) => this.handleUserConnected(userId));
        socket.on('user left', (userId) => this.handleUserLeft(userId));
        socket.on('disconnect', () => this.handleRoomClosed());
    }

    removeListeners() {
        var {socket} = this.props;

        socket.off('user joined');
        socket.off('card changed');
        socket.off('user left');
        socket.off('disconnect');
    }

    handleUserJoined(user) {
        this.setState({ users: this.state.users.concat(user) });
    }

    handleCardChanged(userId, card) {
        var {users} = this.state;
        var i = users.findIndex((user) => user.id === userId);

        users[i].card = card;

        this.setState({ users: [...users] });

        if (card === 'Bk') {
            this.props.notify({
                type: "info",
                message: <span><b>{users[i].username}</b>: ¡Es hora de un descanso!</span>
            });
        }
    }

    handleUserDisconnected(userId) {
        var {users} = this.state;
        var user = users.find((user) => user.id === userId);

        user.connected = false;

        this.setState({ users: [...users] });
    }

    handleUserConnected(userId) {
        var {users} = this.state;
        var user = users.find((user) => user.id === userId);

        user.connected = true;

        this.setState({ users: [...users] });
    }

    handleUserLeft(userId) {
        var {users} = this.state;
        var i = users.findIndex((user) => user.id === userId);

        users.splice(i, 1);

        this.setState({ users: [...users] });
    }

    handleRoomClosed() {
        alert('La sesión fue terminada.');
        window.location.reload(false);
    }

    handleStartVoting() {
        this.state.users.forEach((user) => user.card = null);

        this.setState({
            results: null,
            voting: true
        });

        this.props.socket.emit('start voting');
    }

    handleEndVoting() {
        this.setState({
            results: calcResults(this.state.users),
            voting: false
        });
    }

    render() {
        const {session} = this.props;
        const {users, voting, results} = this.state;

        return (
            <Page
                header={<MasterViewHeader session={session} />}
            >
                {voting && users.length === 0 ?
                    <NoUsersMessage sessionId={session.id} /> :
                    <Content
                        onStartVoting={this.handleStartVoting}
                        onEndVoting={this.handleEndVoting}
                        voting={voting}
                        results={results}
                        users={users}
                    />
                }
            </Page>
        );
    }
}

function MasterViewHeader(props) {
    return (
        <Header>
            <div className="session">
                <span className="session__name">
                    {props.session.name} |
                </span>
                <span className="session__id">
                    <b> ID</b>: {props.session.id}
                </span>
            </div>
        </Header>
    );
}

function NoUsersMessage(props) {
    return (
        <div className="no-users">
            <h3>¿Dónde están todos?</h3>
            <p>Esperando a que los miembros del equipo se unan.</p>
            <p>Usa el ID de la sesión <b>{props.sessionId}</b> para unirte a la sala.</p>
        </div>
    );
}

function Content(props) {
    return (
        props.voting ?
            <VotingPanel
                users={props.users}
                onEndVoting={props.onEndVoting}
            /> :
            <ResultsPanel
                results={props.results}
                onStartVoting={props.onStartVoting}
            />
    );
}

function VotingPanel(props) {
    return (
        <>
            <UsersList
                users={props.users}
                showResponse={false}
            />
            <div className="actions">
                <button onClick={props.onEndVoting}>Terminar Votación</button>
            </div>
        </>
    );
}

function ResultsPanel(props) {
    return (
        <>
            <Results {...props.results} />
            <UsersList
                users={props.results.users}
                showResponse={true}
            />
            <div className="actions">
                <button onClick={props.onStartVoting}>Nueva Votación</button>
            </div>
        </>
    )
}

export default withNotifications(MasterView);
