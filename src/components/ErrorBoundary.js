import React from 'react';
import Alert from './Alert';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
       this.state = { 
           hasError: false,
           messageError: '',
           modal: false,
        };
    }
    static getDerivedStateFromError(error) {
      // Update state so the next render will show the fallback UI.
      return { hasError: true };
    }

    toggleAlert() {
        this.setState(prevState => ({
          modal: !prevState.modal
        }))
      };

    onCloseAlert() {
        this.clearErrors();
        this.toggleAlert();
    }

    clearErrors() {
        this.setState({ messageError: '', hasError: false });
    }

    componentDidCatch(error) {
      this.setState({ messageError: error.message, hasError: true });
    }

    render() {
      if (this.state.hasError) {
        return <Alert
          modal={this.state.hasError}
          toggle={this.toggleAlert.bind(this)}
          alertMessage={this.state.messageError}
          onClose={this.onCloseAlert.bind(this)}
        />
      }
      return this.props.children
    }
  }