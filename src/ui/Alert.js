import React from 'react';
import './Alert.css';

class Alert extends React.Component {
    render() {
        return (
            <div className={"alert " + this.props.type}>
                <div className="alert__content">
                    {this.props.children}
                </div>
            </div>
        );
    }
}

export default Alert;
