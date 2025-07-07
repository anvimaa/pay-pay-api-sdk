import crypto from 'crypto';

/**
 * PayPay Africa API TypeScript SDK
 * 
 * Este SDK fornece métodos para integração com a API PayPay Africa,
 * incluindo pagamentos via PayPay APP, MULTICAIXA Express e por referência.
 */

export interface PayPayConfig {
  partnerId: string;
  privateKey: string;
  publicKey: string;
  baseUrl?: string;
  version?: string;
  charset?: string;
  format?: string;
  language?: string;
}

export interface PaymentRequest {
  requestNo: string;
  amount: number;
  currency: string;
  subject: string;
  body?: string;
  notifyUrl?: string;
  returnUrl?: string;
  timeoutExpress?: string;
}

export interface PaymentResponse {
  code: string;
  msg: string;
  subCode?: string;
  subMsg?: string;
  sign: string;
  bizContent: {
    outTradeNo: string;
    tradeNo?: string;
    totalAmount: string;
    sellerId?: string;
    payUrl?: string;
    qrCode?: string;
    reference?: string;
  };
}

export interface RefundRequest {
  outTradeNo: string;
  tradeNo?: string;
  refundAmount: number;
  refundReason?: string;
  outRequestNo: string;
}

export interface QueryRequest {
  outTradeNo?: string;
  tradeNo?: string;
}

export class PayPaySDK {
  private config: PayPayConfig;

  constructor(config: PayPayConfig) {
    this.config = {
      baseUrl: 'https://gateway.paypayafrica.com/recv.do',
      version: '1.0',
      charset: 'UTF-8',
      format: 'JSON',
      language: 'pt',
      ...config
    };
  }

  /**
   * Gera assinatura RSA para os parâmetros da API
   */
  private generateSignature(params: Record<string, any>): string {
    // Remove sign e sign_type dos parâmetros
    const filteredParams = Object.keys(params)
      .filter(key => key !== 'sign' && key !== 'sign_type')
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as Record<string, any>);

    // Cria string de parâmetros ordenados
    const paramString = Object.keys(filteredParams)
      .map(key => `${key}=${filteredParams[key]}`)
      .join('&');

