import * as React from 'react';
import { Nav, NavItem, NavLink } from 'reactstrap';

export default class FrontFilters extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeAllButton: true
        }
    }

    componentDidMount() {
        this.setState({ activeAllButton: !this.props.pushedButton })
    }

    handleClick(isAllButton, action) {
        this.setState({ activeAllButton: isAllButton }, () => { action() });
    }

    render () {
        return (
            <div>
                <Nav pills>
                    <NavItem>
                        <NavLink
                            className="pointer"
                            onClick={this.handleClick.bind(this, true, this.props.allButtonClick)}
                            active={this.state.activeAllButton}
                        >
                            All
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className="pointer"
                            onClick={this.handleClick.bind(this, false, this.props.secondButtonClick)}
                            active={!this.state.activeAllButton}
                        >
                            {this.props.secondButtonTitle}
                        </NavLink>
                    </NavItem>
                </Nav>
            </div>
        )
    }
}