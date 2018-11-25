import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {Link} from 'react-router-dom';

import {
  Nav,
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  NavItem,
  NavLink,
} from 'reactstrap';

import {ROUTES} from './constants';

@inject('boardStore')
@observer
class Navigation extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {isOpen: false};
  }

  toggle() {
    this.setState((prevState) => {
      return {isOpen: !prevState.isOpen};
    });
  }

  render() {
    return (
      <Navbar color='dark' dark expand='md'>
        <NavbarBrand
          tag={Link}
          to={ROUTES.home}
        >
          {'Minesweeper'}
        </NavbarBrand>
        <NavbarToggler onClick={this.toggle} />
        <Collapse isOpen={this.state.isOpen} navbar>
          <Nav className='ml-auto' navbar>
            <NavItem>
              <NavLink
                tag={Link}
                to={ROUTES.home}
              >
                {'Board'}
              </NavLink>
            </NavItem>
          </Nav>
        </Collapse>
      </Navbar>
    );
  }
}

export default Navigation;
