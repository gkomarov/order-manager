import React from 'react';
import { Container } from 'reactstrap';
import NavMenu from './NavMenu';
import ErrorBoundary from './ErrorBoundary';

export default props => (
  <div>
    <NavMenu />
    <Container fluid>
      <ErrorBoundary>
        {props.children}
      </ErrorBoundary>
    </Container>
  </div>
);
