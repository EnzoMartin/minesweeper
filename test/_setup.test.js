import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import {configure, shallow, render, mount} from 'enzyme';
import {expect} from 'chai';

configure({adapter: new Adapter()});

global.React = React;
global.expect = expect;
global.mount = mount;
global.render = render;
global.shallow = shallow;
