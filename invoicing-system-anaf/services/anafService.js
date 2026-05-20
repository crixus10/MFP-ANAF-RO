const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const ANAF_BASE_URL = process.env.ANAF_BASE_URL || 'https://webservicesp.anaf.ro';
const ANAF_OAUTH_URL = 'https://oauth.anaf.gov.ro';
const ANAF_SPV_URL = 'https://mfp.anaf.ro/anaf/internet/Iasi/info_iasi/programe/!ut/p/a1/';

class AnafService {
  constructor() {
    this.cache = new Map();
  }

  // Verify company tax status with ANAF
  async verifyTaxStatus(taxNumber, date) {
    try {
      const response = await axios.post(`${ANAF_BASE_URL}/PlatitorTvaRest/api/v8/ws/tva`, [
        {
          cui: taxNumber,
          data: date.toISOString().split('T')[0]
        }
      ], {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.data.cod === 200 && response.data.found && response.data.found.length > 0) {
        return {
          success: true,
          isTaxPayer: response.data.found[0].inregistrare_scop_Tva?.scpTVA || false,
          data: response.data.found[0]
        };
      }

      return {
        success: false,
        isTaxPayer: false,
        message: response.data.message || 'Company not found'
      };
    } catch (error) {
      console.error('ANAF tax verification error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get OAuth token
  async getAccessToken(clientId, clientSecret, certificatePath, certificatePassword) {
    try {
      const cert = fs.readFileSync(certificatePath);

      const response = await axios.post(`${ANAF_OAUTH_URL}/oauth/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          scope: 'upload_factura:to_anaf download_factura:de_la_anaf'
        }),
        {
          auth: {
            username: clientId,
            password: clientSecret
          },
          cert: cert,
          key: cert,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 15000
        }
      );

      return {
        success: true,
        accessToken: response.data.access_token,
        expiresIn: response.data.expires_in,
        tokenType: response.data.token_type
      };
    } catch (error) {
      console.error('ANAF OAuth token error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Upload invoice to ANAF
  async uploadInvoice(invoiceXml, accessToken, companyTaxNumber) {
    try {
      const uploadId = uuidv4();
      const timestamp = new Date().toISOString();

      const response = await axios.post(
        `${ANAF_BASE_URL}/upload/`,
        invoiceXml,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/xml',
            'X-upload-id': uploadId,
            'X-timestamp': timestamp,
            'X-client-id': process.env.ANAF_CLIENT_ID
          },
          timeout: 30000
        }
      );

      return {
        success: true,
        uploadId: uploadId,
        response: response.data
      };
    } catch (error) {
      console.error('ANAF upload error:', error.message);
      return {
        success: false,
        error: error.message,
        details: error.response?.data
      };
    }
  }

  // Check invoice status
  async checkInvoiceStatus(uploadId, accessToken) {
    try {
      const response = await axios.get(
        `${ANAF_BASE_URL}/status/${uploadId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      return {
        success: true,
        status: response.data.status,
        message: response.data.message,
        data: response.data
      };
    } catch (error) {
      console.error('ANAF status check error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Download invoices list
  async downloadInvoicesList(accessToken, startDate, endDate) {
    try {
      const response = await axios.get(
        `${ANAF_BASE_URL}/download/`,
        {
          params: {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
          },
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return {
        success: true,
        invoices: response.data
      };
    } catch (error) {
      console.error('ANAF download error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate signature for XML
  generateSignature(xmlContent, certificatePath, certificatePassword) {
    try {
      const cert = fs.readFileSync(certificatePath);
      const sign = crypto.createSign('RSA-SHA256');
      sign.update(xmlContent);
      const signature = sign.sign(cert, 'base64');

      return {
        success: true,
        signature: signature
      };
    } catch (error) {
      console.error('Signature generation error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new AnafService();
