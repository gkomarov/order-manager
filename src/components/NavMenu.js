import React from 'react';
import { Collapse, Container, Nav, NavItem, Navbar, NavbarBrand, NavbarToggler, NavLink } from 'reactstrap';
import { UncontrolledButtonDropdown, DropdownMenu, DropdownItem, DropdownToggle } from 'reactstrap';
import { Link } from 'react-router-dom';
import { logOut } from "../index";
import './NavMenu.css';

export default class NavMenu extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      isOpen: false,
      activePath: ''
    };
    this.toggle = this.toggle.bind(this);
  }

  getPathName() {
    return window.location.pathname;
  }

  toggle () {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  markAsActive(e) {
    this.setState( { activePath: e.target.pathName });
  }

  logout(e) {
    e.preventDefault();
    logOut();
  }

  render () {
    const activePath = this.getPathName();
    return (
      <header>
        <Navbar className="navbar-expand-sm navbar-toggleable-sm border-bottom box-shadow mb-3" light >
          <Container fluid>
            <NavbarBrand tag={Link} to="/">
              <div className="d-flex align-items-center">
                <img style={{marginBottom: 10}} alt="logo" width="100" height="50" src="/logo.png"></img>
                <span style={{color: "#009fe3"}}>OMS</span>
              </div>
            </NavbarBrand>
            <NavbarToggler onClick={this.toggle} className="mr-2" />
            <Collapse className="d-sm-inline-flex" isOpen={this.state.isOpen} navbar>
              <Nav className="navbar-nav">
                <NavItem active={activePath.includes("/customers")}><NavLink tag={Link} to="/customers">Customers</NavLink></NavItem>
                <NavItem active={activePath.includes("/orders")}><NavLink tag={Link} to="/orders">Orders</NavLink></NavItem>
                <NavItem active={activePath.includes("/jobs")}><NavLink tag={Link} to="/jobs">Jobs</NavLink></NavItem>
                <NavItem active={activePath.includes("/invoices")}><NavLink tag={Link} to="/invoices">Invoices</NavLink></NavItem>
              </Nav>
            </Collapse>
            <UncontrolledButtonDropdown>
              <DropdownToggle caret className="btn-light">
                <img alt="profile" src="/user.svg"></img>
              </DropdownToggle>
              <DropdownMenu style={{minWidth: "inherit"}}>
                <DropdownItem divider />
                <DropdownItem>
                  <a href={null} onClick={this.logout}>
                    <img alt="logout" src="/log-in.svg"></img>
                  </a>
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledButtonDropdown>
          </Container>
        </Navbar>
      </header>
    );
  }
}
