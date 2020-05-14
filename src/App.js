import React from 'react';
import { Route } from 'react-router';
import Layout from './components/Layout';
import Home from './components/Home';
import Orders from './components/Orders';
import OrderDetails from './components/OrderDetails';
import Customers from './components/Customers';
import CustomerDetails from './components/CustomerDetails';
import Jobs from './components/Jobs';
import JobDetails from './components/JobDetails';
import JobPrintable from './components/JobPrintable';
import Invoices from './components/Invoices';
import InvoiceDetails from './components/InvoiceDetails';
import InvoicePrintable from './components/InvoicePrintable';

export default () => (
  <Layout>
    <Route exact path='/' component={Home} />
    <Route path='/orders/:orderId' component={OrderDetails} />
    <Route exact path='/orders' component={Orders} />
    <Route path='/customers/:customerId' component={CustomerDetails} />
    <Route exact path='/customers' component={Customers} />
    <Route exact path='/jobs/:jobId' component={JobDetails} />
    <Route exact path='/jobs/:jobId/print' component={JobPrintable} />
    <Route exact path='/jobs' component={Jobs} />
    <Route exact path='/invoices/:invoiceId' component={InvoiceDetails} />
    <Route exact path='/invoices/:invoiceId/print' component={InvoicePrintable} />
    <Route exact path='/invoices' component={Invoices} />
  </Layout>
);
