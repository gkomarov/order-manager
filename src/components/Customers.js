import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ReactPaginate from 'react-paginate';
import { actionCreators } from '../store/Customers';
import { getUniqKey } from './helpers';
import { InputGroup, Input, InputGroupAddon, Button } from 'reactstrap';



class Customers extends Component {

  constructor(props) {
    super(props);
    this.state = {
      searchValue: '',
      numberOfItemOnPage: 10,
      customOrdering: false,
      errors: '',
    }
    this.changeSearchValue = this.changeSearchValue.bind(this);
    this.ensureDataFetched = this.ensureDataFetched.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
  }

  componentDidMount() {
    if (this.props.list.length < 1) {
      this.ensureDataFetched();
    }
    const sortableHeadersCollection = document.getElementsByClassName("sortableItem");//
    for (let sortableNode of sortableHeadersCollection) {
      sortableNode.addEventListener("click", this.sortByValue.bind(this, sortableNode));
    }
  }

  componentWillUnmount() {
    /**Clear order list leave order type page.
     * If user come back from another page, list will be downloaded */
    let leaveOrders = window.location.href.includes('customers');
    if (!leaveOrders) {
        this.props.clearFilter();
        this.props.replaceCustomersList([]);
    }
  }

  changeSearchValue(e, clear) {
    const value = clear ? '' : e.target.value;
    this.setState({ searchValue: value }, () => {
        this.props.updatePageFilter({
          searchValue: value,
          skip: 0,
          take: this.state.numberOfItemOnPage,
          activePage: 0
        })
            .then(() => {
                if (clear) this.ensureDataFetched();
            })
    });
  }

  ensureDataFetched() {
    const { requestCustomers, updatePageFilter } = this.props;
    updatePageFilter({ pagingKey: getUniqKey() })
        .then(requestCustomers())
        .catch(errors => {
            this.setState({ errors });
        });
  }
  
  sortByValue(element) {
    const sortValue = element.dataset.sort;
    const { orderBy, orderByDesc } = this.props.pageFilter;
    const actualOrderByDesc = orderBy === sortValue ? !orderByDesc : false;
    this.props.updatePageFilter({
      orderBy: sortValue ? sortValue : undefined,
      orderByDesc: actualOrderByDesc
    })
      .then(this.setState({ customOrdering: true }, () => this.ensureDataFetched()));
  }

  redirectToDetails(id) {
    this.props.history.push(`/customers/${id}`)
  }
  
  renderCustomersTable(props) {
    const { orderBy, orderByDesc } = this.props.pageFilter;
    const { customOrdering } = this.state;
    const orderDownImg = <img width={10} alt="desc" src="arrow-down-solid.svg"/>;
    const orderUpImg = <img width={10} alt="desc" src="arrow-up-solid.svg"/>;
    const emptyImg = <span style={{width: 10}}/>;
    const activeOrderIcon = orderByDesc ? orderDownImg : orderUpImg;

    const headers = [
      {title: "Name", ordering: "FirstName"},
      {title: "Company", ordering: "Company"},
      {title: "Payment terms", ordering: "PaymentTerms"},
    ]

    return (
      <table className='table table-sm table-hover table-striped table-nonselectable'>
        <thead>
          <tr>
            {headers.map(header => {
              let orderingIcon = customOrdering && orderBy === header.ordering && activeOrderIcon;
              return <th data-sort={header.ordering} className="sortableItem" key={header.ordering}>
                <span className="thContent d-flex align-items-center justify-content-between">{header.title}{orderingIcon ? orderingIcon : emptyImg}</span>
              </th>
            })}
          </tr>
        </thead>
        <tbody>
          {props.list.length > 0 && 
            props.list.map(customer =>
              <tr key={customer.id} onClick={this.redirectToDetails.bind(this, customer.id)}>
                <td style={{width: 500}}>{customer.fullName}</td>
                <td>{customer.company}</td>
                <td className="text-right">{customer.paymentTerms}</td>
              </tr>
            )
          }
          {!props.list.length && (
            <tr>
              <td className="col-12 text-center" colSpan={3}>No results</td>
            </tr>
          )}
        </tbody>
      </table>
    );
  }

  clearSearch(e) {
    this.changeSearchValue(e, true);
  }

  changePage(selectedObject) {
    const activePage = selectedObject.selected;
    const skip = activePage * this.state.numberOfItemOnPage;
    const rest = this.props.count - skip;
    const take = this.state.numberOfItemOnPage > rest ? rest : this.state.numberOfItemOnPage;
    this.props.updatePageFilter({
      skip: skip,
      take: take,
      activePage: activePage
    })
      .catch(errors => {
          this.setState({ errors });
      })
      .then(this.ensureDataFetched());
  }

  handleKeyPress(e) {
    if (e.key === "Enter") {
      this.ensureDataFetched()
    }
  }
  
  renderPagination(props) {
    const initialPage = props.pageFilter.activePage;
    const pageCount = props.count / this.state.numberOfItemOnPage;
    return (
      <div className="d-flex align-items-center">
        <ReactPaginate
          pageCount={pageCount}
          pageRangeDisplayed={4}
          marginPagesDisplayed={2}
          previousLabel="Previous"
          nextLabel="Next"
          previousClassName="page-item"
          nextClassName="page-item"
          previousLinkClassName="page-link"
          nextLinkClassName="page-link"
          initialPage={initialPage}
          forcePage={initialPage}
          breakClassName="page-item"
          breakLinkClassName="page-link"
          onPageChange={this.changePage.bind(this)}
          containerClassName="pagination justify-content-center mb-0"
          pageClassName="page-item"
          pageLinkClassName="page-link"
          activeClassName="active"
          disableInitialCallback
          disabledClassName="disabled"
        />
      </div>
    )
  }

  
  renderTableSearch() {
    return (
      <div className="row mb-3 mr-0">
        <InputGroup>
          <Input id="searchValueId" value={this.state.searchValue} onKeyPress={this.handleKeyPress} onInput={this.changeSearchValue} />
          <InputGroupAddon addonType="append">
            {this.state.searchValue.length > 0 && 
              <Button color="light" className="border" onClick={this.clearSearch}><img width={10} alt="desc" src="times-solid.svg" /></Button>
            }
            <Button color="lite" onClick={this.ensureDataFetched}>Search</Button>
          </InputGroupAddon>
        </InputGroup>
      </div>
    )
  }

  render() {
    const { count, pageFilter } = this.props;
    const { skip, take } = pageFilter;
    const { errors } = this.state;
    
    if (errors) {
      throw new Error(errors);
    }

    return (
      <div>
        <div className="d-flex justify-content-between">
          <h4>Customers</h4>
          {this.renderTableSearch(this.props, this.changeSearchValue, this.state.searchValue)}
        </div>
        {this.renderCustomersTable(this.props)}
        {this.props.list.length > 0 &&
          <div className="d-flex justify-content-between align-items-center mb-3" key={pageFilter.pagingKey}>
            <div>Showing {skip + 1} to {skip + take} of {count} entries</div>
            {count > pageFilter.take && this.renderPagination(this.props)}
          </div>
        }
      </div>
    );
  }
}




export default connect(
  state => state.customers,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(Customers);
