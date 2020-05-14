import React from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';

export default class ModalConfirm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return <div>
            <Modal isOpen={this.props.modal} toggle={this.props.toggle} className={this.props.className}>
            <ModalBody  style={{backgroundColor: "#dc3545", color: "#fff"}}>
                <div dangerouslySetInnerHTML={{__html: this.props.alertMessage}}></div>
            </ModalBody>
            <ModalFooter style={{backgroundColor: "#dc3545", borderTop: "none"}}>
                <Button color="secondary" onClick={this.props.onClose ? this.props.onClose : this.props.toggle}>Close</Button>
            </ModalFooter>
            </Modal>
        </div>
    }
}