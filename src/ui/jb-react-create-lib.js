import { createElement, Component } from 'react';
import { render, findDOMNode } from 'react-dom';

jb.ui.render = render;
jb.ui.h = createElement;
jb.ui.Component = Component;
jb.ui.findDOMNode = findDOMNode;

