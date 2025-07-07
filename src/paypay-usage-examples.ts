import PayPaySDK, { type PayPayConfig, type PaymentRequest } from './paypay-typescript-sdk';

/**
 * Exemplos de utilização do SDK PayPay Africa
 * 
 * Este ficheiro demonstra como utilizar o SDK TypeScript para integrar
 * com a API PayPay Africa para diferentes tipos de pagamento.
 */

// Configuração do SDK
const config: PayPayConfig = {
  partnerId: 'SEU_PARTNER_ID',
  privateKey: `-----BEGIN PRIVATE KEY-----
SEU_PRIVATE_KEY_AQUI
-----END PRIVATE KEY-----`,
  publicKey: `-----BEGIN PUBLIC KEY-----
CHAVE_PUBLICA_PAYPAY_AQUI
-----END PUBLIC KEY-----`,
  baseUrl: 'https://gateway.paypayafrica.com/recv.do',
  version: '1.0',
  charset: 'UTF-8',
  format: 'JSON',
  language: 'pt'
};

// Inicializar o SDK
const payPaySDK = new PayPaySDK(config);

/**
 * Exemplo 1: Criar pagamento via PayPay APP
 */
async function exemploPayPayApp() {
  try {
    const payment: PaymentRequest = {
      requestNo: `PAY_${Date.now()}`,
      amount: 1000, // 1000 AOA
      currency: 'AOA',
      subject: 'Compra de produto',
      body: 'Descrição detalhada do produto',
      notifyUrl: 'https://seusite.com/notify',
      returnUrl: 'https://seusite.com/return',
      timeoutExpress: '30m'
    };

    const response = await payPaySDK.createPayPayAppPayment(payment);

    if (response.code === '10000') {
      console.log('Pagamento criado com sucesso!');
      console.log('URL de pagamento:', response.bizContent.payUrl);
      console.log('Número da transação:', response.bizContent.tradeNo);

      // Redirecionar o utilizador para o URL de pagamento
      // ou abrir a aplicação PayPay com o URL
      window.location.href = response.bizContent.payUrl!;
    } else {
      console.error('Erro ao criar pagamento:', response.msg);
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
  }
}

/**
 * Exemplo 2: Criar pagamento via MULTICAIXA Express
 */
async function exemploMulticaixaExpress() {
  try {
    const payment: PaymentRequest = {
      requestNo: `MCX_${Date.now()}`,
      amount: 2500, // 2500 AOA
      currency: 'AOA',
      subject: 'Pagamento de serviço',
      body: 'Pagamento de serviço de consultoria',
      notifyUrl: 'https://seusite.com/notify',
      returnUrl: 'https://seusite.com/return',
      timeoutExpress: '60m'
    };

    const response = await payPaySDK.createMulticaixaExpressPayment(payment);

    if (response.code === '10000') {
      console.log('Pagamento MULTICAIXA Express criado com sucesso!');
      console.log('QR Code:', response.bizContent.qrCode);
      console.log('Número da transação:', response.bizContent.tradeNo);

      // Exibir QR Code para o utilizador escanear
      // ou redirecionar para a interface MULTICAIXA Express
    } else {
      console.error('Erro ao criar pagamento MULTICAIXA Express:', response.msg);
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
  }
}

/**
 * Exemplo 3: Criar pagamento por referência
 */
async function exemploPagamentoPorReferencia() {
  try {
    const payment: PaymentRequest = {
      requestNo: `REF_${Date.now()}`,
      amount: 5000, // 5000 AOA
      currency: 'AOA',
      subject: 'Pagamento de fatura',
      body: 'Pagamento de fatura mensal',
      notifyUrl: 'https://seusite.com/notify',
      returnUrl: 'https://seusite.com/return',
      timeoutExpress: '24h'
    };

    const response = await payPaySDK.createReferencePayment(payment);

    if (response.code === '10000') {
      console.log('Pagamento por referência criado com sucesso!');
      console.log('Referência:', response.bizContent.reference);
      console.log('Número da transação:', response.bizContent.tradeNo);

      // Exibir a referência para o utilizador usar no banco
      alert(`Sua referência de pagamento é: ${response.bizContent.reference}`);
    } else {
      console.error('Erro ao criar pagamento por referência:', response.msg);
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
  }
}

/**
 * Exemplo 4: Consultar status de pagamento
 */
async function exemploConsultarPagamento() {
  try {
    const response = await payPaySDK.queryPayment({
      outTradeNo: 'PAY_1234567890', // Número da sua transação
      // ou
      // tradeNo: 'PAYPAY_TRADE_NO' // Número da transação PayPay
    });

    if (response.code === '10000') {
      console.log('Consulta realizada com sucesso!');
      console.log('Status do pagamento:', response.bizContent);
    } else {
      console.error('Erro ao consultar pagamento:', response.msg);
    }
  } catch (error) {
    console.error('Erro na consulta:', error);
  }
}

/**
 * Exemplo 5: Processar reembolso
 */
async function exemploReembolso() {
  try {
    const response = await payPaySDK.refundPayment({
      outTradeNo: 'PAY_1234567890',
      refundAmount: 500, // Reembolso parcial de 500 AOA
      refundReason: 'Produto defeituoso',
      outRequestNo: `REFUND_${Date.now()}`
    });

    if (response.code === '10000') {
      console.log('Reembolso processado com sucesso!');
      console.log('Detalhes do reembolso:', response.bizContent);
    } else {
      console.error('Erro ao processar reembolso:', response.msg);
    }
  } catch (error) {
    console.error('Erro no reembolso:', error);
  }
}

/**
 * Exemplo 6: Fechar pagamento
 */
async function exemploFecharPagamento() {
  try {
    const response = await payPaySDK.closePayment({
      outTradeNo: 'PAY_1234567890'
    });

    if (response.code === '10000') {
      console.log('Pagamento fechado com sucesso!');
    } else {
      console.error('Erro ao fechar pagamento:', response.msg);
    }
  } catch (error) {
    console.error('Erro ao fechar pagamento:', error);
  }
}

/**
 * Exemplo 7: Transferir para conta bancária
 */
async function exemploTransferenciaBancaria() {
  try {
    const response = await payPaySDK.transferToBankAccount({
      outBizNo: `TRANSFER_${Date.now()}`,
      payeeType: 'ALIPAY_LOGONID',
      payeeAccount: 'AO06000000012345678901234', // IBAN da conta
      amount: 1000,
      payerShowName: 'Sua Empresa Lda',
      payeeRealName: 'João Silva',
      remark: 'Pagamento de salário'
    });

    if (response.code === '10000') {
      console.log('Transferência bancária realizada com sucesso!');
      console.log('Detalhes:', response.bizContent);
    } else {
      console.error('Erro na transferência bancária:', response.msg);
    }
  } catch (error) {
    console.error('Erro na transferência:', error);
  }
}

/**
 * Exemplo 8: Transferir para conta PayPay
 */
async function exemploTransferenciaPayPay() {
  try {
    const response = await payPaySDK.transferToPayPayAccount({
      outBizNo: `PAYPAY_TRANSFER_${Date.now()}`,
      payeeAccount: 'usuario@paypay.com',
      amount: 500,
      payerShowName: 'Sua Empresa Lda',
      payeeRealName: 'Maria Santos',
      remark: 'Pagamento de comissão'
    });

    if (response.code === '10000') {
      console.log('Transferência PayPay realizada com sucesso!');
      console.log('Detalhes:', response.bizContent);
    } else {
      console.error('Erro na transferência PayPay:', response.msg);
    }
  } catch (error) {
    console.error('Erro na transferência:', error);
  }
}

/**
 * Exemplo de integração completa com tratamento de notificações
 */
class PayPayIntegration {
  private sdk: PayPaySDK;

  constructor(config: PayPayConfig) {
    this.sdk = new PayPaySDK(config);
  }

  /**
   * Processa uma notificação de pagamento recebida do PayPay
   */
  async processNotification(notificationData: any): Promise<boolean> {
    try {
      // Verificar a assinatura da notificação
      const isValid = this.verifyNotificationSignature(notificationData);

      if (!isValid) {
        console.error('Assinatura da notificação inválida');
        return false;
      }

      // Processar a notificação baseada no status
      switch (notificationData.trade_status) {
        case 'TRADE_SUCCESS':
          await this.handleSuccessfulPayment(notificationData);
          break;
        case 'TRADE_FINISHED':
          await this.handleFinishedPayment(notificationData);
          break;
        case 'TRADE_CLOSED':
          await this.handleClosedPayment(notificationData);
          break;
        default:
          console.log('Status de pagamento não reconhecido:', notificationData.trade_status);
      }

      return true;
    } catch (error) {
      console.error('Erro ao processar notificação:', error);
      return false;
    }
  }

  private verifyNotificationSignature(data: any): boolean {
    // Implementar verificação de assinatura
    // Similar ao método verifySignature do SDK
    return true; // Placeholder
  }

  private async handleSuccessfulPayment(data: any): Promise<void> {
    console.log('Pagamento bem-sucedido:', data.out_trade_no);
    // Atualizar base de dados, enviar email de confirmação, etc.
  }

  private async handleFinishedPayment(data: any): Promise<void> {
    console.log('Pagamento finalizado:', data.out_trade_no);
    // Processar entrega do produto/serviço
  }

  private async handleClosedPayment(data: any): Promise<void> {
    console.log('Pagamento fechado:', data.out_trade_no);
    // Cancelar pedido, liberar stock, etc.
  }
}

// Exportar exemplos para uso
export {
  exemploPayPayApp,
  exemploMulticaixaExpress,
  exemploPagamentoPorReferencia,
  exemploConsultarPagamento,
  exemploReembolso,
  exemploFecharPagamento,
  exemploTransferenciaBancaria,
  exemploTransferenciaPayPay,
  PayPayIntegration
};

