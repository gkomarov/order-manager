import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

export default class ModalConfirm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return <div>
            <Modal isOpen={this.props.modal} toggle={this.props.toggle} className={this.props.className}>
            <ModalHeader toggle={this.props.toggle}>{this.props.header}</ModalHeader>
            <ModalBody>{this.props.body}</ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={this.props.toggle}>Cancel</Button>
                <Button color="primary" onClick={this.props.action}>Yes</Button>{' '}
            </ModalFooter>
            </Modal>
        </div>
    }
}