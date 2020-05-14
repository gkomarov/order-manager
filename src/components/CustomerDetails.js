import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actionCreators } from '../store/Customers';
import { Button, Input } from 'reactstrap';

import Alert from './Alert';

class CustomerDetails extends Component {

    constructor(props) {
        super(props);
        this.state = {
            paymentTerms: 0,
            modal: false,
            alertMessage: 'Default',
            errors: '',
            customerId: null
        }
        this.setErrorsToState = this.setErrorsToState.bind(this);
    }

    componentDidMount() {
        this.setState({ customerId: this.props.match.params.customerId }, () => {
            this.props.requestCustomerDetails(this.state.customerId)
                .then(() => {
                    this.setState({ paymentTerms: this.props.details.paymentTerms });
                })
                .catch(errorResponse => {
                    this.setErrorsToState(errorResponse);
                });
        });
    }

    setErrorsToState(errors) {
        this.setState({ errors });
    }

    toggleAlert() {
        this.setState(prevState => ({
            modal: !prevState.modal
        }))
    };

    onCloseAlert() {
        const { clearErrors } = this.props;
        clearErrors();
        this.toggleAlert();
    }

    savePaymentTerms(event) {
        const paymentTerms = this.state.paymentTerms;
        const { updateCustomerDetails } = this.props;
        const customerId = this.state.customerId;
        updateCustomerDetails(customerId, paymentTerms)
            .catch(errorResponse => {
                this.setErrorsToState(errorResponse)
            });
    }

    handleChange(event) {
        this.setState({ paymentTerms: event.target.value });
    }

    handleBack() {
        // const { requestCustomers, pageFilter } = this.props;
        // requestCustomers(pageFilter.skip, pageFilter.take, '' , pageFilter.activePage)
        //   .then(() => {this.props.history.goBack();})
        //   .catch(errorResponse => {
        //     this.setErrorsToState(errorResponse)
        //   });
        this.props.history.goBack();
    }

    render() {
        const { details } = this.props;
        const { errors } = this.state;

        if (errors) {
            throw new Error(errors);
        }

        return (
            <div>
                <Alert
                    modal={this.props.errors !== ''}
                    toggle={this.toggleAlert.bind(this)}
                    alertMessage={this.props.errors}
                    onClose={this.onCloseAlert.bind(this)}
                />

                <div className="row p-3">
                    <div className="col-9 d-flex justify-content-start align-items-center">
                        <h4 className="mb-0 mr-2">Customer Details</h4>
                    </div>
                    <div className="col-3 d-flex justify-content-end align-items-center">
                        <Button color="secondary" onClick={this.handleBack.bind(this)}>Back</Button>
                    </div>
                </div>

                <div className="row p-3">
                    <div className="col-12 d-flex justify-content-start align-items-center">
                        <h5 className="mb-0">{details.fullName}</h5>
                        <div className="ml-2">@ {details.company}</div>
                        {details.email && (<div className="ml-2">({details.email})</div>)}
                    </div>
                </div>

                <div className="col-4">
                    <div className="d-flex flex-column">
                        <label className="labled">Payment terms</label>
                        <Input className="col-3" value={this.state.paymentTerms} onChange={this.handleChange.bind(this)} onBlur={this.savePaymentTerms.bind(this)} />
                        <small className="mt-1">set 0 for payment term 'on receipt'</small>
                    </div>
                    <br />

                    <div>
                        <label className="labled">Phone number</label>
                        <div>{details.phone}</div>
                    </div>
                    <br />

                    <div>
                        <label className="labled">Billing address</label>
                        {details.address && (
                            <React.Fragment>
                                <div>{details.address.firstName + ' ' + details.address.lastName}</div>
                                <div>{details.address.company}</div>
                                <div>{details.address.address1}</div>
                                <div>{details.address.address2}</div>
                                <div>{details.address.city}</div>
                                <div>{details.address.state}</div>
                                <div>{details.address.postCode}</div>
                                <div>{details.address.country}</div>
                                <div>{details.address.phone}</div>
                            </React.Fragment>
                        )
                        }
                    </div>
                </div>

                <div className="col-4"></div>
                <div className="col-4"></div>

            </div>
        );
    }
}

export default connect(
    state => state.customers,
    dispatch => bindActionCreators(actionCreators, dispatch)
)(CustomerDetails);