const { Builder } = require('xml2js');
const { v4: uuidv4 } = require('uuid');

class InvoiceXmlService {
  generateUBLInvoice(invoice, items, sellerCompany, buyerCompany) {
    const invoiceDate = invoice.invoiceDate;
    const dueDate = invoice.dueDate || invoiceDate;

    const invoiceObject = {
      Invoice: {
        $: {
          'xmlns': 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
          'xmlns:cac': 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
          'xmlns:cbc': 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2'
        },
        cbc: {
          UBLVersionID: '2.1',
          CustomizationID: 'urn:cen.eu:en16931:2017#compliant#urn:xoev-de:invoice-x-rechnung:1.2',
          ProfileID: 'urn:fdc:peppol.eu:2017:poacc:billing:01:1.0',
          ID: invoice.invoiceNumber,
          IssueDate: this.formatDate(invoiceDate),
          DueDate: this.formatDate(dueDate),
          InvoiceTypeCode: '380',
          DocumentCurrencyCode: invoice.currency || 'RON',
          BillingReference: {
            InvoiceDocumentReference: {
              ID: invoice.invoiceNumber
            }
          }
        },
        cac: {
          AccountingSupplierParty: this.buildPartyInfo(sellerCompany, 'seller'),
          AccountingCustomerParty: this.buildPartyInfo(buyerCompany, 'buyer'),
          LegalMonetaryTotal: this.buildMonetaryTotal(invoice),
          InvoiceLine: items.map((item, index) => this.buildInvoiceLine(item, index + 1))
        }
      }
    };

    // Add tax total
    const vatAmount = invoice.vatAmount;
    if (vatAmount > 0) {
      invoiceObject.Invoice.cac.TaxTotal = [{
        cbc: {
          TaxAmount: {
            _: this.formatDecimal(vatAmount),
            $: { currencyID: invoice.currency || 'RON' }
          }
        },
        cac: {
          TaxSubtotal: items
            .filter((item, i) => item.vatRate > 0)
            .map(item => ({
              cbc: {
                TaxableAmount: {
                  _: this.formatDecimal(item.lineTotal),
                  $: { currencyID: invoice.currency || 'RON' }
                },
                TaxAmount: {
                  _: this.formatDecimal(item.lineVat),
                  $: { currencyID: invoice.currency || 'RON' }
                }
              },
              cac: {
                TaxCategory: {
                  ID: this.formatDecimal(item.vatRate),
                  Percent: this.formatDecimal(item.vatRate),
                  TaxScheme: {
                    ID: 'VAT'
                  }
                }
              }
            }))
        }
      }];
    }

    const builder = new Builder({
      xmldec: { version: '1.0', encoding: 'UTF-8' }
    });

    return builder.buildObject(invoiceObject);
  }

  buildPartyInfo(company, type) {
    const partyType = type === 'seller' ? 'AccountingSupplierParty' : 'AccountingCustomerParty';

    return {
      Party: {
        cbc: {
          Name: company.name
        },
        cac: {
          PartyIdentification: {
            ID: {
              _: company.taxNumber,
              $: { schemeID: 'TAXID' }
            }
          },
          PartyName: {
            Name: company.name
          },
          PostalAddress: {
            StreetName: company.address || '',
            CityName: company.city || '',
            PostalZone: company.postalCode || '',
            CountrySubentity: company.county || '',
            Country: {
              IdentificationCode: company.country || 'RO'
            }
          },
          PartyTaxScheme: {
            CompanyID: company.taxNumber,
            TaxScheme: {
              ID: 'VAT'
            }
          },
          Contact: {
            Telephone: company.phone || '',
            ElectronicMail: company.email || ''
          }
        }
      }
    };
  }

  buildMonetaryTotal(invoice) {
    return {
      LineExtensionAmount: {
        _: this.formatDecimal(invoice.subtotal),
        $: { currencyID: invoice.currency || 'RON' }
      },
      TaxExclusiveAmount: {
        _: this.formatDecimal(invoice.subtotal),
        $: { currencyID: invoice.currency || 'RON' }
      },
      TaxInclusiveAmount: {
        _: this.formatDecimal(invoice.total),
        $: { currencyID: invoice.currency || 'RON' }
      },
      PrepaidAmount: {
        _: '0.00',
        $: { currencyID: invoice.currency || 'RON' }
      },
      PayableAmount: {
        _: this.formatDecimal(invoice.total),
        $: { currencyID: invoice.currency || 'RON' }
      }
    };
  }

  buildInvoiceLine(item, lineNumber) {
    return {
      $: { ID: lineNumber.toString() },
      cbc: {
        Note: item.description,
        InvoicedQuantity: {
          _: this.formatDecimal(item.quantity),
          $: { unitCode: item.unit || 'C62' }
        },
        LineExtensionAmount: {
          _: this.formatDecimal(item.lineTotal),
          $: { currencyID: item.currency || 'RON' }
        }
      },
      cac: {
        Item: {
          Description: item.description,
          Name: item.description,
          SellersItemIdentification: {
            ID: lineNumber.toString()
          }
        },
        Price: {
          PriceAmount: {
            _: this.formatDecimal(item.unitPrice),
            $: { currencyID: item.currency || 'RON' }
          }
        },
        TaxTotal: {
          cbc: {
            TaxAmount: {
              _: this.formatDecimal(item.lineVat),
              $: { currencyID: item.currency || 'RON' }
            }
          },
          cac: {
            TaxSubtotal: {
              cbc: {
                TaxableAmount: {
                  _: this.formatDecimal(item.lineTotal),
                  $: { currencyID: item.currency || 'RON' }
                },
                TaxAmount: {
                  _: this.formatDecimal(item.lineVat),
                  $: { currencyID: item.currency || 'RON' }
                }
              },
              cac: {
                TaxCategory: {
                  ID: this.formatDecimal(item.vatRate),
                  Percent: this.formatDecimal(item.vatRate),
                  TaxScheme: {
                    ID: 'VAT'
                  }
                }
              }
            }
          }
        }
      }
    };
  }

  formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  formatDecimal(value) {
    return parseFloat(value).toFixed(2);
  }
}

module.exports = new InvoiceXmlService();
