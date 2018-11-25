import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {Link} from 'react-router-dom';

import {faGithub} from '@fortawesome/free-brands-svg-icons';
import {FontAwesomeIcon as Icon} from '@fortawesome/react-fontawesome';

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
                target='_blank'
                href='https://github.com/EnzoMartin/minesweeper'
              >
                {'GitHub '}
                <Icon icon={faGithub} />
              </NavLink>
            </NavItem>
          </Nav>
        </Collapse>
      </Navbar>
    );
  }
}

export default Navigation;