    // Gera assinatura usando SHA1withRSA
    const sign = crypto.createSign('RSA-SHA1');
    sign.update(paramString, 'utf8');
    return sign.sign(this.config.privateKey, 'base64');
  }

  /**
   * Encripta o conteúdo do negócio usando RSA
   */
  private encryptBizContent(bizContent: any): string {
    const content = JSON.stringify(bizContent);
    return crypto.publicEncrypt(
      {
        key: this.config.publicKey,
        padding: crypto.constants.RSA_PKCS1_PADDING
      },
      Buffer.from(content, 'utf8')
    ).toString('base64');
  }

  /**
   * Desencripta o conteúdo da resposta usando RSA
   */
  private decryptBizContent(encryptedContent: string): any {
    const decrypted = crypto.privateDecrypt(
      {
        key: this.config.privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING
      },
      Buffer.from(encryptedContent, 'base64')
    );
    return JSON.parse(decrypted.toString('utf8'));
  }

  /**
   * Verifica a assinatura da resposta
   */
  private verifySignature(params: Record<string, any>, signature: string): boolean {
    const filteredParams = Object.keys(params)
      .filter(key => key !== 'sign' && key !== 'sign_type')
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as Record<string, any>);

    const paramString = Object.keys(filteredParams)
      .map(key => `${key}=${filteredParams[key]}`)
      .join('&');

    const verify = crypto.createVerify('RSA-SHA1');
    verify.update(paramString, 'utf8');
    return verify.verify(this.config.publicKey, signature, 'base64');
  }

  /**
   * Faz uma requisição HTTP para a API PayPay
   */
  private async makeRequest(params: Record<string, any>): Promise<PaymentResponse> {
    const signature = this.generateSignature(params);
    const requestParams = {
      ...params,
      sign: signature,
      sign_type: 'RSA'
    };

    const response = await fetch(this.config.baseUrl!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestParams)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Verifica a assinatura da resposta
    if (!this.verifySignature(result, result.sign)) {
      throw new Error('Assinatura da resposta inválida');
    }

    return result;
  }

  /**
   * Cria um pagamento via PayPay APP
   */
  async createPayPayAppPayment(payment: PaymentRequest): Promise<PaymentResponse> {
    const bizContent = {
      out_trade_no: payment.requestNo,
      total_amount: payment.amount.toString(),
      subject: payment.subject,
      body: payment.body || '',
      timeout_express: payment.timeoutExpress || '30m',
      product_code: 'QUICK_MSECURITY_PAY'
    };

    const params = {
      service: 'alipay.trade.app.pay',
      partner_id: this.config.partnerId,
      timestamp: new Date().toISOString(),
      charset: this.config.charset,
      format: this.config.format,
      version: this.config.version,
      language: this.config.language,
      request_no: payment.requestNo,
      biz_content: this.encryptBizContent(bizContent),
      notify_url: payment.notifyUrl,
      return_url: payment.returnUrl
    };

    return this.makeRequest(params);
  }

  /**
   * Cria um pagamento via MULTICAIXA Express
   */
  async createMulticaixaExpressPayment(payment: PaymentRequest): Promise<PaymentResponse> {
    const bizContent = {
      out_trade_no: payment.requestNo,
      total_amount: payment.amount.toString(),
      subject: payment.subject,
      body: payment.body || '',
      timeout_express: payment.timeoutExpress || '30m',
      product_code: 'MULTICAIXA_EXPRESS',
      payment_method: {
        type: 'MULTICAIXA_EXPRESS'
      }
    };

    const params = {
      service: 'alipay.trade.precreate',
      partner_id: this.config.partnerId,
      timestamp: new Date().toISOString(),
      charset: this.config.charset,
      format: this.config.format,
      version: this.config.version,
      language: this.config.language,
      request_no: payment.requestNo,
      biz_content: this.encryptBizContent(bizContent),
      notify_url: payment.notifyUrl,
      return_url: payment.returnUrl
    };

    return this.makeRequest(params);
  }

  /**
   * Cria um pagamento por referência
   */
  async createReferencePayment(payment: PaymentRequest): Promise<PaymentResponse> {
    const bizContent = {
      out_trade_no: payment.requestNo,
      total_amount: payment.amount.toString(),
      subject: payment.subject,
      body: payment.body || '',
      timeout_express: payment.timeoutExpress || '30m',
      product_code: 'REFERENCE_PAY',
      payment_method: {
        type: 'REFERENCE'
      }
    };

    const params = {
      service: 'alipay.trade.precreate',
      partner_id: this.config.partnerId,
      timestamp: new Date().toISOString(),
      charset: this.config.charset,
      format: this.config.format,
      version: this.config.version,
      language: this.config.language,
      request_no: payment.requestNo,
      biz_content: this.encryptBizContent(bizContent),
      notify_url: payment.notifyUrl,
      return_url: payment.returnUrl
    };

    return this.makeRequest(params);
  }

  /**
   * Consulta o status de um pagamento
   */
  async queryPayment(query: QueryRequest): Promise<PaymentResponse> {
    const bizContent = {
      out_trade_no: query.outTradeNo,
      trade_no: query.tradeNo
    };

    const params = {
      service: 'alipay.trade.query',
      partner_id: this.config.partnerId,
      timestamp: new Date().toISOString(),
      charset: this.config.charset,
      format: this.config.format,
      version: this.config.version,
      language: this.config.language,
      request_no: `query_${Date.now()}`,
      biz_content: this.encryptBizContent(bizContent)
    };

    return this.makeRequest(params);
  }

  /**
   * Processa um reembolso
   */
  async refundPayment(refund: RefundRequest): Promise<PaymentResponse> {
    const bizContent = {
      out_trade_no: refund.outTradeNo,
      trade_no: refund.tradeNo,
      refund_amount: refund.refundAmount.toString(),
      refund_reason: refund.refundReason || '',
      out_request_no: refund.outRequestNo
    };

    const params = {
      service: 'alipay.trade.refund',
      partner_id: this.config.partnerId,
      timestamp: new Date().toISOString(),
      charset: this.config.charset,
      format: this.config.format,
      version: this.config.version,
      language: this.config.language,
      request_no: refund.outRequestNo,
      biz_content: this.encryptBizContent(bizContent)
    };

    return this.makeRequest(params);
  }

  /**
   * Fecha um pagamento
   */
  async closePayment(query: QueryRequest): Promise<PaymentResponse> {
    const bizContent = {
      out_trade_no: query.outTradeNo,
      trade_no: query.tradeNo
    };

    const params = {
      service: 'alipay.trade.close',
      partner_id: this.config.partnerId,
      timestamp: new Date().toISOString(),
      charset: this.config.charset,
      format: this.config.format,
      version: this.config.version,
      language: this.config.language,
      request_no: `close_${Date.now()}`,
      biz_content: this.encryptBizContent(bizContent)
    };

    return this.makeRequest(params);
  }

  /**
   * Transfere fundos para uma conta bancária
   */
  async transferToBankAccount(transfer: {
    outBizNo: string;
    payeeType: string;
    payeeAccount: string;
    amount: number;
    payerShowName?: string;
    payeeRealName?: string;
    remark?: string;
  }): Promise<PaymentResponse> {
    const bizContent = {
      out_biz_no: transfer.outBizNo,
      payee_type: transfer.payeeType,
      payee_account: transfer.payeeAccount,
      amount: transfer.amount.toString(),
      payer_show_name: transfer.payerShowName,
      payee_real_name: transfer.payeeRealName,
      remark: transfer.remark
    };

    const params = {
      service: 'alipay.fund.trans.toaccount.transfer',
      partner_id: this.config.partnerId,
      timestamp: new Date().toISOString(),
      charset: this.config.charset,
      format: this.config.format,
      version: this.config.version,
      language: this.config.language,
      request_no: transfer.outBizNo,
      biz_content: this.encryptBizContent(bizContent)
    };

    return this.makeRequest(params);
  }

  /**
   * Transfere fundos para uma conta PayPay
   */
  async transferToPayPayAccount(transfer: {
    outBizNo: string;
    payeeAccount: string;
    amount: number;
    payerShowName?: string;
    payeeRealName?: string;
    remark?: string;
  }): Promise<PaymentResponse> {
    const bizContent = {
      out_biz_no: transfer.outBizNo,
      payee_type: 'PAYPAY_USERID',
      payee_account: transfer.payeeAccount,
      amount: transfer.amount.toString(),
      payer_show_name: transfer.payerShowName,
      payee_real_name: transfer.payeeRealName,
      remark: transfer.remark
    };

    const params = {
      service: 'alipay.fund.trans.toaccount.transfer',
      partner_id: this.config.partnerId,
      timestamp: new Date().toISOString(),
      charset: this.config.charset,
      format: this.config.format,
      version: this.config.version,
      language: this.config.language,
      request_no: transfer.outBizNo,
      biz_content: this.encryptBizContent(bizContent)
    };

    return this.makeRequest(params);
  }
}

export default PayPaySDK;

